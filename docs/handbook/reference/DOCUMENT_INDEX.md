---
title: Document Index
status: active
doc_type: reference
lifecycle: living
owner: engineering
update_cadence: when repository-owned Markdown documents are added, reclassified, or superseded
last_reviewed: null
related:
  - ./README.md
  - ./DOCUMENTATION_DRIFT.md
  - ./HANDBOOK_HEALTH_REPORT.md
  - ./CURRENT_STATE.md
  - ../README.md
  - ../adrs/README.md
  - ../templates/README.md
  - ../process/README.md
  - ../governance/README.md
  - ../architecture/README.md
---

# Document Index

## Purpose

This document classifies repository-owned Markdown documentation and identifies the canonical handbook replacement when one exists.

## Current Guidance

Use this index to decide whether a document is canonical, living, historical, reference, a template, generated, or an archive candidate.

Classifications are intentionally exact: each document has one classification.

| Document Path | Classification | Owner | Status | Canonical Replacement | Review Cadence |
|---|---|---|---|---|---|
| `README.md` | Reference | Engineering | Active | None | When setup, stack, or layout changes |
| `docs/AUTH_ARCHITECTURE.md` | Reference | Engineering | Active source material | Future living auth/RLS architecture page | When auth architecture changes |
| `docs/AUTH_ROLE_MIGRATION_NOTES.md` | Historical | Engineering | Active source material | Future permission/role reference | When role migration status changes |
| `docs/DATABASE_SCHEMA.md` | Archive Candidate | Engineering | Superseded by richer schema sources | Future living schema reference | Replace during schema reference milestone |
| `docs/INVENTORY_ARCHITECTURE.md` | Reference | Engineering | Active source material | Future living inventory architecture page | When inventory architecture changes |
| `docs/MVP_SCOPE.md` | Reference | Product/Engineering | Active source material | None | When MVP scope changes |
| `docs/PERMISSIONS_MATRIX.md` | Reference | Engineering | Active source material with drift | Future permission/role reference | When permissions change |
| `docs/PRODUCT_HORIZONS.md` | Canonical | Product/Engineering | Canonical long-term product roadmap and active horizon source | None | When horizons, active horizon, or horizon rules change |
| `docs/PRODUCT_VISION.md` | Reference | Product | Active source material | None | When product vision changes |
| `docs/SYSTEM_ARCHITECTURE.md` | Reference | Engineering | Active source material with drift | Future living system architecture page | When system architecture changes |
| `docs/delivery/DELIVERY_MODEL.md` | Canonical | Delivery | Active Delivery Management model | None | When Delivery Management responsibilities, lifecycle semantics, authority boundaries, or document relationships change |
| `docs/delivery/CURRENT_DELIVERY_INCREMENT.md` | Living | Delivery | Active current delivery increment scope | None | When the selected increment, included stories, acceptance criteria, exit criteria, risks, or blockers change |
| `docs/delivery/CAPABILITY_MATRIX.md` | Living | Delivery | Active capability delivery inventory | None | When product capabilities or delivery, current-delivery, pilot-ready, or production-ready status changes |
| `docs/delivery/DELIVERY_BACKLOG.md` | Living | Delivery | Active ordered customer-outcome backlog | None | When delivery outcome order, dependencies, or readiness evidence changes |
| `docs/delivery/DELIVERY_STATUS.md` | Living | Delivery | Active product-facing delivery status | None | When Current Delivery Increment, delivery goal, included/excluded capabilities, completion, or product-facing gaps change |
| `docs/delivery/DELIVERY_DECISIONS.md` | Living | Delivery | Active delivery decision log | None | When delivery increment selection, sequencing, pilot scope, or readiness interpretation changes |
| `docs/delivery/DELIVERY_READINESS.md` | Living | Delivery | Active delivery readiness assessment | None | When increment readiness, pilot readiness, production readiness, blockers, residual risks, future approved work, or evidence materially changes |
| `docs/delivery/PILOT_EVIDENCE.md` | Living | Delivery | Active pilot evidence record | None | When pilot-facing evidence, acceptance criteria, known limitations, or readiness conclusions change |
| `docs/execution/BACKLOG.md` | Archive Candidate | Engineering | Superseded by living milestone docs | `docs/handbook/reference/CURRENT_MILESTONE.md`; `docs/handbook/reference/NEXT_MILESTONE.md` | Reclassify during backlog cleanup |
| `docs/execution/CODE_REVIEW_CHECKLIST.md` | Historical | Engineering | Superseded source material | `docs/handbook/process/ENGINEERING_REVIEW_CHECKLIST.md` | Revisit during process migration |
| `docs/execution/DEFINITION_OF_DONE.md` | Historical | Engineering | Superseded source material | `docs/handbook/process/DEFINITION_OF_DONE.md` | Revisit during process migration |
| `docs/execution/DELIVERY_PROCESS.md` | Historical | Engineering | Superseded source material | `docs/handbook/process/MILESTONE_LIFECYCLE.md` | Revisit during process migration |
| `docs/execution/DEVELOPMENT_WORKFLOW.md` | Historical | Engineering | Superseded source material | `docs/handbook/process/SESSION_LIFECYCLE.md`; `docs/handbook/process/MILESTONE_LIFECYCLE.md` | Revisit during process migration |
| `docs/execution/FEATURE_TEMPLATE.md` | Template | Engineering | Legacy template | `docs/handbook/templates/FEATURE_SPECIFICATION_TEMPLATE.md` | Revisit during template migration |
| `docs/execution/RELEASE_PROCESS.md` | Historical | Engineering/Operations | Superseded source material | `docs/handbook/templates/RELEASE_CHECKLIST_TEMPLATE.md`; future operations runbook | Revisit during operations migration |
| `docs/execution/TESTING_STRATEGY.md` | Historical | Engineering | Superseded source material | `docs/handbook/templates/TEST_PLAN_TEMPLATE.md`; future testing strategy page | Revisit during testing migration |
| `docs/features/alpha_persistence_foundation.md` | Historical | Engineering | Historical feature spec | None | Preserve unless superseded by current feature docs |
| `docs/features/barcode_catalog_management.md` | Historical | Engineering | Historical feature spec | Future barcode/catalog architecture or feature reference | Preserve unless superseded |
| `docs/features/barcode_scanning.md` | Historical | Engineering | Historical feature spec with overlap | Future scanning architecture page | Preserve unless superseded |
| `docs/features/camera_scanning.md` | Historical | Engineering | Historical feature spec with overlap | Future scanning architecture page | Preserve unless superseded |
| `docs/features/inventory_catalog_queries.md` | Historical | Engineering | Historical feature spec | Future inventory/catalog reference | Preserve unless superseded |
| `docs/features/inventory_mobile_ui.md` | Archive Candidate | Engineering/Product | Duplicated by epic doc | Future mobile UI architecture/spec | Resolve during UI docs cleanup |
| `docs/features/inventory_mobile_ui_epic.md` | Historical | Engineering/Product | Historical feature epic | Future mobile UI architecture/spec | Preserve until canonical UI doc exists |
| `docs/features/inventory_receiving.md` | Historical | Engineering | Historical feature spec | Future inventory workflow reference | Preserve unless superseded |
| `docs/features/inventory_receiving_persistence.md` | Historical | Engineering | Historical feature spec | Future persistence/reference doc | Preserve unless superseded |
| `docs/features/inventory_return.md` | Historical | Engineering | Historical feature spec with drift | Future inventory transaction reference | Preserve until return semantics resolved |
| `docs/features/inventory_transfer.md` | Historical | Engineering | Historical feature spec | Future inventory workflow reference | Preserve unless superseded |
| `docs/features/inventory_visibility.md` | Historical | Engineering | Historical feature spec | Future inventory visibility reference | Preserve unless superseded |
| `docs/features/receiving_scan_workflow.md` | Historical | Engineering | Historical workflow spec | Future scanning/workflow architecture page | Preserve unless superseded |
| `docs/features/return_scan_workflow.md` | Historical | Engineering | Historical workflow spec with drift | Future scanning/workflow architecture page | Preserve until return semantics resolved |
| `docs/features/transfer_scan_workflow.md` | Historical | Engineering | Historical workflow spec | Future scanning/workflow architecture page | Preserve unless superseded |
| `docs/features/ui_integration_foundation.md` | Historical | Engineering | Historical architecture/feature spec | `docs/handbook/adrs/0006-repository-pattern.md`; future UI boundary architecture | Preserve unless superseded |
| `docs/features/unknown_barcodes.md` | Historical | Engineering | Historical feature spec | Future barcode/unknown barcode reference | Preserve unless superseded |
| `infra/supabase/README.md` | Reference | Engineering/Operations | Active source material | Future Supabase operations/schema runbooks | When Supabase operations change |
| `infra/supabase/seed/VALIDATION_SEED_DATA.md` | Reference | Engineering/Operations | Active source material | Future validation runbook | When validation seed data changes |
| `docs/handbook/README.md` | Canonical | Engineering | Stable 1.0 | None | When handbook structure changes |
| `docs/handbook/overview.md` | Canonical | Engineering | Active | None | When handbook scope changes |
| `docs/handbook/reading-paths.md` | Canonical | Engineering | Active | None | When reading paths change |
| `docs/handbook/existing-documentation.md` | Reference | Engineering | Active | `docs/handbook/reference/DOCUMENT_INDEX.md` for classification | When docs are migrated or superseded |
| `docs/handbook/roadmap.md` | Living | Engineering | Stable | None | When handbook stewardship policy changes |
| `docs/handbook/conventions.md` | Canonical | Engineering | Stable | None | When documentation conventions change |
| `docs/handbook/governance/README.md` | Canonical | Engineering | Active | None | When governance navigation changes |
| `docs/handbook/governance/AI_ENGINEERING_OPERATING_MODEL.md` | Canonical | Engineering | Active | None | When AI engineering operating model changes |
| `docs/handbook/governance/ENGINEERING_PRINCIPLES.md` | Canonical | Engineering | Active | None | Rarely; when enduring engineering philosophy changes |
| `docs/handbook/governance/PROJECT_CONSTITUTION.md` | Canonical | Engineering | Active | None | When mission, hierarchy, or invariants change |
| `docs/handbook/governance/AI_EXECUTION_PROTOCOL.md` | Canonical | Engineering | Active | None | When AI workflow changes |
| `docs/handbook/governance/REPOSITORY_REFRESH_PROTOCOL.md` | Canonical | Engineering | Active | None | When repository refresh expectations change |
| `docs/handbook/governance/ENGINEERING_SYSTEM.md` | Canonical | Engineering | Active | None | When engineering system changes |
| `docs/handbook/process/README.md` | Canonical | Engineering | Active | None | When process navigation changes |
| `docs/handbook/process/DEFINITION_OF_DONE.md` | Canonical | Engineering | Active | None | When completion bar changes |
| `docs/handbook/process/QUALITY_GATES.md` | Canonical | Engineering | Active | None | When quality gates change |
| `docs/handbook/process/MILESTONE_LIFECYCLE.md` | Canonical | Engineering | Active | None | When milestone workflow changes |
| `docs/handbook/process/SESSION_LIFECYCLE.md` | Canonical | Engineering | Active | None | When session workflow changes |
| `docs/handbook/process/POST_IMPLEMENTATION_REVIEW.md` | Canonical | Engineering | Active | `docs/handbook/templates/POST_IMPLEMENTATION_REVIEW_TEMPLATE.md` for reusable template | When review requirements change |
| `docs/handbook/process/ENGINEERING_REVIEW_CHECKLIST.md` | Canonical | Engineering | Active | None | When review expectations change |
| `docs/handbook/templates/README.md` | Template | Engineering | Active | None | When template navigation changes |
| `docs/handbook/templates/ADR_TEMPLATE.md` | Template | Engineering | Active | None | When ADR structure changes |
| `docs/handbook/templates/ARCHITECTURE_DOCUMENT_TEMPLATE.md` | Template | Engineering | Active | None | When architecture template changes |
| `docs/handbook/templates/FEATURE_SPECIFICATION_TEMPLATE.md` | Template | Engineering | Active | None | When feature template changes |
| `docs/handbook/templates/LIVING_DOCUMENT_TEMPLATE.md` | Template | Engineering | Active | None | When living doc conventions change |
| `docs/handbook/templates/POST_IMPLEMENTATION_REVIEW_TEMPLATE.md` | Template | Engineering | Active | None | When review template changes |
| `docs/handbook/templates/ROOT_CAUSE_ANALYSIS_TEMPLATE.md` | Template | Engineering | Active | None | When RCA template changes |
| `docs/handbook/templates/SECURITY_REVIEW_TEMPLATE.md` | Template | Security/Engineering | Active | None | When security review template changes |
| `docs/handbook/templates/TEST_PLAN_TEMPLATE.md` | Template | Engineering | Active | None | When test plan template changes |
| `docs/handbook/templates/VALIDATION_RUNBOOK_TEMPLATE.md` | Template | Operations | Active | None | When validation template changes |
| `docs/handbook/templates/RELEASE_CHECKLIST_TEMPLATE.md` | Template | Operations | Active | None | When release template changes |
| `docs/handbook/templates/ROADMAP_ITEM_TEMPLATE.md` | Template | Product/Engineering | Active | None | When roadmap template changes |
| `docs/handbook/templates/TECH_DEBT_TEMPLATE.md` | Template | Engineering | Active | None | When debt template changes |
| `docs/handbook/adrs/README.md` | Canonical | Engineering | Active | None | When ADRs change |
| `docs/handbook/adrs/ADR_GUIDE.md` | Canonical | Engineering | Active | None | When ADR policy changes |
| `docs/handbook/adrs/0001-immutable-inventory-ledger.md` | Historical | Engineering | Accepted ADR | None | Update only supersession metadata |
| `docs/handbook/adrs/0002-positive-quantities-and-quantity-effects.md` | Historical | Engineering | Accepted ADR | None | Update only supersession metadata |
| `docs/handbook/adrs/0003-supabase-auth-and-rls-boundary.md` | Historical | Engineering | Accepted ADR | None | Update only supersession metadata |
| `docs/handbook/adrs/0004-temporary-volunteer-session-model.md` | Historical | Engineering | Accepted ADR | None | Update only supersession metadata |
| `docs/handbook/adrs/0005-mobile-first-offline-pwa.md` | Historical | Engineering | Accepted ADR | None | Update only supersession metadata |
| `docs/handbook/adrs/0006-repository-pattern.md` | Historical | Engineering | Accepted ADR | None | Update only supersession metadata |
| `docs/handbook/adrs/0007-rpc-boundaries-and-browser-trust.md` | Historical | Engineering | Accepted ADR | None | Update only supersession metadata |
| `docs/handbook/adrs/0008-domain-driven-package-organization.md` | Historical | Engineering | Accepted ADR | None | Update only supersession metadata |
| `docs/handbook/adrs/0009-auditability-and-reversibility.md` | Historical | Engineering | Accepted ADR | None | Update only supersession metadata |
| `docs/handbook/adrs/0010-security-review-before-commit.md` | Historical | Engineering | Accepted ADR | None | Update only supersession metadata |
| `docs/handbook/architecture/README.md` | Canonical | Engineering | Active | None | When architecture navigation changes |
| `docs/handbook/architecture/offline-sync.md` | Canonical | Engineering | Active living architecture | None | When offline queue, replay, idempotency, conflict, or sync behavior changes |
| `docs/handbook/operations/README.md` | Canonical | Engineering/Operations | Active | None | When operations navigation changes |
| `docs/handbook/owners/README.md` | Canonical | Engineering | Active | None | When ownership navigation changes |
| `docs/handbook/reference/README.md` | Reference | Engineering | Active | None | When reference navigation changes |
| `docs/handbook/reference/CURRENT_STATE.md` | Living | Engineering | Active | None | After every implementation or major documentation milestone |
| `docs/handbook/reference/CURRENT_MILESTONE.md` | Living | Engineering | Active | None | At milestone start, pause, completion, or scope change |
| `docs/handbook/reference/PROJECT_RECONSTRUCTION.md` | Living | Engineering | Active | None | After major implementation milestones or material reconstruction changes |
| `docs/handbook/reference/NEXT_MILESTONE.md` | Living | Engineering | Active | None | When candidate milestones change, are approved, are rejected, or are replaced |
| `docs/handbook/reference/PROJECT_MEMORY.md` | Living | Engineering | Active | None | When durable project memory changes |
| `docs/handbook/reference/IMPLEMENTATION_PATTERNS.md` | Living | Engineering | Active | None | When reusable implementation patterns change |
| `docs/handbook/reference/COMMON_FAILURES.md` | Living | Engineering | Active | None | When recurring failures or engineering discoveries change |
| `docs/handbook/reference/PROJECT_SCORECARD.md` | Living | Engineering | Active | None | After scorecard-impacting changes |
| `docs/handbook/reference/TECH_DEBT.md` | Living | Engineering | Active | None | When debt changes |
| `docs/handbook/reference/SECURITY_STATUS.md` | Living | Engineering | Active | None | After security-sensitive milestones or review |
| `docs/handbook/reference/KNOWN_LIMITATIONS.md` | Living | Engineering | Active | None | When limitations change |
| `docs/handbook/reference/OPEN_DECISIONS.md` | Living | Engineering | Active | None | When decisions open or close |
| `docs/handbook/reference/CHANGELOG_SUMMARY.md` | Living | Engineering | Active | None | After meaningful engineering milestones |
| `docs/handbook/reference/EVIDENCE_REPORT.md` | Living | Engineering | Active | None | After repository reconstruction, implementation, verification, or commit-readiness milestones |
| `docs/handbook/reference/ARCHITECTURAL_INVARIANTS.md` | Living | Engineering | Active | None | When ADRs change invariants |
| `docs/handbook/reference/DOCUMENT_INDEX.md` | Living | Engineering | Active | None | When documents are added or reclassified |
| `docs/handbook/reference/DOCUMENTATION_DRIFT.md` | Living | Engineering | Active | None | When drift changes |
| `docs/handbook/reference/HANDBOOK_HEALTH_REPORT.md` | Living | Engineering | Active | None | After documentation audits |

## Owner

Engineering owns this document.

## Update Cadence

Update when repository-owned Markdown documents are added, reclassified, or superseded.

## Lifecycle

This is living documentation.

## Related Documents

- [Documentation Drift](./DOCUMENTATION_DRIFT.md)
- [Handbook Health Report](./HANDBOOK_HEALTH_REPORT.md)
- [Current State](./CURRENT_STATE.md)
- [Engineering Handbook](../README.md)
- [ADR Index](../adrs/README.md)
- [Templates](../templates/README.md)
