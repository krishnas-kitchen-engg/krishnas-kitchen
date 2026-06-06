-- =====================================================
-- Krishna's Kitchen / SevaOps
-- Inventory Low Stock Threshold Persistence
-- =====================================================

-- Add durable low-stock thresholds used by visibility projections, Home
-- summaries, and volunteer Tasks. This is additive only and does not introduce
-- procurement or reorder workflow behavior.

create table if not exists public.inventory_low_stock_thresholds (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null references public.organizations(id),
  temple_id uuid references public.temples(id),
  item_id uuid not null references public.items(id),
  location_id uuid references public.locations(id),

  unit public.item_unit not null,
  minimum_quantity numeric(12, 3) not null check (minimum_quantity >= 0),

  created_by_actor_type public.actor_type not null,
  created_by_actor_user_id uuid references public.users(id),
  created_by_actor_temp_session_id uuid,

  archived_at timestamptz,
  archived_by_actor_type public.actor_type,
  archived_by_actor_user_id uuid references public.users(id),
  archived_by_actor_temp_session_id uuid,

  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists inventory_low_stock_thresholds_active_unique
  on public.inventory_low_stock_thresholds(
    organization_id,
    coalesce(temple_id, '00000000-0000-0000-0000-000000000000'::uuid),
    item_id,
    coalesce(location_id, '00000000-0000-0000-0000-000000000000'::uuid),
    unit
  )
  where archived_at is null;

create index if not exists idx_inventory_low_stock_thresholds_active_scope
  on public.inventory_low_stock_thresholds(organization_id, temple_id, location_id, item_id, unit)
  where archived_at is null;

drop trigger if exists inventory_low_stock_thresholds_updated_at
  on public.inventory_low_stock_thresholds;

create trigger inventory_low_stock_thresholds_updated_at
before update on public.inventory_low_stock_thresholds
for each row
execute procedure public.set_updated_at();

alter table public.inventory_low_stock_thresholds enable row level security;
