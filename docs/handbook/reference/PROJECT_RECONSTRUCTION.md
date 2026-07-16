---
title: Project Reconstruction
status: active
doc_type: reference
lifecycle: living
owner: engineering
update_cadence: after major implementation milestones or when repository reconstruction evidence materially changes
last_reviewed: null
related:
  - ./README.md
  - ./CURRENT_STATE.md
  - ./CURRENT_MILESTONE.md
  - ./NEXT_MILESTONE.md
  - ./PROJECT_SCORECARD.md
  - ./PROJECT_MEMORY.md
  - ./COMMON_FAILURES.md
  - ./SECURITY_STATUS.md
  - ./TECH_DEBT.md
  - ./KNOWN_LIMITATIONS.md
  - ./DOCUMENTATION_DRIFT.md
  - ./CHANGELOG_SUMMARY.md
  - ./ARCHITECTURAL_INVARIANTS.md
  - ../architecture/offline-sync.md
  - ../README.md
  - ../governance/AI_ENGINEERING_OPERATING_MODEL.md
  - ../governance/ENGINEERING_PRINCIPLES.md
  - ../adrs/README.md
  - ../architecture/README.md
  - ../../PRODUCT_VISION.md
  - ../../PRODUCT_HORIZONS.md
  - ../../MVP_SCOPE.md
  - ../../SYSTEM_ARCHITECTURE.md
  - ../../INVENTORY_ARCHITECTURE.md
  - ../../AUTH_ARCHITECTURE.md
  - ../../../README.md
  - ../../../infra/supabase/README.md
---

# Project Reconstruction

## Purpose

This is the primary repository reconstruction snapshot for Krishna's Kitchen. It lets future AI engineers understand current project state from repository evidence instead of conversation memory.

Use this document after [Engineering Handbook](../README.md) and [AI Engineering Operating Model](../governance/AI_ENGINEERING_OPERATING_MODEL.md), then follow links to the canonical source documents for detail.

## Executive Summary

Krishna's Kitchen is a mobile-first React/Vite/TypeScript PWA for volunteer-run temple kitchen operations. [Product Horizons](../../PRODUCT_HORIZONS.md) is the canonical long-term roadmap and active horizon source. Horizon 1, Core Kitchen Inventory Platform, is active. See [Product Vision](../../PRODUCT_VISION.md) and [MVP Scope](../../MVP_SCOPE.md) for supporting product context.

Implementation maturity: active development. Repository evidence shows implemented authentication scaffolding, temporary volunteer session infrastructure, inventory domain services, Supabase repository adapters, mobile inventory lookup and receive/transfer/return/scan screens, volunteer home and tasks screens, migrations, and tests. It is not documented as production-ready; see [Current State](./CURRENT_STATE.md) and [Known Limitations](./KNOWN_LIMITATIONS.md).

Engineering maturity: strong. The Engineering Operating System is Stable at v1.3, with a canonical operating model, Product Horizons, governance, process docs, templates, ADRs, living references, and a scorecard. Future EOS changes require implementation-driven justification.

Security maturity: foundation implemented, production posture still needs review. RLS is enabled on foundational tables, helper functions and controlled volunteer RPCs exist, authenticated inventory read policies exist, and security ADRs are accepted. Temporary volunteer browser permissions are now restricted to read/session capabilities; the absence of a consolidated living security architecture remains a known risk. See [Security Status](./SECURITY_STATUS.md).

Documentation maturity: high for engineering process and reconstruction, medium for application-state documentation. Canonical handbook docs exist, but older docs still contain drift, duplication, and some encoding artifacts. See [Document Index](./DOCUMENT_INDEX.md) and [Documentation Drift](./DOCUMENTATION_DRIFT.md).

Overall project status: ready to continue controlled application development. The temporary volunteer login diagnostic worktree state, temporary volunteer permission drift, undo/reversal terminology drift, return semantics drift, and offline architecture drift have been resolved; remaining high-priority risks include unimplemented offline queue/replay behavior and distributed security architecture ownership.

## Product Vision Summary

