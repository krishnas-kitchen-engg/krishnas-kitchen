---
title: ADR-0007 RPC Boundaries And Browser Trust
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
  - ./0004-temporary-volunteer-session-model.md
  - ../../../infra/supabase/README.md
  - ../../../infra/supabase/migrations/20260607000100_add_rls_security_helper_functions.sql
  - ../../../infra/supabase/migrations/20260607000200_add_volunteer_session_rpc_functions.sql
  - ../../../infra/supabase/migrations/20260607000400_add_volunteer_inventory_read_rpc_functions.sql
  - ../../../infra/supabase/migrations/20260607000500_add_volunteer_inventory_barcode_catalog_rpc.sql
---

# ADR-0007: RPC Boundaries And Browser Trust

## Status

Accepted

## Context

The Supabase README states that anon-key access is public client access and authorization must live in RLS policies. It also expects audit logs to be writable only by trusted server-side code or controlled database functions.

The RLS helper migration states that helper functions are for later RLS policies and volunteer RPCs and do not expose volunteer session tables directly to anonymous clients.

Volunteer session and inventory read migrations add controlled security-definer RPCs, revoke broad execution, and grant specific anonymous execution surfaces where needed.

## Decision

Browser access must be treated as untrusted. Anonymous or temporary-volunteer browser access uses controlled RPC boundaries rather than direct table policies for sensitive volunteer-session surfaces.

Security-definer RPCs must derive scope from database state, not from trusted browser claims alone.

## Consequences

- RPCs become part of the security boundary and require review.
- Anonymous execution grants must be narrow and intentional.
- Volunteer-session tables are not directly exposed to anonymous clients.
- Browser-held identifiers must be validated against active, unexpired, non-revoked session rows.

## Alternatives Considered

- Direct anonymous table policies for volunteer access: Current migration comments explicitly avoid direct anonymous table policies for volunteer session and inventory read surfaces.

## Implementation Notes

- `20260607000100_add_rls_security_helper_functions.sql` creates database-derived scope helpers.
- `20260607000200_add_volunteer_session_rpc_functions.sql` creates controlled volunteer session RPCs.
- `20260607000400_add_volunteer_inventory_read_rpc_functions.sql` creates temporary-volunteer inventory visibility RPCs.
- `20260607000500_add_volunteer_inventory_barcode_catalog_rpc.sql` adds the volunteer barcode catalog read RPC.

## Related Documents

- [Supabase README](../../../infra/supabase/README.md)
- [RLS Helper Functions Migration](../../../infra/supabase/migrations/20260607000100_add_rls_security_helper_functions.sql)
- [Volunteer Session RPC Migration](../../../infra/supabase/migrations/20260607000200_add_volunteer_session_rpc_functions.sql)
- [Volunteer Inventory Read RPC Migration](../../../infra/supabase/migrations/20260607000400_add_volunteer_inventory_read_rpc_functions.sql)
- [Volunteer Barcode Catalog RPC Migration](../../../infra/supabase/migrations/20260607000500_add_volunteer_inventory_barcode_catalog_rpc.sql)
- [ADR-0003: Supabase Auth And RLS Boundary](./0003-supabase-auth-and-rls-boundary.md)
- [ADR-0004: Temporary Volunteer Session Model](./0004-temporary-volunteer-session-model.md)

## Supersession

None.

