# Inventory Mobile UI Architecture

# Objective

Design a mobile-first volunteer experience for Krishna's Kitchen.

The UI must optimize:

* speed
* simplicity
* low training requirements
* high volunteer turnover
* mobile phone usage

The UI must support both:

* iPhone Safari/PWA
* Android Chrome/PWA

---

# Primary Personas

## Temporary Volunteer

Characteristics:

* first-time user
* minimal training
* session-based access

Goals:

* scan item
* complete task
* leave

---

## Volunteer

Characteristics:

* recurring helper

Goals:

* receive inventory
* transfer inventory
* return inventory
* check inventory

---

## Inventory Manager

Characteristics:

* responsible for inventory accuracy

Goals:

* manage items
* manage locations
* manage barcodes
* manage reorder levels
* audit inventory

---

## Temple Admin

Characteristics:

* operational oversight

Goals:

* user management
* permissions
* reports
* configuration

---

# Navigation Principles

Rule:

A volunteer should be able to complete a common inventory task within:

* 3 taps
* 30 seconds

where practical.

---

# Bottom Navigation

## Volunteer

Home

Inventory

Scan

Tasks

Profile

---

# Home Screen

Display:

* Quick Receive
* Quick Transfer
* Quick Return
* Inventory Lookup

Recent activity:

* last scans
* recent transactions

---

# Scan Screen

Primary action:

Open camera immediately.

No extra clicks.

Outcomes:

* item found
* item unknown
* duplicate scan

---

# Inventory Screen

Functions:

* search item
* search barcode
* search location

---

# Tasks Screen

Display:

* low stock alerts
* pending counts
* assigned tasks

---

# Profile Screen

Display:

* current temple
* active role
* volunteer session
* logout

---

# Receiving Flow

Receive

↓

Select Location

↓

Scan Item

↓

Enter Quantity

↓

Confirm

↓

Success

---

# Transfer Flow

Transfer

↓

Select Source

↓

Select Destination

↓

Scan Item

↓

Enter Quantity

↓

Confirm

↓

Success

---

# Return Flow

Return

↓

Select Source

↓

Select Destination

↓

Scan Item

↓

Enter Quantity

↓

Confirm

↓

Success

---

# Unknown Barcode Flow

Scan

↓

Unknown Barcode

↓

Manual Search

or

Flag For Later

---

# Inventory Lookup Flow

Search

↓

Item

↓

Locations

↓

Balances

↓

History

---

# Inventory Manager Screens

Items

Locations

Barcodes

Inventory Audit

Low Stock

Reorder Queue

---

# Admin Screens

Users

Roles

Permissions

Temples

Organizations

Settings

---

# Design Principles

Always:

* mobile-first
* thumb-friendly
* minimal typing
* large buttons
* high contrast
* fast scanning

Never:

* desktop-first
* multi-column complexity
* ERP-style screens

---

# Acceptance Criteria

* volunteer can complete receive workflow
* volunteer can complete transfer workflow
* volunteer can complete return workflow
* inventory lookup is simple
* low training required
* mobile optimized