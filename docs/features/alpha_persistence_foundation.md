# Alpha Persistence Foundation

# Objective

Complete the minimum Supabase persistence layer required for Alpha volunteer workflows.

This sprint focuses on data access only.

No React screens.

No UI implementation.

---

# Scope

Implement:

* Item repository adapter
* Location repository adapter
* Barcode repository adapter
* Barcode lookup adapter
* Typed Supabase schema refresh

---

# Out Of Scope

* React screens
* Manager UI
* Admin UI
* Low stock thresholds
* Volunteer session persistence
* Offline queue

---

# Required Volunteer Workflows

Receive Inventory

Transfer Inventory

Return Inventory

Inventory Lookup

Barcode Scan Lookup

---

# Adapter Requirements

## Items

Support:

* listItems
* searchItems
* findItemById

Organization scoped.

Exclude archived items.

---

## Locations

Support:

* listLocations
* searchLocations
* findLocationById

Organization scoped.

Exclude archived locations.

---

## Barcode Mappings

Support:

* listBarcodes
* findBarcode
* active mappings only

Organization scoped.

Archived mappings ignored.

---

## Barcode Lookup

Support:

* barcode resolution
* duplicate barcode handling
* organization boundaries

---

# Typed Schema

Refresh generated Supabase types.

Must include:

* items
* locations
* item_barcodes

Future tables may remain excluded.

---

# Acceptance Criteria

Inventory catalog queries use live adapters.

Barcode lookup uses live adapters.

Receive workflow can resolve items and locations.

Transfer workflow can resolve items and locations.

Return workflow can resolve items and locations.

Typecheck passes.

Lint passes.

Tests pass.

Build passes.