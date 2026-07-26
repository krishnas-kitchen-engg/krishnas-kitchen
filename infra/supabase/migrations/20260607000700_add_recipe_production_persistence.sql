-- =====================================================
-- Krishna's Kitchen / SevaOps
-- Recipe and Production Run Persistence
-- =====================================================

create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  temple_id uuid not null references public.temples(id),
  name text not null,
  description text,
  servings numeric not null,
  ingredients jsonb not null,
  is_active boolean not null default true,
  version integer not null default 1,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),

  constraint recipes_servings_positive
    check (servings > 0),
  constraint recipes_ingredients_array
    check (jsonb_typeof(ingredients) = 'array')
);

create index if not exists idx_recipes_org_temple
  on public.recipes(organization_id, temple_id);

create index if not exists idx_recipes_active
  on public.recipes(organization_id, temple_id, is_active);

drop trigger if exists recipes_updated_at on public.recipes;
create trigger recipes_updated_at
before update on public.recipes
for each row
execute procedure public.set_updated_at();

create table if not exists public.recipe_production_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  temple_id uuid not null references public.temples(id),
  recipe_id uuid not null references public.recipes(id),
  recipe_name text not null,
  recipe_version integer not null,
  location_id uuid not null references public.locations(id),
  servings numeric not null,
  batch_count numeric not null,
  actor_type public.actor_type not null,
  actor_user_id uuid,
  actor_temp_session_id uuid,
  notes text,
  consumption_transaction_ids uuid[] not null default '{}',
  created_at timestamptz not null default timezone('utc', now()),

  constraint recipe_production_runs_servings_positive
    check (servings > 0),
  constraint recipe_production_runs_batch_count_positive
    check (batch_count > 0),
  constraint recipe_production_runs_actor_shape
    check (
      (actor_type = 'user' and actor_user_id is not null and actor_temp_session_id is null)
      or (actor_type = 'temporary_volunteer' and actor_temp_session_id is not null and actor_user_id is null)
      or (actor_type = 'system' and actor_user_id is null and actor_temp_session_id is null)
    )
);

create index if not exists idx_recipe_production_runs_org_temple
  on public.recipe_production_runs(organization_id, temple_id, created_at desc);

create index if not exists idx_recipe_production_runs_recipe
  on public.recipe_production_runs(recipe_id, created_at desc);

alter table public.recipes enable row level security;
alter table public.recipe_production_runs enable row level security;

drop policy if exists "Authenticated users can read scoped recipes"
  on public.recipes;

create policy "Authenticated users can read scoped recipes"
  on public.recipes
  for select
  to authenticated
  using (
    public.is_authenticated_user_in_organization(organization_id)
    and public.is_authenticated_user_assigned_to_temple(temple_id)
  );

drop policy if exists "Authenticated recipe managers can create scoped recipes"
  on public.recipes;

create policy "Authenticated recipe managers can create scoped recipes"
  on public.recipes
  for insert
  to authenticated
  with check (
    public.is_authenticated_user_in_organization(organization_id)
    and public.is_authenticated_user_assigned_to_temple(temple_id)
    and exists (
      select 1
      from public.current_authenticated_user_roles() authenticated_role
      where authenticated_role.organization_id = recipes.organization_id
        and (
          authenticated_role.temple_id is null
          or authenticated_role.temple_id = recipes.temple_id
        )
        and authenticated_role.role in (
          'senior_cook',
          'inventory_manager',
          'temple_admin',
          'super_admin'
        )
    )
  );

drop policy if exists "Authenticated recipe managers can update scoped recipes"
  on public.recipes;

create policy "Authenticated recipe managers can update scoped recipes"
  on public.recipes
  for update
  to authenticated
  using (
    public.is_authenticated_user_in_organization(organization_id)
    and public.is_authenticated_user_assigned_to_temple(temple_id)
    and exists (
      select 1
      from public.current_authenticated_user_roles() authenticated_role
      where authenticated_role.organization_id = recipes.organization_id
        and (
          authenticated_role.temple_id is null
          or authenticated_role.temple_id = recipes.temple_id
        )
        and authenticated_role.role in (
          'senior_cook',
          'inventory_manager',
          'temple_admin',
          'super_admin'
        )
    )
  )
  with check (
    public.is_authenticated_user_in_organization(organization_id)
    and public.is_authenticated_user_assigned_to_temple(temple_id)
  );

drop policy if exists "Authenticated users can read scoped production runs"
  on public.recipe_production_runs;

create policy "Authenticated users can read scoped production runs"
  on public.recipe_production_runs
  for select
  to authenticated
  using (
    public.is_authenticated_user_in_organization(organization_id)
    and public.is_authenticated_user_assigned_to_temple(temple_id)
  );

drop policy if exists "Authenticated recipe managers can create scoped production runs"
  on public.recipe_production_runs;

create policy "Authenticated recipe managers can create scoped production runs"
  on public.recipe_production_runs
  for insert
  to authenticated
  with check (
    public.is_authenticated_user_in_organization(organization_id)
    and public.is_authenticated_user_assigned_to_temple(temple_id)
    and actor_type = 'user'
    and actor_user_id = auth.uid()
    and actor_temp_session_id is null
    and exists (
      select 1
      from public.locations production_location
      where production_location.id = location_id
        and production_location.organization_id = organization_id
        and production_location.temple_id = temple_id
        and production_location.deleted_at is null
    )
    and exists (
      select 1
      from public.current_authenticated_user_roles() authenticated_role
      where authenticated_role.organization_id = recipe_production_runs.organization_id
        and (
          authenticated_role.temple_id is null
          or authenticated_role.temple_id = recipe_production_runs.temple_id
        )
        and authenticated_role.role in (
          'senior_cook',
          'inventory_manager',
          'temple_admin',
          'super_admin'
        )
    )
  );
