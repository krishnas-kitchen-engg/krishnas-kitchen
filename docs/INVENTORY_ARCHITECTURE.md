# INVENTORY_ARCHITECTURE.md

# Core Principle

Inventory is event-driven.

Inventory counts are derived from immutable inventory transactions.

Inventory values must never be directly mutated.

---

# Inventory Philosophy

The inventory system must prioritize:

- auditability
- reversibility
- operational trust
- simplicity
- offline resilience

---

# Inventory Transaction Types

- received
- consumed
- transfer
- returned
- adjusted
- wasted
- reservation
- undo

---

# Immutable Transactions

Inventory transactions are append-only.

Transactions:
- cannot be updated
- cannot be deleted

Corrections occur via:
- reversal transactions
- compensating transactions

---

# Undo Architecture

Undo operations create reversal transactions.

Undo must never mutate historical transactions.

---

# Transfer Model

Transfers use:

- source_location_id
- destination_location_id

Transfer direction must not depend on signed quantities.

---

# Quantity Rules

Quantities must always remain positive.

Transaction semantics determine inventory direction.

---

# Inventory Balance Calculation

Inventory balances are derived from transaction aggregation.

Current inventory is NOT the source of truth.

Transactions are the source of truth.

---

# Reservation Philosophy

Reservations temporarily allocate inventory for planned usage.

Reservations do not immediately deduct stock.

---

# Auditability

All inventory-changing actions must remain attributable to:

- user
- temporary volunteer
- system process

---

# Offline Strategy

Offline actions:
- queue locally
- sync later
- retry safely
- avoid duplicate application

---

# Operational Simplicity

Operational workflows must remain:

- fast
- mobile-first
- low-friction
- reversible

---

# Domain Implementation

The foundational inventory domain lives under:

```text
apps/web/src/domains/inventory/
  application/
    inventoryRepository.ts   # persistence contract
    inventoryService.ts      # use-case service
  domain/
    aggregation.ts           # balance derivation from immutable events
    transactionHelpers.ts    # creation helpers and undo/reversal helpers
    types.ts                 # domain models and audit metadata
    validation.ts            # transaction validation rules
  infrastructure/
    supabase/                # Supabase repository adapter and row mapping
```

No React inventory screens are implemented. The domain can be used by future screens, background sync, or an offline queue.

## Event Semantics

Transactions store positive quantities only. `quantity_effect` determines balance direction:

- `increase`: adds quantity to `destination_location_id`
- `decrease`: subtracts quantity from `source_location_id`
- `transfer`: subtracts from source and adds to destination
- `none`: records an event without changing balance

`undo` creates a new reversal transaction. It never edits the original transaction.

## Audit Metadata

Inventory drafts include `auditMetadata` for client request IDs, device IDs, offline queue source, and operational reason text. This supports later idempotency and sync diagnostics without changing the immutable transaction model.

## Service Boundary

`createInventoryService` depends on `InventoryTransactionRepository`. The Supabase adapter is one implementation. A future offline queue can implement the same repository contract and replay validated drafts when connectivity returns.
