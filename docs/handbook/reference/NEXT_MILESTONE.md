---
title: Next Milestone
status: active
doc_type: reference
lifecycle: living
owner: engineering
update_cadence: when candidate implementation milestones change, are approved, are rejected, or are replaced
last_reviewed: null
related:
  - ./README.md
  - ./CURRENT_MILESTONE.md
  - ./PROJECT_MEMORY.md
  - ./IMPLEMENTATION_PATTERNS.md
  - ./COMMON_FAILURES.md
  - ./OPEN_DECISIONS.md
  - ./TECH_DEBT.md
  - ../../PRODUCT_HORIZONS.md
  - ../governance/AI_ENGINEERING_OPERATING_MODEL.md
  - ../process/MILESTONE_LIFECYCLE.md
  - ../process/QUALITY_GATES.md
  - ../adrs/0010-security-review-before-commit.md
  - ../architecture/README.md
  - ../architecture/offline-sync.md
---

# Next Milestone

## Purpose

This document records the top three candidate implementation micro-milestones and the single recommended candidate for human approval.

## Current Guidance

Do not use this page as a broad roadmap. It should contain three candidates when enough repository evidence exists.

Each candidate should include strategic alignment, current horizon, reason it belongs to that horizon, evidence value, how it supports future horizons without expanding scope, recommendation, rationale, confidence, estimated effort, dependencies, risk, expected value, architecture impact, security impact, and testing strategy. The recommended candidate must also include assumptions, uncertainties, and why alternatives were not recommended.

Candidate milestones must come from the active horizon in [Product Horizons](../../PRODUCT_HORIZONS.md). Work outside the active horizon must be rejected automatically and explained, not recommended.

Implementation must not begin until the human approves one candidate. Commit approval remains a separate later gate.

## Status

Implemented and verified for the approved candidate. Human review pending.

## Approval

Candidate 1, Define Offline Queue Architecture, was approved for implementation.

## Recommended Candidate

Candidate 1: Define Offline Queue Architecture.

Recommendation: Implemented, pending human review.

Strategic Alignment: Strengthens Horizon 1 production readiness by defining the offline-ready architecture required for trustworthy inventory workflows.

Current Horizon: Horizon 1, Core Kitchen Inventory Platform.

Reason It Belongs To This Horizon: Horizon 1 includes mobile-first PWA, offline-ready architecture, audit trail, repository architecture, testing, and engineering documentation.

Evidence Value: High. The milestone resolves the gap between offline-ready architecture requirements and the absence of a canonical queue/replay boundary.

Future Horizon Support Without Scope Expansion: Keeps future kitchen operations and intelligence features compatible with offline inventory evidence while explicitly excluding queue implementation, planning, forecasting, and analytics scope.

Implementation Note: Offline sync now has a living architecture source that defines current non-implementation status, future queue boundary, replay/idempotency requirements, conflict policy, audit metadata, and security constraints without changing runtime behavior.

Confidence: 78%.

Rationale: Offline capability is required by ADR and product architecture, and source already contains PWA tooling plus offline-safe inventory metadata. The missing piece was a canonical architecture boundary before any queue or replay implementation.

Estimated Effort: Medium.

Assumptions:

- Offline writes should enter through inventory domain validation and repository boundaries.
- Server/database authorization must remain authoritative at replay time.
- Future queue storage, replay workers, and server idempotency constraints require separate approval.

Uncertainties:

- The exact local storage mechanism, background sync mechanism, and server idempotency implementation are intentionally unresolved for future implementation milestones.

Reasons Alternatives Were Not Recommended:

- Candidate 2 is important, but security architecture ownership can follow this milestone because the offline page already preserves server/RLS/RPC authority without changing the security model.
- Candidate 3 is useful, but scanning documentation overlap is less blocking than queue/replay/idempotency architecture.

## Candidate 1: Define Offline Queue Architecture

Recommendation: Implemented, pending human review.

Strategic Alignment: Defines an offline architecture prerequisite for production-grade Horizon 1 inventory workflows.

Current Horizon: Horizon 1, Core Kitchen Inventory Platform.

Reason It Belongs To This Horizon: Horizon 1 includes mobile-first PWA, offline-ready architecture, audit trail, repository architecture, testing, and engineering documentation.

Rationale: Offline capability is an architectural requirement, but detailed queue storage, replay, idempotency, conflict, and authorization behavior were not captured in a living architecture document.

Confidence: 78%.

Estimated Effort: Medium.

Dependencies:

- Review [ADR-0005](../adrs/0005-mobile-first-offline-pwa.md), inventory repository contracts, transaction audit metadata, current PWA behavior, and Supabase/RPC boundaries.

Risk:

