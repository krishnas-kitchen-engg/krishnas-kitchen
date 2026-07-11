---
title: ADR-0006 Repository Pattern
status: active
doc_type: adr
lifecycle: historical
owner: engineering
update_cadence: update only supersession metadata or links
last_reviewed: null
related:
  - ./README.md
  - ./ADR_GUIDE.md
  - ./0001-immutable-inventory-ledger.md
  - ../../../README.md
  - ../../INVENTORY_ARCHITECTURE.md
  - ../../features/ui_integration_foundation.md
  - ../../features/alpha_persistence_foundation.md
---

# ADR-0006: Repository Pattern

## Status

Accepted

## Context

The project README states that Supabase access is prepared under `shared/integrations/supabase` and that feature code should consume a thin application-facing API instead of importing Supabase directly once real data flows are introduced.

The inventory architecture documents `InventoryTransactionRepository`, `createInventoryService`, and a Supabase repository adapter. It also states that a future offline queue can implement the same repository contract.

Feature documentation for UI integration requires repository adapters, service factories, and hooks, and says React components must not call Supabase directly or construct inventory services directly.

## Decision

Application and feature code should interact with domain services and repository contracts rather than directly coupling UI workflows to Supabase.

Supabase is one infrastructure adapter behind application-facing repositories and service factories.

## Consequences

- Domain logic can be tested without direct Supabase coupling.
- Future offline queues can implement the same contracts.
- UI code depends on hooks and services rather than database clients.
- Repository interfaces must preserve domain semantics and not leak low-level persistence details.

## Alternatives Considered

- Direct Supabase access from React components: Existing UI integration documentation explicitly prohibits this.

## Implementation Notes

- Inventory architecture documents the foundational inventory domain under `apps/web/src/domains/inventory/`.
- UI integration documentation defines service factories and hooks as the React integration boundary.
- Alpha persistence documentation establishes item, location, barcode, and lookup adapters as a persistence foundation.

## Related Documents

- [Project README](../../../README.md)
- [Inventory Architecture](../../INVENTORY_ARCHITECTURE.md)
- [UI Integration Foundation](../../features/ui_integration_foundation.md)
- [Alpha Persistence Foundation](../../features/alpha_persistence_foundation.md)
- [ADR-0001: Immutable Inventory Ledger](./0001-immutable-inventory-ledger.md)

## Supersession

None.
