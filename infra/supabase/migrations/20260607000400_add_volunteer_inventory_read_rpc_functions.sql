-- =====================================================
-- Krishna's Kitchen / SevaOps
-- Volunteer Inventory Read RPCs
-- =====================================================

-- Add controlled SECURITY DEFINER RPCs for temporary volunteer inventory
-- visibility. These functions intentionally avoid direct anon table policies
-- and derive organization and temple scope from active volunteer_sessions rows.

create or replace function public.list_volunteer_inventory_items(
  volunteer_session_id uuid,
  expected_client_session_id text,
  checked_at timestamptz default timezone('utc', now())
)
returns setof public.items
language sql
stable
security definer
set search_path = public
as $$
  select item.*
  from public.get_active_volunteer_session_scope(
    volunteer_session_id,
    nullif(trim(expected_client_session_id), ''),
    checked_at
  ) session_scope
  join public.items item
    on item.organization_id = session_scope.organization_id
  where nullif(trim(expected_client_session_id), '') is not null
    and item.deleted_at is null
  order by item.name, item.id;
$$;

create or replace function public.list_volunteer_inventory_locations(
  volunteer_session_id uuid,
  expected_client_session_id text,
  checked_at timestamptz default timezone('utc', now())
)
returns setof public.locations
language sql
stable
security definer
set search_path = public
as $$
  select location.*
  from public.get_active_volunteer_session_scope(
    volunteer_session_id,
    nullif(trim(expected_client_session_id), ''),
    checked_at
  ) session_scope
  join public.locations location
    on location.organization_id = session_scope.organization_id
   and location.temple_id = session_scope.temple_id
  where nullif(trim(expected_client_session_id), '') is not null
    and location.deleted_at is null
  order by location.name, location.id;
$$;

create or replace function public.lookup_volunteer_inventory_barcode(
  volunteer_session_id uuid,
  expected_client_session_id text,
  requested_barcode_format public.barcode_format,
  requested_barcode_value text,
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
    and requested_barcode_value is not null
    and length(trim(requested_barcode_value)) > 0
    and barcode_mapping.archived_at is null
    and barcode_mapping.barcode_format = requested_barcode_format
    and barcode_mapping.barcode_value = requested_barcode_value
  order by barcode_mapping.item_id, barcode_mapping.id;
$$;

create or replace function public.list_volunteer_inventory_transactions(
  volunteer_session_id uuid,
  expected_client_session_id text,
  checked_at timestamptz default timezone('utc', now())
)
returns setof public.inventory_transactions
language sql
stable
security definer
set search_path = public
as $$
  select inventory_transaction.*
  from public.get_active_volunteer_session_scope(
    volunteer_session_id,
    nullif(trim(expected_client_session_id), ''),
    checked_at
  ) session_scope
  join public.inventory_transactions inventory_transaction
    on inventory_transaction.organization_id = session_scope.organization_id
   and inventory_transaction.temple_id = session_scope.temple_id
  join public.items item
    on item.id = inventory_transaction.item_id
   and item.organization_id = session_scope.organization_id
   and item.deleted_at is null
  left join public.locations source_location
    on source_location.id = inventory_transaction.source_location_id
   and source_location.organization_id = session_scope.organization_id
   and source_location.temple_id = session_scope.temple_id
  left join public.locations destination_location
    on destination_location.id = inventory_transaction.destination_location_id
   and destination_location.organization_id = session_scope.organization_id
   and destination_location.temple_id = session_scope.temple_id
  where nullif(trim(expected_client_session_id), '') is not null
    and (
      inventory_transaction.source_location_id is null
      or (
        source_location.id is not null
        and source_location.deleted_at is null
      )
    )
    and (
      inventory_transaction.destination_location_id is null
      or (
        destination_location.id is not null
        and destination_location.deleted_at is null
      )
    )
  order by inventory_transaction.created_at, inventory_transaction.id;
$$;

create or replace function public.list_volunteer_inventory_low_stock_thresholds(
  volunteer_session_id uuid,
  expected_client_session_id text,
  checked_at timestamptz default timezone('utc', now())
)
returns setof public.inventory_low_stock_thresholds
language sql
stable
security definer
set search_path = public
as $$
  select threshold.*
  from public.get_active_volunteer_session_scope(
    volunteer_session_id,
    nullif(trim(expected_client_session_id), ''),
    checked_at
  ) session_scope
  join public.inventory_low_stock_thresholds threshold
    on threshold.organization_id = session_scope.organization_id
  join public.items item
    on item.id = threshold.item_id
   and item.organization_id = session_scope.organization_id
   and item.deleted_at is null
  left join public.locations threshold_location
    on threshold_location.id = threshold.location_id
   and threshold_location.organization_id = session_scope.organization_id
  where nullif(trim(expected_client_session_id), '') is not null
    and threshold.archived_at is null
    and (
      threshold.temple_id is null
      or threshold.temple_id = session_scope.temple_id
    )
    and (
      threshold.location_id is null
      or (
        threshold_location.deleted_at is null
        and threshold_location.temple_id = session_scope.temple_id
      )
    )
  order by threshold.temple_id, threshold.location_id, threshold.item_id, threshold.unit, threshold.id;
$$;

create or replace function public.list_volunteer_pending_unknown_barcodes(
  volunteer_session_id uuid,
  expected_client_session_id text,
  checked_at timestamptz default timezone('utc', now())
)
returns setof public.unknown_barcodes
language sql
stable
security definer
set search_path = public
as $$
  select unknown_barcode.*
  from public.get_active_volunteer_session_scope(
    volunteer_session_id,
    nullif(trim(expected_client_session_id), ''),
    checked_at
  ) session_scope
  join public.unknown_barcodes unknown_barcode
    on unknown_barcode.organization_id = session_scope.organization_id
  where nullif(trim(expected_client_session_id), '') is not null
    and unknown_barcode.status = 'pending'
    and (
      unknown_barcode.temple_id is null
      or unknown_barcode.temple_id = session_scope.temple_id
    )
  order by unknown_barcode.last_seen_at desc, unknown_barcode.id desc;
$$;

revoke execute on function public.list_volunteer_inventory_items(uuid, text, timestamptz)
  from public;
revoke execute on function public.list_volunteer_inventory_locations(uuid, text, timestamptz)
  from public;
revoke execute on function public.lookup_volunteer_inventory_barcode(uuid, text, public.barcode_format, text, timestamptz)
  from public;
revoke execute on function public.list_volunteer_inventory_transactions(uuid, text, timestamptz)
  from public;
revoke execute on function public.list_volunteer_inventory_low_stock_thresholds(uuid, text, timestamptz)
  from public;
revoke execute on function public.list_volunteer_pending_unknown_barcodes(uuid, text, timestamptz)
  from public;

grant execute on function public.list_volunteer_inventory_items(uuid, text, timestamptz)
  to anon;
grant execute on function public.list_volunteer_inventory_locations(uuid, text, timestamptz)
  to anon;
grant execute on function public.lookup_volunteer_inventory_barcode(uuid, text, public.barcode_format, text, timestamptz)
  to anon;
grant execute on function public.list_volunteer_inventory_transactions(uuid, text, timestamptz)
  to anon;
grant execute on function public.list_volunteer_inventory_low_stock_thresholds(uuid, text, timestamptz)
  to anon;
grant execute on function public.list_volunteer_pending_unknown_barcodes(uuid, text, timestamptz)
  to anon;
