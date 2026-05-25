create extension if not exists pgcrypto;

create type public.organization_status as enum ('active', 'suspended', 'archived');
create type public.temple_status as enum ('active', 'inactive', 'archived');
create type public.app_role as enum ('owner', 'admin', 'manager', 'volunteer', 'viewer');
create type public.location_kind as enum ('kitchen', 'pantry', 'refrigerator', 'freezer', 'storage', 'other');
create type public.item_status as enum ('active', 'inactive', 'archived');
create type public.unit_of_measure as enum ('each', 'gram', 'kilogram', 'milliliter', 'liter', 'case');
create type public.inventory_transaction_type as enum (
  'initial_count',
  'received',
  'consumed',
  'adjusted',
  'transferred_in',
  'transferred_out',
  'wasted'
);
create type public.volunteer_session_status as enum ('scheduled', 'active', 'completed', 'cancelled');
create type public.audit_action as enum ('insert', 'update', 'delete', 'login', 'logout', 'system');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.prevent_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception '% records are immutable', tg_table_name;
end;
$$;

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  status public.organization_status not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint organizations_id_organization_unique unique (id),
  constraint organizations_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint organizations_name_not_blank check (length(btrim(name)) > 0),
  constraint organizations_slug_not_blank check (length(btrim(slug)) > 0)
);

create unique index organizations_slug_unique_active_idx
  on public.organizations (slug)
  where deleted_at is null;

create index organizations_status_idx on public.organizations (status);

create trigger set_organizations_updated_at
before update on public.organizations
for each row execute function public.set_updated_at();

create table public.temples (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete restrict,
  name text not null,
  slug text not null,
  status public.temple_status not null default 'active',
  timezone text not null default 'UTC',
  address jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint temples_id_organization_unique unique (id, organization_id),
  constraint temples_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint temples_name_not_blank check (length(btrim(name)) > 0)
);

create unique index temples_org_slug_unique_active_idx
  on public.temples (organization_id, slug)
  where deleted_at is null;

create index temples_org_status_idx on public.temples (organization_id, status);

create trigger set_temples_updated_at
before update on public.temples
for each row execute function public.set_updated_at();

create table public.users (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete restrict,
  auth_user_id uuid references auth.users (id) on delete set null,
  display_name text not null,
  email text,
  phone text,
  avatar_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint users_id_organization_unique unique (id, organization_id),
  constraint users_display_name_not_blank check (length(btrim(display_name)) > 0),
  constraint users_email_lowercase check (email is null or email = lower(email))
);

create unique index users_org_auth_user_unique_active_idx
  on public.users (organization_id, auth_user_id)
  where auth_user_id is not null and deleted_at is null;

create unique index users_org_email_unique_active_idx
  on public.users (organization_id, email)
  where email is not null and deleted_at is null;

create index users_org_idx on public.users (organization_id);
create index users_auth_user_idx on public.users (auth_user_id);

create trigger set_users_updated_at
before update on public.users
for each row execute function public.set_updated_at();

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete restrict,
  temple_id uuid references public.temples (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create unique index roles_org_scope_unique_active_idx
  on public.roles (organization_id, user_id, role)
  where temple_id is null and deleted_at is null;

create unique index roles_temple_scope_unique_active_idx
  on public.roles (organization_id, temple_id, user_id, role)
  where temple_id is not null and deleted_at is null;

create index roles_org_user_idx on public.roles (organization_id, user_id);
create index roles_temple_idx on public.roles (temple_id);

create trigger set_roles_updated_at
before update on public.roles
for each row execute function public.set_updated_at();

create table public.locations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete restrict,
  temple_id uuid not null references public.temples (id) on delete restrict,
  parent_location_id uuid references public.locations (id) on delete restrict,
  name text not null,
  kind public.location_kind not null default 'other',
  code text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint locations_id_organization_unique unique (id, organization_id),
  constraint locations_id_organization_temple_unique unique (id, organization_id, temple_id),
  constraint locations_name_not_blank check (length(btrim(name)) > 0),
  constraint locations_code_not_blank check (code is null or length(btrim(code)) > 0),
  constraint locations_not_own_parent check (parent_location_id is null or parent_location_id <> id)
);

create unique index locations_temple_code_unique_active_idx
  on public.locations (organization_id, temple_id, code)
  where code is not null and deleted_at is null;

