-- =====================================================
-- Krishna's Kitchen / SevaOps
-- Expanded Validation Seed Data
-- =====================================================
--
-- Purpose:
--   Additional catalog and history rows for richer manual usability testing.
--
-- Usage:
--   1. Run seed_validation_cleanup.sql.
--   2. Run seed_validation_core.sql.
--   3. Run this file.

begin;

insert into public.items (
  id,
  organization_id,
  name,
  category,
  default_unit,
  preferred_vendor,
  preferred_purchase_unit,
  reorder_threshold,
  critical_threshold,
  deleted_at
)
values
  (
    '40000000-0000-4000-8000-000000000011',
    '10000000-0000-4000-8000-000000000001',
    'Validation Flour',
    'Dry Goods',
    'kg',
    'Validation Vendor',
    '25 kg bag',
    25,
    10,
    null
  ),
  (
    '40000000-0000-4000-8000-000000000012',
    '10000000-0000-4000-8000-000000000001',
    'Validation Sugar',
    'Dry Goods',
    'kg',
    'Validation Vendor',
    '10 kg bag',
    15,
    5,
    null
  ),
  (
    '40000000-0000-4000-8000-000000000013',
    '10000000-0000-4000-8000-000000000001',
    'Validation Yogurt',
    'Cold Storage',
    'l',
    'Validation Dairy',
    'crate',
    8,
    3,
    null
  ),
  (
    '40000000-0000-4000-8000-000000000014',
    '10000000-0000-4000-8000-000000000001',
    'Validation Potatoes',
    'Produce',
    'kg',
    'Validation Farm',
    'crate',
    20,
    8,
    null
  )
on conflict (id) do update
set name = excluded.name;

insert into public.locations (
  id,
  organization_id,
  temple_id,
  parent_location_id,
  name,
  location_type,
  qr_code,
  deleted_at
)
values
  (
    '50000000-0000-4000-8000-000000000011',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    null,
    'Validation Trailer B',
    'trailer',
    'validation-location-trailer-b',
    null
  ),
  (
    '50000000-0000-4000-8000-000000000012',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    null,
    'Validation Festival Storage',
    'warehouse',
    'validation-location-festival-storage',
    null
  ),
  (
    '50000000-0000-4000-8000-000000000013',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    null,
    'Validation Walk-in Cooler',
    'other',
    'validation-location-walk-in-cooler',
    null
  )
on conflict (id) do update
set name = excluded.name;

insert into public.item_barcodes (
  id,
  organization_id,
  item_id,
  barcode,
  barcode_format,
  barcode_value,
  archived_at,
  created_by_actor_type,
  created_by_actor_user_id,
  created_by_actor_temp_session_id,
  notes
)
values
  (
    '60000000-0000-4000-8000-000000000011',
    '10000000-0000-4000-8000-000000000001',
    '40000000-0000-4000-8000-000000000011',
    '042100005264',
    'upc_a',
    '042100005264',
    null,
    'system',
    null,
    null,
    'validation: expanded flour UPC-A'
  ),
  (
    '60000000-0000-4000-8000-000000000012',
    '10000000-0000-4000-8000-000000000001',
    '40000000-0000-4000-8000-000000000012',
    '4012345678901',
    'ean_13',
    '4012345678901',
    null,
    'system',
    null,
    null,
    'validation: expanded sugar EAN-13'
  ),
  (
    '60000000-0000-4000-8000-000000000013',
    '10000000-0000-4000-8000-000000000001',
    '40000000-0000-4000-8000-000000000013',
    'KK-VALIDATION-YOGURT',
    'qr',
    'KK-VALIDATION-YOGURT',
    null,
    'system',
    null,
    null,
    'validation: expanded yogurt QR'
  )
on conflict (id) do update
set notes = excluded.notes;

insert into public.inventory_transactions (
  id,
  organization_id,
  temple_id,
  item_id,
  source_location_id,
  destination_location_id,
  transaction_type,
  quantity_effect,
  quantity,
  unit,
  actor_type,
  actor_user_id,
  actor_temp_session_id,
  notes,
  audit_metadata,
  reversal_of_transaction_id,
  created_at
)
values
  (
    'a0000000-0000-4000-8000-000000000011',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    '40000000-0000-4000-8000-000000000011',
    null,
    '50000000-0000-4000-8000-000000000002',
    'received',
    'increase',
    25,
    'kg',
    'system',
    null,
    null,
    'validation: expanded flour receive',
    '{"source":"validation_seed","scenario":"expanded_history"}'::jsonb,
    null,
    timezone('utc', now()) - interval '36 hours'
  ),
  (
    'a0000000-0000-4000-8000-000000000012',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    '40000000-0000-4000-8000-000000000011',
    '50000000-0000-4000-8000-000000000002',
    '50000000-0000-4000-8000-000000000012',
    'transfer',
    'transfer',
    10,
    'kg',
    'system',
    null,
    null,
    'validation: expanded flour transfer',
    '{"source":"validation_seed","scenario":"expanded_history"}'::jsonb,
    null,
    timezone('utc', now()) - interval '30 hours'
  ),
  (
    'a0000000-0000-4000-8000-000000000013',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    '40000000-0000-4000-8000-000000000013',
    null,
    '50000000-0000-4000-8000-000000000013',
    'received',
    'increase',
    12,
    'l',
    'system',
    null,
    null,
    'validation: expanded yogurt receive',
    '{"source":"validation_seed","scenario":"expanded_history"}'::jsonb,
    null,
    timezone('utc', now()) - interval '24 hours'
  )
on conflict (id) do nothing;

insert into public.unknown_barcodes (
  id,
  organization_id,
  temple_id,
  barcode_format,
  barcode_value,
  status,
  scan_count,
  source_workflow,
  actor_type,
  actor_user_id,
  actor_temp_session_id,
  first_seen_at,
  last_seen_at,
  last_seen_by_actor_type,
  last_seen_by_actor_user_id,
  last_seen_by_actor_temp_session_id,
  notes
)
values
  (
    '90000000-0000-4000-8000-000000000005',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'ean_13',
    '4011111111116',
    'pending',
    4,
    'validation_scan',
    'system',
    null,
    null,
    timezone('utc', now()) - interval '5 hours',
    timezone('utc', now()) - interval '30 minutes',
    'system',
    null,
    null,
    'validation: expanded pending unknown barcode'
  )
on conflict (id) do update
set
  scan_count = excluded.scan_count,
  last_seen_at = excluded.last_seen_at,
  notes = excluded.notes;

commit;
