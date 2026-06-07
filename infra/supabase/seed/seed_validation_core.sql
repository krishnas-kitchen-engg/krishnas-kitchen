-- =====================================================
-- Krishna's Kitchen / SevaOps
-- Core Validation Seed Data
-- =====================================================
--
-- Purpose:
--   Minimal deterministic staging dataset for manual live validation.
--
-- Usage:
--   1. Run seed_validation_cleanup.sql.
--   2. Run this file.
--
-- Notes:
--   - IDs are deterministic.
--   - Rows are validation-tagged by name, notes, or audit_metadata.source.
--   - This file is not a migration.
--   - Intended for staging only.

begin;

-- -----------------------------------------------------
-- Auth + tenant roots
-- -----------------------------------------------------

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '30000000-0000-4000-8000-000000000001',
    'authenticated',
    'authenticated',
    'validation.manager@krishnas-kitchen.test',
    crypt('validation-password', gen_salt('bf')),
    timezone('utc', now()),
    timezone('utc', now()),
    timezone('utc', now()),
    '{
      "provider":"email",
      "providers":["email"],
      "profile_id":"30000000-0000-4000-8000-000000000001",
      "organization_id":"10000000-0000-4000-8000-000000000001",
      "organization_name":"Validation Krishna Kitchen Alpha",
      "roles":["inventory_manager"],
      "temples":[
        {
          "id":"20000000-0000-4000-8000-000000000001",
          "name":"Validation Main Temple"
        },
        {
          "id":"20000000-0000-4000-8000-000000000002",
          "name":"Validation Secondary Temple"
        }
      ]
    }'::jsonb,
    '{"full_name":"Validation Manager"}'::jsonb,
    false
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '30000000-0000-4000-8000-000000000002',
    'authenticated',
    'authenticated',
    'validation.secondary@krishnas-kitchen.test',
    crypt('validation-password', gen_salt('bf')),
    timezone('utc', now()),
    timezone('utc', now()),
    timezone('utc', now()),
    '{
      "provider":"email",
      "providers":["email"],
      "profile_id":"30000000-0000-4000-8000-000000000002",
      "organization_id":"10000000-0000-4000-8000-000000000002",
      "organization_name":"Validation Other Organization",
      "roles":["inventory_manager"],
      "temples":[
        {
          "id":"20000000-0000-4000-8000-000000000003",
          "name":"Validation Other Org Temple"
        }
      ]
    }'::jsonb,
    '{"full_name":"Validation Secondary Manager"}'::jsonb,
    false
  )
on conflict (id) do update
set
  email = excluded.email,
  updated_at = timezone('utc', now()),
  raw_app_meta_data = excluded.raw_app_meta_data,
  raw_user_meta_data = excluded.raw_user_meta_data;

insert into public.organizations (id, name)
values
  ('10000000-0000-4000-8000-000000000001', 'Validation Krishna Kitchen Alpha'),
  ('10000000-0000-4000-8000-000000000002', 'Validation Other Organization')
on conflict (id) do update
set name = excluded.name;

insert into public.temples (id, organization_id, name)
values
  (
    '20000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    'Validation Main Temple'
  ),
  (
    '20000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000001',
    'Validation Secondary Temple'
  ),
  (
    '20000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000002',
    'Validation Other Org Temple'
  )
on conflict (id) do update
set name = excluded.name;

insert into public.users (id, organization_id, full_name, email)
values
  (
    '30000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    'Validation Manager',
    'validation.manager@krishnas-kitchen.test'
  ),
  (
    '30000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000002',
    'Validation Secondary Manager',
    'validation.secondary@krishnas-kitchen.test'
  )
on conflict (id) do update
set
  full_name = excluded.full_name,
  email = excluded.email,
  organization_id = excluded.organization_id;