Canonical roadmap source: [Product Horizons](../../PRODUCT_HORIZONS.md). Future repository reconstruction must read it before candidate milestone selection.

Active horizon: Horizon 1, Core Kitchen Inventory Platform. Candidate implementation milestones must come from this horizon. Future horizons may influence architecture, but they must not expand implementation scope.

Purpose: build the simplest, fastest, most volunteer-friendly operational platform for temple and community kitchens. The platform aims to reduce shortages, overbuying, wastage, manual coordination, inventory inaccuracies, procurement mistakes, and volunteer onboarding friction. See [Product Vision](../../PRODUCT_VISION.md).

Target users: temple kitchens, prasadam preparation teams, inventory/store teams, feast coordinators, kitchen volunteers, procurement volunteers, temporary volunteers, senior cooks, inventory managers, and temple administrators.

Core workflows:

- Mobile-first authentication and temple/role context.
- Scan-first inventory visibility and lookup.
- Inventory receiving, transfers, returns, and correction/reversal.
- Temporary volunteer participation with restricted access.
- Low-stock and unknown-barcode operational follow-up.

Long-term vision: become the operational backbone for volunteer-run kitchens globally while preserving operational simplicity. Future horizons include kitchen operations, temple intelligence, and broader temple operations; these may influence architecture but not current implementation scope.

## Current Product Capabilities

| Capability | Status | Evidence | Notes |
|---|---|---|---|
| Authentication | Partially Implemented | [Auth Architecture](../../AUTH_ARCHITECTURE.md); `apps/web/src/features/auth`; `apps/web/src/shared/integrations/supabase/auth` | Supabase session source and app-facing auth provider exist. Production profile/RLS integration remains a future extension in docs. |
| Temporary Volunteer Login | Partially Implemented / Clean Worktree | [ADR-0004](../adrs/0004-temporary-volunteer-session-model.md); [Security Status](./SECURITY_STATUS.md); [Current Milestone](./CURRENT_MILESTONE.md) | Session storage, repository, RPCs, and tests exist. Temporary auth/routing diagnostic instrumentation has been removed without changing permission semantics. |
| Inventory Domain | Implemented | [Inventory Architecture](../../INVENTORY_ARCHITECTURE.md); `apps/web/src/domains/inventory` | Domain services, validation, aggregation, transaction helpers, repository contracts, and Supabase adapters exist. |
| Inventory Visibility | Implemented | `inventoryVisibilityService`, visibility domain/tests, inventory lookup screens | Current stock and location/item detail UI files exist. Latest full verification is recorded in [Evidence Report](./EVIDENCE_REPORT.md). |
| Barcode Lookup | Implemented | `barcodeLookupService`, barcode catalog services, lookup UI components | Barcode lookup/catalog domain and Supabase repository files exist. |
| Barcode Scanning | Partially Implemented | `cameraScanningService`, scan workflow UI files, [Documentation Drift](./DOCUMENTATION_DRIFT.md) DD-006 | Manual/scanner workflow UI exists; camera/scanning docs overlap and need canonical boundary clarification. |
| Receiving | Implemented | receive domain/workflow services and `ReceiveInventoryScreen` | Domain, UI, and tests exist. Persistence adapters exist. |
| Transfers | Implemented | transfer domain/workflow services and `TransferInventoryScreen` | Domain, UI, and tests exist. |
| Returns | Implemented with Canonical Semantics | return domain/workflow services and `ReturnInventoryScreen`; [Inventory Architecture](../../INVENTORY_ARCHITECTURE.md) | Current returns use `transaction_type = "returned"` with `quantity_effect = "transfer"`; migration support for `returned` plus `increase` is compatibility only. |
| Undo/Reversal | Implemented with Canonical Terminology | reversal validation, transaction helpers, migrations, [ADR-0009](../adrs/0009-auditability-and-reversibility.md) | `undo` is the user-facing action and service operation; `reversal` is the current persisted correction transaction type; legacy persisted `undo` rows remain read-compatible history only. |
| Unknown Barcodes | Implemented | unknown barcode domain/service/repository/tests; migration `20260606000400_add_unknown_barcodes.sql` | Home/tasks summary files also reference pending unknown barcodes. |
| Low Stock | Implemented | low-stock threshold repository/mapper/tests; migration `20260606000500_add_inventory_low_stock_thresholds.sql` | Home and tasks summary components exist. |
| Volunteer Home | Implemented | `apps/web/src/features/home` | Home summary, quick actions, low-stock and unknown barcode summaries exist. |
| Tasks | Implemented | `apps/web/src/features/tasks` | Low-stock and unknown-barcode task cards exist; future task placeholder exists. |
| Offline | Architecture Defined / Implementation Planned | [ADR-0005](../adrs/0005-mobile-first-offline-pwa.md); [Offline Sync Architecture](../architecture/offline-sync.md); [Known Limitations](./KNOWN_LIMITATIONS.md) | PWA tooling and offline-safe inventory metadata exist. Local queue storage and replay are not implemented. |
| Settings | Planned / Unknown | No current source files found for a settings feature | Not enough repository evidence to classify as implemented. |
| Administration | Planned / Unknown | Product docs mention admin needs; no dedicated admin feature files found | Admin workflows are not evidenced as implemented. |
| Reporting | Planned | [Product Vision](../../PRODUCT_VISION.md); [MVP Scope](../../MVP_SCOPE.md) excludes advanced reporting | Advanced reporting is explicitly outside initial MVP. |
| Recipes, Meal Planning, Procurement | Planned | [Product Vision](../../PRODUCT_VISION.md); [MVP Scope](../../MVP_SCOPE.md) | These are product domains or future expansion areas, not current implementation. |

