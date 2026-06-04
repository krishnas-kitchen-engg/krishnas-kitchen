# Transfer Scan Workflow

# Objective

Enable volunteers to transfer inventory between locations using barcode scanning.

This workflow combines:

* camera scanning
* barcode lookup
* item identification
* transfer transaction creation

into a single operational workflow.

The goal is to make inventory movement fast, accurate, and traceable.

---

# User Story

As a volunteer,

I want to scan inventory items while moving them between locations,

so that inventory balances remain accurate without manual searching.

---

# Roles

* volunteer
* inventory_manager
* temple_admin

---

# Permissions

Required:

* inventory.transfer
* inventory.read
* items.read
* locations.read

---

# Operational Workflow

## Standard Flow

1. Volunteer opens transfer workflow
2. Volunteer selects source location
3. Volunteer selects destination location
4. Volunteer scans barcode
5. Barcode lookup occurs
6. Item identified
7. Volunteer enters quantity
8. Volunteer confirms
9. Transfer transaction created
10. Inventory visibility updates

---

# Unknown Barcode Flow

1. Barcode scanned
2. Item not found
3. User may:

   * cancel
   * manually select item
   * flag barcode for later association

No transfer created automatically.

---

# Duplicate Scan Flow

1. Same barcode scanned repeatedly
2. Duplicate suppression triggers
3. User receives feedback
4. No duplicate transfer created

---

# Manual Override Flow

1. Barcode exists
2. User chooses manual item search
3. Item selected manually
4. Workflow continues

---

# Inventory Rules

Transfers:

* move inventory
* do not create inventory
* do not destroy inventory

Inventory totals remain conserved.

---

# Validation Rules

## Source

* must exist
* must belong to organization
* must not be archived

## Destination

* must exist
* must belong to organization
* must not be archived

## Transfer

* source ≠ destination

## Quantity

* required
* positive

## Permissions

* inventory.transfer required

---

# Error Handling

Handle:

* unknown barcode
* invalid barcode
* duplicate scan
* permission failure
* transfer validation failure
* transaction persistence failure

---

# Acceptance Criteria

* [ ] Existing barcode resolves item
* [ ] Unknown barcode handled
* [ ] Duplicate scans suppressed
* [ ] Transfer transaction created
* [ ] Source inventory reduced
* [ ] Destination inventory increased
* [ ] Visibility updated

---

# Required Tests

## Workflow Tests

* successful transfer
* duplicate scan prevention
* unknown barcode transfer

## Permission Tests

* authorized transfer
* unauthorized transfer

## Integration Tests

* barcode lookup integration
* transfer service integration

## Inventory Tests

* source balance update
* destination balance update

---

# Future Enhancements

* bulk transfer mode
* trailer replenishment mode
* inventory move recommendations