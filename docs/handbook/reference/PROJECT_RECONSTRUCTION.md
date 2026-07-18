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
  - ../architecture/security.md
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

Implementation maturity: active development. Repository evidence shows implemented authentication scaffolding, temporary volunteer session infrastructure, inventory domain services, recipe definition/scaling/availability/shopping-list domain foundations, recipe repository contract, Supabase repository adapters, mobile inventory lookup and receive/transfer/return/scan screens, volunteer home and tasks screens, migrations, and tests. It is not documented as production-ready; see [Current State](./CURRENT_STATE.md) and [Known Limitations](./KNOWN_LIMITATIONS.md).

Engineering maturity: strong. The Engineering Operating System is frozen for production use, with a canonical Session Controller, Product Horizons, governance, process docs, templates, ADRs, living references, and a scorecard. Future EOS changes require implementation-driven justification.

Security maturity: foundation implemented, production approval not granted. RLS is enabled on foundational tables, helper functions and controlled volunteer RPCs exist, authenticated inventory read policies exist, security ADRs are accepted, durable security boundaries are consolidated in [Security Architecture](../architecture/security.md), and the latest Horizon 1 security review baseline is recorded in [Security Status](./SECURITY_STATUS.md). Temporary volunteer browser permissions are restricted to read/session capabilities.

Documentation maturity: high for engineering process and reconstruction, medium for application-state documentation. Canonical handbook docs exist, and Delivery Management now provides a separate product-delivery reporting layer under `docs/delivery`. Older docs still contain drift, duplication, and some encoding artifacts. See [Document Index](./DOCUMENT_INDEX.md) and [Documentation Drift](./DOCUMENTATION_DRIFT.md).

Overall project status: ready to continue controlled application development. The temporary volunteer login diagnostic worktree state, temporary volunteer permission drift, undo/reversal terminology drift, return semantics drift, offline architecture drift, security architecture ownership gap, unrecorded security review baseline, EOS Session Controller freeze, and Delivery Management handbook gap have been resolved. Recipe domain work has started as small Horizon 1 foundations; remaining high-priority risks include unimplemented offline queue/replay behavior, missing production security approval, and no formally selected Current Delivery Increment.

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
| Recipe Definitions, Scaling, Availability, Shopping Lists, and Repository Contract | Foundation Implemented | `apps/web/src/domains/recipes`; [Current Milestone](./CURRENT_MILESTONE.md) | Domain types, validation, normalization, scaling, exact item/unit availability evaluation, shortage-only shopping-list output, application repository contract, exports, and tests exist. No recipe UI, persistence implementation, Supabase adapter, migrations, RLS/RPC changes, unit conversion, procurement, vendor, approval, or planning behavior is implemented. |
| Volunteer Home | Implemented | `apps/web/src/features/home` | Home summary, quick actions, low-stock and unknown barcode summaries exist. |
| Tasks | Implemented | `apps/web/src/features/tasks` | Low-stock and unknown-barcode task cards exist; future task placeholder exists. |
| Offline | Architecture Defined / Implementation Planned | [ADR-0005](../adrs/0005-mobile-first-offline-pwa.md); [Offline Sync Architecture](../architecture/offline-sync.md); [Known Limitations](./KNOWN_LIMITATIONS.md) | PWA tooling and offline-safe inventory metadata exist. Local queue storage and replay are not implemented. |
| Settings | Planned / Unknown | No current source files found for a settings feature | Not enough repository evidence to classify as implemented. |
| Administration | Planned / Unknown | Product docs mention admin needs; no dedicated admin feature files found | Admin workflows are not evidenced as implemented. |
| Reporting | Planned | [Product Vision](../../PRODUCT_VISION.md); [MVP Scope](../../MVP_SCOPE.md) excludes advanced reporting | Advanced reporting is explicitly outside initial MVP. |
| Recipe UI, Persistence, Meal Planning, Procurement | Planned | [Product Vision](../../PRODUCT_VISION.md); [MVP Scope](../../MVP_SCOPE.md) | Recipe UI/persistence remain later Horizon 1 work; meal planning and procurement remain future expansion areas. |

## Delivery Management Snapshot

Delivery Management lives under `docs/delivery` and is separate from the Engineering Operating System.

