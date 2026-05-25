# MVP_SCOPE.md

# Objective

The MVP goal is to establish reliable inventory discipline for temple kitchen operations.

The MVP is NOT intended to solve all kitchen operational problems initially.

The primary success metric is:

> Volunteers reliably use the system for inventory movements and trust inventory visibility.

---

# MVP PRINCIPLES

1. Mobile-first
2. Extremely fast workflows
3. Scan-first UX
4. Minimal typing
5. Offline-capable
6. Reversible actions
7. Volunteer-friendly
8. Low operational friction

---

# INCLUDED IN MVP

## Authentication

- Login
- Logout
- Session persistence
- Temple selection
- Role-based access

---

## Organization Management

- Multi-temple support
- Temple creation
- Location hierarchy

---

## Inventory Items

- Create inventory items
- Multiple barcodes per item
- Manufacturer barcode support
- Internal QR code support
- Item categories
- Preferred units

---

## Barcode Scanning

- Camera scanning
- QR scanning
- UPC/EAN support
- Duplicate scan prevention

---

## Inventory Transactions

- Receive inventory
- Transfer inventory
- Consume inventory
- Return inventory
- Undo recent actions

---

## Inventory Visibility

- Current stock levels
- Location-based inventory
- Inventory history
- Transaction history

---

## Alerts

- Reorder thresholds
- Low inventory warnings

---

## Temporary Volunteer Mode

- QR join flow
- Temporary access sessions
- Restricted permissions
- Session expiration

---

## Offline Capability

- Offline scanning
- Local transaction queue
- Deferred sync

---

# EXCLUDED FROM MVP

The following features are intentionally excluded initially:

- Recipe management
- Meal planning
- Procurement optimization
- AI forecasting
- Advanced analytics
- Vendor pricing intelligence
- WhatsApp integration
- Voice workflows
- Invoice OCR
- Advanced reporting
- Attendance forecasting

---

# MVP SUCCESS CRITERIA

The MVP is successful if:

- Volunteers consistently use scanning workflows
- Inventory visibility becomes trusted
- Feast shortages reduce
- Manual counting reduces
- Temporary volunteers can participate easily
- Inventory corrections remain manageable
- Inventory transactions remain auditable

---

# MVP NON-GOALS

The MVP is NOT intended to become:

- Full ERP
- Accounting software
- Payroll system
- HR platform
- Enterprise procurement suite

---

# MVP TECHNICAL CONSTRAINTS

## Frontend

- React
- TypeScript
- PWA
- Tailwind

---

## Backend

- Supabase
- PostgreSQL
- Row-level security

---

## Hosting

- Cloudflare Pages

---

## Mobile Support

- iPhone Safari
- Android Chrome

---

# MVP ARCHITECTURAL REQUIREMENTS

1. Inventory transactions must be immutable
2. Actions must be reversible
3. Offline-first architecture required
4. Multi-tenant architecture required
5. Permissions enforced server-side
6. Mobile-first UX mandatory
7. Fast operational flows prioritized over feature richness