## Architecture Snapshot

Stack: React, Vite, TypeScript, Tailwind, Supabase, PostgreSQL, pnpm workspaces, and Vite PWA tooling are evidenced by package manifests and docs. `docs/SYSTEM_ARCHITECTURE.md` mentions shadcn/ui and Zustand, but package manifests do not show those dependencies; this is recorded as drift in [Documentation Drift](./DOCUMENTATION_DRIFT.md).

Packages:

- `apps/web`: main PWA.
- `packages/types`: shared auth/role/permission/database shape types.
- `packages/ui`: small shared UI package.
- `packages/utils`: shared utilities.

Domains and features:

- Domain logic lives under `apps/web/src/domains`, especially `domains/inventory`.
- Feature UI lives under `apps/web/src/features`, including `auth`, `home`, `inventory`, and `tasks`.
- App composition, routing, shell, and providers live under `apps/web/src/app`.
- Supabase integration lives under `apps/web/src/shared/integrations/supabase`.

Repository pattern: [ADR-0006](../adrs/0006-repository-pattern.md) and [Inventory Architecture](../../INVENTORY_ARCHITECTURE.md) establish repository contracts between domain/application services and persistence adapters. Inventory repository adapters exist under `apps/web/src/domains/inventory/infrastructure/supabase`.

Supabase: migrations live under `infra/supabase/migrations`; seed assets live under `infra/supabase/seed`. The schema includes inventory, volunteer session, RLS helper, read-policy, and volunteer RPC milestones.

RPC boundaries: [ADR-0007](../adrs/0007-rpc-boundaries-and-browser-trust.md) and [Security Status](./SECURITY_STATUS.md) establish that browser clients are not authoritative for protected authorization decisions. Temporary volunteer inventory/barcode read surfaces use controlled RPCs.

RLS: RLS is enabled on foundational tables, authenticated inventory read policies exist, and helper functions derive authenticated organization/role/temple context.

Authentication: Supabase Auth is the browser session source. `SupabaseAuthProvider` owns the low-level session/client; `AuthProvider` converts it into app-facing profile, organization, temple, roles, permissions, and temporary volunteer mode. See [Auth Architecture](../../AUTH_ARCHITECTURE.md).

Provider hierarchy: app-wide providers compose Supabase/auth/inventory integration through `AppProviders`, auth providers, and inventory provider bridge files.

