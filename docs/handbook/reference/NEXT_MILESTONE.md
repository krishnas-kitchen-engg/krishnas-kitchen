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

Approved for implementation. Verification and commit approval remain separate Session Controller gates.

## Approval

Candidate 1, Recipe Shopping-List Domain Foundation, was approved for implementation.

## Recommended Candidate

Candidate 1: Recipe Shopping-List Domain Foundation.

Recommendation: Approved for implementation.

Strategic Alignment: Advances Horizon 1 recipe work from availability evaluation to deterministic shopping-list shortage output.

Current Horizon: Horizon 1, Core Kitchen Inventory Platform.

Reason It Belongs To This Horizon: Horizon 1 explicitly includes shopping list generation.

Evidence Value: High. It proves the recipe domain can convert availability shortages into a deterministic output before UI or persistence is added.

Future Horizon Support Without Scope Expansion: Gives future procurement, planning, and forecasting work a tested shortage-output contract while implementing only active Horizon 1 shopping-list generation.

Confidence: 84%.

Rationale: Recipe shopping-list generation is the smallest next Horizon 1 recipe step after definition, scaling, and availability foundations.

Estimated Effort: Medium.

Assumptions:

- Shopping-list output should consume the existing availability result.
- Shortage items should be grouped by exact `itemId` plus `unit`.

Uncertainties:

- Future shopping-list work may need persistence, UI, authorization, procurement, vendor, approval, or unit-conversion rules.

Reasons Alternatives Were Not Recommended:

- Candidate 2 is useful, but scanning architecture drift does not advance the recipe pipeline as directly as completing Horizon 1 shopping-list domain output.
- Candidate 3 is useful, but stack documentation reconciliation is lower product value than a tested shopping-list primitive.

## Candidate 1: Recipe Shopping-List Domain Foundation

Recommendation: Approved for implementation.

Strategic Alignment: Adds deterministic shortage-output generation to the Horizon 1 recipe domain.

Current Horizon: Horizon 1, Core Kitchen Inventory Platform.

Reason It Belongs To This Horizon: Horizon 1 includes shopping list generation.

Rationale: The repository now has validated, scalable, and availability-aware recipe foundations. A pure domain slice can add shopping-list shortage output without UI, persistence, migrations, unit conversion, procurement, vendor, or approval decisions.

Confidence: 84%.

Estimated Effort: Medium.

Dependencies:

- Existing recipe definition, scaling, and availability domains.
- [Product Horizons](../../PRODUCT_HORIZONS.md).
- [ADR-0008](../adrs/0008-domain-driven-package-organization.md).

Risk:

- Medium-low. Procurement, vendor, approval, persistence, and unit-conversion concerns must remain outside scope.

Expected Value: High. Establishes the shortage-output contract that later UI, persistence, and procurement work can build on.

Evidence Value: High. Demonstrates availability shortages can become deterministic recipe-domain output without UI, schema, permissions, or higher-horizon expansion.

Future Horizon Support Without Scope Expansion: Creates a shortage-output primitive future procurement, planning, and forecasting can consume later, while deferring those higher-horizon workflows.

Architecture Impact: Low. Expands the existing `recipes` domain by deriving shopping-list items from availability results without crossing feature, app, or persistence boundaries.

Security Impact: Low. No new protected data access, browser trust boundary, RLS/RPC, or permission behavior is introduced.

Testing Strategy:

- Focused recipe shopping-list domain tests.
- Full format, typecheck, lint, test, build, and diff whitespace verification before human review.

Expected Deliverables:

- Recipe shopping-list generator.
- Recipe shopping-list item/result types.
- Recipe domain barrel export.
- Focused tests.
- Updated required living docs and evidence report.

Validation Plan:

- Confirm no recipe UI, route, persistence, migration, RLS/RPC, permission, unit-conversion, menu-planning, procurement, vendor, approval, or analytics behavior was added.
- Run focused recipe shopping-list tests and full verification suite.

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

Evidence Value: Medium. It would reduce workflow-boundary drift but is less urgent than extending the recipe pipeline.

Future Horizon Support Without Scope Expansion: Leaves future operational workflows with a cleaner scan boundary while avoiding menu planning, kitchen planning, and analytics scope.

Architecture Impact: Medium.

Security Impact: Low.

Testing Strategy:

- Documentation/reference validation.
- No code verification unless implementation scope changes.

## Candidate 3: Reconcile Stack Documentation Against Package Manifests

Recommendation: Defer.

Strategic Alignment: Keeps Horizon 1 repository architecture and onboarding guidance aligned with package manifests.

Current Horizon: Horizon 1, Core Kitchen Inventory Platform.

Reason It Belongs To This Horizon: Horizon 1 includes repository architecture, testing, evidence generation, and engineering documentation.

Rationale: Stack documentation lists dependencies that package manifests do not show.

Confidence: 70%.

Estimated Effort: Low.

Dependencies:

- Review root and app package manifests, system architecture docs, and handbook stack references.

Risk:

- Low documentation risk; the main risk is mistaking planned dependencies for implemented dependencies.

Expected Value: Medium-low. It improves onboarding and architecture reconstruction, but is less urgent than current recipe pipeline progress.

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
