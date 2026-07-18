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

Candidate 1, Recipe Availability Domain Foundation, was approved for implementation.

## Recommended Candidate

Candidate 1: Recipe Availability Domain Foundation.

Recommendation: Approved for implementation.

Strategic Alignment: Advances Horizon 1 recipe work from validated/scaled definitions to ingredient availability evaluation.

Current Horizon: Horizon 1, Core Kitchen Inventory Platform.

Reason It Belongs To This Horizon: Horizon 1 explicitly includes ingredient availability checks.

Evidence Value: High. It proves the recipe domain can compose recipe requirements with inventory balances before shopping-list logic is added.

Future Horizon Support Without Scope Expansion: Gives future shopping-list, planning, and forecasting work a tested availability contract while implementing only active Horizon 1 readiness evaluation.

Confidence: 86%.

Rationale: Recipe availability is the smallest next Horizon 1 recipe step after definition and scaling foundations.

Estimated Effort: Medium.

Assumptions:

- Availability should use exact `itemId` plus `unit` matching.
- Projected item balances are sufficient input for the pure domain foundation.

Uncertainties:

- Future recipe availability may need explicit unit conversion, location scoping, reservations, or persistence rules.

Reasons Alternatives Were Not Recommended:

- Candidate 2 is useful, but shopping-list generation should follow the availability result model so it does not create parallel shortage semantics.
- Candidate 3 is useful, but offline recipe behavior depends on persistence and queue decisions that are intentionally outside this active slice.

## Candidate 1: Recipe Availability Domain Foundation

Recommendation: Approved for implementation.

Strategic Alignment: Adds deterministic ingredient readiness evaluation to the Horizon 1 recipe domain.

Current Horizon: Horizon 1, Core Kitchen Inventory Platform.

Reason It Belongs To This Horizon: Horizon 1 includes ingredient availability checks.

Rationale: The repository now has validated and scalable recipe definitions but no availability model. A pure domain slice can add availability evaluation without UI, persistence, migrations, unit conversion, or shopping-list decisions.

Confidence: 86%.

Estimated Effort: Medium.

Dependencies:

- Existing recipe definition and scaling domain.
- Inventory item balance projection types.
- [Product Horizons](../../PRODUCT_HORIZONS.md).
- [ADR-0008](../adrs/0008-domain-driven-package-organization.md).

Risk:

- Medium-low. Exact-unit matching is intentionally limited; future location scoping, reservations, and unit conversion remain outside scope.

Expected Value: High. Establishes the shortage/status contract that later shopping-list work can build on.

Evidence Value: High. Demonstrates recipe availability can compose recipe and inventory domain data without UI, schema, permissions, or higher-horizon expansion.

Future Horizon Support Without Scope Expansion: Creates an availability primitive future planning and forecasting can consume later, while deferring those higher-horizon workflows.

Architecture Impact: Medium-low. Expands the existing `recipes` domain with read-only inventory-balance composition without crossing feature, app, or persistence boundaries.

Security Impact: Low. No new protected data access, browser trust boundary, RLS/RPC, or permission behavior is introduced.

Testing Strategy:

- Focused recipe domain availability tests.
- Full format, typecheck, lint, test, build, and diff whitespace verification before human review.

Expected Deliverables:

- Recipe availability evaluator.
- Recipe availability status/result types.
- Recipe domain barrel export.
- Focused tests.
- Updated required living docs and evidence report.

Validation Plan:

- Confirm no recipe UI, route, persistence, migration, RLS/RPC, permission, shopping-list, unit-conversion, menu-planning, procurement, or analytics behavior was added.
- Run focused recipe availability tests and full verification suite.

## Candidate 2: Recipe Shopping-List Domain Foundation

Recommendation: Defer.

Strategic Alignment: Builds on recipe availability to produce purchase/request quantities for Horizon 1 kitchen operations.

Current Horizon: Horizon 1, Core Kitchen Inventory Platform.

Reason It Belongs To This Horizon: Horizon 1 includes shopping list generation.

Rationale: Once availability exists, shopping-list generation can derive needed quantities without inventing a separate shortage model.

Confidence: 78%.

Estimated Effort: Medium.

Dependencies:

- Recipe definition, scaling, and availability domain foundations.

Risk:

- Medium. Procurement, vendor, approval, persistence, and unit-conversion concerns must remain outside scope.

Expected Value: High for the next recipe workflow.

Evidence Value: High. It would prove availability shortages can become a deterministic domain output.

Future Horizon Support Without Scope Expansion: Gives future procurement and planning features a small shortage-output contract while deferring those higher-horizon workflows.

Architecture Impact: Medium-low.

Security Impact: Low.

Testing Strategy:

- Focused recipe shopping-list domain tests.
- Full verification suite.

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

Evidence Value: Medium. It would reduce workflow-boundary drift but is less urgent than extending the recipe pipeline.

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
- [Security Architecture](../architecture/security.md)