PWA and offline: the app uses Vite PWA tooling and documentation requires offline capability. [Offline Sync Architecture](../architecture/offline-sync.md) defines the queue/replay boundary; do not implement local queue storage, replay, or server idempotency without a separate approved milestone.

## Security Snapshot

Current RLS coverage: foundational migrations enable RLS. Authenticated inventory read policies exist for inventory-facing tables. Temporary volunteer direct anonymous table access is intentionally avoided for documented volunteer RPC surfaces.

Current RPC usage: volunteer session validation/restoration/refresh/logout cleanup and volunteer inventory/barcode read surfaces use controlled security-definer RPCs, according to [Security Status](./SECURITY_STATUS.md) and migration files.

Volunteer security model: temporary volunteers use session records rather than permanent roles. The intended permission model is security-sensitive and currently drifted across docs. Do not expand temporary volunteer capabilities without human product/security approval.

Known remaining security work:

- Consolidate RLS/security architecture into a living architecture document.
- Record latest security review results.
- Add explicit policies for new write paths before production use.

Completed security milestones:

- Volunteer session security architecture commits and migrations appear in git history.
- RLS helper functions, volunteer session RPCs, authenticated inventory read policies, volunteer inventory read RPCs, and volunteer inventory barcode catalog RPC migrations exist.
- [ADR-0010](../adrs/0010-security-review-before-commit.md) requires security review before security-sensitive commit readiness.

## Milestone Timeline

This timeline is reconstructed from [Changelog Summary](./CHANGELOG_SUMMARY.md), migrations, source files, and recent git history.

| Milestone | Evidence | Commit Evidence Where Available |
|---|---|---|
| Project foundation | Root package metadata, workspace packages, [Project README](../../../README.md) | Earlier than visible 40-commit log |
| Auth and inventory domain foundation | Auth/inventory source structure | `3ea9435 feat: establish auth and inventory domain foundation` |
| Receiving domain workflow and persistence | Receiving domain/service files and Supabase persistence | `66788fc`, `03fcbb0` |
| Transfer workflow | Transfer domain/UI files | `28b9b8d`, `96bc2bb`, `690f6f7` |
| Return workflow | Return domain/UI files | `61e73a8`, `546475a`, `fe80efe` |
| Reversal workflow | Reversal validation and migration | `dc16b3c` |
| Inventory visibility | Visibility domain/service/UI files | `dc8adc5`, `80c22bd` |
| Barcode and camera scanning | Barcode, camera, and scan workflow services/UI | `bee2bf2`, `dcc8baf`, `0e75124` |
| Catalog, unknown barcode, low stock persistence | Services, repositories, migrations | `fdc9621`, `cdd8c86`, `a0c8ff3`, `c8e1c78`, `2bfbcf6` |
| UI integration, home, and tasks | Integration bridge, home and task screens | `82e2965`, `802794c`, `749cf8a` |
| Volunteer session persistence and auth integration | Volunteer session storage/repository/RPC files | `e72b45b`, `05ecdbe`, `b6d8e78`, `7c0cf3b` |
| RLS/RPC security foundation | Security helper, authenticated read, volunteer read RPC migrations | `ac2c4b7`, `befd9bd`, `7234f1d`, `ff48d6c`, `7c67441` |
| Engineering Handbook v1.0 | Handbook docs and ADRs | `29757e6 docs(handbook): establish Engineering Handbook v1.0` |
| EOS freeze | Stable Engineering Operating System v1.2 | `e5f2fe7`, `2aaaad5 docs(eos): freeze Engineering Operating System v1.2` |
| Engineering Handbook v1.3 freeze | Product Horizons integration, active-horizon milestone gating, offline-sync architecture, and final handbook consistency pass | Pending current commit |

Current milestone: [Current Milestone](./CURRENT_MILESTONE.md) identifies Define Offline Queue Architecture as the active implemented milestone pending human review.

## ADR Status

