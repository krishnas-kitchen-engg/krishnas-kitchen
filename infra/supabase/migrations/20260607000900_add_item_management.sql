-- =====================================================
-- Krishna's Kitchen / SevaOps
-- Inventory Item Management
-- =====================================================

alter table public.items
  add column if not exists description text;

alter table public.items
  drop constraint if exists items_unique_name_per_org;

create unique index if not exists items_unique_active_name_per_org
  on public.items (
    organization_id,
    lower(name)
  )
  where deleted_at is null;

drop policy if exists "Authenticated managers can create organization items"
  on public.items;

create policy "Authenticated managers can create organization items"
  on public.items
  for insert
  to authenticated
  with check (
    public.is_authenticated_user_in_organization(organization_id)
    and exists (
      select 1
      from public.current_authenticated_user_roles() authenticated_role
      where authenticated_role.organization_id = items.organization_id
        and authenticated_role.role in (
          'inventory_manager',
          'temple_admin',
          'super_admin'
        )
    )
  );

drop policy if exists "Authenticated managers can update organization items"
  on public.items;

create policy "Authenticated managers can update organization items"
  on public.items
  for update
  to authenticated
  using (
    public.is_authenticated_user_in_organization(organization_id)
    and exists (
      select 1
      from public.current_authenticated_user_roles() authenticated_role
      where authenticated_role.organization_id = items.organization_id
        and authenticated_role.role in (
          'inventory_manager',
          'temple_admin',
          'super_admin'
        )
    )
  )
  with check (
    public.is_authenticated_user_in_organization(organization_id)
    and exists (
      select 1
      from public.current_authenticated_user_roles() authenticated_role
      where authenticated_role.organization_id = items.organization_id
        and authenticated_role.role in (
          'inventory_manager',
          'temple_admin',
          'super_admin'
        )
    )
  );

drop policy if exists "Authenticated managers can create low stock thresholds"
  on public.inventory_low_stock_thresholds;

create policy "Authenticated managers can create low stock thresholds"
  on public.inventory_low_stock_thresholds
  for insert
  to authenticated
  with check (
    public.is_authenticated_user_in_organization(organization_id)
    and (
      temple_id is null
      or public.is_authenticated_user_assigned_to_temple(temple_id)
    )
    and created_by_actor_type = 'user'
    and created_by_actor_user_id = auth.uid()
    and exists (
      select 1
      from public.current_authenticated_user_roles() authenticated_role
      where authenticated_role.organization_id = inventory_low_stock_thresholds.organization_id
        and (
          inventory_low_stock_thresholds.temple_id is null
          or authenticated_role.temple_id is null
          or authenticated_role.temple_id = inventory_low_stock_thresholds.temple_id
        )
        and authenticated_role.role in (
          'inventory_manager',
          'temple_admin',
          'super_admin'
        )
    )
  );

drop policy if exists "Authenticated managers can update low stock thresholds"
  on public.inventory_low_stock_thresholds;

create policy "Authenticated managers can update low stock thresholds"
  on public.inventory_low_stock_thresholds
  for update
  to authenticated
  using (
    public.is_authenticated_user_in_organization(organization_id)
    and (
      temple_id is null
      or public.is_authenticated_user_assigned_to_temple(temple_id)
    )
    and exists (
      select 1
      from public.current_authenticated_user_roles() authenticated_role
      where authenticated_role.organization_id = inventory_low_stock_thresholds.organization_id
        and (
          inventory_low_stock_thresholds.temple_id is null
          or authenticated_role.temple_id is null
          or authenticated_role.temple_id = inventory_low_stock_thresholds.temple_id
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
    and (
      temple_id is null
      or public.is_authenticated_user_assigned_to_temple(temple_id)
    )
    and exists (
      select 1
      from public.current_authenticated_user_roles() authenticated_role
      where authenticated_role.organization_id = inventory_low_stock_thresholds.organization_id
        and (
          inventory_low_stock_thresholds.temple_id is null
          or authenticated_role.temple_id is null
          or authenticated_role.temple_id = inventory_low_stock_thresholds.temple_id
        )
        and authenticated_role.role in (
          'inventory_manager',
          'temple_admin',
          'super_admin'
        )
    )
  );
