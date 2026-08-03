-- =====================================================
-- Krishna's Kitchen / SevaOps
-- Admin Management Policies and Metadata Synchronization
-- =====================================================

create or replace function public.is_authenticated_organization_admin(
  requested_organization_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.current_authenticated_user_roles() authenticated_role
    where authenticated_role.organization_id = requested_organization_id
      and authenticated_role.role in ('temple_admin', 'super_admin')
  );
$$;

create or replace function public.is_authenticated_super_admin(
  requested_organization_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.current_authenticated_user_roles() authenticated_role
    where authenticated_role.organization_id = requested_organization_id
      and authenticated_role.role = 'super_admin'
      and authenticated_role.temple_id is null
  );
$$;

create or replace function public.admin_refresh_user_app_metadata(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  profile_record record;
  role_values jsonb;
  temple_values jsonb;
begin
  if auth.uid() is null or auth.uid() <> p_actor_user_id then
    raise exception 'Admin metadata refresh requires the current authenticated admin user.';
  end if;

  if not public.is_authenticated_organization_admin(p_organization_id) then
    raise exception 'Admin metadata refresh requires organization admin permission.';
  end if;

  select
    app_user.id,
    app_user.email,
    app_user.full_name,
    app_user.organization_id,
    organization.name as organization_name,
    app_user.deleted_at
  into profile_record
  from public.users app_user
  join public.organizations organization
    on organization.id = app_user.organization_id
  where app_user.id = p_user_id
    and app_user.organization_id = p_organization_id;

  if profile_record.id is null then
    raise exception 'App user profile not found.';
  end if;

  if profile_record.deleted_at is not null then
    role_values := '[]'::jsonb;
    temple_values := '[]'::jsonb;
  else
    select coalesce(jsonb_agg(distinct user_role.role order by user_role.role), '[]'::jsonb)
    into role_values
    from public.user_roles user_role
    where user_role.organization_id = p_organization_id
      and user_role.user_id = p_user_id;

    select coalesce(jsonb_agg(temple_scope.temple_metadata), '[]'::jsonb)
    into temple_values
    from (
      select distinct
        temple.name,
        jsonb_build_object(
          'id', temple.id,
          'name', temple.name
        ) as temple_metadata
      from public.temples temple
      where temple.organization_id = p_organization_id
        and temple.deleted_at is null
        and exists (
          select 1
          from public.user_roles user_role
          where user_role.organization_id = p_organization_id
            and user_role.user_id = p_user_id
            and (
              user_role.temple_id is null
              or user_role.temple_id = temple.id
            )
        )
      order by temple.name
    ) temple_scope;
  end if;

  update auth.users auth_user
  set raw_app_meta_data =
    coalesce(auth_user.raw_app_meta_data, '{}'::jsonb) ||
    jsonb_build_object(
      'profile_id', profile_record.id,
      'organization_id', profile_record.organization_id,
      'organization_name', profile_record.organization_name,
      'roles', role_values,
      'temples', temple_values
    ),
    raw_user_meta_data =
      coalesce(auth_user.raw_user_meta_data, '{}'::jsonb) ||
      jsonb_build_object(
        'display_name', profile_record.full_name
      ),
    updated_at = timezone('utc', now())
  where auth_user.id = p_user_id;
end;
$$;

create or replace function public.admin_refresh_organization_app_metadata(
  p_actor_user_id uuid,
  p_organization_id uuid
)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  managed_user record;
begin
  if auth.uid() is null or auth.uid() <> p_actor_user_id then
    raise exception 'Organization metadata refresh requires the current authenticated admin user.';
  end if;

  if not public.is_authenticated_organization_admin(p_organization_id) then
    raise exception 'Organization metadata refresh requires organization admin permission.';
  end if;

  for managed_user in
    select app_user.id
    from public.users app_user
    where app_user.organization_id = p_organization_id
  loop
    perform public.admin_refresh_user_app_metadata(
      p_actor_user_id,
      p_organization_id,
      managed_user.id
    );
  end loop;
end;
$$;

revoke execute on function public.is_authenticated_organization_admin(uuid) from public;
revoke execute on function public.is_authenticated_super_admin(uuid) from public;
revoke execute on function public.admin_refresh_user_app_metadata(uuid, uuid, uuid) from public;
revoke execute on function public.admin_refresh_organization_app_metadata(uuid, uuid) from public;

grant execute on function public.is_authenticated_organization_admin(uuid) to authenticated;
grant execute on function public.is_authenticated_super_admin(uuid) to authenticated;
grant execute on function public.admin_refresh_user_app_metadata(uuid, uuid, uuid) to authenticated;
grant execute on function public.admin_refresh_organization_app_metadata(uuid, uuid) to authenticated;

drop policy if exists "Authenticated users can read own organization"
  on public.organizations;

create policy "Authenticated users can read own organization"
on public.organizations
for select
to authenticated
using (
  public.is_authenticated_user_in_organization(id)
);

drop policy if exists "Authenticated admins can update own organization"
  on public.organizations;

create policy "Authenticated admins can update own organization"
on public.organizations
for update
to authenticated
using (
  public.is_authenticated_super_admin(id)
)
with check (
  public.is_authenticated_super_admin(id)
);

drop policy if exists "Authenticated users can read organization temples"
  on public.temples;

create policy "Authenticated users can read organization temples"
on public.temples
for select
to authenticated
using (
  public.is_authenticated_user_in_organization(organization_id)
);

drop policy if exists "Authenticated admins can create organization temples"
  on public.temples;

create policy "Authenticated admins can create organization temples"
on public.temples
for insert
to authenticated
with check (
  public.is_authenticated_organization_admin(organization_id)
);

drop policy if exists "Authenticated admins can update organization temples"
  on public.temples;

create policy "Authenticated admins can update organization temples"
on public.temples
for update
to authenticated
using (
  public.is_authenticated_organization_admin(organization_id)
)
with check (
  public.is_authenticated_organization_admin(organization_id)
);

drop policy if exists "Authenticated admins can read organization users"
  on public.users;

create policy "Authenticated admins can read organization users"
on public.users
for select
to authenticated
using (
  public.is_authenticated_organization_admin(organization_id)
);

drop policy if exists "Authenticated admins can create organization users"
  on public.users;

create policy "Authenticated admins can create organization users"
on public.users
for insert
to authenticated
with check (
  public.is_authenticated_organization_admin(organization_id)
);

drop policy if exists "Authenticated admins can update organization users"
  on public.users;

create policy "Authenticated admins can update organization users"
on public.users
for update
to authenticated
using (
  public.is_authenticated_organization_admin(organization_id)
)
with check (
  public.is_authenticated_organization_admin(organization_id)
);

drop policy if exists "Authenticated admins can read organization user roles"
  on public.user_roles;

create policy "Authenticated admins can read organization user roles"
on public.user_roles
for select
to authenticated
using (
  public.is_authenticated_organization_admin(organization_id)
);

drop policy if exists "Authenticated admins can create organization user roles"
  on public.user_roles;

create policy "Authenticated admins can create organization user roles"
on public.user_roles
for insert
to authenticated
with check (
  public.is_authenticated_organization_admin(organization_id)
  and (
    role <> 'super_admin'
    or (
      temple_id is null
      and public.is_authenticated_super_admin(organization_id)
    )
  )
  and exists (
    select 1
    from public.users app_user
    where app_user.id = user_id
      and app_user.organization_id = user_roles.organization_id
  )
  and (
    temple_id is null
    or exists (
      select 1
      from public.temples temple
      where temple.id = user_roles.temple_id
        and temple.organization_id = user_roles.organization_id
        and temple.deleted_at is null
    )
  )
);

drop policy if exists "Authenticated admins can remove organization user roles"
  on public.user_roles;

create policy "Authenticated admins can remove organization user roles"
on public.user_roles
for delete
to authenticated
using (
  public.is_authenticated_organization_admin(organization_id)
  and (
    role <> 'super_admin'
    or public.is_authenticated_super_admin(organization_id)
  )
);
