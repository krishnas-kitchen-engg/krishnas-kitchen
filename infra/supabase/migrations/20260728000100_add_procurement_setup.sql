-- =====================================================
-- Krishna's Kitchen / SevaOps
-- Procurement Setup Foundation
-- =====================================================

create table if not exists public.purchase_locations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  temple_id uuid not null references public.temples(id),
  name text not null,
  description text,
  notes text,
  default_purchaser_user_id uuid references public.users(id),
  created_by_actor_type public.actor_type not null,
  created_by_actor_user_id uuid references public.users(id),
  created_by_actor_temp_session_id uuid,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  archived_at timestamptz,

  constraint purchase_locations_actor_context check (
    (created_by_actor_type = 'user' and created_by_actor_user_id is not null and created_by_actor_temp_session_id is null)
    or (created_by_actor_type = 'temporary_volunteer' and created_by_actor_temp_session_id is not null and created_by_actor_user_id is null)
    or (created_by_actor_type = 'system' and created_by_actor_user_id is null and created_by_actor_temp_session_id is null)
  )
);

create unique index if not exists purchase_locations_unique_active_name
  on public.purchase_locations (
    organization_id,
    temple_id,
    lower(name)
  )
  where archived_at is null;

create index if not exists idx_purchase_locations_org_temple
  on public.purchase_locations(organization_id, temple_id);

create trigger purchase_locations_updated_at
before update on public.purchase_locations
for each row
execute procedure public.set_updated_at();

create table if not exists public.item_purchase_preferences (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  temple_id uuid not null references public.temples(id),
  item_id uuid not null references public.items(id),
  preferred_purchase_location_id uuid not null references public.purchase_locations(id),
  backup_purchase_location_id uuid references public.purchase_locations(id),
  purchaser_user_id uuid references public.users(id),
  preferred_purchase_unit public.item_unit,
  pack_size numeric(12, 3),
  estimated_unit_cost numeric(12, 2),
  notes text,
  created_by_actor_type public.actor_type not null,
  created_by_actor_user_id uuid references public.users(id),
  created_by_actor_temp_session_id uuid,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  archived_at timestamptz,

  constraint item_purchase_preferences_actor_context check (
    (created_by_actor_type = 'user' and created_by_actor_user_id is not null and created_by_actor_temp_session_id is null)
    or (created_by_actor_type = 'temporary_volunteer' and created_by_actor_temp_session_id is not null and created_by_actor_user_id is null)
    or (created_by_actor_type = 'system' and created_by_actor_user_id is null and created_by_actor_temp_session_id is null)
  ),
  constraint item_purchase_preferences_pack_size_positive check (
    pack_size is null or pack_size > 0
  ),
  constraint item_purchase_preferences_cost_non_negative check (
    estimated_unit_cost is null or estimated_unit_cost >= 0
  ),
  constraint item_purchase_preferences_locations_differ check (
    backup_purchase_location_id is null
    or backup_purchase_location_id <> preferred_purchase_location_id
  )
);

create unique index if not exists item_purchase_preferences_unique_active_item
  on public.item_purchase_preferences (
    organization_id,
    temple_id,
    item_id
  )
  where archived_at is null;

create index if not exists idx_item_purchase_preferences_org_temple
  on public.item_purchase_preferences(organization_id, temple_id);

create index if not exists idx_item_purchase_preferences_item
  on public.item_purchase_preferences(item_id);

create trigger item_purchase_preferences_updated_at
before update on public.item_purchase_preferences
for each row
execute procedure public.set_updated_at();

alter table public.purchase_locations enable row level security;
alter table public.item_purchase_preferences enable row level security;

drop policy if exists "Authenticated users can read scoped purchase locations"
  on public.purchase_locations;

create policy "Authenticated users can read scoped purchase locations"
  on public.purchase_locations
  for select
  to authenticated
  using (
    public.is_authenticated_user_in_organization(organization_id)
    and public.is_authenticated_user_assigned_to_temple(temple_id)
  );

drop policy if exists "Authenticated procurement admins can create purchase locations"
  on public.purchase_locations;

