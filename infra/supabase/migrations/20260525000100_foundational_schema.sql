-- =====================================================
-- Krishna's Kitchen / SevaOps
-- Foundational Schema Migration
-- =====================================================

-- =====================================================
-- EXTENSIONS
-- =====================================================

create extension if not exists pgcrypto;

-- =====================================================
-- UPDATED_AT TRIGGER
-- =====================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- =====================================================
-- IMMUTABLE TABLE GUARD
-- =====================================================

create or replace function public.prevent_update_delete()
returns trigger
language plpgsql
as $$
begin
  raise exception 'This table is immutable';
end;
$$;

-- =====================================================
-- ENUMS
-- =====================================================

create type public.user_role as enum (
  'volunteer',
  'cook',
  'senior_cook',
  'inventory_manager',
  'temple_admin',
  'super_admin'
);

create type public.temp_volunteer_role as enum (
  'temp_picker',
  'temp_receiver',
  'temp_helper'
);

create type public.location_type as enum (
  'warehouse',
  'trailer',
  'pantry',
  'freezer',
  'shelf',
  'bin',
  'other'
);

create type public.item_unit as enum (
  'g',
  'kg',
  'ml',
  'l',
  'unit'
);

create type public.inventory_transaction_type as enum (
  'received',
  'consumed',
  'transfer',
  'returned',
  'adjusted',
  'wasted',
  'reservation',
  'undo'
);

create type public.inventory_quantity_effect as enum (
  'increase',
  'decrease',
  'transfer',
  'none'
);

create type public.volunteer_session_status as enum (
  'active',
  'expired',
  'revoked'
);

create type public.audit_action as enum (
  'create',
  'update',
  'delete',
  'login',
  'logout',
  'inventory_action',
  'permission_change'
);

create type public.actor_type as enum (
  'user',
  'temporary_volunteer',
  'system'
);

-- =====================================================
-- ORGANIZATIONS
-- =====================================================

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create trigger organizations_updated_at
before update on public.organizations
for each row
execute procedure public.set_updated_at();

-- =====================================================
-- TEMPLES
-- =====================================================

create table public.temples (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  name text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,

  constraint temples_unique_name_per_org
    unique (organization_id, name)
);

create index idx_temples_org_id
  on public.temples(organization_id);

create trigger temples_updated_at
before update on public.temples
for each row
execute procedure public.set_updated_at();

-- =====================================================
-- USERS
-- =====================================================

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id),
  full_name text,
  email text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create index idx_users_org_id
  on public.users(organization_id);

create trigger users_updated_at
before update on public.users
for each row
execute procedure public.set_updated_at();

-- =====================================================
-- USER ROLES
-- =====================================================

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  temple_id uuid references public.temples(id),
  user_id uuid not null references public.users(id) on delete cascade,
  role public.user_role not null,
  created_at timestamptz not null default timezone('utc', now()),

  constraint user_roles_unique_role
    unique (organization_id, temple_id, user_id, role)
);

create index idx_user_roles_org_id
  on public.user_roles(organization_id);

create index idx_user_roles_user_id
  on public.user_roles(user_id);

create index idx_user_roles_temple_id
  on public.user_roles(temple_id);

-- =====================================================
-- LOCATIONS
-- =====================================================

create table public.locations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  temple_id uuid not null references public.temples(id),
  parent_location_id uuid references public.locations(id),
  name text not null,
  location_type public.location_type not null,
  qr_code text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,

  constraint locations_unique_name_per_parent
    unique (organization_id, temple_id, parent_location_id, name)
);

create index idx_locations_org_id
  on public.locations(organization_id);

create index idx_locations_temple_id
  on public.locations(temple_id);

create index idx_locations_parent_id
  on public.locations(parent_location_id);

create trigger locations_updated_at
before update on public.locations
for each row
execute procedure public.set_updated_at();

-- =====================================================
-- ITEMS
-- =====================================================

create table public.items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  name text not null,
  category text,
  default_unit public.item_unit not null,
  preferred_vendor text,
  preferred_purchase_unit text,
  reorder_threshold numeric(12, 3),
  critical_threshold numeric(12, 3),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,

  constraint items_unique_name_per_org
    unique (organization_id, name)
);

create index idx_items_org_id
  on public.items(organization_id);

create trigger items_updated_at
before update on public.items
for each row
execute procedure public.set_updated_at();

-- =====================================================
-- ITEM BARCODES
-- =====================================================

create table public.item_barcodes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  item_id uuid not null references public.items(id) on delete cascade,
  barcode text not null,
  created_at timestamptz not null default timezone('utc', now()),

  constraint item_barcodes_unique
    unique (organization_id, barcode)
);

create index idx_item_barcodes_item_id
  on public.item_barcodes(item_id);

