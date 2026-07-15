---
title: Documentation Drift
status: active
doc_type: reference
lifecycle: living
owner: engineering
update_cadence: when contradictions are discovered, resolved, or reclassified
last_reviewed: null
related:
  - ./README.md
  - ./DOCUMENT_INDEX.md
  - ./OPEN_DECISIONS.md
  - ./TECH_DEBT.md
  - ./KNOWN_LIMITATIONS.md
  - ./HANDBOOK_HEALTH_REPORT.md
  - ../adrs/0003-supabase-auth-and-rls-boundary.md
  - ../adrs/0004-temporary-volunteer-session-model.md
  - ../adrs/0005-mobile-first-offline-pwa.md
  - ../adrs/0009-auditability-and-reversibility.md
  - ../architecture/README.md
---

# Documentation Drift

## Purpose

This document records known contradictions and drift across repository-owned Markdown documentation.

## Current Guidance

Do not silently resolve contradictions. Record them here, then resolve them through a focused milestone that updates the correct canonical documents and creates ADRs when required.

| ID | Contradiction | Affected Files | Impact | Recommended Resolution | Priority |
|---|---|---|---|---|---|
| DD-002 | Undo and reversal terminology is inconsistent. Some docs use `undo` as a transaction type, others use reversal transactions, and migrations add a `reversal` transaction type while preserving legacy `undo` compatibility. | `docs/SYSTEM_ARCHITECTURE.md`; `docs/INVENTORY_ARCHITECTURE.md`; `docs/features/inventory_receiving_persistence.md`; `infra/supabase/seed/VALIDATION_SEED_DATA.md`; `docs/handbook/adrs/0009-auditability-and-reversibility.md` | Inventory correction logic and UI language can diverge. | Define canonical terminology: user action, domain event, database transaction type, and legacy compatibility. Update architecture/reference docs. | High |
| DD-003 | Return transaction semantics are not consistently described. Some docs describe returns as moving inventory from source to destination, while schema constraints also allow `returned` with increase semantics. | `docs/features/inventory_return.md`; `docs/features/return_scan_workflow.md`; `docs/INVENTORY_ARCHITECTURE.md`; `infra/supabase/migrations/20260606000200_reconcile_inventory_transaction_constraints.sql`; `docs/handbook/adrs/0002-positive-quantities-and-quantity-effects.md` | Balance aggregation and persistence expectations may diverge for returns. | Add a canonical inventory transaction type reference that defines `returned` effects and migration compatibility. | High |
| DD-004 | Offline architecture is required globally, but several feature docs say offline is future work or not implemented yet. | `docs/SYSTEM_ARCHITECTURE.md`; `docs/MVP_SCOPE.md`; `docs/INVENTORY_ARCHITECTURE.md`; `docs/features/barcode_scanning.md`; `docs/features/inventory_receiving.md`; `docs/features/inventory_receiving_persistence.md`; `docs/features/inventory_transfer.md`; `docs/features/inventory_return.md` | Contributors may confuse architectural requirement with current implementation status. | Create a living offline-sync architecture/status page that separates invariant, current implementation, and future work. | High |
| DD-005 | Mobile inventory UI guidance is duplicated across two docs with overlapping personas, navigation, and workflows. | `docs/features/inventory_mobile_ui.md`; `docs/features/inventory_mobile_ui_epic.md` | Future UI work may update one document and miss the other. | Classify one as historical or archive candidate after a canonical UI architecture/spec exists. | Medium |
| DD-006 | Camera scanning and barcode scanning docs overlap in workflow ownership and duplicate scan handling. | `docs/features/camera_scanning.md`; `docs/features/barcode_scanning.md`; `docs/features/receiving_scan_workflow.md`; `docs/features/transfer_scan_workflow.md`; `docs/features/return_scan_workflow.md` | Scanner boundary may become unclear between camera capture, barcode lookup, and inventory workflows. | Create or update a canonical scanning architecture page that separates capture, lookup, and transaction workflows. | Medium |
| DD-007 | Stack documentation lists shadcn/ui and Zustand, but the package manifests inspected during this audit do not show those dependencies. | `docs/SYSTEM_ARCHITECTURE.md`; `package.json`; `apps/web/package.json` | Onboarding and architecture assumptions may be inaccurate. | Verify whether these are intended future choices, removed dependencies, or stale documentation; update stack reference accordingly. | Medium |
| DD-008 | `DATABASE_SCHEMA.md` is skeletal compared with Supabase README and migrations. | `docs/DATABASE_SCHEMA.md`; `infra/supabase/README.md`; `infra/supabase/migrations/*.sql`; `docs/handbook/reference/CURRENT_STATE.md` | Schema reference users may miss important constraints, indexes, RLS, RPC, and migration details. | Replace or supersede with a living data-model/schema reference generated from current migrations. | Medium |
| DD-009 | Product naming and platform branding vary between Krishna's Kitchen and SevaOps. | `README.md`; `docs/PRODUCT_VISION.md`; `docs/MVP_SCOPE.md` | Low engineering risk, but may confuse product/documentation readers. | Clarify platform name versus temple instance name in product/reference docs. | Low |
| DD-010 | Existing older execution docs overlap with handbook process docs. | `docs/execution/*.md`; `docs/handbook/process/*.md`; `docs/handbook/README.md` | Contributors may follow older process docs instead of canonical handbook process. | Keep older docs as historical/source material and link readers to canonical handbook process. | Medium |

## Owner

Engineering owns this document.

## Update Cadence

Update when contradictions are discovered, resolved, or reclassified.

## Lifecycle

This is living documentation.

## Related Documents

- [Document Index](./DOCUMENT_INDEX.md)
- [Open Decisions](./OPEN_DECISIONS.md)
- [Technical Debt](./TECH_DEBT.md)
- [Known Limitations](./KNOWN_LIMITATIONS.md)
- [Handbook Health Report](./HANDBOOK_HEALTH_REPORT.md)
