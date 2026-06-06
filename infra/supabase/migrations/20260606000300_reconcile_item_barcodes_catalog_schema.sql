-- =====================================================
-- Krishna's Kitchen / SevaOps
-- Item Barcode Catalog Compatibility
-- =====================================================

-- Expand item_barcodes to match the barcode catalog domain while preserving
-- the legacy barcode column for rollback and old-client compatibility.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'barcode_format') then
    create type public.barcode_format as enum (
      'ean_13',
      'ean_8',
      'qr',
      'upc_a',
      'upc_e'
    );
  end if;
end
$$;

alter table public.item_barcodes
  add column if not exists barcode_value text,
  add column if not exists barcode_format public.barcode_format,
  add column if not exists archived_at timestamptz,
  add column if not exists archived_by_actor_type public.actor_type,
  add column if not exists archived_by_actor_user_id uuid references public.users(id),
  add column if not exists archived_by_actor_temp_session_id uuid,
  add column if not exists archive_reason text,
  add column if not exists created_by_actor_type public.actor_type,
  add column if not exists created_by_actor_user_id uuid references public.users(id),
  add column if not exists created_by_actor_temp_session_id uuid,
  add column if not exists notes text,
  add column if not exists source_unknown_barcode_id uuid,
  add column if not exists updated_at timestamptz;

do $$
begin
  if exists (
    select 1
    from public.item_barcodes
    where barcode is null
      and barcode_value is null
  ) then
    raise exception
      'Cannot reconcile item_barcodes: legacy barcode and barcode_value are both null for at least one row.';
  end if;
end
$$;

update public.item_barcodes
set
  barcode_value = coalesce(barcode_value, barcode),
  barcode_format = coalesce(
    barcode_format,
    case
      when coalesce(barcode_value, barcode) ~ '^[0-9]{13}$' then 'ean_13'::public.barcode_format
      when coalesce(barcode_value, barcode) ~ '^[0-9]{12}$' then 'upc_a'::public.barcode_format
      when coalesce(barcode_value, barcode) ~ '^[0-9]{8}$' then 'ean_8'::public.barcode_format
      else 'qr'::public.barcode_format
    end
  ),
  created_by_actor_type = coalesce(created_by_actor_type, 'system'::public.actor_type),
  updated_at = coalesce(updated_at, created_at);

do $$
begin
  if exists (
    select 1
    from public.item_barcodes
    where barcode_value is null
  ) then
    raise exception
      'Cannot reconcile item_barcodes: barcode_value backfill left at least one null value.';
  end if;
end
$$;

alter table public.item_barcodes
  alter column barcode drop not null,
  alter column barcode_value set not null,
  alter column barcode_format set not null,
  alter column created_by_actor_type set not null,
  alter column updated_at set default timezone('utc', now()),
  alter column updated_at set not null;

create or replace function public.sync_item_barcodes_legacy_barcode()
returns trigger
language plpgsql
as $$
begin
  if new.barcode_value is null and new.barcode is not null then
    new.barcode_value = new.barcode;
  end if;

  if new.barcode is null and new.barcode_value is not null then
    new.barcode = new.barcode_value;
  end if;

  if new.updated_at is null then
    new.updated_at = timezone('utc', now());
  end if;

  return new;
end;
$$;

drop trigger if exists item_barcodes_sync_legacy_barcode on public.item_barcodes;

create trigger item_barcodes_sync_legacy_barcode
before insert or update on public.item_barcodes
for each row
execute procedure public.sync_item_barcodes_legacy_barcode();

do $$
begin
  if exists (
    select 1
    from (
      select organization_id, barcode_format, barcode_value
      from public.item_barcodes
      where archived_at is null
      group by organization_id, barcode_format, barcode_value
      having count(*) > 1
    ) duplicate_active_barcodes
  ) then
    raise exception
      'Cannot create active item barcode uniqueness index: duplicate active barcode mappings exist.';
  end if;
end
$$;

alter table public.item_barcodes
  drop constraint if exists item_barcodes_unique;

create index if not exists idx_item_barcodes_org_format_value
  on public.item_barcodes(organization_id, barcode_format, barcode_value);

create unique index if not exists item_barcodes_active_unique
  on public.item_barcodes(organization_id, barcode_format, barcode_value)
  where archived_at is null;

create index if not exists idx_item_barcodes_active_lookup
  on public.item_barcodes(organization_id, barcode_format, barcode_value, item_id, id)
  where archived_at is null;

drop trigger if exists item_barcodes_updated_at on public.item_barcodes;

create trigger item_barcodes_updated_at
before update on public.item_barcodes
for each row
execute procedure public.set_updated_at();
