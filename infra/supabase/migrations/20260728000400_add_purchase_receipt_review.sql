alter table public.purchase_receipts
  add column if not exists finance_review_notes text,
  add column if not exists reviewed_by_actor_type public.actor_type,
  add column if not exists reviewed_by_actor_user_id uuid references public.users(id),
  add column if not exists reviewed_by_actor_temp_session_id uuid,
  add column if not exists reviewed_at timestamptz;

alter table public.purchase_receipts
  drop constraint if exists purchase_receipts_reviewer_context;

alter table public.purchase_receipts
  add constraint purchase_receipts_reviewer_context check (
    (
      reviewed_by_actor_type is null
      and reviewed_by_actor_user_id is null
      and reviewed_by_actor_temp_session_id is null
      and reviewed_at is null
    )
    or (
      reviewed_by_actor_type = 'user'
      and reviewed_by_actor_user_id is not null
      and reviewed_by_actor_temp_session_id is null
      and reviewed_at is not null
    )
  );

create or replace function public.review_purchase_receipt(
  p_organization_id uuid,
  p_temple_id uuid,
  p_receipt_id uuid,
  p_review_status text,
  p_finance_review_notes text,
  p_reviewed_by_user_id uuid
)
returns public.purchase_receipts
language plpgsql
security definer
set search_path = public
as $$
declare
  reviewed_receipt public.purchase_receipts;
begin
  if auth.uid() is null or auth.uid() <> p_reviewed_by_user_id then
    raise exception 'Reviewer must match the signed-in user.';
  end if;

  if p_review_status not in ('matched', 'needs_review', 'partially_matched', 'reconciled', 'rejected') then
    raise exception 'Receipt review status is invalid.';
  end if;

  if length(nullif(trim(coalesce(p_finance_review_notes, '')), '')) > 500 then
    raise exception 'Finance review notes must be 500 characters or fewer.';
  end if;

  if not public.is_authenticated_user_in_organization(p_organization_id)
    or not public.is_authenticated_user_assigned_to_temple(p_temple_id) then
    raise exception 'Signed-in user is not assigned to this organization and temple.';
  end if;

  if not exists (
    select 1
    from public.current_authenticated_user_roles() authenticated_role
    where authenticated_role.organization_id = p_organization_id
      and (
        authenticated_role.temple_id is null
        or authenticated_role.temple_id = p_temple_id
      )
      and authenticated_role.role in (
        'inventory_manager',
        'temple_admin',
        'super_admin'
      )
  ) then
    raise exception 'Signed-in user cannot review purchase receipts.';
  end if;

  update public.purchase_receipts receipt
     set status = p_review_status,
         finance_review_notes = nullif(trim(coalesce(p_finance_review_notes, '')), ''),
         reviewed_by_actor_type = 'user',
         reviewed_by_actor_user_id = p_reviewed_by_user_id,
         reviewed_by_actor_temp_session_id = null,
         reviewed_at = timezone('utc', now())
   where receipt.organization_id = p_organization_id
     and receipt.temple_id = p_temple_id
     and receipt.id = p_receipt_id
   returning *
    into reviewed_receipt;

  if reviewed_receipt.id is null then
    raise exception 'Purchase receipt was not found.';
  end if;

  return reviewed_receipt;
end;
$$;

revoke execute on function public.review_purchase_receipt(
  uuid,
  uuid,
  uuid,
  text,
  text,
  uuid
) from public;

grant execute on function public.review_purchase_receipt(
  uuid,
  uuid,
  uuid,
  text,
  text,
  uuid
) to authenticated;
