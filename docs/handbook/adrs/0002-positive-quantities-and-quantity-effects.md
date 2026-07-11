---
title: ADR-0002 Positive Quantities And Quantity Effects
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
  - ../../INVENTORY_ARCHITECTURE.md
  - ../../../infra/supabase/migrations/20260525000100_foundational_schema.sql
  - ../../../infra/supabase/migrations/20260606000200_reconcile_inventory_transaction_constraints.sql
---

# ADR-0002: Positive Quantities And Quantity Effects

## Status

Accepted

## Context

The inventory architecture states that quantities must always remain positive and transaction semantics determine inventory direction. It also documents `quantity_effect` values for increase, decrease, transfer, and none.

The foundational schema creates an `inventory_quantity_effect` enum and constraints tying transaction type, quantity effect, and source/destination location requirements together. A later migration reconciles these constraints for received, transfer, returned, reversal, undo, adjusted, reservation, consumed, and wasted transaction families.

## Decision

Inventory transactions store positive quantities. Direction and balance impact are represented by transaction type, `quantity_effect`, and source/destination location fields rather than signed quantity values.

## Consequences

- Transaction rows are easier to read operationally.
- Transfer direction is explicit through source and destination locations.
- Validation must enforce effect/type/location consistency.
- Aggregation logic must interpret `quantity_effect`.
- Corrections must preserve positive quantity semantics.

## Alternatives Considered

- Signed quantity deltas: Existing inventory architecture rejects direction based on signed quantities for transfers.

## Implementation Notes

- `inventory_quantity_effect` is defined in `20260525000100_foundational_schema.sql`.
- `inventory_transactions_effect_matches_type` and `inventory_transactions_locations_match_effect` constrain event semantics.
- `20260606000200_reconcile_inventory_transaction_constraints.sql` reconciles the current transaction family constraints.

## Related Documents

- [Inventory Architecture](../../INVENTORY_ARCHITECTURE.md)
- [Foundational Schema Migration](../../../infra/supabase/migrations/20260525000100_foundational_schema.sql)
- [Transaction Constraint Reconciliation Migration](../../../infra/supabase/migrations/20260606000200_reconcile_inventory_transaction_constraints.sql)
- [ADR-0001: Immutable Inventory Ledger](./0001-immutable-inventory-ledger.md)
- [ADR-0009: Auditability And Reversibility](./0009-auditability-and-reversibility.md)

## Supersession

None.

