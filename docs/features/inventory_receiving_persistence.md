# Inventory Receiving Persistence

## Objective

Persist receiving transactions durably and append-only so inventory history remains auditable, reversible, and safe for later offline replay.

This feature focuses only on the persistence boundary for the already-defined receiving domain workflow.

It must ensure:

* receiving transactions are saved as immutable inventory events
* audit metadata is persisted with the transaction
* duplicate replay prevention is supported through client request metadata
* Supabase integration preserves domain transaction semantics
* rollback does not require deleting or mutating inventory history

---

# User Story

As an inventory manager,

I want receiving transactions to persist reliably with audit context,

so that inventory balances and transaction history remain trustworthy after page reloads, reconnects, and operational review.

---

# Roles Involved

* volunteer
* inventory_manager
* temple_admin
* system

---

# Permissions Required

* inventory.receive
* inventory.read
* locations.read
* items.read
* audit.read

---

# Operational Flow

1. Receiving domain input is validated.
2. Receiving service creates a received inventory transaction draft.
3. Draft contains positive quantity, destination location, actor, and audit metadata.
4. Supabase repository inserts the transaction into `inventory_transactions`.
5. Supabase returns the persisted immutable transaction row.
6. Mapper converts the row back into the domain transaction type.
7. Inventory balances remain derived from transaction aggregation.
8. Corrections are handled by undo/reversal transactions, never updates or deletes.

---

# Persistence Rules

Receiving persistence must be append-only.

Allowed:

* insert a new receiving transaction
* insert a new undo transaction that reverses a receiving transaction
* read transactions for aggregation and audit review

Not allowed:

* update a receiving transaction
* delete a receiving transaction
* overwrite audit metadata
* persist negative receiving quantities
* persist signed quantity deltas

Receiving transactions must persist:

* `transaction_type = "received"`
* `quantity_effect = "increase"`
* positive `quantity`
* `destination_location_id`
* null `source_location_id`
* actor identity
* organization and temple scope
* unit
* audit metadata

---

# Edge Cases

* duplicate submit with same client request id
* network retry after insert succeeded but response failed
* archived item or location detected before persistence
* Supabase insert failure
* transaction mapper mismatch
* audit metadata missing client request id
* temporary volunteer session expires before persistence
* receiving undo after original transaction persisted

---

# Offline Behavior

Offline queueing is not implemented in this feature.

The persistence design must support it later by preserving:

* stable client-side transaction draft ids
* `auditMetadata.clientRequestId`
* `auditMetadata.source = "offline_queue"` when queued replay is introduced
* idempotent replay requirements at the repository or database boundary
* append-only replay semantics

Queued receiving transactions must replay as inserts. Failed replay must not mutate previously persisted history.

---

# Validation Rules

Before persistence:

* quantity must be positive and finite
* unit must be valid for receiving
* item must exist and belong to the same organization
* item must not be archived
* location must exist and belong to the same organization and temple
* location must not be archived
* actor identity must be valid

At persistence boundary:

* repository must only accept a validated transaction draft
* mapper must preserve transaction type, quantity effect, locations, unit, and audit metadata
* persisted transaction must round-trip into the strongly typed domain shape

---

# Audit Requirements

Every persisted receiving transaction must record:

* actor type
* actor user id or temporary volunteer session id when applicable
* organization id
* temple id
* item id
* destination location id
* quantity
* unit
* created timestamp
* client request id
* source
* device id when supplied
* notes when supplied

Undo persistence must record:

* a new transaction with `transaction_type = "undo"`
* `reversal_of_transaction_id` pointing to the original receiving transaction
* audit metadata explaining the reversal reason when supplied

---

# Acceptance Criteria

* [ ] Receiving service persists a validated receiving transaction through Supabase repository.
* [ ] Persisted receiving transaction round-trips into `InventoryTransaction`.
* [ ] Persisted receiving transaction uses positive quantity and increase semantics.
* [ ] Audit metadata persists without being dropped by mapper or repository.
* [ ] Original receiving transaction remains immutable after undo.
* [ ] Undo persists as a separate reversal transaction.
* [ ] Repository rejects or surfaces persistence failures without mutating local history.
* [ ] Persistence design supports duplicate replay prevention later.

---

# Required Tests

## Unit Tests

* mapper preserves receiving transaction fields
* mapper preserves audit metadata
* receiving draft maps to Supabase insert shape
* received transaction round-trips from Supabase row shape

## Service Tests

* receive inventory calls repository with validated draft
* persistence failure does not fabricate a successful transaction
* undo creates a reversal transaction after receiving persistence

## Integration Tests

* Supabase insert persists receiving transaction
* Supabase read returns receiving transaction
* audit metadata persists as JSON
* append-only undo creates a second transaction

## Permission Tests

* authorized receive can persist
* unauthorized receive cannot persist
* temporary volunteer scope is enforced before persistence

## Offline Tests

Not implemented yet.

Future tests should cover:

* duplicate client request id replay
* interrupted insert response
* queued transaction replay
* failed replay recovery

## Mobile Tests

No UI or browser workflow in this feature.

Mobile-safe assumptions:

* no browser-only persistence assumptions
* no direct localStorage dependency in domain persistence
* no camera or scanning integration
* service remains callable from future mobile-first UI

## Real Workflow Tests

Use real receiving scenarios once Supabase integration is available:

* bulk rice bags
* dairy delivery
* freezer item receiving
* repeated produce receiving
* undo of an incorrect persisted receiving transaction

---

# Deployment Considerations

Persistence rollout must preserve inventory integrity.

Risks:

* mapper mistakes can corrupt audit visibility
* missing idempotency can duplicate offline replays later
* database constraints may reject valid domain drafts if schema and types drift
* weak RLS can expose cross-temple transaction history

Rollback:

* do not delete receiving transactions
* disable new receiving persistence path if needed
* keep existing persisted transactions available for aggregation and audit
* corrections must use reversal transactions

---

# Future Extension Notes

Future work, in order:

* receiving Supabase repository integration tests
* transfer workflow persistence
* return workflow persistence
* undo/reversal workflow hardening
* barcode scanning
* offline queue idempotency
* RLS policy hardening
