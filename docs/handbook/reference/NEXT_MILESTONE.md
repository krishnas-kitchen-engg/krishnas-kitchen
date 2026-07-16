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

Implemented for the approved candidate. Commit approved.

## Approval

Candidate 1, Record Horizon 1 Security Review Baseline, was approved for implementation.

## Recommended Candidate

Candidate 1: Record Horizon 1 Security Review Baseline.

Recommendation: Implemented and approved for commit.

Strategic Alignment: Strengthens Horizon 1 security posture, evidence generation, repository health, engineering documentation, and production-readiness discipline.

Current Horizon: Horizon 1, Core Kitchen Inventory Platform.

Reason It Belongs To This Horizon: Horizon 1 includes RLS/RPC foundations, temporary volunteer access, inventory workflows, evidence generation, and engineering documentation.

Evidence Value: High. The milestone records the latest security review baseline so future sensitive work starts from explicit findings instead of an unrecorded posture gap.

Future Horizon Support Without Scope Expansion: Keeps authorization, audit, and offline replay constraints visible before larger planning, procurement, analytics, or operations domains are added.

Implementation Note: Security Status now records the 2026-07-16 Horizon 1 security review baseline and clarifies that it is not production security approval.

Confidence: 87%.

Rationale: Security architecture is canonicalized, but living docs still recorded the absence of a latest full security review result as a known risk.

Estimated Effort: Low.

Assumptions:

- The review can be recorded from repository evidence without changing application code.
- The review baseline should not imply production readiness or authorize temporary volunteer write capability.

Uncertainties:

- Future candidate ranking may change after the next full repository reconstruction and verification cycle.

Reasons Alternatives Were Not Recommended:

- Candidate 2 is useful, but scanning documentation drift is less urgent than closing the explicit security-review evidence gap.
- Candidate 3 is useful, but stack documentation drift does not de-risk security-sensitive Horizon 1 work as directly.

## Candidate 1: Record Horizon 1 Security Review Baseline

Recommendation: Implemented and approved for commit.

Strategic Alignment: Keeps Horizon 1 security posture and evidence aligned with repository reality.

Current Horizon: Horizon 1, Core Kitchen Inventory Platform.

Reason It Belongs To This Horizon: Horizon 1 includes auth/RLS/RPC foundations, inventory authorization, temporary volunteer access, evidence generation, and engineering documentation.

Rationale: Security architecture ownership is consolidated, but the latest full security review result still needed to be recorded before security-sensitive follow-up work.

Confidence: 87%.

Estimated Effort: Low.

Dependencies:

- [Security Architecture](../architecture/security.md).
- [Security Status](./SECURITY_STATUS.md).
- [Auth Architecture](../../AUTH_ARCHITECTURE.md).
- [Permissions Matrix](../../PERMISSIONS_MATRIX.md).
- Supabase migrations under `infra/supabase/migrations`.
- [Current Milestone](./CURRENT_MILESTONE.md).
- [Current State](./CURRENT_STATE.md).
- [Project Reconstruction](./PROJECT_RECONSTRUCTION.md).
- [Project Scorecard](./PROJECT_SCORECARD.md).
- [Evidence Report](./EVIDENCE_REPORT.md).

Risk:

- Low. Main risk is overstating baseline review as production approval or expanding into RLS/RPC implementation.

Expected Value: High. Future EOS sessions start from an explicit Horizon 1 security posture baseline instead of an unrecorded review gap.

Evidence Value: High. It directly resolves the documented absence of latest full security review results.

Future Horizon Support Without Scope Expansion: Preserves authorization and audit constraints for future planning, procurement, analytics, and operations work without implementing them.

Architecture Impact: Low. It records current architecture/security posture without changing boundaries.

Security Impact: Medium documentation/evidence impact. Runtime security remains unchanged; review findings become explicit.

Testing Strategy:

- Documentation/reference validation.
- Full format, typecheck, lint, test, and build before human review.

Expected Deliverables:

- Recorded Horizon 1 security review baseline.
- Refreshed affected living milestone, state, reconstruction, scorecard, memory, lessons, and evidence references.
- Updated evidence report.
- No runtime, migration, permission, RLS, RPC, Product Horizons, or application changes.

Validation Plan:

- Confirm no references still describe latest full security review results as unrecorded.
- Confirm no source, migration, policy, permission, RPC, Product Horizons, or runtime behavior changed.

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

Evidence Value: Medium. It would reduce workflow-boundary drift but is less urgent than correcting completed milestone state.

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

Expected Value: Medium-low. It improves onboarding and architecture reconstruction, but is less urgent than current milestone-state accuracy.

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
