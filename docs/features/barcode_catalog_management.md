# Barcode Catalog Management

# Objective

Provide barcode administration capabilities.

This feature owns barcode mappings.

Unknown barcode management does not own barcode mappings.

Barcode catalog management is the source of truth for item-barcode relationships.

---

# User Story

As an inventory manager,

I want to manage barcode mappings,

so that future scans resolve correctly.

---

# Supported Actions

Create Barcode Mapping

Update Barcode Mapping

Archive Barcode Mapping

Search Barcode Mapping

---

# Create Barcode Mapping

Inputs:

* organizationId
* itemId
* barcodeValue
* barcodeFormat

Requirements:

* barcode normalized
* barcode valid
* item active
* organization match

Prevent:

* duplicate barcode assignment

---

# Update Barcode Mapping

Allow:

* notes
* metadata

Do not allow:

* barcode value mutation

Create new mapping instead.

---

# Archive Barcode Mapping

Requirements:

* mapping exists
* organization match

Archived mappings:

* do not resolve scans

---

# Unknown Barcode Integration

Manager may:

Unknown Barcode

↓

Select Item

↓

Create Barcode Mapping

↓

Mark Unknown Barcode Linked

Future scans resolve normally.

---

# Search

Search by:

* barcode
* item
* barcode format

---

# Acceptance Criteria

* barcode mapping created
* duplicate assignment prevented
* archived mappings ignored
* unknown barcode resolution supported

---

# Required Tests

* create mapping
* duplicate prevention
* archive mapping
* search mapping
* unknown barcode integration