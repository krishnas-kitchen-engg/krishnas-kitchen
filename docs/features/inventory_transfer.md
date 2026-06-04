# Inventory Transfer Workflow

## Objective

Enable inventory managers and trained volunteers to move inventory between temple storage locations while preserving immutable transaction history and trustworthy location balances.

Transfers are the operational bridge between receiving and consumption. They model real movement such as trailer to pantry, warehouse to freezer, and pantry to festival storage.

This workflow must:

* preserve event-driven inventory history
* move inventory using transfer semantics, not signed quantities
* keep source and destination locations explicit
* prevent same-location transfers
* support reversal through undo transactions
* remain compatible with future offline queueing

---

# User Story

As an inventory manager,

I want to transfer inventory from one location to another,

so that location-level balances reflect where food actually is before cooking, festivals, and restocking decisions.

---

# Roles Involved

* inventory_manager
* temple_admin
* trained volunteer
* system

---

# Permissions Required

* inventory.transfer
* inventory.read
* locations.read
* items.read
* audit.read

---

# Operational Flow

1. User selects the item being moved.
2. User selects source location.
3. User selects destination location.
4. User enters positive quantity.
5. User confirms unit.
6. System validates item, source location, destination location, quantity, and unit.
7. System prevents transfer when source and destination are the same.
8. Transfer transaction is created.
9. Transaction uses `source_location_id` and `destination_location_id`.
10. Transaction uses positive quantity and `quantity_effect = "transfer"`.
11. Inventory balances re-aggregate by subtracting from source and adding to destination.
12. Audit metadata records actor, source, destination, item, quantity, unit, and request metadata.

---

# Transfer Rules

Transfer transactions:

* are immutable
* are append-only
* use positive quantity
* use `transaction_type = "transfer"`
* use `quantity_effect = "transfer"`
* require `source_location_id`
* require `destination_location_id`
* require source and destination to differ
* do not use signed quantity input
* do not mutate balances directly

Balances derive from aggregation:

* source location decreases by transfer quantity
* destination location increases by transfer quantity
* original transaction remains unchanged
* corrections occur through reversal transactions

---

# Edge Cases

* source location missing
* destination location missing
* source and destination are the same
* source location archived
* destination location archived
* item archived
* quantity is zero, negative, non-finite, or too large
* unit does not match item transfer unit expectations
* duplicate submit
* network retry after persistence succeeds
* user attempts transfer from wrong temple or organization
* source balance may be insufficient

Insufficient balance handling should be explicit. Initial implementation may validate transaction shape only, but the architecture should allow later source-balance checks without mutating inventory state.

---

# Offline Behavior

Offline transfer queueing is not implemented in this feature.

The workflow must support future offline queueing by preserving:

* stable client-side transaction draft ids
* `auditMetadata.clientRequestId`
* source and destination location ids
* append-only replay semantics
* duplicate replay prevention requirements

Queued transfers must replay as transaction inserts. Failed replay must remain recoverable and must not mutate previously persisted inventory history.

---

# Validation Rules

## Quantity Validation

* quantity is required
* quantity must be positive
* quantity must be finite
* quantity must remain within a reasonable operational maximum

## Unit Validation

* unit must be a supported inventory unit
* unit must be valid for the item

## Source Location Validation

* source location is required
* source location must exist
* source location must belong to the same organization
* source location must belong to the same temple
* source location must not be archived

## Destination Location Validation

* destination location is required
* destination location must exist
* destination location must belong to the same organization
* destination location must belong to the same temple
* destination location must not be archived
* destination location must differ from source location

## Item Validation

* item must exist
* item must belong to the same organization
* item must not be archived

## Permission Validation

* user must have `inventory.transfer`
* temporary volunteers should require explicit scoped allowance before transfer is enabled

---

# Audit Requirements

Every transfer transaction must record:

* actor identity
* actor type
* organization id
* temple id
* item id
* source location id
* destination location id
* quantity
* unit
* notes when supplied
* created timestamp
* client request id
* source audit metadata
* device id when supplied

Undo of transfer must record:

* a new `undo` transaction
* `reversal_of_transaction_id` pointing to the original transfer transaction
* source and destination swapped by reversal semantics
* original transfer remains immutable

---

# Acceptance Criteria

* [ ] Transfer transaction drafts can be created with source and destination locations.
* [ ] Transfer rejects missing source location.
* [ ] Transfer rejects missing destination location.
* [ ] Transfer rejects same-location movement.
* [ ] Transfer rejects non-positive quantities.
* [ ] Transfer uses positive quantity and transfer semantics.
* [ ] Transfer aggregation subtracts from source and adds to destination.
* [ ] Transfer audit metadata includes client request id.
* [ ] Transfer can be reversed by an undo transaction.
* [ ] Original transfer transaction remains immutable after undo.

---

# Required Tests

## Unit Tests

* transfer transaction creation
* source location validation
* destination location validation
* same-location prevention
* quantity validation
* unit validation
* audit metadata preservation
* transfer aggregation correctness
* transfer undo transaction creation

## Service Tests

* authorized transfer input creates transfer transaction draft
* invalid transfer input fails before repository persistence
* transfer service uses repository append-only create method

## Permission Tests

* authorized transfer succeeds
* unauthorized transfer fails
* temporary volunteer restrictions enforced

## Offline Tests

Not implemented yet.

Future tests should cover:

* duplicate client request id replay
* interrupted transfer persistence response
* queued transfer replay
* failed replay recovery

## Mobile Tests

No UI in this feature.

Mobile-safe assumptions:

* no direct DOM dependency
* no localStorage dependency in domain logic
* no barcode scanner dependency
* service remains callable from future mobile-first transfer UI

## Real Workflow Tests

Test using real movement scenarios:

* trailer to pantry
* trailer to freezer
* warehouse to pantry
* pantry to festival storage
* mistaken transfer followed by undo

Observe:

* whether location balances remain understandable
* whether source and destination are easy to audit
* whether reversal preserves transaction history

---

# Deployment Considerations

Initial rollout should be limited to inventory managers and temple admins.

Risks:

* wrong source location reduces the wrong balance
* same-location transfers create audit noise
* missing source-balance checks may allow negative derived balances
* weak organization or temple scoping can expose cross-location data

Rollback:

* do not delete transfer transactions
* disable transfer creation path if needed
* preserve existing transfer history for audit
* corrections must use reversal transactions

---

# Future Extension Notes

Future work, in order:

* transfer persistence integration
* return workflow
* undo/reversal workflow hardening
* barcode-assisted transfer
* source balance sufficiency checks
* offline transfer queue
* RLS policy hardening