| Document | Responsibility | Current Delivery Evidence |
|---|---|---|
| [Delivery Model](../../delivery/DELIVERY_MODEL.md) | Delivery vocabulary, lifecycle, authority boundaries, and document responsibilities | Active and canonical for Delivery Management. |
| [Capability Matrix](../../delivery/CAPABILITY_MATRIX.md) | Capability inventory and capability-level delivery/readiness status | Horizon 1 capabilities are tracked; capability-level readiness remains distinct from overall readiness. |
| [Delivery Status](../../delivery/DELIVERY_STATUS.md) | Current Delivery Increment, delivery goal, included/excluded capabilities, and product-facing progress | No narrower Current Delivery Increment has been formally selected; Horizon 1 production-alpha path remains the delivery goal. |
| [Delivery Readiness](../../delivery/DELIVERY_READINESS.md) | Increment, pilot, and production readiness; blockers; residual risks; future approved work; evidence summary | Increment readiness, pilot readiness, and production readiness are currently blocked. |

## Architecture Snapshot

Stack: React, Vite, TypeScript, Tailwind, Supabase, PostgreSQL, pnpm workspaces, and Vite PWA tooling are evidenced by package manifests and docs. `docs/SYSTEM_ARCHITECTURE.md` mentions shadcn/ui and Zustand, but package manifests do not show those dependencies; this is recorded as drift in [Documentation Drift](./DOCUMENTATION_DRIFT.md).

Packages:

- `apps/web`: main PWA.
- `packages/types`: shared auth/role/permission/database shape types.
- `packages/ui`: small shared UI package.
- `packages/utils`: shared utilities.

Domains and features:

- Domain logic lives under `apps/web/src/domains`, especially `domains/inventory`.
- Recipe definition, scaling, availability, shopping-list, and repository-contract logic now lives under `apps/web/src/domains/recipes`.
- Feature UI lives under `apps/web/src/features`, including `auth`, `home`, `inventory`, and `tasks`.
- App composition, routing, shell, and providers live under `apps/web/src/app`.
- Supabase integration lives under `apps/web/src/shared/integrations/supabase`.

Repository pattern: [ADR-0006](../adrs/0006-repository-pattern.md) and [Inventory Architecture](../../INVENTORY_ARCHITECTURE.md) establish repository contracts between domain/application services and persistence adapters. Inventory repository adapters exist under `apps/web/src/domains/inventory/infrastructure/supabase`; the recipe repository contract exists without a persistence adapter.

Supabase: migrations live under `infra/supabase/migrations`; seed assets live under `infra/supabase/seed`. The schema includes inventory, volunteer session, RLS helper, read-policy, and volunteer RPC milestones.

RPC boundaries: [ADR-0007](../adrs/0007-rpc-boundaries-and-browser-trust.md), [Security Architecture](../architecture/security.md), and [Security Status](./SECURITY_STATUS.md) establish that browser clients are not authoritative for protected authorization decisions. Temporary volunteer inventory/barcode read surfaces use controlled RPCs.

RLS: RLS is enabled on foundational tables, authenticated inventory read policies exist, and helper functions derive authenticated organization/role/temple context.

Authentication: Supabase Auth is the browser session source. `SupabaseAuthProvider` owns the low-level session/client; `AuthProvider` converts it into app-facing profile, organization, temple, roles, permissions, and temporary volunteer mode. See [Auth Architecture](../../AUTH_ARCHITECTURE.md).

Provider hierarchy: app-wide providers compose Supabase/auth/inventory integration through `AppProviders`, auth providers, and inventory provider bridge files.

PWA and offline: the app uses Vite PWA tooling and documentation requires offline capability. [Offline Sync Architecture](../architecture/offline-sync.md) defines the queue/replay boundary; do not implement local queue storage, replay, or server idempotency without a separate approved milestone.

## Security Snapshot

Current RLS coverage: foundational migrations enable RLS. Authenticated inventory read policies exist for inventory-facing tables. Temporary volunteer direct anonymous table access is intentionally avoided for documented volunteer RPC surfaces.

Current RPC usage: volunteer session validation/restoration/refresh/logout cleanup and volunteer inventory/barcode read surfaces use controlled security-definer RPCs, according to [Security Status](./SECURITY_STATUS.md) and migration files.

Volunteer security model: temporary volunteers use session records rather than permanent roles. Temporary volunteer browser permissions are read/session-only. Do not expand temporary volunteer capabilities without human product/security approval and a separate server-enforced write model.

Known remaining security work:

- Add explicit policies for new write paths before production use.
- Convert security review findings into focused implementation milestones before production hardening.

Completed security milestones:

- Volunteer session security architecture commits and migrations appear in git history.
- RLS helper functions, volunteer session RPCs, authenticated inventory read policies, volunteer inventory read RPCs, and volunteer inventory barcode catalog RPC migrations exist.
- [ADR-0010](../adrs/0010-security-review-before-commit.md) requires security review before security-sensitive commit readiness.
- [Security Architecture](../architecture/security.md) now owns durable Horizon 1 auth/RLS/RPC/temporary-volunteer security boundaries.
- [Security Status](./SECURITY_STATUS.md) records the 2026-07-16 Horizon 1 security review baseline and states that it is not production security approval.

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
| Engineering Handbook v1.3 freeze | Product Horizons integration, active-horizon milestone gating, offline-sync architecture, and final handbook consistency pass | `9275155 docs(handbook): freeze engineering handbook v1.3` |
| Security architecture ownership consolidation | Living security architecture source and reference updates | `c8a4f5c docs(security): consolidate architecture ownership` |
| Living state refresh after security commit | Milestone, reconstruction, scorecard, and evidence references aligned to committed security architecture history | `63dc374 docs(handbook): refresh milestone state after security commit` |
| Engineering Operating System Session Controller freeze | Canonical Session Controller, repository-evidence resume, verification-integrated Evidence Capture, and simplified governance/process workflow references | `560ad58 docs(eos): freeze Session Controller workflow` |
| Recipe definition domain foundation | Recipe definition types, validation, normalization, exports, and focused tests | `b36e144 feat(recipes): add recipe definition domain foundation` |
| Engineering Operating System reporting refinement | Completion reporting separates residual risks from future approved work | `6662e77 docs(eos): refine completion reporting terminology` |
| Recipe scaling domain foundation | Recipe scaling helper, six-decimal quantity precision, exports, and focused tests | `830c5dc feat(recipes): add recipe scaling domain foundation` |
| Recipe availability domain foundation | Availability evaluator, exact item/unit matching, per-line balance allocation, exports, and focused tests | `4906960 feat(recipes): add recipe availability domain foundation` |
| Recipe shopping-list domain foundation | Shortage-only item/unit shopping-list generator, grouped totals, exports, and focused tests | `9a9aa53 feat(recipes): add shopping list domain foundation` |
| Recipe repository contract foundation | Scoped list/read repository contract, record/query types, exports, and focused contract tests | Committed in `98d6317` |
| Delivery Management handbook freeze | Separate product-delivery reporting layer for capability status, delivery status, and readiness assessment | Pending commit |

Current milestone: [Current Milestone](./CURRENT_MILESTONE.md) identifies Recipe Repository Contract Foundation as the active implemented milestone pending human review in the current Session Controller run.

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

Living docs: [Current State](./CURRENT_STATE.md), [Current Milestone](./CURRENT_MILESTONE.md), [Next Milestone](./NEXT_MILESTONE.md), this reconstruction, [Project Scorecard](./PROJECT_SCORECARD.md), [Security Status](./SECURITY_STATUS.md), [Technical Debt](./TECH_DEBT.md), [Known Limitations](./KNOWN_LIMITATIONS.md), [Open Decisions](./OPEN_DECISIONS.md), [Documentation Drift](./DOCUMENTATION_DRIFT.md), [Project Memory](./PROJECT_MEMORY.md), [Common Failures and Engineering Lessons](./COMMON_FAILURES.md), and Delivery Management living docs under `docs/delivery`.

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

Not blockers, but important gaps: offline queue implementation, missing production security approval, scanning documentation drift, schema reference drift, and older documentation drift.

## Recommended Next Engineering Milestone

Use the EOS candidate flow in [AI Engineering Operating Model](../governance/AI_ENGINEERING_OPERATING_MODEL.md). The current ranked candidates come from [Next Milestone](./NEXT_MILESTONE.md).

| Rank | Candidate | Strategic Alignment | Current Horizon | Reason It Belongs | Evidence Value | Future Horizon Support Without Scope Expansion | Recommendation |
|---|---|---|---|---|---|---|---|
| 1 | Recipe Repository Contract Foundation | Adds a scoped recipe access boundary for application integration | Horizon 1, Core Kitchen Inventory Platform | Horizon 1 includes recipe definitions, repository architecture, testing, and evidence generation | High: proves recipe access can follow repository boundaries without UI or persistence scope | Gives future UI, persistence, offline, planning, and procurement work a tested access contract | Approved and implemented; pending human review |
| 2 | Recipe Feature Route Empty-State Foundation | Starts visible recipe workflow integration | Horizon 1, Core Kitchen Inventory Platform | Horizon 1 includes recipe definitions, ingredient availability, shopping-list generation, and mobile-first PWA | Medium: proves route/shell integration | Gives future recipe workflows a home without implementing higher-horizon behavior | Defer |
| 3 | Canonicalize scanning architecture boundary | Clarifies scan-first inventory workflow ownership | Horizon 1, Core Kitchen Inventory Platform | Horizon 1 includes inventory workflows, barcode lookup, barcode catalog, unknown barcode workflow, inventory visibility, and mobile-first PWA | Medium: reduces scan workflow drift | Keeps future operational workflows compatible with a cleaner scan boundary without expanding scope | Defer |