-- -----------------------------------------------------
-- Catalog
-- -----------------------------------------------------

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
    '40000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    'Validation Rice',
    'Dry Goods',
    'kg',
    'Validation Vendor',
    '25 kg bag',
    60,
    20,
    null
  ),
  (
    '40000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000001',
    'Validation Oil',
    'Pantry',
    'l',
    'Validation Vendor',
    '20 l tin',
    10,
    4,
    null
  ),
  (
    '40000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000001',
    'Validation Milk',
    'Cold Storage',
    'l',
    'Validation Dairy',
    'crate',
    5,
    2,
    null
  ),
  (
    '40000000-0000-4000-8000-000000000004',
    '10000000-0000-4000-8000-000000000001',
    'Validation Vegetables',
    'Produce',
    'kg',
    'Validation Farm',
    'crate',
    15,
    5,
    null
  ),
  (
    '40000000-0000-4000-8000-000000000005',
    '10000000-0000-4000-8000-000000000001',
    'Validation Archived Lentils',
    'Dry Goods',
    'kg',
    null,
    null,
    null,
    null,
    timezone('utc', now())
  ),
  (
    '40000000-0000-4000-8000-000000000006',
    '10000000-0000-4000-8000-000000000002',
    'Validation Other Org Rice',
    'Dry Goods',
    'kg',
    null,
    null,
    null,
    null,
    null
  )
on conflict (id) do update
set
  name = excluded.name,
  category = excluded.category,
  default_unit = excluded.default_unit,
  deleted_at = excluded.deleted_at;

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
    '50000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    null,
    'Validation Trailer A',
    'trailer',
    'validation-location-trailer-a',
    null
  ),
  (
    '50000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    null,
    'Validation Pantry',
    'pantry',
    'validation-location-pantry',
    null
  ),
  (
    '50000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    null,
    'Validation Kitchen',
    'other',
    'validation-location-kitchen',
    null
  ),
  (
    '50000000-0000-4000-8000-000000000004',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    null,
    'Validation Freezer',
    'freezer',
    'validation-location-freezer',
    null
  ),
  (
    '50000000-0000-4000-8000-000000000005',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000002',
    null,
    'Validation Secondary Pantry',
    'pantry',
    'validation-secondary-pantry',
    null
  ),
  (
    '50000000-0000-4000-8000-000000000006',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000002',
    null,
    'Validation Secondary Kitchen',
    'other',
    'validation-secondary-kitchen',
    null
  ),
  (
    '50000000-0000-4000-8000-000000000007',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    null,
    'Validation Old Pantry',
    'pantry',
    'validation-old-pantry',
    timezone('utc', now())
  ),
  (
    '50000000-0000-4000-8000-000000000008',
    '10000000-0000-4000-8000-000000000002',
    '20000000-0000-4000-8000-000000000003',
    null,
    'Validation Other Org Pantry',
    'pantry',
    'validation-other-org-pantry',
    null
  )
on conflict (id) do update
set
  name = excluded.name,
  deleted_at = excluded.deleted_at,
  qr_code = excluded.qr_code;

-- -----------------------------------------------------
-- Volunteer sessions
-- -----------------------------------------------------

