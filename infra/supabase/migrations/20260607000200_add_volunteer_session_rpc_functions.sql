-- =====================================================
-- Krishna's Kitchen / SevaOps
-- Volunteer Session RPC Foundation
-- =====================================================

-- Add controlled SECURITY DEFINER RPCs for temporary volunteer session
-- validation. These functions intentionally avoid direct anon table policies
-- and derive organization, temple, role, and session scope from database rows.

create or replace function public.validate_volunteer_join_code(
  raw_join_code text,
  volunteer_display_name text,
  input_client_session_id text,
  checked_at timestamptz default timezone('utc', now())
)
returns table (
  session_id uuid,
  organization_id uuid,
  temple_id uuid,
  role public.temp_volunteer_role,
  display_name text,
  started_at timestamptz,
  last_seen_at timestamptz,
  expires_at timestamptz,
  client_session_id text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_join_code text := upper(trim(raw_join_code));
  normalized_display_name text := nullif(trim(volunteer_display_name), '');
  normalized_client_session_id text := nullif(trim(input_client_session_id), '');
  matched_session_id uuid;
begin
  if normalized_join_code is null
    or normalized_display_name is null
    or normalized_client_session_id is null
  then
    return;
  end if;

  select session_scope.session_id
  into matched_session_id
  from public.get_active_volunteer_session_scope_by_join_code(
    normalized_join_code,
    checked_at
  ) session_scope
  limit 1;

  if matched_session_id is null then
    return;
  end if;

  return query
  update public.volunteer_sessions volunteer_session
  set
    client_session_id = normalized_client_session_id,
    display_name = normalized_display_name,
    last_seen_at = checked_at,
    started_at = coalesce(volunteer_session.started_at, checked_at)
  where volunteer_session.id = matched_session_id
    and volunteer_session.status = 'active'
    and volunteer_session.revoked_at is null
    and volunteer_session.expires_at > checked_at
  returning
    volunteer_session.id,
    volunteer_session.organization_id,
    volunteer_session.temple_id,
    volunteer_session.role,
    volunteer_session.display_name,
    volunteer_session.started_at,
    volunteer_session.last_seen_at,
    volunteer_session.expires_at,
    volunteer_session.client_session_id;
end;
$$;

create or replace function public.restore_volunteer_session(
  volunteer_session_id uuid,
  expected_client_session_id text,
  checked_at timestamptz default timezone('utc', now())
)
returns table (
  session_id uuid,
  organization_id uuid,
  temple_id uuid,
  role public.temp_volunteer_role,
  display_name text,
  started_at timestamptz,
  last_seen_at timestamptz,
  expires_at timestamptz,
  client_session_id text
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
    volunteer_session.started_at,
    volunteer_session.last_seen_at,
    volunteer_session.expires_at,
    volunteer_session.client_session_id
  from public.get_active_volunteer_session_scope(
    volunteer_session_id,
    nullif(trim(expected_client_session_id), ''),
    checked_at
  ) session_scope
  join public.volunteer_sessions volunteer_session
    on volunteer_session.id = session_scope.session_id
  where nullif(trim(expected_client_session_id), '') is not null
  limit 1;
$$;

create or replace function public.refresh_volunteer_session(
  volunteer_session_id uuid,
  expected_client_session_id text,
  refreshed_at timestamptz default timezone('utc', now())
)
returns table (
  session_id uuid,
  organization_id uuid,
  temple_id uuid,
  role public.temp_volunteer_role,
  display_name text,
  started_at timestamptz,
  last_seen_at timestamptz,
  expires_at timestamptz,
  client_session_id text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  matched_session_id uuid;
begin
  select session_scope.session_id
  into matched_session_id
  from public.get_active_volunteer_session_scope(
    volunteer_session_id,
    expected_client_session_id,
    refreshed_at
  ) session_scope
  limit 1;

  if matched_session_id is null then
    return;
  end if;

  return query
  update public.volunteer_sessions volunteer_session
  set last_seen_at = refreshed_at
  where volunteer_session.id = matched_session_id
    and volunteer_session.status = 'active'
    and volunteer_session.revoked_at is null
    and volunteer_session.expires_at > refreshed_at
    and volunteer_session.client_session_id = expected_client_session_id
  returning
    volunteer_session.id,
    volunteer_session.organization_id,
    volunteer_session.temple_id,
    volunteer_session.role,
    volunteer_session.display_name,
    volunteer_session.started_at,
    volunteer_session.last_seen_at,
    volunteer_session.expires_at,
    volunteer_session.client_session_id;
end;
$$;

create or replace function public.clear_volunteer_client_session(
  volunteer_session_id uuid,
  expected_client_session_id text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if nullif(trim(expected_client_session_id), '') is null then
    return;
  end if;

  update public.volunteer_sessions volunteer_session
  set client_session_id = null
  where volunteer_session.id = volunteer_session_id
    and volunteer_session.client_session_id = nullif(trim(expected_client_session_id), '');
end;
$$;

revoke execute on function public.validate_volunteer_join_code(text, text, text, timestamptz)
  from public;
revoke execute on function public.restore_volunteer_session(uuid, text, timestamptz)
  from public;
revoke execute on function public.refresh_volunteer_session(uuid, text, timestamptz)
  from public;
revoke execute on function public.clear_volunteer_client_session(uuid, text)
  from public;

grant execute on function public.validate_volunteer_join_code(text, text, text, timestamptz)
  to anon;
grant execute on function public.restore_volunteer_session(uuid, text, timestamptz)
  to anon;
grant execute on function public.refresh_volunteer_session(uuid, text, timestamptz)
  to anon;
grant execute on function public.clear_volunteer_client_session(uuid, text)
  to anon;
