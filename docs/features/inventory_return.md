# Inventory Return Workflow

# Objective

Enable volunteers and inventory managers to return unused inventory from operational locations back into storage locations while maintaining complete inventory traceability and auditability.

The workflow must:

- reduce inventory waste
- maintain accurate stock balances
- preserve audit history
- support reversibility
- remain operationally simple

Returns are common after:

- festivals
- large prasadam preparation
- special events
- inventory over-picks
- kitchen preparation mistakes

---

# Operational Problem

Today inventory that is not fully consumed often:

- gets forgotten
- gets misplaced
- is not recorded
- causes inventory mismatches

Examples:

- Rice taken to kitchen but not used
- Vegetables prepared but not fully consumed
- Milk returned to cold storage
- Festival inventory returned after event
- Frozen inventory returned to freezer

The workflow must ensure these returns are recorded accurately.

---

# User Story

As a volunteer,

I want to return unused inventory to the correct storage location,

so that inventory balances remain accurate and usable stock is not lost.

---

# Roles Involved

- volunteer
- inventory_manager
- temple_admin

---

# Permissions Required

- inventory.return
- inventory.read
- locations.read
- items.read

---

# Operational Workflow

# Standard Return Flow

1. Volunteer opens return workflow
2. Volunteer selects source location
3. Volunteer selects destination location
4. Volunteer selects item
5. Volunteer enters quantity
6. Volunteer submits return
7. Return transaction is created
8. Inventory balances re-aggregate automatically
9. Audit metadata is recorded

Current return transactions persist as `transaction_type = "returned"` with
`quantity_effect = "transfer"`. The source location decreases and the
destination location increases.

---

# Return Examples

Rice:
Kitchen → Pantry

Vegetables:
Festival Area → Pantry

Milk:
Kitchen → Cold Storage

Frozen Items:
Kitchen → Freezer

Bulk Ingredients:
Temporary Storage → Trailer

---

# Volunteer Realities

Assume:

- volunteers are busy
- volunteers may not know exact quantities
- volunteers may be distracted
- internet may be unstable

The workflow must be:

- simple
- forgiving
- reversible
- mobile-first

---

# Edge Cases

## Quantity Issues

- zero quantity
- negative quantity
- unrealistic quantity
- decimal quantity

---

## Location Issues

- source missing
- destination missing
- source equals destination
- archived location

---

## Operational Issues

- accidental double submission
- expired volunteer session
- interrupted network
- duplicate return

---

# Offline Behavior

Architecture must support future offline queueing.

No offline implementation required yet.

---

# Validation Rules

## Quantity

- required
- positive
- operationally reasonable

## Location

- source exists
- destination exists
- same location prohibited

## Item

- item exists
- item belongs to organization
- item not archived

## Permissions

- user must have inventory.return

---

# Audit Requirements

Record:

- actor identity
- actor type
- timestamp
- source location
- destination location
- item
- quantity
- unit

---

# Inventory Rules

Returns:

- remain immutable
- cannot be edited
- cannot be deleted
- use positive quantities
- use transfer semantics from source to destination

Corrections occur via reversal transactions.

Inventory balances derive from transaction aggregation.

---

# Acceptance Criteria

- [ ] Return creates immutable transaction
- [ ] Inventory balances aggregate correctly
- [ ] Invalid quantities rejected
- [ ] Same-location returns rejected
- [ ] Invalid permissions rejected
- [ ] Audit metadata recorded
- [ ] Mobile workflow supported

---

# Required Tests

## Validation Tests

- quantity validation
- location validation
- item validation

## Service Tests

- successful return
- invalid return
- invalid permissions

## Aggregation Tests

- return movement correctness

## Audit Tests

- metadata persistence

---

# Deployment Considerations

Initial rollout:

- single temple
- supervised use
- rollback preserves transaction history

---

# Future Enhancements

- barcode-assisted returns
- batch returns
- smart quantity suggestions
- voice-assisted entry
