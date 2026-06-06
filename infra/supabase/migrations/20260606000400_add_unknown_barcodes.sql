-- =====================================================
-- Krishna's Kitchen / SevaOps
-- Unknown Barcode Persistence
-- =====================================================

-- Add durable unknown barcode review records. This is additive only and does
-- not alter barcode lookup or inventory transaction behavior.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'unknown_barcode_status') then
    create type public.unknown_barcode_status as enum (
      'pending',
      'linked',
      'dismissed'
    );
  end if;
end
$$;

create table if not exists public.unknown_barcodes (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null references public.organizations(id),
  temple_id uuid references public.temples(id),

  barcode_format public.barcode_format not null,
  barcode_value text not null,

  status public.unknown_barcode_status not null default 'pending',
  scan_count integer not null default 1 check (scan_count > 0),
  source_workflow text,

  actor_type public.actor_type not null,
  actor_user_id uuid references public.users(id),
  actor_temp_session_id uuid,

  first_seen_at timestamptz not null,
  last_seen_at timestamptz not null,
  last_seen_by_actor_type public.actor_type not null,
  last_seen_by_actor_user_id uuid references public.users(id),
  last_seen_by_actor_temp_session_id uuid,

  linked_item_id uuid references public.items(id),
  linked_barcode_mapping_id uuid references public.item_barcodes(id),
  linked_at timestamptz,
  linked_by_actor_type public.actor_type,
  linked_by_actor_user_id uuid references public.users(id),
  linked_by_actor_temp_session_id uuid,

  dismissed_at timestamptz,
  dismissed_by_actor_type public.actor_type,
  dismissed_by_actor_user_id uuid references public.users(id),
  dismissed_by_actor_temp_session_id uuid,
  dismissal_reason text,

  notes text,

  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),

  constraint unknown_barcodes_linked_state check (
    status <> 'linked'
    or (linked_item_id is not null and linked_at is not null and linked_by_actor_type is not null)
  ),
  constraint unknown_barcodes_dismissed_state check (
    status <> 'dismissed'
    or (
      dismissed_at is not null
      and dismissed_by_actor_type is not null
      and dismissal_reason is not null
      and length(trim(dismissal_reason)) > 0
    )
  )
);

create unique index if not exists unknown_barcodes_pending_unique
  on public.unknown_barcodes(
    organization_id,
    coalesce(temple_id, '00000000-0000-0000-0000-000000000000'::uuid),
    barcode_format,
    barcode_value
  )
  where status = 'pending';

create index if not exists idx_unknown_barcodes_review_queue
  on public.unknown_barcodes(organization_id, temple_id, status, last_seen_at desc, id desc);

create index if not exists idx_unknown_barcodes_lookup
  on public.unknown_barcodes(organization_id, barcode_format, barcode_value);

drop trigger if exists unknown_barcodes_updated_at on public.unknown_barcodes;

create trigger unknown_barcodes_updated_at
before update on public.unknown_barcodes
for each row
execute procedure public.set_updated_at();

alter table public.unknown_barcodes enable row level security;
