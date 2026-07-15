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
  - ../governance/AI_ENGINEERING_OPERATING_MODEL.md
  - ../process/MILESTONE_LIFECYCLE.md
  - ../process/QUALITY_GATES.md
  - ../adrs/0010-security-review-before-commit.md
  - ../architecture/README.md
---

# Next Milestone

## Purpose

This document records the top three candidate implementation micro-milestones and the single recommended candidate for human approval.

## Current Guidance

Do not use this page as a broad roadmap. It should contain three candidates when enough repository evidence exists.

Each candidate should include recommendation, rationale, confidence, estimated effort, dependencies, risk, expected value, architecture impact, security impact, and testing strategy. The recommended candidate must also include assumptions, uncertainties, and why alternatives were not recommended.

Implementation must not begin until the human approves one candidate. Commit approval remains a separate later gate.

## Status

Candidate Options

## Approval

Pending Human Approval

## Recommended Candidate

Candidate 1: Reconcile Temporary Volunteer Permission Drift.

Recommendation: Request Human Decision.

Confidence: 68%.

Rationale: Temporary volunteer permissions are the highest-priority documented security/product ambiguity. The repository shows conflict between `AUTH_ARCHITECTURE.md`, `PERMISSIONS_MATRIX.md`, mobile UI docs, current permission helpers, and workflow tests. Resolving the intended policy is the safest next blocker to clear before expanding temporary volunteer capability.

Estimated Effort: Medium.

Assumptions:

- Temporary volunteer access must remain scoped, attributable, expiring, and server-reviewable.
- Client-side permission helpers are usability signals, not final authorization.
- The next step may be decision documentation first if product/security intent is not yet explicit.

Uncertainties:

- Whether temporary volunteers should be read/session-only or allowed scoped receive, transfer, consume, and return permissions.
- Whether session type should determine operational capability.
- Whether implementation changes are safe before an explicit product/security decision.

Reasons Alternatives Were Not Recommended:

- Candidate 2 is important, but offline writes should not outrank an active authorization ambiguity.
- Candidate 3 is important, but terminology cleanup has lower immediate security impact than temporary volunteer permissions.

## Candidate 1: Reconcile Temporary Volunteer Permission Drift

Recommendation: Request Human Decision.

Rationale: Temporary volunteer permission drift is documented in [Documentation Drift](./DOCUMENTATION_DRIFT.md), [Open Decisions](./OPEN_DECISIONS.md), [Technical Debt](./TECH_DEBT.md), and [Security Status](./SECURITY_STATUS.md). Current source grants temporary volunteers operational inventory permissions, while the permissions matrix says they cannot perform those operations.

Confidence: 68%.

Estimated Effort: Medium.

Dependencies:

- Human product/security decision on intended temporary volunteer capabilities.
- Review of [ADR-0004](../adrs/0004-temporary-volunteer-session-model.md), [ADR-0007](../adrs/0007-rpc-boundaries-and-browser-trust.md), [Auth Architecture](../../AUTH_ARCHITECTURE.md), [Permissions Matrix](../../PERMISSIONS_MATRIX.md), and affected workflow tests.

Risk:

- High security risk if implementation silently expands or contracts temporary volunteer authority.
- Medium documentation risk because multiple older docs conflict.

Expected Value: Very high. Resolving this removes the main security/product ambiguity before volunteer workflow expansion.

Architecture Impact: Medium. May require a canonical permission reference, ADR update, or targeted implementation change depending on the approved decision.

Security Impact: High. Temporary volunteer authority must remain narrow and server-enforced.

Testing Strategy:

- If documentation-only decision: metadata/link review plus targeted permission evidence review.
- If implementation is approved: focused permission helper tests, affected receive/transfer/return screen tests, route/auth tests, then typecheck, lint, full tests, and build.

Expected Deliverables:

- Canonical temporary volunteer permission decision or explicitly documented unresolved decision.
- Updated affected living docs and older source docs as needed.
- No RLS/RPC or app permission behavior changes unless explicitly included in the approved milestone.

Validation Plan:

- Verify `AUTH_ARCHITECTURE.md`, `PERMISSIONS_MATRIX.md`, `DOCUMENTATION_DRIFT.md`, `OPEN_DECISIONS.md`, and source permission helpers no longer contradict the approved decision.
- Run applicable checks based on whether implementation is documentation-only or code-changing.

## Candidate 2: Define Offline Queue Architecture

Recommendation: Defer.

Rationale: Offline capability is an architectural requirement, but detailed queue storage, replay, idempotency, and conflict behavior are not yet captured in a living architecture document.

Confidence: 60%.

Estimated Effort: Medium.

Dependencies:

- Review [ADR-0005](../adrs/0005-mobile-first-offline-pwa.md), inventory repository contracts, transaction audit metadata, and current PWA behavior.
- Human approval for architecture work before implementation.

Risk:

- Medium-to-high architecture risk if offline writes proceed without canonical replay and authorization rules.
- Medium security risk because offline replay must not bypass server authorization or auditability.

Expected Value: High for future offline implementation, but less urgent than resolving current temporary volunteer authorization drift.

Architecture Impact: High. Queue boundaries, storage, replay, idempotency, and conflict handling need explicit design.

Security Impact: Medium. Offline write replay must preserve RLS/RPC boundaries and immutable audit history.

Testing Strategy:

- Architecture-only validation first.
- Future implementation should include queue unit tests, replay/idempotency tests, and integration coverage where feasible.

Expected Deliverables:

- Focused offline queue architecture/status page or ADR proposal.
- Explicit current/future separation for offline capability.
- No offline write implementation until architecture is approved.

Validation Plan:

- Confirm offline docs distinguish requirement, current implementation, and future queue work.
- Confirm architecture preserves repository boundaries and server authorization.

## Candidate 3: Canonicalize Undo/Reversal Terminology

Recommendation: Defer.

Rationale: Undo/reversal terminology drift affects inventory correction semantics, documentation, and future UI wording. The implementation already has reversal validation and compatibility migrations, but docs still use mixed language.

Confidence: 66%.

Estimated Effort: Small to Medium.

Dependencies:

- Review [ADR-0009](../adrs/0009-auditability-and-reversibility.md), inventory architecture, transaction compatibility migration, reversal validation, transaction helpers, and feature docs.

Risk:

- Medium inventory-correctness risk if terminology cleanup accidentally changes semantics.
- Low-to-medium implementation risk if kept documentation/reference-only.

Expected Value: High for maintainability and future correction workflows, but lower immediate security value than temporary volunteer permission drift.

Architecture Impact: Medium if the milestone creates a canonical transaction terminology reference; low if only documentation language is clarified.

Security Impact: Low. Main concern is auditability and inventory integrity rather than authorization.

Testing Strategy:

- Documentation/reference validation for terminology-only work.
- If code names or behavior change, run reversal validation tests, inventory service tests, typecheck, lint, full tests, and build.

Expected Deliverables:

- Canonical distinction between user-facing undo action, domain reversal event, database transaction type, and legacy compatibility.
- Updated affected docs without changing immutable ledger semantics.

Validation Plan:

- Confirm references no longer conflict on `undo` versus `reversal`.
- Confirm no historical transaction mutation or signed-quantity behavior is introduced.

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