create policy "Authenticated procurement admins can create purchase locations"
  on public.purchase_locations
  for insert
  to authenticated
  with check (
    public.is_authenticated_user_in_organization(organization_id)
    and public.is_authenticated_user_assigned_to_temple(temple_id)
    and created_by_actor_type = 'user'
    and created_by_actor_user_id = auth.uid()
    and exists (
      select 1
      from public.current_authenticated_user_roles() authenticated_role
      where authenticated_role.organization_id = purchase_locations.organization_id
        and (
          authenticated_role.temple_id is null
          or authenticated_role.temple_id = purchase_locations.temple_id
        )
        and authenticated_role.role in (
          'inventory_manager',
          'temple_admin',
          'super_admin'
        )
    )
  );

drop policy if exists "Authenticated procurement admins can update purchase locations"
  on public.purchase_locations;

create policy "Authenticated procurement admins can update purchase locations"
  on public.purchase_locations
  for update
  to authenticated
  using (
    public.is_authenticated_user_in_organization(organization_id)
    and public.is_authenticated_user_assigned_to_temple(temple_id)
    and status in (
      'submitted',
      'needs_clarification'
    )
    and included_purchase_list_item_id is null
    and exists (
      select 1
      from public.current_authenticated_user_roles() authenticated_role
      where authenticated_role.organization_id = purchase_locations.organization_id
        and (
          authenticated_role.temple_id is null
          or authenticated_role.temple_id = purchase_locations.temple_id
        )
        and authenticated_role.role in (
          'inventory_manager',
          'temple_admin',
          'super_admin'
        )
    )
  )
  with check (
    public.is_authenticated_user_in_organization(organization_id)
    and public.is_authenticated_user_assigned_to_temple(temple_id)
  );

drop policy if exists "Authenticated users can read scoped item purchase preferences"
  on public.item_purchase_preferences;

create policy "Authenticated users can read scoped item purchase preferences"
  on public.item_purchase_preferences
  for select
  to authenticated
  using (
    public.is_authenticated_user_in_organization(organization_id)
    and public.is_authenticated_user_assigned_to_temple(temple_id)
  );

drop policy if exists "Authenticated procurement admins can create item purchase preferences"
  on public.item_purchase_preferences;

create policy "Authenticated procurement admins can create item purchase preferences"
  on public.item_purchase_preferences
  for insert
  to authenticated
  with check (
    public.is_authenticated_user_in_organization(organization_id)
    and public.is_authenticated_user_assigned_to_temple(temple_id)
    and created_by_actor_type = 'user'
    and created_by_actor_user_id = auth.uid()
    and exists (
      select 1
      from public.current_authenticated_user_roles() authenticated_role
      where authenticated_role.organization_id = item_purchase_preferences.organization_id
        and (
          authenticated_role.temple_id is null
          or authenticated_role.temple_id = item_purchase_preferences.temple_id
        )
        and authenticated_role.role in (
          'inventory_manager',
          'temple_admin',
          'super_admin'
        )
    )
  );

drop policy if exists "Authenticated procurement admins can update item purchase preferences"
  on public.item_purchase_preferences;

create policy "Authenticated procurement admins can update item purchase preferences"
  on public.item_purchase_preferences
  for update
  to authenticated
  using (
    public.is_authenticated_user_in_organization(organization_id)
    and public.is_authenticated_user_assigned_to_temple(temple_id)
    and exists (
      select 1
      from public.current_authenticated_user_roles() authenticated_role
      where authenticated_role.organization_id = item_purchase_preferences.organization_id
        and (
          authenticated_role.temple_id is null
          or authenticated_role.temple_id = item_purchase_preferences.temple_id
        )
        and authenticated_role.role in (
          'inventory_manager',
          'temple_admin',
          'super_admin'
        )
    )
  )
  with check (
    public.is_authenticated_user_in_organization(organization_id)
    and public.is_authenticated_user_assigned_to_temple(temple_id)
  );

