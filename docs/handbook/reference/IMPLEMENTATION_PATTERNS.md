---
title: Implementation Patterns
status: active
doc_type: reference
lifecycle: living
owner: engineering
update_cadence: when reusable implementation patterns are discovered, changed, or retired
last_reviewed: null
related:
  - ./README.md
  - ./PROJECT_MEMORY.md
  - ./COMMON_FAILURES.md
  - ./ARCHITECTURAL_INVARIANTS.md
  - ../governance/AI_ENGINEERING_OPERATING_MODEL.md
  - ../architecture/security.md
  - ../adrs/0006-repository-pattern.md
  - ../adrs/0008-domain-driven-package-organization.md
---

# Implementation Patterns

## Purpose

This document records reusable implementation patterns and conventions that future application work should follow.

Keep this page concise. Link to ADRs, architecture docs, source files, and tests instead of restating implementation details.

## Patterns

| Pattern | Guidance | References |
|---|---|---|
| Repository-first work | Read current docs, code, tests, migrations, and git status before implementation. | [AI Engineering Operating Model](../governance/AI_ENGINEERING_OPERATING_MODEL.md) |
| Session Controller | Use the Session Controller as the canonical execution workflow. Reconstruct every session, then continue from the appropriate controller state when repository evidence shows an interrupted workflow. | [AI Engineering Operating Model](../governance/AI_ENGINEERING_OPERATING_MODEL.md), [Repository Refresh Protocol](../governance/REPOSITORY_REFRESH_PROTOCOL.md) |
| Evidence Capture | After successful verification and before Ready For Human Review, identify lessons, patterns, Project Memory needs, required living-doc updates, and evidence that may later qualify for promotion. Do not add a separate evidence state. | [AI Engineering Operating Model](../governance/AI_ENGINEERING_OPERATING_MODEL.md) |
| Active-horizon milestone selection | Recommend implementation milestones only from the active horizon in Product Horizons. Future horizons may influence architecture, but not implementation scope. | [Product Horizons](../../PRODUCT_HORIZONS.md), [AI Engineering Operating Model](../governance/AI_ENGINEERING_OPERATING_MODEL.md) |
| Domain before UI | Keep core domain rules in `apps/web/src/domains`; keep user-facing workflows in `apps/web/src/features`. | [ADR-0008](../adrs/0008-domain-driven-package-organization.md) |
| Repository boundary | UI and application services should depend on repository contracts, not raw persistence details. | [ADR-0006](../adrs/0006-repository-pattern.md) |
| Supabase boundary | Browser code must not treat client-side permission checks as authoritative. Use RLS/RPC boundaries for protected data. | [ADR-0003](../adrs/0003-supabase-auth-and-rls-boundary.md), [ADR-0007](../adrs/0007-rpc-boundaries-and-browser-trust.md) |
| Security architecture ownership | Durable auth, permission, RLS, RPC, temporary volunteer, inventory auditability, and offline replay security boundaries belong in Security Architecture. Use Security Status for posture and review evidence. | [Security Architecture](../architecture/security.md), [Security Status](./SECURITY_STATUS.md) |
| Security review baseline | Record security review scope, findings, required changes, and approval status in Security Status before security-sensitive follow-up work. Do not treat a baseline as production security approval. | [Security Status](./SECURITY_STATUS.md), [ADR-0010](../adrs/0010-security-review-before-commit.md) |
| Permission drift reconciliation | When permission docs, helpers, and tests conflict, first identify the approved product/security policy, then align only the affected sources. Do not treat existing helper behavior as authoritative for server authorization. | [Documentation Drift](./DOCUMENTATION_DRIFT.md), [Open Decisions](./OPEN_DECISIONS.md), [Security Status](./SECURITY_STATUS.md) |
| Permission-sensitive tests | Set exact permission arrays in auth fixtures and add a direct helper test near the permission source so broad fixture defaults cannot mask restricted-session behavior. | `apps/web/src/features/auth/lib/permissions.test.ts`, [Current Milestone](./CURRENT_MILESTONE.md) |
| Inventory changes | Inventory-changing work must preserve immutable transactions, positive quantities, derived balances, and reversibility. | [Architectural Invariants](./ARCHITECTURAL_INVARIANTS.md) |
| Inventory correction terminology | Use `undo` for the user-facing action and service operation. Use `reversal` for the domain event and current persisted correction transaction type. Treat legacy persisted `undo` rows as read-compatible history only. | [Inventory Architecture](../../INVENTORY_ARCHITECTURE.md), [ADR-0009](../adrs/0009-auditability-and-reversibility.md) |
| Return transaction semantics | Create current returns as `transactionType: "returned"` with `quantityEffect: "transfer"`, source location, destination location, and positive quantity. Treat `returned` plus `increase` as migration compatibility only. | [Inventory Architecture](../../INVENTORY_ARCHITECTURE.md), [ADR-0002](../adrs/0002-positive-quantities-and-quantity-effects.md), `apps/web/src/domains/inventory/domain/transactionHelpers.ts` |
| Offline sync boundary | Future offline writes must store validated inventory drafts, preserve audit/client request metadata, replay through repository/server boundaries, remain idempotent, and fail closed on authorization or conflict errors. | [Offline Sync Architecture](../architecture/offline-sync.md), [ADR-0005](../adrs/0005-mobile-first-offline-pwa.md), `apps/web/src/domains/inventory/application/inventoryRepository.ts` |
| Diagnostic cleanup | Temporary diagnostic logging in auth, routing, security, or inventory flows should be removed or converted to an explicit approved observability pattern before commit readiness. Verify with targeted search and scoped diff review. | [Common Failures and Engineering Lessons](./COMMON_FAILURES.md), [AI Engineering Operating Model](../governance/AI_ENGINEERING_OPERATING_MODEL.md) |
| Living docs | Update only living docs affected by the approved milestone. Do not expand handbook infrastructure unless stewardship rules allow it. | [Handbook Stewardship](../roadmap.md) |
| Milestone state refresh | After a milestone completes, refresh current milestone, next milestone, scorecard, and limitation references before treating the next planning cycle as current. | [Current Milestone](./CURRENT_MILESTONE.md), [Next Milestone](./NEXT_MILESTONE.md), [Project Scorecard](./PROJECT_SCORECARD.md) |
| Post-commit state refresh | If a committed milestone remains described as pending in living docs, update only the stale planning and reconstruction references before starting new product work. | [Current Milestone](./CURRENT_MILESTONE.md), [Project Reconstruction](./PROJECT_RECONSTRUCTION.md), [Evidence Report](./EVIDENCE_REPORT.md) |
| Verification | Use scoped checks during repair, then full typecheck, lint, tests, and build before commit readiness for implementation milestones. | [Quality Gates](../process/QUALITY_GATES.md), [Definition of Done](../process/DEFINITION_OF_DONE.md) |

## Owner

Engineering owns this document.

## Update Cadence

Update when repeated implementation work reveals a reusable pattern or an existing pattern becomes stale.

## Lifecycle

This is living documentation.

## Related Documents

- [Project Memory](./PROJECT_MEMORY.md)
- [Common Failures and Engineering Lessons](./COMMON_FAILURES.md)
- [Architectural Invariants](./ARCHITECTURAL_INVARIANTS.md)
- [AI Engineering Operating Model](../governance/AI_ENGINEERING_OPERATING_MODEL.md)
- [Security Architecture](../architecture/security.md)
- [ADR-0006: Repository Pattern](../adrs/0006-repository-pattern.md)
- [ADR-0008: Domain-Driven Package Organization](../adrs/0008-domain-driven-package-organization.md)