| ADR | Decision Status | Implementation Status | Notes |
|---|---|---|---|
| [ADR-0001 Immutable Inventory Ledger](../adrs/0001-immutable-inventory-ledger.md) | Accepted | Implemented | Domain helpers, aggregation, migrations, and docs support immutable transaction history. |
| [ADR-0002 Positive Quantities And Quantity Effects](../adrs/0002-positive-quantities-and-quantity-effects.md) | Accepted | Implemented | Quantity/effect model exists; current return semantics are canonicalized as `returned` plus `transfer`, while migration compatibility remains documented. |
| [ADR-0003 Supabase Auth And RLS Boundary](../adrs/0003-supabase-auth-and-rls-boundary.md) | Accepted | Partially Implemented | Supabase Auth, RLS helpers, policies, and auth providers exist; production security review remains needed. |
| [ADR-0004 Temporary Volunteer Session Model](../adrs/0004-temporary-volunteer-session-model.md) | Accepted | Partially Implemented / Needs Review | Session storage, repository, RPCs, tests, and read/session-only browser permissions exist. Temporary auth/routing diagnostics have been resolved. |
| [ADR-0005 Mobile-First Offline PWA](../adrs/0005-mobile-first-offline-pwa.md) | Accepted | Architecture Defined / Partially Implemented | PWA stack exists and offline-sync architecture is defined; queue storage and replay remain unimplemented. |
| [ADR-0006 Repository Pattern](../adrs/0006-repository-pattern.md) | Accepted | Implemented | Repository contracts and Supabase adapters exist. |
| [ADR-0007 RPC Boundaries And Browser Trust](../adrs/0007-rpc-boundaries-and-browser-trust.md) | Accepted | Partially Implemented | Volunteer RPC surfaces exist; future protected operations must preserve boundary. |
| [ADR-0008 Domain-Driven Package Organization](../adrs/0008-domain-driven-package-organization.md) | Accepted | Implemented | Source tree follows app/domain/feature/shared/packages organization. |
| [ADR-0009 Auditability And Reversibility](../adrs/0009-auditability-and-reversibility.md) | Accepted | Implemented | Auditability and reversal are implemented, and undo/reversal terminology is canonicalized. |
| [ADR-0010 Security Review Before Commit](../adrs/0010-security-review-before-commit.md) | Accepted | Implemented as governance | EOS and process docs require security review before security-sensitive commit readiness. |

## Documentation Status

Canonical docs: [Engineering Handbook](../README.md), [AI Engineering Operating Model](../governance/AI_ENGINEERING_OPERATING_MODEL.md), governance docs, process docs, ADR index/guide, architecture index, and handbook conventions.

Living docs: [Current State](./CURRENT_STATE.md), [Current Milestone](./CURRENT_MILESTONE.md), [Next Milestone](./NEXT_MILESTONE.md), this reconstruction, [Project Scorecard](./PROJECT_SCORECARD.md), [Security Status](./SECURITY_STATUS.md), [Technical Debt](./TECH_DEBT.md), [Known Limitations](./KNOWN_LIMITATIONS.md), [Open Decisions](./OPEN_DECISIONS.md), [Documentation Drift](./DOCUMENTATION_DRIFT.md), [Project Memory](./PROJECT_MEMORY.md), and [Common Failures and Engineering Lessons](./COMMON_FAILURES.md).

Historical docs: accepted ADRs and many older feature/execution documents are classified in [Document Index](./DOCUMENT_INDEX.md). They remain useful context but are not always current authority.

Reference docs: product, MVP, system architecture, inventory architecture, auth architecture, permissions, Supabase README, validation seed data, and handbook reference pages.

Templates: handbook templates exist under `docs/handbook/templates` and should be used for future ADRs, architecture docs, living docs, reviews, security reviews, test plans, validation runbooks, release checklists, roadmap items, and technical debt.

## Technical Debt

Intentional or accepted technical debt from [Technical Debt](./TECH_DEBT.md) and [Known Limitations](./KNOWN_LIMITATIONS.md):

- Offline queue implementation gap: medium priority because offline is an architectural requirement and the architecture is now specified, but queue storage and replay are not implemented.
- Older documentation duplication and encoding artifacts: medium priority, mostly contributor-experience risk.
- Verification freshness: medium priority because project health depends on rerunning checks during each implementation milestone.