create index idx_item_barcodes_barcode
  on public.item_barcodes(barcode);

-- =====================================================
-- INVENTORY TRANSACTIONS
-- =====================================================

create table public.inventory_transactions (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null references public.organizations(id),
  temple_id uuid not null references public.temples(id),

  item_id uuid not null references public.items(id),

  source_location_id uuid references public.locations(id),
  destination_location_id uuid references public.locations(id),

  transaction_type public.inventory_transaction_type not null,
  quantity_effect public.inventory_quantity_effect not null,

  quantity numeric(12, 3) not null check (quantity > 0),
  unit public.item_unit not null,

  actor_type public.actor_type not null,
  actor_user_id uuid references public.users(id),
  actor_temp_session_id uuid,

  notes text,
  audit_metadata jsonb not null default '{}'::jsonb,

  reversal_of_transaction_id uuid
    references public.inventory_transactions(id),

  created_at timestamptz not null default timezone('utc', now()),

  constraint inventory_transactions_effect_matches_type check (
    (transaction_type = 'transfer' and quantity_effect = 'transfer')
    or (transaction_type = 'reservation' and quantity_effect = 'none')
    or (
      transaction_type in ('received', 'returned')
      and quantity_effect = 'increase'
    )
    or (
      transaction_type in ('consumed', 'wasted')
      and quantity_effect = 'decrease'
    )
    or (
      transaction_type in ('adjusted', 'undo')
      and quantity_effect in ('increase', 'decrease', 'transfer', 'none')
    )
  ),
  constraint inventory_transactions_locations_match_effect check (
    (quantity_effect = 'increase' and source_location_id is null and destination_location_id is not null)
    or (quantity_effect = 'decrease' and source_location_id is not null and destination_location_id is null)
    or (quantity_effect = 'transfer' and source_location_id is not null and destination_location_id is not null and source_location_id <> destination_location_id)
    or (quantity_effect = 'none' and source_location_id is null and destination_location_id is null)
  )
);

create index idx_inventory_transactions_org_id
  on public.inventory_transactions(organization_id);

create index idx_inventory_transactions_item_id
  on public.inventory_transactions(item_id);

create index idx_inventory_transactions_temple_id
  on public.inventory_transactions(temple_id);

create index idx_inventory_transactions_source_location
  on public.inventory_transactions(source_location_id);

create index idx_inventory_transactions_destination_location
  on public.inventory_transactions(destination_location_id);

create index idx_inventory_transactions_created_at
  on public.inventory_transactions(created_at desc);

create trigger inventory_transactions_immutable
before update or delete on public.inventory_transactions
for each row
execute procedure public.prevent_update_delete();

-- =====================================================
-- VOLUNTEER SESSIONS
-- =====================================================

create table public.volunteer_sessions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  temple_id uuid not null references public.temples(id),

  session_name text not null,
  role public.temp_volunteer_role not null,

  join_code text not null,

  created_by_user_id uuid not null references public.users(id),

  expires_at timestamptz not null,
  status public.volunteer_session_status not null default 'active',

  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),

  constraint volunteer_sessions_join_code_unique
    unique (join_code)
);

create index idx_volunteer_sessions_org_id
  on public.volunteer_sessions(organization_id);

create index idx_volunteer_sessions_temple_id
  on public.volunteer_sessions(temple_id);

create trigger volunteer_sessions_updated_at
before update on public.volunteer_sessions
for each row
execute procedure public.set_updated_at();

-- =====================================================
-- AUDIT LOGS
-- =====================================================

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null references public.organizations(id),

  actor_type public.actor_type not null,
  actor_user_id uuid references public.users(id),
  actor_temp_session_id uuid,

  action public.audit_action not null,

  entity_name text not null,
  entity_id uuid,

  metadata jsonb,

  created_at timestamptz not null default timezone('utc', now())
);

create index idx_audit_logs_org_id
  on public.audit_logs(organization_id);

create index idx_audit_logs_created_at
  on public.audit_logs(created_at desc);

create trigger audit_logs_immutable
before update or delete on public.audit_logs
for each row
execute procedure public.prevent_update_delete();

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

alter table public.organizations enable row level security;
alter table public.temples enable row level security;
alter table public.users enable row level security;
alter table public.user_roles enable row level security;
alter table public.locations enable row level security;
alter table public.items enable row level security;
alter table public.item_barcodes enable row level security;
alter table public.inventory_transactions enable row level security;
alter table public.volunteer_sessions enable row level security;
alter table public.audit_logs enable row level security;

-- =====================================================
-- FUTURE RLS NOTE
-- =====================================================

-- Policies will be implemented after auth architecture stabilizes.
-- All policies must enforce organization-level isolation.
-- Temporary volunteers must remain heavily restricted.
-- Inventory-changing operations must remain auditable.
