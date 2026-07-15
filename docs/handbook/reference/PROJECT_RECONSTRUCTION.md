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
  - ../README.md
  - ../governance/AI_ENGINEERING_OPERATING_MODEL.md
  - ../governance/ENGINEERING_PRINCIPLES.md
  - ../adrs/README.md
  - ../architecture/README.md
  - ../../PRODUCT_VISION.md
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

Krishna's Kitchen is a mobile-first React/Vite/TypeScript PWA for volunteer-run temple kitchen operations. The product vision frames it as operational reliability software for volunteer kitchens, with inventory discipline as the MVP center of gravity. See [Product Vision](../../PRODUCT_VISION.md) and [MVP Scope](../../MVP_SCOPE.md).

Implementation maturity: active development. Repository evidence shows implemented authentication scaffolding, temporary volunteer session infrastructure, inventory domain services, Supabase repository adapters, mobile inventory lookup and receive/transfer/return/scan screens, volunteer home and tasks screens, migrations, and tests. It is not documented as production-ready; see [Current State](./CURRENT_STATE.md) and [Known Limitations](./KNOWN_LIMITATIONS.md).

Engineering maturity: strong. The Engineering Operating System is Stable at v1.2, with a canonical operating model, governance, process docs, templates, ADRs, living references, and a scorecard. Future EOS changes require implementation-driven justification.

Security maturity: foundation implemented, production posture still needs review. RLS is enabled on foundational tables, helper functions and controlled volunteer RPCs exist, authenticated inventory read policies exist, and security ADRs are accepted. Temporary volunteer permission drift and the absence of a consolidated living security architecture remain known risks. See [Security Status](./SECURITY_STATUS.md).

Documentation maturity: high for engineering process and reconstruction, medium for application-state documentation. Canonical handbook docs exist, but older docs still contain drift, duplication, and some encoding artifacts. See [Document Index](./DOCUMENT_INDEX.md) and [Documentation Drift](./DOCUMENTATION_DRIFT.md).

Overall project status: ready to continue controlled application development. The temporary volunteer login diagnostic worktree state has been resolved; remaining high-priority risks are documented permission drift, undo/reversal terminology drift, and incomplete offline queue architecture.

## Product Vision Summary

Purpose: build the simplest, fastest, most volunteer-friendly operational platform for temple and community kitchens. The platform aims to reduce shortages, overbuying, wastage, manual coordination, inventory inaccuracies, procurement mistakes, and volunteer onboarding friction. See [Product Vision](../../PRODUCT_VISION.md).

Target users: temple kitchens, prasadam preparation teams, inventory/store teams, feast coordinators, kitchen volunteers, procurement volunteers, temporary volunteers, senior cooks, inventory managers, and temple administrators.

Core workflows:

- Mobile-first authentication and temple/role context.
- Scan-first inventory visibility and lookup.
- Inventory receiving, transfers, returns, and correction/reversal.
- Temporary volunteer participation with restricted access.
- Low-stock and unknown-barcode operational follow-up.

Long-term vision: become the operational backbone for volunteer-run kitchens globally while preserving operational simplicity. Longer-term areas such as recipes, meal planning, procurement optimization, forecasting, analytics, and multilingual or voice workflows are documented as later expansion, not current implementation.

## Current Product Capabilities

