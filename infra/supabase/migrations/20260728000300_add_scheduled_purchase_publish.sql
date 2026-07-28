create or replace function public.schedule_approved_purchase_requests(
  p_organization_id uuid,
  p_temple_id uuid,
  p_name text,
  p_scheduled_publish_at timestamptz,
  p_scheduled_by_user_id uuid
)
returns public.purchase_lists
language plpgsql
security definer
set search_path = public
as $$
declare
  created_list public.purchase_lists;
begin
  if auth.uid() is null or auth.uid() <> p_scheduled_by_user_id then
    raise exception 'Scheduler must match the signed-in user.';
  end if;

  if nullif(trim(p_name), '') is null then
    raise exception 'Purchase list name is required.';
  end if;

  if p_scheduled_publish_at is null
     or p_scheduled_publish_at <= timezone('utc', now()) then
    raise exception 'Scheduled publish time must be in the future.';
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
        'senior_cook',
        'inventory_manager',
        'temple_admin',
        'super_admin'
      )
  ) then
    raise exception 'Signed-in user cannot schedule purchase lists.';
  end if;

  if not exists (
    select 1
    from public.purchase_requests request
    where request.organization_id = p_organization_id
      and request.temple_id = p_temple_id
      and request.status = 'approved'
      and request.included_purchase_list_item_id is null
  ) then
    raise exception 'No approved purchase requests are ready to schedule.';
  end if;

  insert into public.purchase_lists (
    organization_id,
    temple_id,
    name,
    status,
    publish_mode,
    scheduled_publish_at,
    created_by_actor_type,
    created_by_actor_user_id
  )
  values (
    p_organization_id,
    p_temple_id,
    trim(p_name),
    'ready_to_publish',
    'scheduled',
    p_scheduled_publish_at,
    'user',
    p_scheduled_by_user_id
  )
  returning * into created_list;

  return created_list;
end;
$$;

revoke execute on function public.schedule_approved_purchase_requests(
  uuid,
  uuid,
  text,
  timestamptz,
  uuid
) from public;

grant execute on function public.schedule_approved_purchase_requests(
  uuid,
  uuid,
  text,
  timestamptz,
  uuid
) to authenticated;

create or replace function public.publish_scheduled_purchase_list(
  p_organization_id uuid,
  p_temple_id uuid,
  p_purchase_list_id uuid,
  p_published_by_user_id uuid
)
returns public.purchase_lists
language plpgsql
security definer
set search_path = public
as $$
declare
  published_list public.purchase_lists;
  scheduled_list public.purchase_lists;
begin
  if auth.uid() is null or auth.uid() <> p_published_by_user_id then
    raise exception 'Publisher must match the signed-in user.';
  end if;

  select *
    into scheduled_list
    from public.purchase_lists list
   where list.organization_id = p_organization_id
     and list.temple_id = p_temple_id
     and list.id = p_purchase_list_id
     and list.publish_mode = 'scheduled'
   for update;

  if not found then
    raise exception 'Scheduled purchase list was not found.';
  end if;

  if scheduled_list.status <> 'ready_to_publish' then
    raise exception 'Scheduled purchase list is not ready to publish.';
  end if;

  if scheduled_list.scheduled_publish_at is null
     or scheduled_list.scheduled_publish_at > timezone('utc', now()) then
    raise exception 'Scheduled purchase list is not due yet.';
  end if;

  published_list := public.publish_approved_purchase_requests(
    p_organization_id,
    p_temple_id,
    scheduled_list.name,
    p_published_by_user_id
  );

  update public.purchase_lists list
     set status = 'completed',
         published_at = published_list.published_at,
         published_by_actor_type = 'user',
         published_by_actor_user_id = p_published_by_user_id
   where list.id = scheduled_list.id;

  return published_list;
end;
$$;

revoke execute on function public.publish_scheduled_purchase_list(uuid, uuid, uuid, uuid)
  from public;

grant execute on function public.publish_scheduled_purchase_list(uuid, uuid, uuid, uuid)
  to authenticated;
