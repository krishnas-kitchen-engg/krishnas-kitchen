# PERMISSIONS_MATRIX.md

# Roles

## Permanent Roles

| Role | Description |
|---|---|
| volunteer | Standard operational volunteer |
| cook | Kitchen operational user |
| senior_cook | Recipe and planning manager |
| inventory_manager | Inventory authority |
| temple_admin | Temple-level administrator |
| super_admin | Platform-wide administrator |

---

# Temporary Volunteer Session Types

Temporary volunteer sessions are not permanent authorization roles. They are restricted session modes that must be server-verified before production use.

| Session type | Description |
|---|---|
| temp_picker | Pick-list helper |
| temp_receiver | Receiving helper |
| temp_helper | General scan helper |

---

# Permission Principles

1. Permissions enforced server-side
2. Client-side permissions are informational only
3. Temporary volunteers must remain highly restricted
4. Inventory-changing actions must remain auditable
5. Cross-organization access forbidden

---

# Permission Categories

## Inventory

- inventory.read
- inventory.receive
- inventory.transfer
- inventory.consume
- inventory.return
- inventory.adjust
- inventory.undo

---

## Item Management

- items.create
- items.edit
- items.archive

---

## Location Management

- locations.create
- locations.edit

---

## Volunteer Sessions

- volunteer_sessions.create
- volunteer_sessions.expire

---

# Permission Matrix

| Permission | volunteer | cook | senior_cook | inventory_manager | temple_admin | super_admin |
|---|---|---|---|---|---|---|
| inventory.read | YES | YES | YES | YES | YES | YES |
| inventory.receive | YES | YES | YES | YES | YES | YES |
| inventory.transfer | YES | YES | YES | YES | YES | YES |
| inventory.consume | YES | YES | YES | YES | YES | YES |
| inventory.return | YES | YES | YES | YES | YES | YES |
| inventory.adjust | NO | NO | NO | YES | YES | YES |
| inventory.undo | NO | NO | NO | YES | YES | YES |
| items.read | YES | YES | YES | YES | YES | YES |
| items.create | NO | NO | YES | YES | YES | YES |
| items.edit | NO | NO | YES | YES | YES | YES |
| items.archive | NO | NO | NO | YES | YES | YES |
| locations.read | YES | YES | YES | YES | YES | YES |
| locations.create | NO | NO | NO | YES | YES | YES |
| locations.edit | NO | NO | NO | YES | YES | YES |
| volunteer_sessions.create | YES | YES | YES | YES | YES | YES |
| volunteer_sessions.expire | NO | NO | NO | YES | YES | YES |
| audit.read | NO | NO | NO | NO | YES | YES |

---

# Temporary Volunteer Restrictions

Temporary volunteers:

- cannot edit inventory directly
- cannot receive, transfer, consume, return, adjust, or undo inventory
- cannot perform adjustments
- cannot edit items
- cannot access admin views
- cannot access cross-temple data
- must auto-expire
- receive only `locations.read`, `items.read`, `inventory.read`, and `volunteer_sessions.create`

---

# Undo Rules

Standard volunteers:
- cannot undo inventory transactions in the foundational permission model

Inventory managers/admins:
- unrestricted reversal authority