Deferred work reasons: these items require focused, approved milestones. They should not be fixed opportunistically during unrelated implementation.

## Current Blockers

Genuine blockers before permission-changing application development resumes:

- Future temporary volunteer write capability requires a separate approved server-enforced write model before permissions are expanded.

Not blockers, but important gaps: offline queue implementation, security architecture ownership, scanning documentation drift, schema reference drift, and older documentation drift.

## Recommended Next Engineering Milestone

Use the EOS candidate flow in [AI Engineering Operating Model](../governance/AI_ENGINEERING_OPERATING_MODEL.md). The current ranked candidates come from [Next Milestone](./NEXT_MILESTONE.md).

| Rank | Candidate | Strategic Alignment | Current Horizon | Reason It Belongs | Evidence Value | Future Horizon Support Without Scope Expansion | Recommendation |
|---|---|---|---|---|---|---|---|
| 1 | Define offline queue architecture | Strengthens production-ready inventory reliability | Horizon 1, Core Kitchen Inventory Platform | Horizon 1 includes mobile-first PWA, offline-ready architecture, audit trail, repository architecture, testing, and engineering documentation | High: converts PWA tooling, offline-safe metadata, and repository-boundary evidence into architecture | Preserves a sync boundary future operations can use without implementing future planning, forecasting, or analytics | Implemented, pending human review |
| 2 | Consolidate security architecture ownership | Consolidates authorization knowledge before production hardening | Horizon 1, Core Kitchen Inventory Platform | Horizon 1 includes authentication, permissions, temporary volunteers, security, RLS, RPC boundaries, and engineering documentation | High: consolidates RLS/RPC/auth evidence | Makes later procurement, planning, and analytics safer to authorize without implementing them now | Defer |
| 3 | Canonicalize scanning architecture boundary | Clarifies scan-first inventory workflow ownership | Horizon 1, Core Kitchen Inventory Platform | Horizon 1 includes inventory workflows, barcode lookup, barcode catalog, unknown barcode workflow, inventory visibility, and mobile-first PWA | Medium: reduces scan workflow drift | Keeps future operational workflows compatible with a cleaner scan boundary without expanding scope | Defer |

Recommended next action: human review of the implemented offline architecture milestone. Do not implement offline queue storage, replay, idempotency constraints, security architecture ownership, or scanning architecture work until a separate candidate milestone is approved.

## Engineering Health

| Area | Health | Evidence |
|---|---|---|
| Architecture | Good with known gaps | ADRs and architecture references establish core boundaries; offline sync architecture now exists; security living architecture remains a gap. |
| Security | Watch | RLS/RPC foundations exist; temporary volunteer browser permissions are restricted to read/session capabilities. |
| Testing | Watch | Many tests exist across domain, repository, migration, auth, UI, and utilities; latest verification is recorded in [Evidence Report](./EVIDENCE_REPORT.md), and future implementation milestones must rerun verification. |
| Documentation | Good | EOS v1.3 is Stable; Product Horizons, document index, drift register, ADRs, templates, and living references exist. |
| Roadmap | Conditional | Temporary volunteer permission drift, undo/reversal terminology drift, and return semantics drift are complete; next candidate selection should happen after this commit. |
| Technical Debt | Watch | Offline queue implementation and security architecture ownership remain open. |
| Overall | Good for controlled development | The project has enough governance and implementation structure to resume application work after candidate approval. |

## Repository Health

Working tree at latest reconstruction update:

- No auth/routing application diff remains after temporary diagnostic cleanup.
- Living documentation updates are present for the reconstruction, milestone, memory, state, changelog, implementation patterns, and engineering lessons.
- Return semantics drift is implemented and approved for commit.

Resolved debug work: [Project Memory](./PROJECT_MEMORY.md), [Common Failures and Engineering Lessons](./COMMON_FAILURES.md), and [Current Milestone](./CURRENT_MILESTONE.md) record that temporary volunteer login diagnostic instrumentation was removed and verified.

Attention before development resumes: finish review/commit handling for the offline architecture milestone, then refresh candidate options and avoid mixing offline implementation or security architecture decisions into unrelated work.