create index locations_org_temple_idx on public.locations (organization_id, temple_id);
create index locations_parent_idx on public.locations (parent_location_id);

create trigger set_locations_updated_at
before update on public.locations
for each row execute function public.set_updated_at();

create table public.items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete restrict,
  name text not null,
  sku text,
  status public.item_status not null default 'active',
  unit public.unit_of_measure not null default 'each',
  reorder_point numeric(14, 3) not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint items_id_organization_unique unique (id, organization_id),
  constraint items_name_not_blank check (length(btrim(name)) > 0),
  constraint items_reorder_point_nonnegative check (reorder_point >= 0),
  constraint items_sku_not_blank check (sku is null or length(btrim(sku)) > 0)
);

create unique index items_org_sku_unique_active_idx
  on public.items (organization_id, sku)
  where sku is not null and deleted_at is null;

create index items_org_status_idx on public.items (organization_id, status);
create index items_org_name_idx on public.items (organization_id, name);

create trigger set_items_updated_at
before update on public.items
for each row execute function public.set_updated_at();

create table public.item_barcodes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete restrict,
  item_id uuid not null references public.items (id) on delete cascade,
  barcode text not null,
  label text,
  is_primary boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint item_barcodes_barcode_not_blank check (length(btrim(barcode)) > 0)
);

create unique index item_barcodes_org_barcode_unique_active_idx
  on public.item_barcodes (organization_id, barcode)
  where deleted_at is null;

create unique index item_barcodes_primary_unique_active_idx
  on public.item_barcodes (organization_id, item_id)
  where is_primary and deleted_at is null;

create index item_barcodes_item_idx on public.item_barcodes (item_id);

create trigger set_item_barcodes_updated_at
before update on public.item_barcodes
for each row execute function public.set_updated_at();

create table public.inventory_transactions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete restrict,
  temple_id uuid not null references public.temples (id) on delete restrict,
  item_id uuid not null references public.items (id) on delete restrict,
  location_id uuid not null references public.locations (id) on delete restrict,
  actor_user_id uuid references public.users (id),
  transaction_type public.inventory_transaction_type not null,
  quantity_delta numeric(14, 3) not null,
  unit public.unit_of_measure not null,
  occurred_at timestamptz not null default now(),
  source_location_id uuid references public.locations (id) on delete restrict,
  destination_location_id uuid references public.locations (id) on delete restrict,
  reference_type text,
  reference_id uuid,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint inventory_transactions_quantity_nonzero check (quantity_delta <> 0),
  constraint inventory_transactions_transfer_locations check (
    transaction_type not in ('transferred_in', 'transferred_out')
    or source_location_id is not null
    or destination_location_id is not null
  )
);

create index inventory_transactions_org_occurred_idx
  on public.inventory_transactions (organization_id, occurred_at desc);

create index inventory_transactions_item_occurred_idx
  on public.inventory_transactions (organization_id, item_id, occurred_at desc);

create index inventory_transactions_location_occurred_idx
  on public.inventory_transactions (organization_id, location_id, occurred_at desc);

create index inventory_transactions_actor_idx
  on public.inventory_transactions (actor_user_id);

create trigger prevent_inventory_transactions_update
before update on public.inventory_transactions
for each row execute function public.prevent_mutation();

create trigger prevent_inventory_transactions_delete
before delete on public.inventory_transactions
for each row execute function public.prevent_mutation();

create table public.volunteer_sessions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete restrict,
  temple_id uuid not null references public.temples (id) on delete restrict,
  user_id uuid references public.users (id) on delete set null,
  status public.volunteer_session_status not null default 'scheduled',
  started_at timestamptz,
  ended_at timestamptz,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint volunteer_sessions_time_order check (
    started_at is null
    or ended_at is null
    or ended_at >= started_at
  )
);

create index volunteer_sessions_org_temple_status_idx
  on public.volunteer_sessions (organization_id, temple_id, status);

create index volunteer_sessions_user_started_idx
  on public.volunteer_sessions (user_id, started_at desc);

create trigger set_volunteer_sessions_updated_at
before update on public.volunteer_sessions
for each row execute function public.set_updated_at();

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations (id),
  actor_user_id uuid references public.users (id),
  action public.audit_action not null,
  table_name text,
  record_id uuid,
  request_id text,
  ip_address inet,
  user_agent text,
  before_data jsonb,
  after_data jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index audit_logs_org_created_idx on public.audit_logs (organization_id, created_at desc);
