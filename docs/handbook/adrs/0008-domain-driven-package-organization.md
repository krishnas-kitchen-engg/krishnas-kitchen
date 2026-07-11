---
title: ADR-0008 Domain-Driven Package Organization
status: active
doc_type: adr
lifecycle: historical
owner: engineering
update_cadence: update only supersession metadata or links
last_reviewed: null
related:
  - ./README.md
  - ./ADR_GUIDE.md
  - ./0006-repository-pattern.md
  - ../../../README.md
  - ../../AUTH_ARCHITECTURE.md
  - ../../INVENTORY_ARCHITECTURE.md
---

# ADR-0008: Domain-Driven Package Organization

## Status

Accepted

## Context

The project README documents a workspace layout where app composition, domains, features, shared concerns, and packages have separate responsibilities.

The auth architecture documents app, auth feature, shared Supabase integration, and shared type locations. The inventory architecture documents an inventory domain split into application, domain, and infrastructure areas.

## Decision

Organize engineering work around explicit app, domain, feature, shared integration, and package boundaries.

Domain rules and application services should live under domain areas, user-facing workflows under feature areas, cross-cutting integrations under shared areas, and reusable contracts/helpers under packages.

## Consequences

- Contributors can find domain rules separately from UI workflows.
- Feature work should not bypass domain or shared integration boundaries.
- Shared packages must remain broadly useful rather than feature-specific dumping grounds.
- Architecture documents must describe ownership boundaries as the app grows.

## Alternatives Considered

No alternative package organization is documented in the current source material.

## Implementation Notes

- The README documents `apps/web/src/app`, `domains`, `features`, and `shared`.
- The inventory architecture documents `apps/web/src/domains/inventory/application`, `domain`, and `infrastructure`.
- The auth architecture documents `features/auth`, `shared/integrations/supabase`, and `packages/types`.

## Related Documents

- [Project README](../../../README.md)
- [Authentication and Authorization Architecture](../../AUTH_ARCHITECTURE.md)
- [Inventory Architecture](../../INVENTORY_ARCHITECTURE.md)
- [ADR-0006: Repository Pattern](./0006-repository-pattern.md)

## Supersession

None.