## Known Assumptions

Repository evidence shows these assumptions are currently baked into implementation or docs:

- Inventory transactions are immutable and balances are derived from transaction history.
- Quantities should be positive; transaction/effect semantics determine direction.
- Browser clients are not authoritative for protected authorization decisions.
- RLS and controlled RPCs are the server/database authorization boundary.
- Temporary volunteer access is restricted, expiring, attributable, and not equivalent to permanent user roles.
- Supabase Auth is the browser session source.
- Temple selection is currently local session context; RLS remains final authorization authority.
- Offline capability is required; queue architecture is defined, but local queue storage and replay are not implemented.
- Security-sensitive work requires security review before commit readiness.
- Future EOS changes require implementation-driven justification.

## Lessons Worth Preserving

From [Project Memory](./PROJECT_MEMORY.md), [Common Failures and Engineering Lessons](./COMMON_FAILURES.md), ADRs, and architecture docs:

- Start from repository evidence, not conversation memory.
- Keep the operating model singular; avoid parallel workflow descriptions.
- Present ranked candidate micro-milestones and wait for human approval.
- Stop on unclear product/security intent, ADR need, scope expansion, repeated unexplained verification failure, inconsistent repository state, conflicting handbook guidance, or low confidence.
- Preserve inventory history; corrections add reversal/compensating transactions rather than mutating past records.
- Treat documentation as a way to reduce future work, not as an end in itself.
- Do not silently resolve drift in security-sensitive areas.

## Final Summary

A brand-new senior engineer should understand first:

- Krishna's Kitchen is an active-development, mobile-first PWA for volunteer kitchen inventory operations.
- Inventory integrity, auditability, server-side authorization, and volunteer-friendly speed are the central constraints.
- The EOS v1.3 handbook is the canonical engineering operating system.
- The next application work should start from repository refresh, candidate approval, implementation, verification, review, living documentation update, then commit approval.

They should avoid changing:

- Inventory immutability and derived-balance rules without a new ADR.
- Authorization/RLS/RPC boundaries without explicit security review and human approval.
- Temporary volunteer write capability without an approved server-enforced write model.
- Offline write behavior without approved architecture.
- EOS governance without implementation-driven justification.

They should plan next:

- Refresh candidate options after this commit.
- Recommend only active-horizon milestones from [Product Horizons](../../PRODUCT_HORIZONS.md).
- Keep any follow-up milestone small, independently verifiable, and reversible.
- Preserve separate approval gates for implementation review and commit.

## Owner

Engineering owns this document.

## Update Cadence

Update after major implementation milestones or when repository reconstruction evidence materially changes.

## Lifecycle

This is living documentation and should remain concise. Prefer links to canonical documents over duplicating their full content.

## Related Documents

- [Engineering Handbook](../README.md)
- [AI Engineering Operating Model](../governance/AI_ENGINEERING_OPERATING_MODEL.md)
- [Current State](./CURRENT_STATE.md)
- [Current Milestone](./CURRENT_MILESTONE.md)
- [Next Milestone](./NEXT_MILESTONE.md)
- [Project Scorecard](./PROJECT_SCORECARD.md)
- [Security Status](./SECURITY_STATUS.md)
- [Technical Debt](./TECH_DEBT.md)
- [Known Limitations](./KNOWN_LIMITATIONS.md)
- [Documentation Drift](./DOCUMENTATION_DRIFT.md)
- [Project Memory](./PROJECT_MEMORY.md)
- [Common Failures and Engineering Lessons](./COMMON_FAILURES.md)
- [ADR Index](../adrs/README.md)
- [Product Horizons](../../PRODUCT_HORIZONS.md)
- [Product Vision](../../PRODUCT_VISION.md)
- [MVP Scope](../../MVP_SCOPE.md)
- [System Architecture](../../SYSTEM_ARCHITECTURE.md)
- [Inventory Architecture](../../INVENTORY_ARCHITECTURE.md)
- [Auth Architecture](../../AUTH_ARCHITECTURE.md)