insert into public.volunteer_sessions (
  id,
  organization_id,
  temple_id,
  session_name,
  role,
  join_code,
  created_by_user_id,
  expires_at,
  status,
  display_name,
  started_at,
  last_seen_at,
  revoked_at,
  revoked_by_user_id,
  revocation_reason,
  client_session_id
)
values
  (
    '70000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'Validation Active Receiver',
    'temp_receiver',
    'ACTIVE123',
    '30000000-0000-4000-8000-000000000001',
    timezone('utc', now()) + interval '7 days',
    'active',
    null,
    null,
    null,
    null,
    null,
    null,
    null
  ),
  (
    '70000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'Validation Active Second Volunteer',
    'temp_receiver',
    'ACTIVE456',
    '30000000-0000-4000-8000-000000000001',
    timezone('utc', now()) + interval '7 days',
    'active',
    null,
    null,
    null,
    null,
    null,
    null,
    null
  ),
  (
    '70000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'Validation Expired Volunteer',
    'temp_receiver',
    'EXPIRED123',
    '30000000-0000-4000-8000-000000000001',
    timezone('utc', now()) - interval '1 day',
    'active',
    null,
    null,
    null,
    null,
    null,
    null,
    null
  ),
  (
    '70000000-0000-4000-8000-000000000004',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'Validation Revoked Volunteer',
    'temp_receiver',
    'REVOKED123',
    '30000000-0000-4000-8000-000000000001',
    timezone('utc', now()) + interval '7 days',
    'revoked',
    null,
    null,
    null,
    timezone('utc', now()),
    '30000000-0000-4000-8000-000000000001',
    'Validation revoked session',
    null
  ),
  (
    '70000000-0000-4000-8000-000000000005',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000002',
    'Validation Secondary Temple Volunteer',
    'temp_receiver',
    'SECONDARY123',
    '30000000-0000-4000-8000-000000000001',
    timezone('utc', now()) + interval '7 days',
    'active',
    null,
    null,
    null,
    null,
    null,
    null,
    null
  ),
  (
    '70000000-0000-4000-8000-000000000006',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'Validation Short Expiration Volunteer',
    'temp_receiver',
    'SHORT123',
    '30000000-0000-4000-8000-000000000001',
    timezone('utc', now()) + interval '5 minutes',
    'active',
    null,
    null,
    null,
    null,
    null,
    null,
    null
  )
on conflict (id) do update
set
  display_name = null,
  started_at = null,
  last_seen_at = null,
  client_session_id = null,
  status = excluded.status,
  expires_at = excluded.expires_at,
  revoked_at = excluded.revoked_at,
  revoked_by_user_id = excluded.revoked_by_user_id,
  revocation_reason = excluded.revocation_reason;

-- -----------------------------------------------------
-- Barcode mappings
-- -----------------------------------------------------

insert into public.item_barcodes (
  id,
  organization_id,
  item_id,
  barcode,
  barcode_format,
  barcode_value,
  archived_at,
  archived_by_actor_type,
  archived_by_actor_user_id,
  archived_by_actor_temp_session_id,
  archive_reason,
  created_by_actor_type,
  created_by_actor_user_id,
  created_by_actor_temp_session_id,
  notes,
  source_unknown_barcode_id
)
values
  (
    '60000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    '40000000-0000-4000-8000-000000000001',
    '036000291452',
    'upc_a',
    '036000291452',
    null,
    null,
    null,
    null,
    null,
    'system',
    null,
    null,
    'validation: active rice UPC-A',
    null
  ),
  (
    '60000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000001',
    '40000000-0000-4000-8000-000000000002',
    '4006381333931',
    'ean_13',
    '4006381333931',
    null,
    null,
    null,
    null,
    null,
    'system',
    null,
    null,
    'validation: active oil EAN-13',
    null
  ),
  (
    '60000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000001',
    '40000000-0000-4000-8000-000000000003',
    '96385074',
    'ean_8',
    '96385074',
    null,
    null,
    null,
    null,
    null,
    'system',
    null,
    null,
    'validation: active milk EAN-8',
    null
  ),
  (
    '60000000-0000-4000-8000-000000000004',
    '10000000-0000-4000-8000-000000000001',
    '40000000-0000-4000-8000-000000000004',
    'KK-VALIDATION-VEGETABLES',
    'qr',
    'KK-VALIDATION-VEGETABLES',
    null,
    null,
    null,
    null,
    null,
    'system',
    null,
    null,
    'validation: active vegetables QR',
    null
  ),
  (
    '60000000-0000-4000-8000-000000000005',
    '10000000-0000-4000-8000-000000000001',
    '40000000-0000-4000-8000-000000000001',
    '012345678905',
    'upc_a',
    '012345678905',
    timezone('utc', now()),
    'system',
    null,
    null,
    'validation archived barcode mapping',
    'system',
    null,
    null,
    'validation: archived rice UPC-A',
    null
  ),
  (
    '60000000-0000-4000-8000-000000000006',
    '10000000-0000-4000-8000-000000000001',
    '40000000-0000-4000-8000-000000000005',
    '12345670',
    'ean_8',
    '12345670',
    null,
    null,
    null,
    null,
    null,
    'system',
    null,
    null,
    'validation: barcode for archived item',
    null
  ),
  (
    '60000000-0000-4000-8000-000000000007',
    '10000000-0000-4000-8000-000000000002',
    '40000000-0000-4000-8000-000000000006',
    '036000291452',
    'upc_a',
    '036000291452',
    null,
    null,
    null,
    null,
    null,
    'system',
    null,
    null,
    'validation: same barcode in another organization',
    null
  )