| Capability | Status | Evidence | Notes |
|---|---|---|---|
| Authentication | Partially Implemented | [Auth Architecture](../../AUTH_ARCHITECTURE.md); `apps/web/src/features/auth`; `apps/web/src/shared/integrations/supabase/auth` | Supabase session source and app-facing auth provider exist. Production profile/RLS integration remains a future extension in docs. |
| Temporary Volunteer Login | Partially Implemented / Clean Worktree | [ADR-0004](../adrs/0004-temporary-volunteer-session-model.md); [Security Status](./SECURITY_STATUS.md); [Current Milestone](./CURRENT_MILESTONE.md) | Session storage, repository, RPCs, and tests exist. Temporary auth/routing diagnostic instrumentation has been removed without changing permission semantics. |
| Inventory Domain | Implemented | [Inventory Architecture](../../INVENTORY_ARCHITECTURE.md); `apps/web/src/domains/inventory` | Domain services, validation, aggregation, transaction helpers, repository contracts, and Supabase adapters exist. |
| Inventory Visibility | Implemented | `inventoryVisibilityService`, visibility domain/tests, inventory lookup screens | Current stock and location/item detail UI files exist. Latest full verification result is not recorded. |
| Barcode Lookup | Implemented | `barcodeLookupService`, barcode catalog services, lookup UI components | Barcode lookup/catalog domain and Supabase repository files exist. |
| Barcode Scanning | Partially Implemented | `cameraScanningService`, scan workflow UI files, [Documentation Drift](./DOCUMENTATION_DRIFT.md) DD-006 | Manual/scanner workflow UI exists; camera/scanning docs overlap and need canonical boundary clarification. |
| Receiving | Implemented | receive domain/workflow services and `ReceiveInventoryScreen` | Domain, UI, and tests exist. Persistence adapters exist. |
| Transfers | Implemented | transfer domain/workflow services and `TransferInventoryScreen` | Domain, UI, and tests exist. |
| Returns | Implemented with Drift | return domain/workflow services and `ReturnInventoryScreen`; DD-003 | Implementation exists, but return semantics are documented inconsistently. |
| Undo/Reversal | Partially Implemented | reversal validation, transaction helpers, migrations, [ADR-0009](../adrs/0009-auditability-and-reversibility.md) | Reversal architecture exists; terminology drift remains open. |
| Unknown Barcodes | Implemented | unknown barcode domain/service/repository/tests; migration `20260606000400_add_unknown_barcodes.sql` | Home/tasks summary files also reference pending unknown barcodes. |
| Low Stock | Implemented | low-stock threshold repository/mapper/tests; migration `20260606000500_add_inventory_low_stock_thresholds.sql` | Home and tasks summary components exist. |
| Volunteer Home | Implemented | `apps/web/src/features/home` | Home summary, quick actions, low-stock and unknown barcode summaries exist. |
| Tasks | Implemented | `apps/web/src/features/tasks` | Low-stock and unknown-barcode task cards exist; future task placeholder exists. |
| Offline | Planned / Partially Scaffolded | [ADR-0005](../adrs/0005-mobile-first-offline-pwa.md); [Known Limitations](./KNOWN_LIMITATIONS.md) | PWA tooling exists, but detailed offline queue architecture is not documented as implemented. |
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

PWA and offline: the app uses Vite PWA tooling and documentation requires offline capability. Detailed offline queue architecture remains incomplete; do not implement offline writes without an approved architecture milestone.

## Security Snapshot

Current RLS coverage: foundational migrations enable RLS. Authenticated inventory read policies exist for inventory-facing tables. Temporary volunteer direct anonymous table access is intentionally avoided for documented volunteer RPC surfaces.

Current RPC usage: volunteer session validation/restoration/refresh/logout cleanup and volunteer inventory/barcode read surfaces use controlled security-definer RPCs, according to [Security Status](./SECURITY_STATUS.md) and migration files.

Volunteer security model: temporary volunteers use session records rather than permanent roles. The intended permission model is security-sensitive and currently drifted across docs. Do not expand temporary volunteer capabilities without human product/security approval.

Known remaining security work:

- Reconcile temporary volunteer permission documentation and implementation expectations.
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

Current milestone: [Current Milestone](./CURRENT_MILESTONE.md) identifies Project Reconstruction v1 as the active documentation milestone.

## ADR Status