Recommended next action: complete verification and human review for Recipe Repository Contract Foundation. Do not implement recipe UI, persistence implementation, Supabase adapter, migrations, RLS/RPC changes, authorization, unit conversion, procurement, vendor management, approval workflows, offline queue storage, replay, permission expansion, scanning architecture work, or stack documentation reconciliation until a separate candidate milestone is approved.

## Engineering Health

| Area | Health | Evidence |
|---|---|---|
| Architecture | Good with known gaps | ADRs and architecture references establish core boundaries; offline sync architecture and security architecture now exist. |
| Security | Watch | RLS/RPC foundations exist; temporary volunteer browser permissions are restricted to read/session capabilities; the Horizon 1 security review baseline is recorded, but production security approval is not granted. |
| Testing | Watch | Many tests exist across domain, repository, migration, auth, UI, and utilities; latest verification is recorded in [Evidence Report](./EVIDENCE_REPORT.md), and future implementation milestones must rerun verification. |
| Documentation | Good | EOS Session Controller is frozen for production use; Product Horizons, document index, drift register, ADRs, templates, and living references exist. |
| Roadmap | Conditional | Temporary volunteer permission drift, undo/reversal terminology drift, return semantics drift, offline architecture drift, security architecture ownership, security review baseline recording, EOS Session Controller freeze, recipe definition foundation, recipe scaling foundation, recipe availability foundation, and recipe shopping-list foundation are complete. |
| Technical Debt | Watch | Offline queue implementation, scanning documentation drift, schema reference drift, and older documentation drift remain open. |
| Overall | Good for controlled development | The project has enough governance and implementation structure to resume application work after candidate approval. |

## Repository Health

Working tree at latest reconstruction update for this milestone:

- Security architecture ownership is committed in `c8a4f5c`.
- Living state refresh after the security commit is committed in `63dc374`.
- Horizon 1 security review baseline is committed in `94e150f`.
- EOS Session Controller freeze is committed in `560ad58`.
- Recipe definition, scaling, availability, and shopping-list domain implementations are committed. Recipe repository contract implementation is pending human review.

Resolved debug work: [Project Memory](./PROJECT_MEMORY.md), [Common Failures and Engineering Lessons](./COMMON_FAILURES.md), and [Current Milestone](./CURRENT_MILESTONE.md) record that temporary volunteer login diagnostic instrumentation was removed and verified.

Attention before development resumes: complete the current Session Controller verification and human-review gate. Avoid mixing recipe UI, persistence, unit conversion, procurement, vendor management, approval workflows, offline implementation, permission changes, scanning architecture, or stack documentation decisions into unrelated work.

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
- Recipe foundations currently include domain validation, scaling, exact item/unit availability, shortage-only shopping-list output, and a scoped repository contract only; persistence implementation, Supabase adapters, authorization, UI, unit conversion, procurement, vendor management, and approval workflows remain future approved slices.
- Delivery Management records product-facing delivery status separately from engineering execution; Product Horizons owns scope and the EOS owns workflow.

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
- The frozen Engineering Operating System Session Controller is the canonical execution workflow.
- The latest application work is the Recipe Repository Contract Foundation, implemented as a Horizon 1 application-boundary slice.
- The latest documentation work is the Delivery Management handbook freeze, adding product-facing delivery status and readiness tracking.

They should avoid changing:

- Inventory immutability and derived-balance rules without a new ADR.
- Authorization/RLS/RPC boundaries without explicit security review and human approval.
- Temporary volunteer write capability without an approved server-enforced write model.
- Offline write behavior without approved architecture.
- EOS governance without implementation-driven justification.

They should plan next:

- Refresh candidate options after reconstructing repository state in the next Session Controller run.
- Recommend only active-horizon milestones from [Product Horizons](../../PRODUCT_HORIZONS.md).
- Read Delivery Management during reconstruction for current delivery target, progress, and readiness.
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
- [Security Architecture](../architecture/security.md)
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