create table if not exists public.purchase_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  temple_id uuid not null references public.temples(id),
  status text not null default 'submitted',
  item_reference_type text not null,
  item_id uuid references public.items(id),
  suggested_item_name text,
  suggested_item_category text,
  quantity numeric(12, 6) not null,
  unit public.item_unit not null,
  needed_by date,
  notes text,
  requested_by_actor_type public.actor_type not null,
  requested_by_actor_user_id uuid references public.users(id),
  requested_by_actor_temp_session_id uuid,
  reviewed_by_actor_type public.actor_type,
  reviewed_by_actor_user_id uuid references public.users(id),
  reviewed_by_actor_temp_session_id uuid,
  reviewed_at timestamptz,
  included_purchase_list_item_id uuid,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),

  constraint purchase_requests_status check (
    status in (
      'draft',
      'submitted',
      'needs_clarification',
      'approved',
      'rejected',
      'included_in_published_list',
      'cancelled'
    )
  ),
  constraint purchase_requests_item_reference_type check (
    item_reference_type in ('existing_item', 'new_item_suggestion')
  ),
  constraint purchase_requests_quantity_positive check (
    quantity > 0
  ),
  constraint purchase_requests_existing_item_shape check (
    (
      item_reference_type = 'existing_item'
      and item_id is not null
      and suggested_item_name is null
    )
    or (
      item_reference_type = 'new_item_suggestion'
      and item_id is null
      and suggested_item_name is not null
    )
  ),
  constraint purchase_requests_requester_context check (
    (requested_by_actor_type = 'user' and requested_by_actor_user_id is not null and requested_by_actor_temp_session_id is null)
    or (requested_by_actor_type = 'temporary_volunteer' and requested_by_actor_temp_session_id is not null and requested_by_actor_user_id is null)
    or (requested_by_actor_type = 'system' and requested_by_actor_user_id is null and requested_by_actor_temp_session_id is null)
  ),
  constraint purchase_requests_reviewer_context check (
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
    or (
      reviewed_by_actor_type = 'temporary_volunteer'
      and reviewed_by_actor_temp_session_id is not null
      and reviewed_by_actor_user_id is null
      and reviewed_at is not null
    )
    or (
      reviewed_by_actor_type = 'system'
      and reviewed_by_actor_user_id is null
      and reviewed_by_actor_temp_session_id is null
      and reviewed_at is not null
    )
  )
);

create index if not exists idx_purchase_requests_org_temple
  on public.purchase_requests(organization_id, temple_id);

create index if not exists idx_purchase_requests_status
  on public.purchase_requests(status);

create index if not exists idx_purchase_requests_requester_user
  on public.purchase_requests(requested_by_actor_user_id);

create trigger purchase_requests_updated_at
before update on public.purchase_requests
for each row
execute procedure public.set_updated_at();

alter table public.purchase_requests enable row level security;

drop policy if exists "Authenticated users can create own purchase requests"
  on public.purchase_requests;

create policy "Authenticated users can create own purchase requests"
  on public.purchase_requests
  for insert
  to authenticated
  with check (
    public.is_authenticated_user_in_organization(organization_id)
    and public.is_authenticated_user_assigned_to_temple(temple_id)
    and requested_by_actor_type = 'user'
    and requested_by_actor_user_id = auth.uid()
  );

drop policy if exists "Authenticated users can read own purchase requests"
  on public.purchase_requests;

create policy "Authenticated users can read own purchase requests"
  on public.purchase_requests
  for select
  to authenticated
  using (
    public.is_authenticated_user_in_organization(organization_id)
    and public.is_authenticated_user_assigned_to_temple(temple_id)
    and (
      requested_by_actor_user_id = auth.uid()
      or exists (
        select 1
        from public.current_authenticated_user_roles() authenticated_role
        where authenticated_role.organization_id = purchase_requests.organization_id
          and (
            authenticated_role.temple_id is null
            or authenticated_role.temple_id = purchase_requests.temple_id
          )
          and authenticated_role.role in (
            'senior_cook',
            'inventory_manager',
            'temple_admin',
            'super_admin'
          )
      )
    )
  );

drop policy if exists "Authenticated procurement approvers can review purchase requests"
  on public.purchase_requests;

create policy "Authenticated procurement approvers can review purchase requests"
  on public.purchase_requests
  for update
  to authenticated
  using (
    public.is_authenticated_user_in_organization(organization_id)
    and public.is_authenticated_user_assigned_to_temple(temple_id)
    and exists (
      select 1
      from public.current_authenticated_user_roles() authenticated_role
      where authenticated_role.organization_id = purchase_requests.organization_id
        and (
          authenticated_role.temple_id is null
          or authenticated_role.temple_id = purchase_requests.temple_id
        )
        and authenticated_role.role in (
          'senior_cook',
          'inventory_manager',
          'temple_admin',
          'super_admin'
        )
    )
  )
  with check (
    public.is_authenticated_user_in_organization(organization_id)
    and public.is_authenticated_user_assigned_to_temple(temple_id)
    and reviewed_by_actor_type = 'user'
    and reviewed_by_actor_user_id = auth.uid()
    and status in (
      'approved',
      'needs_clarification',
      'rejected'
    )
  );

