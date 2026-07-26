-- =====================================================
-- Krishna's Kitchen / SevaOps
-- Location Management
-- =====================================================

alter table public.locations
  add column if not exists description text;

alter table public.locations
  drop constraint if exists locations_unique_name_per_parent;

create unique index if not exists locations_unique_active_name_per_parent
  on public.locations (
    organization_id,
    temple_id,
    coalesce(parent_location_id, '00000000-0000-0000-0000-000000000000'::uuid),
    lower(name)
  )
  where deleted_at is null;

drop policy if exists "Authenticated managers can create scoped locations"
  on public.locations;

create policy "Authenticated managers can create scoped locations"
  on public.locations
  for insert
  to authenticated
  with check (
    public.is_authenticated_user_in_organization(organization_id)
    and public.is_authenticated_user_assigned_to_temple(temple_id)
    and exists (
      select 1
      from public.current_authenticated_user_roles() authenticated_role
      where authenticated_role.organization_id = locations.organization_id
        and (
          authenticated_role.temple_id is null
          or authenticated_role.temple_id = locations.temple_id
        )
        and authenticated_role.role in (
          'inventory_manager',
          'temple_admin',
          'super_admin'
        )
    )
  );

drop policy if exists "Authenticated managers can update scoped locations"
  on public.locations;

create policy "Authenticated managers can update scoped locations"
  on public.locations
  for update
  to authenticated
  using (
    public.is_authenticated_user_in_organization(organization_id)
    and public.is_authenticated_user_assigned_to_temple(temple_id)
    and exists (
      select 1
      from public.current_authenticated_user_roles() authenticated_role
      where authenticated_role.organization_id = locations.organization_id
        and (
          authenticated_role.temple_id is null
          or authenticated_role.temple_id = locations.temple_id
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
    and exists (
      select 1
      from public.current_authenticated_user_roles() authenticated_role
      where authenticated_role.organization_id = locations.organization_id
        and (
          authenticated_role.temple_id is null
          or authenticated_role.temple_id = locations.temple_id
        )
        and authenticated_role.role in (
          'inventory_manager',
          'temple_admin',
          'super_admin'
        )
    )
  );
