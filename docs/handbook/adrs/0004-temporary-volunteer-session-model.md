---
title: ADR-0004 Temporary Volunteer Session Model
status: active
doc_type: adr
lifecycle: historical
owner: engineering
update_cadence: update only supersession metadata or links
last_reviewed: null
related:
  - ./README.md
  - ./ADR_GUIDE.md
  - ./0003-supabase-auth-and-rls-boundary.md
  - ./0007-rpc-boundaries-and-browser-trust.md
  - ../../AUTH_ARCHITECTURE.md
  - ../../PERMISSIONS_MATRIX.md
  - ../../SYSTEM_ARCHITECTURE.md
  - ../../../infra/supabase/README.md
  - ../../../infra/supabase/migrations/20260525000100_foundational_schema.sql
  - ../../../infra/supabase/migrations/20260606000600_reconcile_volunteer_sessions_runtime_fields.sql
  - ../../../infra/supabase/migrations/20260607000100_add_rls_security_helper_functions.sql
  - ../../../infra/supabase/migrations/20260607000200_add_volunteer_session_rpc_functions.sql
---

# ADR-0004: Temporary Volunteer Session Model

## Status

Accepted

## Context

The system architecture states that temporary volunteers must use restricted sessions, have scoped permissions, expire automatically, and remain attributable in audit logs.

The auth architecture describes temporary volunteer sessions as local, time-limited, and restricted. The permissions matrix states that temporary volunteer sessions are not permanent authorization roles and must be server-verified before production use.

The foundational schema creates `volunteer_sessions`. Later migrations reconcile runtime fields and add controlled security-definer RPCs for volunteer session validation and restoration.

## Decision

Temporary volunteers use session records rather than permanent user roles.

Temporary volunteer access is scoped by organization, temple, session status, expiration, revocation state, and client session context where applicable.

## Consequences

- Temporary volunteer access can expire without changing permanent role assignments.
- Volunteer actions can remain attributable to a temporary session.
- Browser-held temporary session state must be validated against server/database state.
- Temporary volunteer capabilities must remain narrow and explicitly reviewed.
- Current documentation contains permission-scope drift that must be resolved before treating every temporary volunteer capability as final.

## Alternatives Considered

No documented alternative model, such as creating permanent users for temporary volunteers, is described in the current source material.

## Implementation Notes

- `volunteer_sessions` is created in `20260525000100_foundational_schema.sql`.
- `20260606000600_reconcile_volunteer_sessions_runtime_fields.sql` adds runtime fields and indexes.
- `20260607000100_add_rls_security_helper_functions.sql` adds active volunteer session scope helpers.
- `20260607000200_add_volunteer_session_rpc_functions.sql` adds volunteer join, restore, refresh, and clear RPC functions.

## Related Documents

- [Authentication and Authorization Architecture](../../AUTH_ARCHITECTURE.md)
- [Permissions Matrix](../../PERMISSIONS_MATRIX.md)
- [System Architecture](../../SYSTEM_ARCHITECTURE.md)
- [Supabase README](../../../infra/supabase/README.md)
- [Foundational Schema Migration](../../../infra/supabase/migrations/20260525000100_foundational_schema.sql)
- [Volunteer Session Runtime Fields Migration](../../../infra/supabase/migrations/20260606000600_reconcile_volunteer_sessions_runtime_fields.sql)
- [Volunteer Session RPC Migration](../../../infra/supabase/migrations/20260607000200_add_volunteer_session_rpc_functions.sql)
- [ADR-0003: Supabase Auth And RLS Boundary](./0003-supabase-auth-and-rls-boundary.md)
- [ADR-0007: RPC Boundaries And Browser Trust](./0007-rpc-boundaries-and-browser-trust.md)

## Supersession

None.