on conflict (id) do update
set
  archived_at = excluded.archived_at,
  archive_reason = excluded.archive_reason,
  notes = excluded.notes;

-- -----------------------------------------------------
-- Starting inventory event history
-- -----------------------------------------------------

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
    'a0000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    '40000000-0000-4000-8000-000000000001',
    null,
    '50000000-0000-4000-8000-000000000002',
    'received',
    'increase',
    50,
    'kg',
    'system',
    null,
    null,
    'validation: starting rice in pantry',
    '{"source":"validation_seed","scenario":"starting_balance"}'::jsonb,
    null,
    timezone('utc', now()) - interval '6 days'
  ),
  (
    'a0000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    '40000000-0000-4000-8000-000000000002',
    null,
    '50000000-0000-4000-8000-000000000002',
    'received',
    'increase',
    20,
    'l',
    'system',
    null,
    null,
    'validation: starting oil in pantry',
    '{"source":"validation_seed","scenario":"starting_balance"}'::jsonb,
    null,
    timezone('utc', now()) - interval '5 days'
  ),
  (
    'a0000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    '40000000-0000-4000-8000-000000000003',
    null,
    '50000000-0000-4000-8000-000000000004',
    'received',
    'increase',
    10,
    'l',
    'system',
    null,
    null,
    'validation: starting milk in freezer',
    '{"source":"validation_seed","scenario":"starting_balance"}'::jsonb,
    null,
    timezone('utc', now()) - interval '4 days'
  ),
  (
    'a0000000-0000-4000-8000-000000000004',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    '40000000-0000-4000-8000-000000000001',
    '50000000-0000-4000-8000-000000000002',
    '50000000-0000-4000-8000-000000000003',
    'transfer',
    'transfer',
    5,
    'kg',
    'system',
    null,
    null,
    'validation: starting rice transfer pantry to kitchen',
    '{"source":"validation_seed","scenario":"transfer_history"}'::jsonb,
    null,
    timezone('utc', now()) - interval '3 days'
  ),
  (
    'a0000000-0000-4000-8000-000000000005',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    '40000000-0000-4000-8000-000000000001',
    '50000000-0000-4000-8000-000000000003',
    '50000000-0000-4000-8000-000000000002',
    'returned',
    'transfer',
    2,
    'kg',
    'system',
    null,
    null,
    'validation: starting rice return kitchen to pantry',
    '{"source":"validation_seed","scenario":"return_history"}'::jsonb,
    null,
    timezone('utc', now()) - interval '2 days'
  ),
  (
    'a0000000-0000-4000-8000-000000000006',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    '40000000-0000-4000-8000-000000000002',
    '50000000-0000-4000-8000-000000000002',
    null,
    'reversal',
    'decrease',
    2,
    'l',
    'system',
    null,
    null,
    'validation: reversal of starting oil receive',
    '{"source":"validation_seed","scenario":"reversal_history"}'::jsonb,
    'a0000000-0000-4000-8000-000000000002',
    timezone('utc', now()) - interval '1 day'
  ),
  (
    'a0000000-0000-4000-8000-000000000007',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000002',
    '40000000-0000-4000-8000-000000000001',
    null,
    '50000000-0000-4000-8000-000000000005',
    'received',
    'increase',
    30,
    'kg',
    'system',
    null,
    null,
    'validation: secondary temple rice',
    '{"source":"validation_seed","scenario":"cross_temple"}'::jsonb,
    null,
    timezone('utc', now()) - interval '2 days'
  )