create table if not exists public.purchase_lists (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  temple_id uuid not null references public.temples(id),
  name text not null,
  status text not null default 'published',
  publish_mode text not null default 'manual',
  scheduled_publish_at timestamptz,
  published_at timestamptz,
  created_by_actor_type public.actor_type not null,
  created_by_actor_user_id uuid references public.users(id),
  created_by_actor_temp_session_id uuid,
  published_by_actor_type public.actor_type,
  published_by_actor_user_id uuid references public.users(id),
  published_by_actor_temp_session_id uuid,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),

  constraint purchase_lists_status check (
    status in (
      'draft',
      'ready_to_publish',
      'published',
      'in_progress',
      'completed',
      'cancelled'
    )
  ),
  constraint purchase_lists_publish_mode check (
    publish_mode in ('manual', 'scheduled')
  ),
  constraint purchase_lists_created_actor_context check (
    (created_by_actor_type = 'user' and created_by_actor_user_id is not null and created_by_actor_temp_session_id is null)
    or (created_by_actor_type = 'temporary_volunteer' and created_by_actor_temp_session_id is not null and created_by_actor_user_id is null)
    or (created_by_actor_type = 'system' and created_by_actor_user_id is null and created_by_actor_temp_session_id is null)
  ),
  constraint purchase_lists_published_actor_context check (
    (
      published_by_actor_type is null
      and published_by_actor_user_id is null
      and published_by_actor_temp_session_id is null
      and published_at is null
    )
    or (
      published_by_actor_type = 'user'
      and published_by_actor_user_id is not null
      and published_by_actor_temp_session_id is null
      and published_at is not null
    )
    or (
      published_by_actor_type = 'temporary_volunteer'
      and published_by_actor_temp_session_id is not null
      and published_by_actor_user_id is null
      and published_at is not null
    )
    or (
      published_by_actor_type = 'system'
      and published_by_actor_user_id is null
      and published_by_actor_temp_session_id is null
      and published_at is not null
    )
  )
);

create index if not exists idx_purchase_lists_org_temple
  on public.purchase_lists(organization_id, temple_id);

create index if not exists idx_purchase_lists_status
  on public.purchase_lists(status);

create trigger purchase_lists_updated_at
before update on public.purchase_lists
for each row
execute procedure public.set_updated_at();

create table if not exists public.purchase_list_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  temple_id uuid not null references public.temples(id),
  purchase_list_id uuid not null references public.purchase_lists(id),
  status text not null default 'pending_purchase',
  item_reference_type text not null,
  item_id uuid references public.items(id),
  suggested_item_name text,
  suggested_item_category text,
  approved_quantity numeric(12, 6) not null,
  unit public.item_unit not null,
  purchase_location_id uuid references public.purchase_locations(id),
  assigned_purchaser_user_id uuid references public.users(id),
  source_purchase_request_ids uuid[] not null default '{}',
  inventory_transaction_id uuid references public.inventory_transactions(id),
  purchased_quantity numeric(12, 6),
  unit_cost numeric(12, 2),
  total_cost numeric(12, 2),
  purchase_date date,
  purchased_at timestamptz,
  purchased_by_actor_type public.actor_type,
  purchased_by_actor_user_id uuid references public.users(id),
  purchased_by_actor_temp_session_id uuid,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),

  constraint purchase_list_items_status check (
    status in (
      'pending_purchase',
      'bought',
      'partially_bought',
      'unavailable',
      'substituted',
      'receipt_uploaded',
      'reconciled',
      'received_into_inventory',
      'cancelled'
    )
  ),
  constraint purchase_list_items_item_reference_type check (
    item_reference_type in ('existing_item', 'new_item_suggestion')
  ),
  constraint purchase_list_items_quantity_positive check (
    approved_quantity > 0
  ),
  constraint purchase_list_items_source_requests_present check (
    cardinality(source_purchase_request_ids) > 0
  ),
  constraint purchase_list_items_purchased_quantity_non_negative check (
    purchased_quantity is null or purchased_quantity >= 0
  ),
  constraint purchase_list_items_unit_cost_non_negative check (
    unit_cost is null or unit_cost >= 0
  ),
  constraint purchase_list_items_total_cost_non_negative check (
    total_cost is null or total_cost >= 0
  ),
  constraint purchase_list_items_purchase_quantity_required check (
    status not in ('bought', 'partially_bought')
    or (purchased_quantity is not null and purchased_quantity > 0)
  ),
  constraint purchase_list_items_purchaser_context check (
    (
      purchased_by_actor_type is null
      and purchased_by_actor_user_id is null
      and purchased_by_actor_temp_session_id is null
      and purchased_at is null
    )
    or (
      purchased_by_actor_type = 'user'
      and purchased_by_actor_user_id is not null
      and purchased_by_actor_temp_session_id is null
      and purchased_at is not null
    )
    or (
      purchased_by_actor_type = 'temporary_volunteer'
      and purchased_by_actor_temp_session_id is not null
      and purchased_by_actor_user_id is null
      and purchased_at is not null
    )
    or (
      purchased_by_actor_type = 'system'
      and purchased_by_actor_user_id is null
      and purchased_by_actor_temp_session_id is null
      and purchased_at is not null
    )
  ),
  constraint purchase_list_items_existing_item_shape check (
    (
      item_reference_type = 'existing_item'
      and item_id is not null
      and suggested_item_name is null
    )
    or (
      item_reference_type = 'new_item_suggestion'
      and item_id is null
      and suggested_item_name is not null
    )
  )
);

