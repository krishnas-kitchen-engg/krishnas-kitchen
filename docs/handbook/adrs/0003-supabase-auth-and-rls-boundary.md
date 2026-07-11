---
title: ADR-0003 Supabase Auth And RLS Boundary
status: active
doc_type: adr
lifecycle: historical
owner: engineering
update_cadence: update only supersession metadata or links
last_reviewed: null
related:
  - ./README.md
  - ./ADR_GUIDE.md
  - ./0004-temporary-volunteer-session-model.md
  - ./0007-rpc-boundaries-and-browser-trust.md
  - ../../AUTH_ARCHITECTURE.md
  - ../../PERMISSIONS_MATRIX.md
  - ../../SYSTEM_ARCHITECTURE.md
  - ../../../infra/supabase/README.md
  - ../../../infra/supabase/migrations/20260525000100_foundational_schema.sql
  - ../../../infra/supabase/migrations/20260607000100_add_rls_security_helper_functions.sql
  - ../../../infra/supabase/migrations/20260607000300_add_authenticated_inventory_read_policies.sql
---

# ADR-0003: Supabase Auth And RLS Boundary

## Status

Accepted

## Context

The auth architecture states that Supabase Auth is the source of browser session persistence and that database authorization should be enforced through Supabase row-level security policies.

The system architecture states that authorization uses row-level security policies and that server-side authorization is mandatory. The permissions matrix states that client-side permissions are informational only and cross-organization access is forbidden.

The foundational migration enables RLS on foundational tables. Later migrations add database-derived authorization helper functions and authenticated inventory read policies.

## Decision

Supabase Auth provides browser session identity, while Supabase/PostgreSQL RLS is the authoritative authorization boundary for protected data access.

Client-side permission helpers may support UI gating, but they are not the final enforcement mechanism.

## Consequences

- Authorization must be represented at the database boundary for protected data.
- Client code can improve usability but cannot be trusted as policy enforcement.
- RLS policy design and helper functions become security-sensitive architecture.
- Multi-tenant data isolation depends on correct organization and temple scoping.

## Alternatives Considered

No alternative authorization boundary is documented in the current source material.

## Implementation Notes

- `20260525000100_foundational_schema.sql` enables RLS on foundational tables.
- `20260607000100_add_rls_security_helper_functions.sql` adds database authorization helpers.
- `20260607000300_add_authenticated_inventory_read_policies.sql` adds authenticated read policies for inventory-facing tables.

## Related Documents

- [Authentication and Authorization Architecture](../../AUTH_ARCHITECTURE.md)
- [Permissions Matrix](../../PERMISSIONS_MATRIX.md)
- [System Architecture](../../SYSTEM_ARCHITECTURE.md)
- [Supabase README](../../../infra/supabase/README.md)
- [Foundational Schema Migration](../../../infra/supabase/migrations/20260525000100_foundational_schema.sql)
- [RLS Helper Functions Migration](../../../infra/supabase/migrations/20260607000100_add_rls_security_helper_functions.sql)
- [Authenticated Inventory Read Policies Migration](../../../infra/supabase/migrations/20260607000300_add_authenticated_inventory_read_policies.sql)
- [ADR-0004: Temporary Volunteer Session Model](./0004-temporary-volunteer-session-model.md)
- [ADR-0007: RPC Boundaries And Browser Trust](./0007-rpc-boundaries-and-browser-trust.md)

## Supersession

None.