on conflict (id) do nothing;

-- -----------------------------------------------------
-- Low-stock tasks
-- -----------------------------------------------------

insert into public.inventory_low_stock_thresholds (
  id,
  organization_id,
  temple_id,
  item_id,
  location_id,
  unit,
  minimum_quantity,
  created_by_actor_type,
  created_by_actor_user_id,
  created_by_actor_temp_session_id,
  archived_at
)
values
  (
    '80000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    '40000000-0000-4000-8000-000000000001',
    '50000000-0000-4000-8000-000000000002',
    'kg',
    60,
    'system',
    null,
    null,
    null
  ),
  (
    '80000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    '40000000-0000-4000-8000-000000000003',
    '50000000-0000-4000-8000-000000000004',
    'l',
    5,
    'system',
    null,
    null,
    null
  ),
  (
    '80000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000001',
    null,
    '40000000-0000-4000-8000-000000000001',
    null,
    'kg',
    40,
    'system',
    null,
    null,
    null
  )
on conflict (id) do update
set
  minimum_quantity = excluded.minimum_quantity,
  archived_at = null;

-- -----------------------------------------------------
-- Unknown barcode task queue
-- -----------------------------------------------------

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
  linked_item_id,
  linked_barcode_mapping_id,
  linked_at,
  linked_by_actor_type,
  linked_by_actor_user_id,
  linked_by_actor_temp_session_id,
  dismissed_at,
  dismissed_by_actor_type,
  dismissed_by_actor_user_id,
  dismissed_by_actor_temp_session_id,
  dismissal_reason,
  notes
)
values
  (
    '90000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'upc_a',
    '999999999993',
    'pending',
    2,
    'validation_scan',
    'system',
    null,
    null,
    timezone('utc', now()) - interval '1 day',
    timezone('utc', now()) - interval '1 hour',
    'system',
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    'validation: pending unknown barcode main temple'
  ),
  (
    '90000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000002',
    'upc_a',
    '999999999993',
    'pending',
    1,
    'validation_scan',
    'system',
    null,
    null,
    timezone('utc', now()) - interval '2 hours',
    timezone('utc', now()) - interval '2 hours',
    'system',
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    'validation: same unknown barcode secondary temple'
  ),
  (
    '90000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'qr',
    'KK-LINKED-UNKNOWN',
    'linked',
    1,
    'validation_scan',
    'system',
    null,
    null,
    timezone('utc', now()) - interval '2 days',
    timezone('utc', now()) - interval '2 days',
    'system',
    null,
    null,
    '40000000-0000-4000-8000-000000000004',
    '60000000-0000-4000-8000-000000000004',
    timezone('utc', now()) - interval '1 day',
    'system',
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    'validation: linked unknown barcode'
  ),
  (
    '90000000-0000-4000-8000-000000000004',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'qr',
    'KK-DISMISSED-UNKNOWN',
    'dismissed',
    1,
    'validation_scan',
    'system',
    null,
    null,
    timezone('utc', now()) - interval '3 days',
    timezone('utc', now()) - interval '3 days',
    'system',
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    timezone('utc', now()) - interval '2 days',
    'system',
    null,
    null,
    'Validation dismissed barcode',
    'validation: dismissed unknown barcode'
  )
on conflict (id) do update
set
  scan_count = excluded.scan_count,
  status = excluded.status,
  notes = excluded.notes,
  last_seen_at = excluded.last_seen_at;

commit;