create index if not exists idx_purchase_list_items_org_temple
  on public.purchase_list_items(organization_id, temple_id);

create index if not exists idx_purchase_list_items_purchase_list
  on public.purchase_list_items(purchase_list_id);

create index if not exists idx_purchase_list_items_assigned_purchaser
  on public.purchase_list_items(assigned_purchaser_user_id);

create trigger purchase_list_items_updated_at
before update on public.purchase_list_items
for each row
execute procedure public.set_updated_at();

alter table public.purchase_requests
  add constraint purchase_requests_included_purchase_list_item_fk
  foreign key (included_purchase_list_item_id)
  references public.purchase_list_items(id);

alter table public.purchase_lists enable row level security;
alter table public.purchase_list_items enable row level security;

drop policy if exists "Authenticated users can read scoped purchase lists"
  on public.purchase_lists;

create policy "Authenticated users can read scoped purchase lists"
  on public.purchase_lists
  for select
  to authenticated
  using (
    public.is_authenticated_user_in_organization(organization_id)
    and public.is_authenticated_user_assigned_to_temple(temple_id)
  );

drop policy if exists "Authenticated users can read scoped purchase list items"
  on public.purchase_list_items;

create policy "Authenticated users can read scoped purchase list items"
  on public.purchase_list_items
  for select
  to authenticated
  using (
    public.is_authenticated_user_in_organization(organization_id)
    and public.is_authenticated_user_assigned_to_temple(temple_id)
  );

drop policy if exists "Assigned purchasers can update purchase list item progress"
  on public.purchase_list_items;

create policy "Assigned purchasers can update purchase list item progress"
  on public.purchase_list_items
  for update
  to authenticated
  using (
    public.is_authenticated_user_in_organization(organization_id)
    and public.is_authenticated_user_assigned_to_temple(temple_id)
    and assigned_purchaser_user_id = auth.uid()
    and status in (
      'pending_purchase',
      'bought',
      'partially_bought',
      'unavailable',
      'substituted'
    )
  )
  with check (
    public.is_authenticated_user_in_organization(organization_id)
    and public.is_authenticated_user_assigned_to_temple(temple_id)
    and assigned_purchaser_user_id = auth.uid()
    and purchased_by_actor_type = 'user'
    and purchased_by_actor_user_id = auth.uid()
    and status in (
      'bought',
      'partially_bought',
      'unavailable',
      'substituted'
    )
  );

create or replace function public.publish_approved_purchase_requests(
  p_organization_id uuid,
  p_temple_id uuid,
  p_name text,
  p_published_by_user_id uuid
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
      request.quantity,
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

revoke execute on function public.publish_approved_purchase_requests(uuid, uuid, text, uuid)
  from public;

grant execute on function public.publish_approved_purchase_requests(uuid, uuid, text, uuid)
  to authenticated;
