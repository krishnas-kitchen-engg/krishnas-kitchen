-- =====================================================
-- Krishna's Kitchen / SevaOps
-- Per-workflow item units used by receiving, transfer, and return forms
-- =====================================================

alter table public.items
  add column if not exists receiving_units public.item_unit[],
  add column if not exists transfer_units public.item_unit[],
  add column if not exists return_units public.item_unit[];

update public.items
set
  receiving_units = coalesce(receiving_units, array[default_unit]::public.item_unit[]),
  transfer_units = coalesce(transfer_units, array[default_unit]::public.item_unit[]),
  return_units = coalesce(return_units, array[default_unit]::public.item_unit[])
where receiving_units is null
   or transfer_units is null
   or return_units is null;

comment on column public.items.receiving_units is
  'Units offered when receiving this item; falls back to default_unit in the application.';

comment on column public.items.transfer_units is
  'Units offered when transferring this item; falls back to default_unit in the application.';

comment on column public.items.return_units is
  'Units offered when returning this item; falls back to default_unit in the application.';
