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
  - ../architecture/security.md
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

Implemented for the approved candidate. Human review pending.

## Approval

Candidate 1, Consolidate Security Architecture Ownership, was approved for implementation.

## Recommended Candidate

Candidate 1: Consolidate Security Architecture Ownership.

Recommendation: Implemented, pending human review.

Strategic Alignment: Strengthens Horizon 1 production readiness by giving auth, permission, RLS, RPC, temporary volunteer, inventory auditability, and offline replay security boundaries one canonical living architecture source.

Current Horizon: Horizon 1, Core Kitchen Inventory Platform.

Reason It Belongs To This Horizon: Horizon 1 includes authentication, role-based permissions, temporary volunteers, security, RLS, RPC boundaries, audit trail, repository architecture, testing, and engineering documentation.

Evidence Value: High. The milestone resolves the gap between existing security evidence and the absence of one durable security architecture owner.

Future Horizon Support Without Scope Expansion: Keeps future planning, procurement, analytics, and operations capabilities compatible with clear authorization boundaries while explicitly excluding higher-horizon implementation.

Implementation Note: Security architecture now has a living architecture source without changing runtime behavior, permissions, migrations, RLS policies, RPCs, or repository contracts.

Confidence: 82%.

Rationale: Security ownership was the remaining active open decision and is a prerequisite for safe future volunteer write capability, offline replay, and production hardening.

Estimated Effort: Low to medium.

Assumptions:

- Existing ADRs, security status, auth docs, permissions docs, Supabase docs, and migrations accurately represent the current security boundary.
- Security Status remains posture/review tracking, while Security Architecture owns durable architecture.
- Future write paths and offline replay require separate approval and enforcement work.

Uncertainties:

- Latest full security review results are not recorded and remain future work.
- Production hardening may identify additional RLS/RPC policy gaps.

Reasons Alternatives Were Not Recommended:

- Candidate 2 is useful, but scanning documentation overlap is less foundational than security ownership.
- Candidate 3 is useful, but stack documentation drift has lower security and production-readiness impact.

## Candidate 1: Consolidate Security Architecture Ownership

Recommendation: Implemented, pending human review.

Strategic Alignment: Consolidates Horizon 1 authorization knowledge before production hardening.

Current Horizon: Horizon 1, Core Kitchen Inventory Platform.

Reason It Belongs To This Horizon: Horizon 1 includes authentication, role-based permissions, temporary volunteers, security, RLS, RPC boundaries, and engineering documentation.

Rationale: Security status was distributed across auth architecture, permissions, Supabase docs, ADRs, migrations, and status references. A living security architecture page reduces future authorization and RLS drift.

Confidence: 82%.

Estimated Effort: Low to medium.

Dependencies:

- [Security Status](./SECURITY_STATUS.md)
- [Auth Architecture](../../AUTH_ARCHITECTURE.md)
- [Permissions Matrix](../../PERMISSIONS_MATRIX.md)
- [Supabase README](../../../infra/supabase/README.md)
- ADR-0003, ADR-0004, ADR-0007, ADR-0010
- Current Supabase migrations

Risk:

- Medium documentation/security risk if the page overstates implemented guarantees.

Expected Value: High before future volunteer write capability or offline replay implementation.

Evidence Value: High. Security architecture ownership consolidates existing RLS/RPC/auth evidence before production hardening.

Future Horizon Support Without Scope Expansion: Makes later procurement, planning, analytics, and operations features safer to authorize without implementing those future capabilities now.

Architecture Impact: Medium.

Security Impact: Medium.

Testing Strategy:

- Documentation/reference validation.
- Full format, typecheck, lint, test, and build before human review.

Expected Deliverables:

- Canonical security architecture page.
- Updated affected living docs without changing runtime behavior, permissions, migrations, policies, RPCs, or repository contracts.

Validation Plan:

- Confirm references no longer describe security architecture ownership as absent.
- Confirm no source, migration, policy, permission, RPC, or runtime behavior changed.

## Candidate 2: Canonicalize Scanning Architecture Boundary

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

Evidence Value: Medium. It would reduce workflow-boundary drift but is less foundational than security ownership.

Future Horizon Support Without Scope Expansion: Leaves future operational workflows with a cleaner scan boundary while avoiding menu planning, kitchen planning, and analytics scope.

Architecture Impact: Medium.

Security Impact: Low.

Testing Strategy:

- Documentation/reference validation.
- No code verification unless implementation scope changes.

## Candidate 3: Reconcile Stack Documentation Against Package Manifests

Recommendation: Defer.

Strategic Alignment: Keeps Horizon 1 repository architecture and onboarding guidance aligned with repository reality.

Current Horizon: Horizon 1, Core Kitchen Inventory Platform.

Reason It Belongs To This Horizon: Horizon 1 includes repository architecture, testing, evidence generation, and engineering documentation.

Rationale: Stack documentation lists dependencies that package manifests do not show.

Confidence: 70%.

Estimated Effort: Low.

Dependencies:

- Review root and app package manifests, system architecture docs, and handbook stack references.

Risk:

- Low documentation risk; the main risk is mistaking planned dependencies for implemented dependencies.

Expected Value: Medium-low. It improves onboarding and architecture reconstruction, but has lower production-readiness impact than security ownership.

Evidence Value: Medium-low. It reduces false assumptions but does not directly harden runtime behavior.

Future Horizon Support Without Scope Expansion: Gives future contributors accurate dependency truth before larger product domains are added.

Architecture Impact: Low.

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
- [Security Architecture](../architecture/security.md)
