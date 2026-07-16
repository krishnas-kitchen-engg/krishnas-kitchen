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

Candidate 1, Refresh Living Milestone State After Security Commit, was approved for implementation.

## Recommended Candidate

Candidate 1: Refresh Living Milestone State After Security Commit.

Recommendation: Implemented, pending human review.

Strategic Alignment: Strengthens Horizon 1 evidence generation, repository health, engineering documentation, and production-readiness discipline.

Current Horizon: Horizon 1, Core Kitchen Inventory Platform.

Reason It Belongs To This Horizon: Horizon 1 includes repository architecture, testing, evidence generation, and engineering documentation.

Evidence Value: High. The milestone removes stale post-commit planning state so the next EOS cycle does not restart completed security architecture work.

Future Horizon Support Without Scope Expansion: Keeps the engineering operating system reliable before larger planning, procurement, analytics, or operations domains are added.

Implementation Note: Living planning and reconstruction references now treat `c8a4f5c docs(security): consolidate architecture ownership` as committed repository history.

Confidence: 88%.

Rationale: The repository was clean and the security architecture milestone had been committed, but multiple living docs still described it as pending review or pre-commit.

Estimated Effort: Low.

Assumptions:

- Commit `c8a4f5c` remains the latest security architecture ownership commit.
- The next application milestone should be selected only after this living-state refresh is reviewed and committed.

Uncertainties:

- Future candidate ranking may change after the next full repository reconstruction.

Reasons Alternatives Were Not Recommended:

- Candidate 2 is useful, but scanning documentation drift should not start while milestone state points at completed work.
- Candidate 3 is useful, but stack documentation drift is less urgent than correcting the current planning state.

## Candidate 1: Refresh Living Milestone State After Security Commit

Recommendation: Implemented, pending human review.

Strategic Alignment: Keeps Horizon 1 engineering documentation and evidence aligned with repository reality.

Current Horizon: Horizon 1, Core Kitchen Inventory Platform.

Reason It Belongs To This Horizon: Horizon 1 includes repository architecture, testing, evidence generation, and engineering documentation.

Rationale: The security architecture ownership milestone was committed, but current/next milestone and reconstruction references still described it as pending.

Confidence: 88%.

Estimated Effort: Low.

Dependencies:

- Latest git history.
- [Current Milestone](./CURRENT_MILESTONE.md).
- [Current State](./CURRENT_STATE.md).
- [Project Reconstruction](./PROJECT_RECONSTRUCTION.md).
- [Project Scorecard](./PROJECT_SCORECARD.md).
- [Evidence Report](./EVIDENCE_REPORT.md).

Risk:

- Low. Main risk is over-editing beyond stale milestone-state references.

Expected Value: High. Future EOS sessions start from current repository state instead of completed work.

Evidence Value: High. It directly resolves documented reconstruction drift.

Future Horizon Support Without Scope Expansion: Preserves reliable engineering state for future planning, procurement, analytics, and operations work without implementing them.

Architecture Impact: Low. It preserves architecture truth by aligning living docs to committed repository state.

Security Impact: Low. Security architecture remains unchanged; this milestone only updates planning state around the committed security architecture work.

Testing Strategy:

- Documentation/reference validation.
- Full format, typecheck, lint, test, and build before human review.

Expected Deliverables:

- Refreshed living milestone and reconstruction references.
- Updated evidence report.
- No runtime, migration, permission, RLS, RPC, Product Horizons, or application changes.

Validation Plan:

- Confirm no references still describe the security architecture milestone as pending review or pending commit.
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
