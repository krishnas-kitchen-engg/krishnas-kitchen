---
title: Evidence Report
status: active
doc_type: reference
lifecycle: living
owner: engineering
update_cadence: after repository reconstruction, implementation, verification, or commit-readiness milestones
last_reviewed: 2026-07-17
related:
  - ./CURRENT_MILESTONE.md
  - ./CURRENT_STATE.md
  - ./NEXT_MILESTONE.md
  - ./PROJECT_RECONSTRUCTION.md
  - ./PROJECT_MEMORY.md
  - ./IMPLEMENTATION_PATTERNS.md
  - ./COMMON_FAILURES.md
  - ../architecture/security.md
  - ../architecture/offline-sync.md
  - ../governance/AI_ENGINEERING_OPERATING_MODEL.md
  - ../process/QUALITY_GATES.md
---

# Evidence Report

## Purpose

This document records evidence gathered during the latest repository reconstruction, implementation, verification, and commit-readiness handoff.

## Report

Date: 2026-07-17.

Milestone: Recipe Shopping-List Domain Foundation.

Status: Implemented and verified. Ready for human review. Commit approval remains pending.

## Repository Evidence

- Branch: `docs/engineering-handbook`.
- Working tree before implementation: clean after `4906960 feat(recipes): add recipe availability domain foundation`.
- Latest committed baseline before implementation: `4906960 feat(recipes): add recipe availability domain foundation`.
- Product Horizons identifies Horizon 1, Core Kitchen Inventory Platform, as active.
- The milestone is inside Horizon 1 because Horizon 1 explicitly includes shopping list generation.

## Architecture Evidence

- Recipe shopping-list generation is implemented under `apps/web/src/domains/recipes`, aligned with ADR-0008 domain-driven package organization.
- Shopping-list generation consumes recipe availability results instead of recalculating inventory readiness.
- Shopping-list output groups shortages by exact `itemId` plus `unit` and does not perform unit conversion.
- No feature UI, routes, navigation, persistence adapters, migrations, RLS, RPC, permission, unit conversion, procurement, vendor management, approval workflow, or Product Horizons changes were made.

## Implementation Evidence

- Added `generateRecipeShoppingList`.
- Added recipe shopping-list item/result types and recipe-domain barrel exports.
- Shopping-list generation filters to shortage-only item/unit groups while preserving total required, allocated available, and shortage quantities.
- Added focused Vitest coverage for shortage output, empty output, duplicate item/unit aggregation, grouped totals, and exact-unit separation.

## Documentation Validation

- Living references now identify Recipe Shopping-List Domain Foundation as the active implemented milestone pending human review.
- Living docs record that recipe UI, persistence, unit conversion, procurement, vendor management, approval workflows, menu planning, analytics, and other higher-horizon behavior remain deferred.
- Product Horizons was not changed because the active horizon and exit criteria did not change.
- Previously observed post-commit documentation drift for Recipe Availability Domain Foundation was addressed where required while recording the approved shopping-list milestone.

## Verification Results

Focused verification passed:

- `corepack pnpm@9.15.4 exec vitest run apps/web/src/domains/recipes/domain/recipeShoppingList.test.ts`

Full verification passed:

- `corepack pnpm@9.15.4 format`
- `corepack pnpm@9.15.4 typecheck`
- `corepack pnpm@9.15.4 lint`
- `corepack pnpm@9.15.4 test`
- `corepack pnpm@9.15.4 build`
- `git diff --check`

## Residual Risks

None known for the completed recipe shopping-list domain foundation.

## Future Approved Work

- Recipe UI, routes, persistence, migrations, and authorization.
- Recipe unit conversion.
- Recipe shopping-list UI and persistence.
- Procurement, vendor management, and approval workflows.
- Menu planning, procurement, forecasting, analytics, and other higher-horizon work.

## Evidence Location

This evidence is stored in `docs/handbook/reference/EVIDENCE_REPORT.md`.
