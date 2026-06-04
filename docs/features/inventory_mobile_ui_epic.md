# Inventory Mobile UI Epic

# Objective

Design the complete mobile-first volunteer experience for Krishna's Kitchen.

This document defines:

* navigation
* screens
* user journeys
* role visibility
* workflow UX

before React implementation begins.

---

# Product Principle

A volunteer should be able to complete common inventory tasks with:

* minimal training
* minimal typing
* minimal navigation

Goal:

30 seconds or less for common actions.

---

# Supported Personas

## Temporary Volunteer

Access:

* receive inventory
* transfer inventory
* return inventory
* inventory lookup

Restrictions:

* no admin screens
* no item management
* no barcode management

---

## Volunteer

Access:

* all temporary volunteer functions
* inventory lookup
* activity history

---

## Inventory Manager

Access:

* item management
* location management
* barcode management
* unknown barcode review
* low stock review

---

## Temple Admin

Access:

* all inventory manager functions
* user management
* role management
* temple configuration

---

# Navigation Model

Bottom Navigation

1. Home
2. Inventory
3. Scan
4. Tasks
5. Profile

---

# Home Screen

Purpose:

Fast action launcher.

Display:

* Quick Receive
* Quick Transfer
* Quick Return
* Inventory Lookup

Recent Activity:

* recent receives
* recent transfers
* recent returns

Low Stock Summary:

* top alerts

Unknown Barcode Summary (manager+)

* pending count

---

# Inventory Screen

Purpose:

Inventory lookup.

Features:

Search Items

Search Locations

Search Barcodes

View Item Details

View Location Details

View Inventory Balances

View Inventory History

---

# Scan Screen

Purpose:

Generic scan utility.

Behavior:

Open camera immediately.

Results:

Found Item

Unknown Barcode

Duplicate Scan

Invalid Barcode

Ambiguous Barcode

Scan screen does NOT create inventory transactions.

---

# Tasks Screen

Volunteer:

* assigned tasks

Manager:

* low stock
* unknown barcodes
* inventory audits

Admin:

* operational alerts

---

# Profile Screen

Display:

* temple
* role
* volunteer session
* logout

---

# Receive Workflow

Home

↓

Quick Receive

↓

Location

↓

Scan

↓

Quantity

↓

Confirm

↓

Success

---

# Transfer Workflow

Home

↓

Quick Transfer

↓

Source

↓

Destination

↓

Scan

↓

Quantity

↓

Confirm

↓

Success

---

# Return Workflow

Home

↓

Quick Return

↓

Source

↓

Destination

↓

Scan

↓

Quantity

↓

Confirm

↓

Success

---

# Unknown Barcode Workflow

Scan

↓

Unknown Barcode

↓

Manual Search

or

Record For Review

↓

Continue

---

# Unknown Barcode Review

Manager Only

Display:

* pending barcodes
* scan count
* last seen
* workflow source

Actions:

* link item
* dismiss

---

# Low Stock Workflow

Manager Only

Display:

* item
* location
* current quantity
* threshold

Actions:

* mark reviewed
* create purchase request (future)

---

# Design Rules

Always:

* thumb friendly
* large buttons
* large touch targets
* high contrast
* mobile first

Never:

* ERP-style grids
* desktop-first layouts
* excessive typing

---

# Acceptance Criteria

Volunteer can:

* receive inventory
* transfer inventory
* return inventory
* search inventory

Manager can:

* review unknown barcodes
* review low stock

Admin can:

* manage operational settings