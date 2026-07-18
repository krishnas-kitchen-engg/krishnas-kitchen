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

Candidate 1, Recipe Repository Contract Foundation, was approved for implementation.

## Recommended Candidate

Candidate 1: Recipe Repository Contract Foundation.

Recommendation: Approved for implementation.

Strategic Alignment: Advances Horizon 1 recipe work from pure domain calculations toward application integration.

Current Horizon: Horizon 1, Core Kitchen Inventory Platform.

Reason It Belongs To This Horizon: Horizon 1 explicitly includes recipe definitions, repository architecture, testing, and evidence generation.

Evidence Value: High. It proves recipe access can be modeled behind a repository boundary before UI or persistence adapters are added.

Future Horizon Support Without Scope Expansion: Gives future UI, persistence, offline, procurement, planning, and forecasting work a stable recipe access boundary while implementing only an active Horizon 1 contract.

Confidence: 86%.

Rationale: Recipe repository contract is the smallest next Horizon 1 recipe step after definition, scaling, availability, and shopping-list foundations.

Estimated Effort: Medium.

Assumptions:

- Recipe access should be scoped by organization and optionally temple.
- Repository records should remain compatible with existing recipe domain calculations.

Uncertainties:

- Future recipe work may need persistence schema, Supabase adapter, authorization, UI, offline, or unit-conversion rules.

Reasons Alternatives Were Not Recommended:

- Candidate 2 is useful, but recipe UI should follow a recipe access boundary so the screen does not couple to future storage decisions.
- Candidate 3 is useful, but scanning architecture drift is less directly tied to completing the current recipe integration path.

## Candidate 1: Recipe Repository Contract Foundation

Recommendation: Approved for implementation.

Strategic Alignment: Adds a stable recipe access boundary for Horizon 1 application integration.

Current Horizon: Horizon 1, Core Kitchen Inventory Platform.

Reason It Belongs To This Horizon: Horizon 1 includes recipe definitions, repository architecture, testing, and evidence generation.

Rationale: The repository now has validated, scalable, availability-aware, and shopping-list-capable recipe foundations. A repository contract can prepare future UI and persistence without adding storage, migrations, RLS/RPC, routes, or authorization changes.

Confidence: 86%.

Estimated Effort: Medium-low.

Dependencies:

- Existing recipe definition, scaling, availability, and shopping-list domains.
- [ADR-0006](../adrs/0006-repository-pattern.md).
- [Product Horizons](../../PRODUCT_HORIZONS.md).
- [ADR-0008](../adrs/0008-domain-driven-package-organization.md).

Risk:

- Medium-low. Future schema, adapter, authorization, UI, and offline rules may extend the contract.

Expected Value: High. Establishes the recipe access boundary that later UI, persistence, and offline work can build on.

Evidence Value: High. Demonstrates recipe access can follow the repository pattern without UI, schema, permissions, or higher-horizon expansion.

Future Horizon Support Without Scope Expansion: Creates a recipe access primitive future planning, procurement, and forecasting can consume later, while deferring those higher-horizon workflows.

Architecture Impact: Medium-low. Adds a recipe application boundary without crossing persistence, feature, app, or Supabase boundaries.

Security Impact: Low. No new protected data access, browser trust boundary, RLS/RPC, or permission behavior is introduced.

Testing Strategy:

- Focused recipe repository contract tests.
- Full format, typecheck, lint, test, build, and diff whitespace verification before human review.

Expected Deliverables:

- Recipe repository contract.
- Recipe repository query/record/scope types.
- Recipe domain barrel export.
- Focused tests.
- Updated required living docs and evidence report.

Validation Plan:

- Confirm no recipe UI, route, persistence adapter, migration, RLS/RPC, permission, unit-conversion, menu-planning, procurement, vendor, approval, or analytics behavior was added.
- Run focused recipe repository contract tests and full verification suite.

## Candidate 2: Recipe Feature Route Empty-State Foundation

Recommendation: Defer.

Strategic Alignment: Starts visible Horizon 1 recipe workflow integration.

Current Horizon: Horizon 1, Core Kitchen Inventory Platform.

Reason It Belongs To This Horizon: Horizon 1 includes recipe definitions, ingredient availability, shopping-list generation, and mobile-first PWA.

Rationale: Recipe workflows have pure domain foundations but no route or screen shell.

Confidence: 73%.

Estimated Effort: Medium.

Dependencies:

- App routing and shell patterns.
- Recipe repository contract foundation.

Risk:

- Medium. The screen must remain an empty-state shell and avoid creation, persistence, or live inventory behavior.

Expected Value: Medium. It gives recipe work a user-facing home without implementing data workflows.

Evidence Value: Medium. It proves recipe feature integration into app routing.

Future Horizon Support Without Scope Expansion: Gives future planning and procurement screens a navigation path later without implementing those workflows now.

Architecture Impact: Medium.

Security Impact: Low.

Testing Strategy:

- Route/shell tests.
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
