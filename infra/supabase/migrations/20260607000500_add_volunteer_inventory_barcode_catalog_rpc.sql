-- =====================================================
-- Krishna's Kitchen / SevaOps
-- Volunteer Inventory Barcode Catalog RPC
-- =====================================================

-- Add the missing temporary-volunteer read surface for Inventory Lookup's
-- barcode catalog mode. Scope is derived exclusively from active
-- volunteer_sessions rows.

create or replace function public.list_volunteer_inventory_barcodes(
  volunteer_session_id uuid,
  expected_client_session_id text,
  checked_at timestamptz default timezone('utc', now())
)
returns setof public.item_barcodes
language sql
stable
security definer
set search_path = public
as $$
  select barcode_mapping.*
  from public.get_active_volunteer_session_scope(
    volunteer_session_id,
    nullif(trim(expected_client_session_id), ''),
    checked_at
  ) session_scope
  join public.item_barcodes barcode_mapping
    on barcode_mapping.organization_id = session_scope.organization_id
  join public.items item
    on item.id = barcode_mapping.item_id
   and item.organization_id = session_scope.organization_id
   and item.deleted_at is null
  where nullif(trim(expected_client_session_id), '') is not null
    and barcode_mapping.archived_at is null
  order by barcode_mapping.item_id, barcode_mapping.barcode_format, barcode_mapping.barcode_value, barcode_mapping.id;
$$;

revoke execute on function public.list_volunteer_inventory_barcodes(uuid, text, timestamptz)
  from public;

grant execute on function public.list_volunteer_inventory_barcodes(uuid, text, timestamptz)
  to anon;
