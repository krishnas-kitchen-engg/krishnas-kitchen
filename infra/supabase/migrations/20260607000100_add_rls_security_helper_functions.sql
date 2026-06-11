-- =====================================================
-- Krishna's Kitchen / SevaOps
-- RLS Security Helper Foundation
-- =====================================================

-- Add database-derived authorization helpers for later RLS policies and
-- volunteer RPCs. These helpers intentionally do not create table policies or
-- expose volunteer session tables directly to anonymous clients.

create or replace function public.current_authenticated_user_organization_id()
returns uuid
language sql
stable
security definer
set search_path = public, auth
as $$
  select app_user.organization_id
  from public.users app_user
  where app_user.id = auth.uid()
    and app_user.deleted_at is null
  limit 1;
$$;

create or replace function public.current_authenticated_user_roles()
returns table (
  organization_id uuid,
  temple_id uuid,
  role public.user_role
)
language sql
stable
security definer
set search_path = public, auth
as $$
  select user_role.organization_id, user_role.temple_id, user_role.role
  from public.user_roles user_role
  join public.users app_user
    on app_user.id = user_role.user_id
   and app_user.organization_id = user_role.organization_id
  where app_user.id = auth.uid()
    and app_user.deleted_at is null;
$$;

create or replace function public.current_authenticated_user_temple_ids()
returns table (
  temple_id uuid
)
language sql
stable
security definer
set search_path = public, auth
as $$
  select distinct temple.id
  from public.temples temple
  join public.users app_user
    on app_user.organization_id = temple.organization_id
  join public.user_roles user_role
    on user_role.user_id = app_user.id
   and user_role.organization_id = app_user.organization_id
   and (
     user_role.temple_id = temple.id
     or user_role.temple_id is null
   )
  where app_user.id = auth.uid()
    and app_user.deleted_at is null
    and temple.deleted_at is null;
$$;

create or replace function public.is_authenticated_user_in_organization(
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
    from public.users app_user
    where app_user.id = auth.uid()
      and app_user.organization_id = requested_organization_id
      and app_user.deleted_at is null
  );
$$;

create or replace function public.is_authenticated_user_assigned_to_temple(
  requested_temple_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.temples temple
    join public.users app_user
      on app_user.organization_id = temple.organization_id
    join public.user_roles user_role
      on user_role.user_id = app_user.id
     and user_role.organization_id = app_user.organization_id
     and (
       user_role.temple_id = temple.id
       or user_role.temple_id is null
     )
    where app_user.id = auth.uid()
      and app_user.deleted_at is null
      and temple.id = requested_temple_id
      and temple.deleted_at is null
  );
$$;

create or replace function public.get_active_volunteer_session_scope(
  volunteer_session_id uuid,
  expected_client_session_id text default null,
  checked_at timestamptz default timezone('utc', now())
)
returns table (
  session_id uuid,
  organization_id uuid,
  temple_id uuid,
  role public.temp_volunteer_role,
  display_name text,
  expires_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    volunteer_session.id,
    volunteer_session.organization_id,
    volunteer_session.temple_id,
    volunteer_session.role,
    volunteer_session.display_name,
    volunteer_session.expires_at
  from public.volunteer_sessions volunteer_session
  where volunteer_session.id = volunteer_session_id
    and volunteer_session.status = 'active'
    and volunteer_session.revoked_at is null
    and volunteer_session.expires_at > checked_at
    and (
      expected_client_session_id is null
      or volunteer_session.client_session_id = expected_client_session_id
    )
  limit 1;
$$;

create or replace function public.get_active_volunteer_session_scope_by_join_code(
  normalized_join_code text,
  checked_at timestamptz default timezone('utc', now())
)
returns table (
  session_id uuid,
  organization_id uuid,
  temple_id uuid,
  role public.temp_volunteer_role,
  display_name text,
  expires_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    volunteer_session.id,
    volunteer_session.organization_id,
    volunteer_session.temple_id,
    volunteer_session.role,
    volunteer_session.display_name,
    volunteer_session.expires_at
  from public.volunteer_sessions volunteer_session
  where volunteer_session.join_code = normalized_join_code
    and volunteer_session.status = 'active'
    and volunteer_session.revoked_at is null
    and volunteer_session.expires_at > checked_at
  order by volunteer_session.expires_at desc, volunteer_session.id
  limit 1;
$$;

revoke execute on function public.current_authenticated_user_organization_id() from public;
revoke execute on function public.current_authenticated_user_roles() from public;
revoke execute on function public.current_authenticated_user_temple_ids() from public;
revoke execute on function public.is_authenticated_user_in_organization(uuid) from public;
revoke execute on function public.is_authenticated_user_assigned_to_temple(uuid) from public;
revoke execute on function public.get_active_volunteer_session_scope(uuid, text, timestamptz)
  from public;
revoke execute on function public.get_active_volunteer_session_scope_by_join_code(text, timestamptz)
  from public;

grant execute on function public.current_authenticated_user_organization_id() to authenticated;
grant execute on function public.current_authenticated_user_roles() to authenticated;
grant execute on function public.current_authenticated_user_temple_ids() to authenticated;
grant execute on function public.is_authenticated_user_in_organization(uuid) to authenticated;
grant execute on function public.is_authenticated_user_assigned_to_temple(uuid) to authenticated;