| ADR | Decision Status | Implementation Status | Notes |
|---|---|---|---|
| [ADR-0001 Immutable Inventory Ledger](../adrs/0001-immutable-inventory-ledger.md) | Accepted | Implemented | Domain helpers, aggregation, migrations, and docs support immutable transaction history. |
| [ADR-0002 Positive Quantities And Quantity Effects](../adrs/0002-positive-quantities-and-quantity-effects.md) | Accepted | Implemented with drift | Quantity/effect model exists; return semantics drift is recorded in DD-003. |
| [ADR-0003 Supabase Auth And RLS Boundary](../adrs/0003-supabase-auth-and-rls-boundary.md) | Accepted | Partially Implemented | Supabase Auth, RLS helpers, policies, and auth providers exist; production security review remains needed. |
| [ADR-0004 Temporary Volunteer Session Model](../adrs/0004-temporary-volunteer-session-model.md) | Accepted | Partially Implemented / Needs Review | Session storage, repository, RPCs, and tests exist; permission drift remains. Temporary auth/routing diagnostics have been resolved. |
| [ADR-0005 Mobile-First Offline PWA](../adrs/0005-mobile-first-offline-pwa.md) | Accepted | Partially Implemented | PWA stack exists; offline queue architecture is incomplete. |
| [ADR-0006 Repository Pattern](../adrs/0006-repository-pattern.md) | Accepted | Implemented | Repository contracts and Supabase adapters exist. |
| [ADR-0007 RPC Boundaries And Browser Trust](../adrs/0007-rpc-boundaries-and-browser-trust.md) | Accepted | Partially Implemented | Volunteer RPC surfaces exist; future protected operations must preserve boundary. |
| [ADR-0008 Domain-Driven Package Organization](../adrs/0008-domain-driven-package-organization.md) | Accepted | Implemented | Source tree follows app/domain/feature/shared/packages organization. |
| [ADR-0009 Auditability And Reversibility](../adrs/0009-auditability-and-reversibility.md) | Accepted | Partially Implemented / Needs Review | Auditability and reversal are implemented, but undo/reversal terminology drift remains. |
| [ADR-0010 Security Review Before Commit](../adrs/0010-security-review-before-commit.md) | Accepted | Implemented as governance | EOS and process docs require security review before security-sensitive commit readiness. |

## Documentation Status

Canonical docs: [Engineering Handbook](../README.md), [AI Engineering Operating Model](../governance/AI_ENGINEERING_OPERATING_MODEL.md), governance docs, process docs, ADR index/guide, architecture index, and handbook conventions.

Living docs: [Current State](./CURRENT_STATE.md), [Current Milestone](./CURRENT_MILESTONE.md), [Next Milestone](./NEXT_MILESTONE.md), this reconstruction, [Project Scorecard](./PROJECT_SCORECARD.md), [Security Status](./SECURITY_STATUS.md), [Technical Debt](./TECH_DEBT.md), [Known Limitations](./KNOWN_LIMITATIONS.md), [Open Decisions](./OPEN_DECISIONS.md), [Documentation Drift](./DOCUMENTATION_DRIFT.md), [Project Memory](./PROJECT_MEMORY.md), and [Common Failures and Engineering Lessons](./COMMON_FAILURES.md).

Historical docs: accepted ADRs and many older feature/execution documents are classified in [Document Index](./DOCUMENT_INDEX.md). They remain useful context but are not always current authority.

Reference docs: product, MVP, system architecture, inventory architecture, auth architecture, permissions, Supabase README, validation seed data, and handbook reference pages.

Templates: handbook templates exist under `docs/handbook/templates` and should be used for future ADRs, architecture docs, living docs, reviews, security reviews, test plans, validation runbooks, release checklists, roadmap items, and technical debt.

## Technical Debt

Intentional or accepted technical debt from [Technical Debt](./TECH_DEBT.md) and [Known Limitations](./KNOWN_LIMITATIONS.md):

- Temporary volunteer permission drift: high priority because it affects security-sensitive authorization.
- Undo versus reversal terminology drift: high priority because it affects inventory correction semantics.
- Offline queue architecture gap: medium priority because offline is an architectural requirement but not fully specified.
- Older documentation duplication and encoding artifacts: medium priority, mostly contributor-experience risk.
- Latest full verification result not recorded: medium priority because project health is harder to assess.

Deferred work reasons: these items require focused, approved milestones. They should not be fixed opportunistically during unrelated implementation.

## Current Blockers

Genuine blockers before permission-changing application development resumes:

- Temporary volunteer permission intent requires human product/security decision before permission expansion or cleanup that changes authorization semantics.

Not blockers, but important gaps: offline queue architecture, undo/reversal terminology cleanup, return semantics documentation drift, and older documentation drift.

## Recommended Next Engineering Milestone

Use the EOS candidate flow in [AI Engineering Operating Model](../governance/AI_ENGINEERING_OPERATING_MODEL.md). The current ranked candidates come from [Next Milestone](./NEXT_MILESTONE.md).

