-- =====================================================
-- Krishna's Kitchen / SevaOps
-- Validation Seed Cleanup
-- =====================================================
--
-- Purpose:
--   Remove only records created by the validation seed assets.
--
-- Safety:
--   - No table truncation.
--   - Deletes are scoped to deterministic validation IDs and
--     audit_metadata.source = 'validation_seed'.
--   - Immutable validation transactions/audit rows require temporarily
--     disabling their immutable triggers so staging can be reset.
--
-- Intended environment:
--   Staging only. Do not run against production.

begin;

alter table public.audit_logs disable trigger audit_logs_immutable;
alter table public.inventory_transactions disable trigger inventory_transactions_immutable;

delete from public.audit_logs
where organization_id in (
  '10000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000002'
)
and metadata ->> 'source' = 'validation_seed';

delete from public.unknown_barcodes
where organization_id in (
  '10000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000002'
)
and (
  notes like 'validation:%'
  or source_workflow like 'validation%'
  or id in (
    '90000000-0000-4000-8000-000000000001',
    '90000000-0000-4000-8000-000000000002',
    '90000000-0000-4000-8000-000000000003',
    '90000000-0000-4000-8000-000000000004',
    '90000000-0000-4000-8000-000000000005',
    '90000000-0000-4000-8000-000000000006'
  )
);

delete from public.inventory_low_stock_thresholds
where organization_id in (
  '10000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000002'
)
and id::text like '80000000-0000-4000-8000-%';

delete from public.inventory_transactions
where organization_id in (
  '10000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000002'
)
and (
  audit_metadata ->> 'source' = 'validation_seed'
  or actor_temp_session_id in (
    '70000000-0000-4000-8000-000000000001',
    '70000000-0000-4000-8000-000000000002',
    '70000000-0000-4000-8000-000000000003',
    '70000000-0000-4000-8000-000000000004',
    '70000000-0000-4000-8000-000000000005',
    '70000000-0000-4000-8000-000000000006'
  )
  or item_id in (
    '40000000-0000-4000-8000-000000000001',
    '40000000-0000-4000-8000-000000000002',
    '40000000-0000-4000-8000-000000000003',
    '40000000-0000-4000-8000-000000000004',
    '40000000-0000-4000-8000-000000000005',
    '40000000-0000-4000-8000-000000000006',
    '40000000-0000-4000-8000-000000000011',
    '40000000-0000-4000-8000-000000000012',
    '40000000-0000-4000-8000-000000000013',
    '40000000-0000-4000-8000-000000000014'
  )
  or source_location_id in (
    '50000000-0000-4000-8000-000000000001',
    '50000000-0000-4000-8000-000000000002',
    '50000000-0000-4000-8000-000000000003',
    '50000000-0000-4000-8000-000000000004',
    '50000000-0000-4000-8000-000000000005',
    '50000000-0000-4000-8000-000000000006',
    '50000000-0000-4000-8000-000000000007',
    '50000000-0000-4000-8000-000000000008',
    '50000000-0000-4000-8000-000000000011',
    '50000000-0000-4000-8000-000000000012',
    '50000000-0000-4000-8000-000000000013'
  )
  or destination_location_id in (
    '50000000-0000-4000-8000-000000000001',
    '50000000-0000-4000-8000-000000000002',
    '50000000-0000-4000-8000-000000000003',
    '50000000-0000-4000-8000-000000000004',
    '50000000-0000-4000-8000-000000000005',
    '50000000-0000-4000-8000-000000000006',
    '50000000-0000-4000-8000-000000000007',
    '50000000-0000-4000-8000-000000000008',
    '50000000-0000-4000-8000-000000000011',
    '50000000-0000-4000-8000-000000000012',
    '50000000-0000-4000-8000-000000000013'
  )
);

delete from public.item_barcodes
where organization_id in (
  '10000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000002'
)
and (
  notes like 'validation:%'
  or id::text like '60000000-0000-4000-8000-%'
);

delete from public.volunteer_sessions
where organization_id in (
  '10000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000002'
)
and session_name like 'Validation %';

delete from public.locations
where organization_id in (
  '10000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000002'
)
and id::text like '50000000-0000-4000-8000-%';

delete from public.items
where organization_id in (
  '10000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000002'
)
and id::text like '40000000-0000-4000-8000-%';

delete from public.user_roles
where organization_id in (
  '10000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000002'
);

delete from public.users
where id in (
  '30000000-0000-4000-8000-000000000001',
  '30000000-0000-4000-8000-000000000002'
);

delete from auth.users
where id in (
  '30000000-0000-4000-8000-000000000001',
  '30000000-0000-4000-8000-000000000002'
);

delete from public.temples
where organization_id in (
  '10000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000002'
)
and id::text like '20000000-0000-4000-8000-%';

delete from public.organizations
where id in (
  '10000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000002'
);

alter table public.inventory_transactions enable trigger inventory_transactions_immutable;
alter table public.audit_logs enable trigger audit_logs_immutable;

commit;
