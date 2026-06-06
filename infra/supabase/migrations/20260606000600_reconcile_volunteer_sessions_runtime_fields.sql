-- =====================================================
-- Krishna's Kitchen / SevaOps
-- Volunteer Session Runtime Compatibility
-- =====================================================

-- Add durable runtime fields needed for future server-backed temporary
-- volunteer validation. This is additive only and does not change auth flows.

alter table public.volunteer_sessions
  add column if not exists display_name text,
  add column if not exists started_at timestamptz,
  add column if not exists last_seen_at timestamptz,
  add column if not exists revoked_at timestamptz,
  add column if not exists revoked_by_user_id uuid references public.users(id),
  add column if not exists revocation_reason text,
  add column if not exists client_session_id text;

create index if not exists idx_volunteer_sessions_join_code_status_expires
  on public.volunteer_sessions(join_code, status, expires_at);

create index if not exists idx_volunteer_sessions_active_lookup
  on public.volunteer_sessions(organization_id, temple_id, status, expires_at)
  where status = 'active';

create index if not exists idx_volunteer_sessions_client_session_id
  on public.volunteer_sessions(client_session_id)
  where client_session_id is not null;
