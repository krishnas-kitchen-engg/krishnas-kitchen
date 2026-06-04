# Inventory Catalog Queries

# Objective

Provide fast, searchable catalog query capabilities to support mobile inventory workflows.

These queries are read-only.

They do not modify inventory.

They exist to support:

* manual item selection
* unknown barcode handling
* location selection
* inventory lookup
* mobile UX optimization

---

# User Story

As a volunteer,

I want to quickly find items and locations,

so that I can complete inventory tasks even when scanning fails.

---

# Item Search

Provide:

searchItems()

Supports:

* partial name
* exact name
* barcode
* SKU
* aliases

Requirements:

* organization scoped
* active items only by default
* archived items optional

Response:

* item id
* item name
* default unit
* aliases
* active status

---

# Location Search

Provide:

searchLocations()

Supports:

* partial name
* exact name
* location type

Location Types:

* pantry
* trailer
* kitchen
* storage
* freezer
* refrigerator

Requirements:

* organization scoped
* active only by default

Response:

* location id
* location name
* location type
* temple id
* active status

---

# Barcode Search

Provide:

searchBarcodes()

Supports:

* exact barcode
* partial barcode

Requirements:

* organization scoped

Response:

* barcode
* item id
* item name
* barcode type

---

# Frequently Used Locations

Provide:

getFrequentlyUsedLocations()

Purpose:

reduce volunteer clicks.

Examples:

* Pantry
* Trailer A
* Trailer B
* Kitchen

Requirements:

organization scoped.

---

# Active Locations

Provide:

getActiveLocations()

Requirements:

* organization scoped
* sorted by display order

---

# Recent Items

Provide:

getRecentItems()

Purpose:

speed up repetitive workflows.

Requirements:

organization scoped.

---

# Validation

Searches:

* must not cross organization boundaries
* must ignore deleted entities

---

# Acceptance Criteria

* item search works
* location search works
* barcode search works
* active locations query works
* recent items query works
* organization boundaries enforced

---

# Required Tests

* item search
* location search
* barcode search
* organization filtering
* archived filtering
* recent item retrieval