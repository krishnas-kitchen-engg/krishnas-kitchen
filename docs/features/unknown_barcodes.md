# Unknown Barcode Management

Status: Complete for UAT

# Objective

Capture and manage unknown barcodes discovered during inventory operations.

Unknown barcodes must never become dead ends.

Every unknown barcode should become actionable inventory data.

---

# User Story

As a volunteer,

I want unknown barcode scans to be recorded,

so that inventory managers can resolve them later.

---

# Operational Workflow

Volunteer scans barcode

↓

Barcode not found

↓

Unknown barcode recorded

↓

Volunteer chooses:

* manual item search
* cancel

↓

Inventory manager later reviews unknown barcodes

↓

Barcode linked to item

or

Barcode dismissed

---

# Unknown Barcode Status

Pending

Barcode requires review.

Linked

Barcode mapped to item.

Dismissed

Barcode intentionally ignored.

---

# Data Model

Unknown Barcode

Fields:

* id
* organizationId
* templeId
* barcodeValue
* barcodeFormat
* workflowType
* actorId
* scannedAt
* status
* notes

---

# Workflow Types

* receive
* transfer
* return
* lookup

---

# Recording Rules

Unknown barcode should be recorded once.

Repeated scans increase:

* occurrence count

Do not create duplicate records.

---

# Review Workflow

Inventory manager views:

* pending unknown barcodes
* unknown barcode tasks in the Tasks workflow

Inventory manager may:

* link barcode to existing item
* dismiss barcode

---

# Linking Workflow

Manager selects item.

System:

* creates barcode mapping
* marks unknown barcode linked

Future scans resolve normally.

---

# Validation Rules

Barcode:

* required
* normalized

Organization:

* required

Status:

* valid enum only

---

# Acceptance Criteria

* unknown barcode captured
* duplicate unknown scans merged
* occurrence count tracked
* pending review queue available
* barcode linking supported
* barcode dismissal supported

---

# Required Tests

* create unknown barcode
* merge duplicate unknown barcode
* link barcode
* dismiss barcode
* organization boundaries
* status transitions
