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

Implemented, verified, human-approved, and committed for the approved candidate.

## Approval

Candidate 1, Recipe Scaling Domain Foundation, was approved for implementation.

## Recommended Candidate

Candidate 1: Recipe Scaling Domain Foundation.

Recommendation: Implemented, verified, human-approved, and committed.

Strategic Alignment: Advances Horizon 1 recipe work from validated definitions to deterministic serving-based quantity scaling.

Current Horizon: Horizon 1, Core Kitchen Inventory Platform.

Reason It Belongs To This Horizon: Horizon 1 explicitly includes recipe scaling.

Evidence Value: High. It proves the recipe domain can scale quantities before availability or shopping-list logic is added.

Future Horizon Support Without Scope Expansion: Gives future availability, shopping-list, planning, and forecasting work a tested quantity contract while implementing only active Horizon 1 scaling.

Confidence: 88%.

Rationale: Recipe scaling is the smallest next Horizon 1 recipe step after the definition foundation.

Estimated Effort: Medium-low.

Assumptions:

- Scaling should preserve exact ingredient units and only change quantities.
- Six-decimal rounding is sufficient for the current domain foundation.

Uncertainties:

- Future recipe availability may need explicit unit conversion rules.

Reasons Alternatives Were Not Recommended:

- Candidate 2 is useful, but availability is cleaner after scaling exists because availability often depends on a target serving count.
- Candidate 3 is useful, but shopping-list generation should follow availability so it does not invent a parallel shortage model.

## Candidate 1: Recipe Scaling Domain Foundation

Recommendation: Implemented, verified, human-approved, and committed.

Strategic Alignment: Adds deterministic serving-based quantity scaling to the Horizon 1 recipe domain.

Current Horizon: Horizon 1, Core Kitchen Inventory Platform.

Reason It Belongs To This Horizon: Horizon 1 includes recipe scaling.

Rationale: The repository now has validated recipe definitions but no scaling logic. A pure domain slice can add scaling without UI, persistence, availability, or shopping-list decisions.

Confidence: 88%.

Estimated Effort: Medium-low.

Dependencies:

- Existing recipe definition domain.
- [Product Horizons](../../PRODUCT_HORIZONS.md).
- [ADR-0008](../adrs/0008-domain-driven-package-organization.md).

Risk:

- Low. Decimal precision is explicit; unit conversion remains intentionally outside scope.

Expected Value: High. Establishes the target-serving quantity contract that later availability and shopping-list work can build on.

Evidence Value: High. Demonstrates recipe scaling can remain pure and deterministic without UI, schema, permissions, or higher-horizon expansion.

Future Horizon Support Without Scope Expansion: Creates a quantity-scaling primitive future planning and forecasting can consume later, while deferring those higher-horizon workflows.

Architecture Impact: Low. Expands the existing `recipes` domain without crossing feature, app, or persistence boundaries.

Security Impact: Low. No new protected data access, browser trust boundary, RLS/RPC, or permission behavior is introduced.

Testing Strategy:

- Focused recipe domain scaling tests.
- Full format, typecheck, lint, test, build, and diff whitespace verification before human review.

Expected Deliverables:

- Recipe scaling helper.
- Documented recipe quantity decimal precision.
- Recipe domain barrel export.
- Focused tests.
- Updated required living docs and evidence report.

Validation Plan:

- Confirm no recipe UI, route, persistence, migration, RLS/RPC, permission, shopping-list, availability, unit-conversion, menu-planning, procurement, or analytics behavior was added.
- Run focused recipe tests and full verification suite.

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
