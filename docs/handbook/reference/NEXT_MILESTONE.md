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

Candidate 1, Recipe Definition Domain Foundation, was approved for implementation.

## Recommended Candidate

Candidate 1: Recipe Definition Domain Foundation.

Recommendation: Implemented, verified, human-approved, and committed.

Strategic Alignment: Opens Horizon 1 recipe work with a tested domain contract before UI, persistence, availability, scaling, or shopping-list workflows are added.

Current Horizon: Horizon 1, Core Kitchen Inventory Platform.

Reason It Belongs To This Horizon: Horizon 1 explicitly includes recipe definitions, recipe scaling, ingredient availability checks, and shopping list generation.

Evidence Value: High. It proves the recipe domain can reuse existing inventory item/unit concepts without expanding into workflow or persistence scope.

Future Horizon Support Without Scope Expansion: Gives future menu planning, forecasting, and operations horizons a stable recipe-definition vocabulary while implementing only the active Horizon 1 foundation.

Confidence: 88%.

Rationale: Recipe definitions are the smallest Horizon 1 step that creates forward product value while preserving current inventory and security behavior.

Estimated Effort: Medium-low.

Assumptions:

- Recipe ingredients should reference existing inventory items through `EntityId`.
- Recipe ingredient units should reuse the existing shared `ItemUnit` vocabulary.

Uncertainties:

- Future persistence may require additional recipe identity, organization, temple, authoring, and archival fields.

Reasons Alternatives Were Not Recommended:

- Candidate 2 is useful, but scanning documentation cleanup is documentation-only and lower product-evidence value than starting the next Horizon 1 recipe capability.
- Candidate 3 is useful, but stack documentation reconciliation improves onboarding more than it advances the active product horizon.

## Candidate 1: Recipe Definition Domain Foundation

Recommendation: Implemented, verified, human-approved, and committed.

Strategic Alignment: Starts Horizon 1 recipe functionality with a small tested domain foundation.

Current Horizon: Horizon 1, Core Kitchen Inventory Platform.

Reason It Belongs To This Horizon: Horizon 1 includes recipe definitions, recipe scaling, ingredient availability checks, and shopping list generation.

Rationale: The repository has mature inventory item/unit concepts but no recipe domain source. A pure domain slice creates the first recipe contract without forcing UI or database decisions.

Confidence: 88%.

Estimated Effort: Medium-low.

Dependencies:

- [Product Horizons](../../PRODUCT_HORIZONS.md).
- `packages/types/src/index.ts`.
- `packages/utils/src/index.ts`.
- `apps/web/src/domains/inventory`.
- [ADR-0008](../adrs/0008-domain-driven-package-organization.md).

Risk:

- Medium-low. Future persistence may require additional fields, but pure validation keeps the current blast radius small.

Expected Value: High. Establishes the first recipe domain contract that later Horizon 1 recipe scaling, availability, and shopping-list work can build on.

Evidence Value: High. Demonstrates recipe work can begin safely inside Horizon 1 without UI, schema, permissions, or higher-horizon expansion.

Future Horizon Support Without Scope Expansion: Creates a vocabulary future planning and forecasting can consume later, while deferring those higher-horizon workflows.

Architecture Impact: Low-medium. Adds a new `recipes` domain alongside `inventory` without crossing feature, app, or persistence boundaries.

Security Impact: Low. No new protected data access, browser trust boundary, RLS/RPC, or permission behavior is introduced.

Testing Strategy:

- Focused recipe domain validation tests.
- Full format, typecheck, lint, test, build, and diff whitespace verification before human review.

Expected Deliverables:

- Recipe definition domain types.
- Recipe validation and normalization helpers.
- Recipe-specific validation error.
- Recipe domain barrel export.
- Focused tests.
- Updated required living docs and evidence report.

Validation Plan:

- Confirm no recipe UI, route, persistence, migration, RLS/RPC, permission, shopping-list, availability, scaling, menu-planning, procurement, or analytics behavior was added.
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
