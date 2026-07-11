---
title: ADR-0001 Immutable Inventory Ledger
status: active
doc_type: adr
lifecycle: historical
owner: engineering
update_cadence: update only supersession metadata or links
last_reviewed: null
related:
  - ./README.md
  - ./ADR_GUIDE.md
  - ./0002-positive-quantities-and-quantity-effects.md
  - ./0009-auditability-and-reversibility.md
  - ../../INVENTORY_ARCHITECTURE.md
  - ../../SYSTEM_ARCHITECTURE.md
  - ../../../infra/supabase/README.md
  - ../../../infra/supabase/migrations/20260525000100_foundational_schema.sql
---

# ADR-0001: Immutable Inventory Ledger

## Status

Accepted

## Context

The existing inventory architecture states that inventory is event-driven, counts are derived from immutable inventory transactions, and inventory values must never be directly mutated.

The foundational Supabase schema creates `inventory_transactions` as the inventory ledger and adds an immutability trigger that rejects updates and deletes. The Supabase README also states that inventory balance will be derived from `inventory_transactions` and that no mutable stock balance table is created yet.

## Decision

Inventory history is represented as an append-only ledger of inventory transactions.

Current inventory is derived from transaction aggregation. Inventory balances are not the source of truth and must not be directly mutated.

## Consequences

- Inventory history remains auditable.
- Corrections require additional transactions rather than edits.
- Balance queries must aggregate or read from future derived views.
- Operational mistakes remain visible rather than being overwritten.
- Future performance improvements must preserve ledger truth.

## Alternatives Considered

- Mutable stock balance table: Existing documentation explicitly states that no mutable stock balance table is created in the foundational schema.

## Implementation Notes

- `inventory_transactions` is created in `20260525000100_foundational_schema.sql`.
- The same migration creates the `inventory_transactions_immutable` trigger.
- Any future snapshot, cache, or materialized view must remain derived from the ledger.

## Related Documents

- [Inventory Architecture](../../INVENTORY_ARCHITECTURE.md)
- [System Architecture](../../SYSTEM_ARCHITECTURE.md)
- [Supabase README](../../../infra/supabase/README.md)
- [Foundational Schema Migration](../../../infra/supabase/migrations/20260525000100_foundational_schema.sql)
- [ADR-0002: Positive Quantities And Quantity Effects](./0002-positive-quantities-and-quantity-effects.md)
- [ADR-0009: Auditability And Reversibility](./0009-auditability-and-reversibility.md)

## Supersession

None.

