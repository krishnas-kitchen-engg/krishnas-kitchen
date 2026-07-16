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
  - ../architecture/offline-sync.md
---

# Documentation Drift

## Purpose

This document records known contradictions and drift across repository-owned Markdown documentation.

## Current Guidance

Do not silently resolve contradictions. Record them here, then resolve them through a focused milestone that updates the correct canonical documents and creates ADRs when required.

| ID | Contradiction | Affected Files | Impact | Recommended Resolution | Priority |
|---|---|---|---|---|---|
| DD-005 | Mobile inventory UI guidance is duplicated across two docs with overlapping personas, navigation, and workflows. | `docs/features/inventory_mobile_ui.md`; `docs/features/inventory_mobile_ui_epic.md` | Future UI work may update one document and miss the other. | Classify one as historical or archive candidate after a canonical UI architecture/spec exists. | Medium |
| DD-006 | Camera scanning and barcode scanning docs overlap in workflow ownership and duplicate scan handling. | `docs/features/camera_scanning.md`; `docs/features/barcode_scanning.md`; `docs/features/receiving_scan_workflow.md`; `docs/features/transfer_scan_workflow.md`; `docs/features/return_scan_workflow.md` | Scanner boundary may become unclear between camera capture, barcode lookup, and inventory workflows. | Create or update a canonical scanning architecture page that separates capture, lookup, and transaction workflows. | Medium |
| DD-007 | Stack documentation lists shadcn/ui and Zustand, but the package manifests inspected during this audit do not show those dependencies. | `docs/SYSTEM_ARCHITECTURE.md`; `package.json`; `apps/web/package.json` | Onboarding and architecture assumptions may be inaccurate. | Verify whether these are intended future choices, removed dependencies, or stale documentation; update stack reference accordingly. | Medium |
| DD-008 | `DATABASE_SCHEMA.md` is skeletal compared with Supabase README and migrations. | `docs/DATABASE_SCHEMA.md`; `infra/supabase/README.md`; `infra/supabase/migrations/*.sql`; `docs/handbook/reference/CURRENT_STATE.md` | Schema reference users may miss important constraints, indexes, RLS, RPC, and migration details. | Replace or supersede with a living data-model/schema reference generated from current migrations. | Medium |
| DD-009 | Product naming and platform branding vary between Krishna's Kitchen and SevaOps. | `README.md`; `docs/PRODUCT_VISION.md`; `docs/MVP_SCOPE.md` | Low engineering risk, but may confuse product/documentation readers. | Clarify platform name versus temple instance name in product/reference docs. | Low |
| DD-010 | Existing older execution docs overlap with handbook process docs. | `docs/execution/*.md`; `docs/handbook/process/*.md`; `docs/handbook/README.md` | Contributors may follow older process docs instead of canonical handbook process. | Keep older docs as historical/source material and link readers to canonical handbook process. | Medium |

## Resolved Drift

| ID | Resolution | Evidence |
|---|---|---|
| DD-002 | Undo/reversal terminology is canonicalized: `undo` is the user-facing action and service operation, `reversal` is the current persisted correction transaction type, `reversal_of_transaction_id` links to the original transaction, and legacy persisted `undo` rows remain read-compatible history only. | [Inventory Architecture](../../INVENTORY_ARCHITECTURE.md); [ADR-0009](../adrs/0009-auditability-and-reversibility.md); `apps/web/src/domains/inventory/domain/transactionHelpers.ts`; `apps/web/src/domains/inventory/infrastructure/supabase/inventoryTransactionMapper.ts` |
| DD-003 | Return semantics are canonicalized: new application-created `returned` transactions use `quantity_effect = "transfer"` with source and destination locations; migration support for `returned` plus `increase` is compatibility only. | [Inventory Architecture](../../INVENTORY_ARCHITECTURE.md); `apps/web/src/domains/inventory/domain/transactionHelpers.ts`; `infra/supabase/migrations/20260606000200_reconcile_inventory_transaction_constraints.sql` |
| DD-004 | Offline architecture now has a living architecture source that separates the offline requirement, current non-implementation status, repository boundary, replay/idempotency expectations, conflict policy, and security constraints. | [Offline Sync Architecture](../architecture/offline-sync.md); [Architecture](../architecture/README.md); [ADR-0005](../adrs/0005-mobile-first-offline-pwa.md) |

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
