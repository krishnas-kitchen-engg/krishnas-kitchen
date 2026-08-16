-- =====================================================
-- Krishna's Kitchen / SevaOps
-- Procurement Planning Controls
-- =====================================================

alter table public.purchase_lists
  add column if not exists generation_grouping text not null default 'purchase_location';

alter table public.item_purchase_preferences
  add column if not exists minimum_order_quantity numeric(12, 3);

alter table public.item_purchase_preferences
  drop constraint if exists item_purchase_preferences_minimum_order_quantity_positive;

alter table public.item_purchase_preferences
  add constraint item_purchase_preferences_minimum_order_quantity_positive
  check (minimum_order_quantity is null or minimum_order_quantity > 0);

alter table public.purchase_lists
  drop constraint if exists purchase_lists_generation_grouping;

alter table public.purchase_lists
  add constraint purchase_lists_generation_grouping
  check (generation_grouping in ('purchase_location', 'purchaser'));

drop function if exists public.publish_approved_purchase_requests(uuid, uuid, text, uuid);

create or replace function public.publish_approved_purchase_requests(
  p_organization_id uuid,
  p_temple_id uuid,
  p_name text,
  p_published_by_user_id uuid,
  p_generation_grouping text default 'purchase_location'
)
returns public.purchase_lists
language plpgsql
security definer
set search_path = public
as $$
declare
  approved_request_ids uuid[];
  created_list public.purchase_lists;
begin
  if auth.uid() is null or auth.uid() <> p_published_by_user_id then
    raise exception 'Publisher must match the signed-in user.';
  end if;

  if nullif(trim(p_name), '') is null then
    raise exception 'Purchase list name is required.';
  end if;

  if coalesce(p_generation_grouping, '') not in ('purchase_location', 'purchaser') then
    raise exception 'Purchase list generation grouping is invalid.';
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
    raise exception 'Signed-in user cannot publish purchase lists.';
  end if;

  select array_agg(locked_request.id)
  into approved_request_ids
  from (
    select request.id
    from public.purchase_requests request
    where request.organization_id = p_organization_id
      and request.temple_id = p_temple_id
      and request.status = 'approved'
      and request.included_purchase_list_item_id is null
    order by request.created_at asc, request.id asc
    for update
  ) locked_request;

  if coalesce(array_length(approved_request_ids, 1), 0) = 0 then
    raise exception 'No approved purchase requests are ready to publish.';
  end if;

  insert into public.purchase_lists (
    organization_id,
    temple_id,
    name,
    status,
    publish_mode,
    generation_grouping,
    published_at,
    created_by_actor_type,
    created_by_actor_user_id,
    published_by_actor_type,
    published_by_actor_user_id
  )
  values (
    p_organization_id,
    p_temple_id,
    trim(p_name),
    'published',
    'manual',
    p_generation_grouping,
    timezone('utc', now()),
    'user',
    p_published_by_user_id,
    'user',
    p_published_by_user_id
  )
  returning * into created_list;

  with approved_requests as (
    select request.*
    from public.purchase_requests request
    where request.id = any(approved_request_ids)
    order by request.created_at asc, request.id asc
    for update
  ),
  created_items as (
    insert into public.purchase_list_items (
      organization_id,
      temple_id,
      purchase_list_id,
      status,
      item_reference_type,
      item_id,
      suggested_item_name,
      suggested_item_category,
      approved_quantity,
      unit,
      purchase_location_id,
      assigned_purchaser_user_id,
      source_purchase_request_ids,
      notes
    )
    select
      request.organization_id,
      request.temple_id,
      created_list.id,
      'pending_purchase',
      request.item_reference_type,
      request.item_id,
      request.suggested_item_name,
      request.suggested_item_category,
      case
        when request.item_reference_type = 'existing_item'
          and preference.minimum_order_quantity is not null
        then greatest(request.quantity, preference.minimum_order_quantity)
        else request.quantity
      end,
      request.unit,
      preference.preferred_purchase_location_id,
      coalesce(preference.purchaser_user_id, location.default_purchaser_user_id),
      array[request.id],
      request.notes
    from approved_requests request
    left join public.item_purchase_preferences preference
      on preference.organization_id = request.organization_id
      and preference.temple_id = request.temple_id
      and preference.item_id = request.item_id
      and preference.archived_at is null
    left join public.purchase_locations location
      on location.id = preference.preferred_purchase_location_id
      and location.archived_at is null
    order by
      case
        when p_generation_grouping = 'purchaser'
        then coalesce(coalesce(preference.purchaser_user_id, location.default_purchaser_user_id)::text, '')
        else coalesce(preference.preferred_purchase_location_id::text, '')
      end,
      request.created_at asc,
      request.id asc
    returning id, source_purchase_request_ids
  )
  update public.purchase_requests request
  set
    status = 'included_in_published_list',
    included_purchase_list_item_id = created_items.id,
    updated_at = timezone('utc', now())
  from created_items
  where request.id = created_items.source_purchase_request_ids[1];

  return created_list;
end;
$$;

revoke execute on function public.publish_approved_purchase_requests(
  uuid,
  uuid,
  text,
  uuid,
  text
) from public;

grant execute on function public.publish_approved_purchase_requests(
  uuid,
  uuid,
  text,
  uuid,
  text
) to authenticated;

drop function if exists public.schedule_approved_purchase_requests(uuid, uuid, text, timestamptz, uuid);

create or replace function public.schedule_approved_purchase_requests(
  p_organization_id uuid,
  p_temple_id uuid,
  p_name text,
  p_scheduled_publish_at timestamptz,
  p_scheduled_by_user_id uuid,
  p_generation_grouping text default 'purchase_location'
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

  if coalesce(p_generation_grouping, '') not in ('purchase_location', 'purchaser') then
    raise exception 'Purchase list generation grouping is invalid.';
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
    generation_grouping,
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
    p_generation_grouping,
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
  uuid,
  text
) from public;

grant execute on function public.schedule_approved_purchase_requests(
  uuid,
  uuid,
  text,
  timestamptz,
  uuid,
  text
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
    p_published_by_user_id,
    scheduled_list.generation_grouping
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