| Rank | Candidate | Recommendation | Confidence | Effort | Dependencies | Risk | Why Alternatives Were Rejected |
|---|---|---|---|---|---|---|---|
| 1 | Reconcile temporary volunteer permission drift | Approved for implementation | 68% | Medium | Human product/security decision; review drift/open decisions/auth docs/permissions matrix/current tests | High security risk | Highest-value known blocker before expanding temporary volunteer capability. |
| 2 | Define offline queue architecture | Defer | 60% | Medium | ADR-0005 review, inventory repository boundary review, architecture approval | Medium-to-high architecture risk | Important, but offline writes should not outrank active authorization ambiguity. |
| 3 | Canonicalize undo/reversal terminology | Defer | 66% | Small to Medium | ADR-0009 review, transaction helper/reversal validation review, feature doc review | Medium inventory-semantics risk | Important, but lower immediate security impact than temporary volunteer permissions. |

Recommended next action: implement only the approved temporary volunteer permission drift milestone. Do not implement offline or reversal work until a separate candidate milestone is approved.

## Engineering Health

| Area | Health | Evidence |
|---|---|---|
| Architecture | Good with known gaps | ADRs and architecture references establish core boundaries; offline/security living architecture pages remain gaps. |
| Security | Watch | RLS/RPC foundations exist; temporary volunteer permission drift remains unresolved. |
| Testing | Watch | Many tests exist across domain, repository, migration, auth, UI, and utilities; latest recorded full-suite result passed for the diagnostic cleanup milestone, and future implementation milestones must rerun verification. |
| Documentation | Good | EOS v1.2 is Stable; document index, drift register, ADRs, templates, and living references exist. |
| Roadmap | Conditional | The prior diagnostic cleanup candidate is complete; temporary volunteer permission drift is approved as the next implementation milestone. |
| Technical Debt | Watch | High-priority auth permission and undo/reversal drift remain open. |
| Overall | Good for controlled development | The project has enough governance and implementation structure to resume application work after candidate approval. |

## Repository Health

Working tree at latest reconstruction update:

- No auth/routing application diff remains after temporary diagnostic cleanup.
- Living documentation updates are present for the reconstruction, milestone, memory, state, changelog, implementation patterns, and engineering lessons.
- Temporary volunteer permission drift is the approved next implementation milestone; implementation has not started in this documentation handoff.

Resolved debug work: [Project Memory](./PROJECT_MEMORY.md), [Common Failures and Engineering Lessons](./COMMON_FAILURES.md), and [Current Milestone](./CURRENT_MILESTONE.md) record that temporary volunteer login diagnostic instrumentation was removed and verified.

Attention before development resumes: implement only the approved temporary volunteer permission drift milestone and avoid mixing offline or reversal decisions into that work.

## Known Assumptions

Repository evidence shows these assumptions are currently baked into implementation or docs:

- Inventory transactions are immutable and balances are derived from transaction history.
- Quantities should be positive; transaction/effect semantics determine direction.
- Browser clients are not authoritative for protected authorization decisions.
- RLS and controlled RPCs are the server/database authorization boundary.
- Temporary volunteer access is restricted, expiring, attributable, and not equivalent to permanent user roles.
- Supabase Auth is the browser session source.
- Temple selection is currently local session context; RLS remains final authorization authority.
- Offline capability is required, but queue architecture is not yet fully defined.
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
- The EOS v1.2 handbook is the canonical engineering operating system.
- The next application work should start from repository refresh, candidate approval, implementation, verification, review, living documentation update, then commit approval.

They should avoid changing:

- Inventory immutability and derived-balance rules without a new ADR.
- Authorization/RLS/RPC boundaries without explicit security review and human approval.
- Temporary volunteer permissions without resolving documented drift.
- Offline write behavior without approved architecture.
- EOS governance without implementation-driven justification.

They should plan next:

- Implement the approved temporary volunteer permission drift milestone.
- Keep the selected milestone small, independently verifiable, and reversible.
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
- [Product Vision](../../PRODUCT_VISION.md)
- [MVP Scope](../../MVP_SCOPE.md)
- [System Architecture](../../SYSTEM_ARCHITECTURE.md)
- [Inventory Architecture](../../INVENTORY_ARCHITECTURE.md)
- [Auth Architecture](../../AUTH_ARCHITECTURE.md)