create index audit_logs_actor_created_idx on public.audit_logs (actor_user_id, created_at desc);
create index audit_logs_record_idx on public.audit_logs (table_name, record_id);

create trigger prevent_audit_logs_update
before update on public.audit_logs
for each row execute function public.prevent_mutation();

create trigger prevent_audit_logs_delete
before delete on public.audit_logs
for each row execute function public.prevent_mutation();

alter table public.roles
  add constraint roles_temple_same_organization_fk
  foreign key (temple_id, organization_id)
  references public.temples (id, organization_id)
  on delete cascade;

alter table public.roles
  add constraint roles_user_same_organization_fk
  foreign key (user_id, organization_id)
  references public.users (id, organization_id)
  on delete cascade;

alter table public.locations
  add constraint locations_temple_same_organization_fk
  foreign key (temple_id, organization_id)
  references public.temples (id, organization_id)
  on delete restrict;

alter table public.locations
  add constraint locations_parent_same_temple_fk
  foreign key (parent_location_id, organization_id, temple_id)
  references public.locations (id, organization_id, temple_id)
  on delete restrict;

alter table public.item_barcodes
  add constraint item_barcodes_item_same_organization_fk
  foreign key (item_id, organization_id)
  references public.items (id, organization_id)
  on delete cascade;

alter table public.inventory_transactions
  add constraint inventory_transactions_temple_same_organization_fk
  foreign key (temple_id, organization_id)
  references public.temples (id, organization_id)
  on delete restrict;

alter table public.inventory_transactions
  add constraint inventory_transactions_item_same_organization_fk
  foreign key (item_id, organization_id)
  references public.items (id, organization_id)
  on delete restrict;

alter table public.inventory_transactions
  add constraint inventory_transactions_location_same_temple_fk
  foreign key (location_id, organization_id, temple_id)
  references public.locations (id, organization_id, temple_id)
  on delete restrict;

alter table public.inventory_transactions
  add constraint inventory_transactions_source_location_same_temple_fk
  foreign key (source_location_id, organization_id, temple_id)
  references public.locations (id, organization_id, temple_id)
  on delete restrict;

alter table public.inventory_transactions
  add constraint inventory_transactions_destination_location_same_temple_fk
  foreign key (destination_location_id, organization_id, temple_id)
  references public.locations (id, organization_id, temple_id)
  on delete restrict;

alter table public.inventory_transactions
  add constraint inventory_transactions_actor_same_organization_fk
  foreign key (actor_user_id, organization_id)
  references public.users (id, organization_id);

alter table public.volunteer_sessions
  add constraint volunteer_sessions_temple_same_organization_fk
  foreign key (temple_id, organization_id)
  references public.temples (id, organization_id)
  on delete restrict;

alter table public.volunteer_sessions
  add constraint volunteer_sessions_user_same_organization_fk
  foreign key (user_id, organization_id)
  references public.users (id, organization_id);

alter table public.audit_logs
  add constraint audit_logs_actor_same_organization_fk
  foreign key (actor_user_id, organization_id)
  references public.users (id, organization_id);

alter table public.organizations enable row level security;
alter table public.temples enable row level security;
alter table public.users enable row level security;
alter table public.roles enable row level security;
alter table public.locations enable row level security;
alter table public.items enable row level security;
alter table public.item_barcodes enable row level security;
alter table public.inventory_transactions enable row level security;
alter table public.volunteer_sessions enable row level security;
alter table public.audit_logs enable row level security;

comment on table public.organizations is 'Tenant root for Krishna''s Kitchen workspaces.';
comment on table public.temples is 'Temple operating units within an organization.';
comment on table public.users is 'Application user profiles linked to Supabase auth.users when available.';
comment on table public.roles is 'Organization-level and temple-level role assignments.';
comment on table public.locations is 'Inventory storage locations within a temple.';
comment on table public.items is 'Organization-owned inventory catalog.';
comment on table public.item_barcodes is 'Barcode aliases for inventory items.';
comment on table public.inventory_transactions is 'Immutable append-only inventory ledger.';
comment on table public.volunteer_sessions is 'Volunteer attendance/session tracking scaffold.';
comment on table public.audit_logs is 'Immutable audit event log for security and compliance events.';
