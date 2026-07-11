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

Candidate 1: Resolve temporary volunteer login diagnostic work.

Recommendation: Request Human Decision.

Confidence: 72%.

Rationale: This candidate addresses the current dirty worktree in auth/routing files before new application development. It is narrow, reversible, and removes ambiguity around temporary volunteer login diagnostics.

Estimated Effort: Small.

Assumptions:

- The debug instrumentation was temporary and should not remain as-is.
- The affected flow is temporary volunteer login/navigation.
- No permission-model change is intended.

Uncertainties:

- Whether the debug logs reveal an actual behavior bug or only unfinished diagnostics.
- Whether the current dirty files are user-owned work that should be preserved.

Reasons Alternatives Were Not Recommended:

- Candidate 2 is valuable but should follow cleanup of the current dirty auth/routing work.
- Candidate 3 is important but has broader architecture dependencies and lower implementation readiness.

## Candidate 1: Resolve Temporary Volunteer Login Diagnostic Work

Recommendation: Request Human Decision.

Rationale: The current working tree contains temporary volunteer login and navigation debug instrumentation in auth/routing files. Resolving that state is the smallest safe step before new application development.

Confidence: 72%.

Estimated Effort: Small.

Dependencies:

- Human approval of this candidate.
- Review of current dirty worktree changes before editing.
- Relevant auth, route, and temporary volunteer session tests.
- Security review because the area touches authentication/session flow.

Risk:

- Auth/session flow is security-sensitive.
- Current dirty worktree changes may be user work and must be preserved unless the user approves changing them.
- Temporary volunteer permissions are documented as drift and must not be silently redefined.

Expected Value: High. This clears the current dirty auth/routing state before new application work and reduces risk of mixing unrelated changes.

Architecture Impact: Low if limited to diagnostic cleanup or narrowly restoring intended behavior. Stop if a session model or permission boundary change is required.

Security Impact: Medium because authentication/session flow is involved. Security review is required before commit readiness.

Testing Strategy:

- Review existing auth, route guard, and temporary volunteer session tests.
- Add or adjust only focused tests required by the approved implementation.
- Run relevant scoped tests, then typecheck, lint, full tests, and build before commit readiness.

Expected Deliverables:

- Clean temporary volunteer login/navigation behavior.
- No stray debug logging unless explicitly approved as a diagnostic artifact.
- Updated or confirmed tests for affected auth/routing behavior.
- Living documentation updates only if behavior, risk, or milestone status changes.

Validation Plan:

- Run relevant auth and route tests.
- Run typecheck, lint, full tests, and build before commit readiness if implementation is approved.
- Manually validate temporary volunteer login/navigation if required by the implemented change.

## Candidate 2: Reconcile Temporary Volunteer Permission Drift

Recommendation: Defer.

Rationale: Temporary volunteer permission drift is high-value and security-sensitive, but it should not be mixed with unresolved dirty auth/routing diagnostic work.

Confidence: 64%.

Estimated Effort: Medium.

Dependencies:

- Review [Documentation Drift](./DOCUMENTATION_DRIFT.md), [Open Decisions](./OPEN_DECISIONS.md), [Auth Architecture](../../AUTH_ARCHITECTURE.md), and [Permissions Matrix](../../PERMISSIONS_MATRIX.md).
- Human product/security decision on intended temporary volunteer capabilities.

Risk:

- High security risk if permissions are changed without explicit decision authority.
- Existing docs conflict and cannot be silently reconciled by implementation.

Expected Value: High. Resolving permission drift would reduce security ambiguity and make volunteer work safer to extend.

Architecture Impact: Medium. May require canonical permission documentation or an ADR before code changes.

Security Impact: High. Temporary volunteer access must remain narrow, server-derived, and reviewable.

Testing Strategy:

- No implementation tests until product/security decision is approved.
- If later approved for implementation, run permission/RLS/RPC tests and full verification.

Why Not Recommended Now:

- It depends on a human product/security decision.
- It should follow cleanup or ownership resolution for the current dirty auth/routing worktree.

Expected Deliverables:

- Canonical temporary volunteer permission decision or documented unresolved decision.
- Updated living docs and affected references if approved.
- No RLS/RPC or app permission changes without explicit implementation approval.

## Candidate 3: Define Offline Queue Architecture

Recommendation: Defer.

Rationale: Offline queue architecture is a known gap, but implementation readiness is lower because storage, replay, idempotency, and conflict behavior need focused design before code.

Confidence: 58%.

Estimated Effort: Medium.

Dependencies:

- Review [ADR-0005](../adrs/0005-mobile-first-offline-pwa.md), inventory repository boundaries, and current PWA/offline behavior.
- Human approval for architecture work before implementation.

Risk:

- Medium-to-high architecture risk if offline writes proceed without a canonical queue design.
- Could affect repository contracts, persistence behavior, and retry/idempotency assumptions.

Expected Value: Medium to high. Offline architecture is important, but current implementation readiness is lower than auth/routing cleanup.

Architecture Impact: High. Queue storage, replay, idempotency, conflict handling, and repository boundaries need explicit design.

Security Impact: Medium. Offline write replay must not bypass server authorization or auditability.

Testing Strategy:

- Architecture-only validation first.
- Later implementation should include unit tests for queue behavior and integration tests for replay/idempotency where feasible.

Why Not Recommended Now:

- It requires architecture approval before implementation.
- It has broader dependencies and lower confidence than resolving current dirty auth/routing work.

Expected Deliverables:

- Focused offline queue architecture proposal or living architecture update.
- Explicit storage, replay, idempotency, and conflict assumptions.
- No offline write implementation until architecture is approved.

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
