---
title: ADR-0009 Auditability And Reversibility
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
  - ./0002-positive-quantities-and-quantity-effects.md
  - ../../INVENTORY_ARCHITECTURE.md
  - ../../SYSTEM_ARCHITECTURE.md
  - ../../MVP_SCOPE.md
  - ../../../infra/supabase/README.md
  - ../../../infra/supabase/migrations/20260525000100_foundational_schema.sql
  - ../../../infra/supabase/migrations/20260606000100_add_reversal_transaction_type.sql
  - ../../../infra/supabase/migrations/20260606000200_reconcile_inventory_transaction_constraints.sql
---

# ADR-0009: Auditability And Reversibility

## Status

Accepted

## Context

The inventory architecture prioritizes auditability, reversibility, operational trust, and immutable transaction history. It states that undo operations create reversal transactions and never mutate historical transactions.

The system architecture requires all inventory actions to be auditable. The MVP scope includes reversible actions as an architectural requirement.

The foundational schema creates immutable `audit_logs` and a `reversal_of_transaction_id` reference on inventory transactions. Later migrations add the current `reversal` transaction type and reconcile reversal constraints.

## Decision

Inventory-changing actions must remain auditable and reversible through explicit reversal or compensating transactions rather than historical mutation.

Audit history and inventory ledger history must remain immutable.

## Consequences

- Mistakes can be corrected without hiding what happened.
- Reversal chains must remain understandable.
- Audit metadata must be carried through transaction drafts and persistence.
- Undo/reversal terminology must remain synchronized across docs, code, and schema.

## Alternatives Considered

- Updating or deleting original transactions: Existing inventory architecture explicitly prohibits this.

## Implementation Notes

- `audit_logs` and `inventory_transactions` are made immutable in `20260525000100_foundational_schema.sql`.
- `reversal_of_transaction_id` links reversal transactions to originals.
- `20260606000100_add_reversal_transaction_type.sql` adds `reversal`.
- `20260606000200_reconcile_inventory_transaction_constraints.sql` requires reversal transactions to reference an original transaction.

## Related Documents

- [Inventory Architecture](../../INVENTORY_ARCHITECTURE.md)
- [System Architecture](../../SYSTEM_ARCHITECTURE.md)
- [MVP Scope](../../MVP_SCOPE.md)
- [Supabase README](../../../infra/supabase/README.md)
- [Foundational Schema Migration](../../../infra/supabase/migrations/20260525000100_foundational_schema.sql)
- [Reversal Transaction Type Migration](../../../infra/supabase/migrations/20260606000100_add_reversal_transaction_type.sql)
- [Transaction Constraint Reconciliation Migration](../../../infra/supabase/migrations/20260606000200_reconcile_inventory_transaction_constraints.sql)
- [ADR-0001: Immutable Inventory Ledger](./0001-immutable-inventory-ledger.md)
- [ADR-0002: Positive Quantities And Quantity Effects](./0002-positive-quantities-and-quantity-effects.md)

## Supersession

None.