- Medium architecture/security risk if future offline writes proceed without replay and authorization rules.
- Low implementation risk because the completed slice is documentation/reference-only.

Expected Value: High. Future offline implementation now has a canonical boundary and constraints.

Evidence Value: High. It converts existing PWA tooling, offline-safe transaction metadata, and repository-boundary evidence into a verifiable architecture source.

Future Horizon Support Without Scope Expansion: Preserves a clean sync boundary for future operational planning and analytics while keeping implementation limited to Horizon 1 offline-ready architecture documentation.

Architecture Impact: High. A living offline-sync architecture page now defines queue and replay boundaries.

Security Impact: Medium. Offline replay must not bypass server authorization or auditability.

Testing Strategy:

- Documentation/reference validation.
- Full format, typecheck, lint, test, and build before human review.

Expected Deliverables:

- Canonical offline sync architecture.
- Updated affected living docs without changing runtime behavior, permissions, migrations, or repository contracts.

Validation Plan:

- Confirm references no longer describe offline architecture as absent.
- Confirm no source, migration, or runtime behavior changed.

## Candidate 2: Consolidate Security Architecture Ownership

Recommendation: Defer.

Strategic Alignment: Consolidates Horizon 1 authorization knowledge before production hardening.

Current Horizon: Horizon 1, Core Kitchen Inventory Platform.

Reason It Belongs To This Horizon: Horizon 1 includes authentication, role-based permissions, temporary volunteers, security, RLS, RPC boundaries, and engineering documentation.

Rationale: Security status is distributed across auth architecture, permissions, Supabase docs, ADRs, migrations, and status references. A living security architecture page would reduce future authorization and RLS drift.

Confidence: 62%.

Estimated Effort: Medium.

Dependencies:

- Review [Security Status](./SECURITY_STATUS.md), [Auth Architecture](../../AUTH_ARCHITECTURE.md), [Permissions Matrix](../../PERMISSIONS_MATRIX.md), [Supabase README](../../../infra/supabase/README.md), ADR-0003, ADR-0004, ADR-0007, ADR-0010, and current migrations.

Risk:

- Medium documentation/security risk if the page overstates implemented guarantees.

Expected Value: High before future volunteer write capability or offline replay implementation.

Evidence Value: High. Security architecture ownership would consolidate existing RLS/RPC/auth evidence before production hardening.

Future Horizon Support Without Scope Expansion: Makes later procurement, planning, and analytics safer to authorize without implementing those future capabilities now.

Architecture Impact: Medium.

Security Impact: Medium.

Testing Strategy:

- Documentation/reference validation.
- No code verification unless implementation scope changes.

## Candidate 3: Canonicalize Scanning Architecture Boundary

Recommendation: Defer.

Strategic Alignment: Clarifies Horizon 1 scan-first inventory workflow ownership.

Current Horizon: Horizon 1, Core Kitchen Inventory Platform.

Reason It Belongs To This Horizon: Horizon 1 includes inventory workflows, barcode lookup, barcode catalog, unknown barcode workflow, inventory visibility, and mobile-first PWA.

Rationale: Camera scanning and barcode scanning docs overlap in workflow ownership and duplicate scan handling.

Confidence: 61%.

Estimated Effort: Medium.

Dependencies:

- Review camera scanning docs, barcode scanning docs, receive/transfer/return scan workflow docs, scan services, and unknown barcode handling.

Risk:

- Medium documentation risk if the slice expands into runtime scanner behavior or offline lookup semantics.

Expected Value: Medium for future scan workflow implementation.

Evidence Value: Medium. It would reduce workflow-boundary drift but is less blocking than security and offline implementation prerequisites.

Future Horizon Support Without Scope Expansion: Leaves future operational workflows with a cleaner scan boundary while avoiding menu planning, kitchen planning, and analytics scope.

Architecture Impact: Medium.

Security Impact: Low.

Testing Strategy:

- Documentation/reference validation.
- No code verification unless implementation scope changes.

## Owner

Engineering owns this document.

## Update Cadence

Update when candidate implementation milestones change, are approved, are rejected, or are replaced.

## Lifecycle

This is living documentation.

## Related Documents

- [Current Milestone](./CURRENT_MILESTONE.md)
- [Project Memory](./PROJECT_MEMORY.md)
- [Implementation Patterns](./IMPLEMENTATION_PATTERNS.md)
- [Common Failures and Engineering Lessons](./COMMON_FAILURES.md)
- [Open Decisions](./OPEN_DECISIONS.md)
- [Technical Debt](./TECH_DEBT.md)
- [AI Engineering Operating Model](../governance/AI_ENGINEERING_OPERATING_MODEL.md)
- [Milestone Lifecycle](../process/MILESTONE_LIFECYCLE.md)
- [Quality Gates](../process/QUALITY_GATES.md)
