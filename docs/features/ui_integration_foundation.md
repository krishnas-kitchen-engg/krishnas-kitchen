# UI Integration Foundation

# Objective

Create the integration layer between React and the inventory platform.

React components must never directly call Supabase.

React components must never directly construct inventory services.

All inventory interactions must flow through application hooks and service factories.

---

# Responsibilities

Provide:

* repository adapters
* service factories
* React hooks
* actor resolution
* permission helpers

---

# Service Factory

Create:

createInventoryServices()

Returns:

* inventoryService
* visibilityService
* barcodeLookupService
* catalogQueryService
* unknownBarcodeService
* barcodeCatalogService

---

# Repository Adapters

Implement Supabase adapters for:

Items

Locations

Barcode Mappings

Unknown Barcodes

Inventory Transactions

Volunteer Sessions

---

# Actor Resolution

Provide:

useInventoryActor()

Returns:

authenticated user actor

or

temporary volunteer actor

---

# Permissions

Provide:

useInventoryPermissions()

Supports:

* receive
* transfer
* return
* inventory lookup
* barcode review

---

# Catalog Queries

Provide:

useInventoryCatalogQueries()

---

# Visibility

Provide:

useInventoryVisibility()

---

# Inventory Workflows

Provide:

useReceivingWorkflow()

useTransferWorkflow()

useReturnWorkflow()

---

# Barcode

Provide:

useBarcodeLookup()

useUnknownBarcodeManagement()

useBarcodeCatalogManagement()

---

# Rules

React components:

MUST NOT

* call Supabase directly
* create inventory services directly

React components:

MUST

* consume hooks

---

# Acceptance Criteria

* services created centrally
* repositories hidden from UI
* actor resolution centralized
* permission checks centralized
* hooks expose required workflows

---

# Required Tests

* service factory tests
* actor resolution tests
* permission helper tests
* hook integration tests