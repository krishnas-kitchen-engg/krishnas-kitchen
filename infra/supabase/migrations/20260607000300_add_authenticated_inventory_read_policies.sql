-- =====================================================
-- Krishna's Kitchen / SevaOps
-- Authenticated Inventory Read Policies
-- =====================================================

-- Add authenticated-user read access for inventory-facing tables. Temporary
-- volunteer inventory reads remain out of scope for this migration and will be
-- mediated by RPCs later.

drop policy if exists "Authenticated users can read organization items"
  on public.items;

create policy "Authenticated users can read organization items"
  on public.items
  for select
  to authenticated
  using (
    public.is_authenticated_user_in_organization(organization_id)
  );

drop policy if exists "Authenticated users can read assigned temple locations"
  on public.locations;

create policy "Authenticated users can read assigned temple locations"
  on public.locations
  for select
  to authenticated
  using (
    public.is_authenticated_user_in_organization(organization_id)
    and public.is_authenticated_user_assigned_to_temple(temple_id)
  );

drop policy if exists "Authenticated users can read organization barcode mappings"
  on public.item_barcodes;

create policy "Authenticated users can read organization barcode mappings"
  on public.item_barcodes
  for select
  to authenticated
  using (
    public.is_authenticated_user_in_organization(organization_id)
  );

drop policy if exists "Authenticated users can read assigned temple inventory transactions"
  on public.inventory_transactions;

create policy "Authenticated users can read assigned temple inventory transactions"
  on public.inventory_transactions
  for select
  to authenticated
  using (
    public.is_authenticated_user_in_organization(organization_id)
    and public.is_authenticated_user_assigned_to_temple(temple_id)
  );

drop policy if exists "Authenticated users can read scoped low stock thresholds"
  on public.inventory_low_stock_thresholds;

create policy "Authenticated users can read scoped low stock thresholds"
  on public.inventory_low_stock_thresholds
  for select
  to authenticated
  using (
    public.is_authenticated_user_in_organization(organization_id)
    and (
      temple_id is null
      or public.is_authenticated_user_assigned_to_temple(temple_id)
    )
    and (
      location_id is null
      or exists (
        select 1
        from public.locations threshold_location
        where threshold_location.id = location_id
          and threshold_location.organization_id = organization_id
          and threshold_location.deleted_at is null
          and public.is_authenticated_user_assigned_to_temple(threshold_location.temple_id)
      )
    )
  );

drop policy if exists "Authenticated users can read scoped unknown barcodes"
  on public.unknown_barcodes;

create policy "Authenticated users can read scoped unknown barcodes"
  on public.unknown_barcodes
  for select
  to authenticated
  using (
    public.is_authenticated_user_in_organization(organization_id)
    and (
      temple_id is null
      or public.is_authenticated_user_assigned_to_temple(temple_id)
    )
  );
