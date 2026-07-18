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

Milestone: Recipe Scaling Domain Foundation.

Status: Implemented, verified, human-approved, and committed.

## Repository Evidence

- Branch: `docs/engineering-handbook`.
- Working tree before implementation: clean after `6662e77 docs(eos): refine completion reporting terminology`.
- Latest committed baseline before implementation: `6662e77 docs(eos): refine completion reporting terminology`.
- Product Horizons identifies Horizon 1, Core Kitchen Inventory Platform, as active.
- The milestone is inside Horizon 1 because Horizon 1 explicitly includes recipe scaling.

## Architecture Evidence

- Recipe scaling is implemented under `apps/web/src/domains/recipes`, aligned with ADR-0008 domain-driven package organization.
- Scaling reuses existing recipe definition validation and normalization before calculating target quantities.
- No feature UI, routes, navigation, persistence adapters, migrations, RLS, RPC, permission, unit conversion, availability check, shopping-list generation, or Product Horizons changes were made.

## Implementation Evidence

- Added `scaleRecipeDefinition`.
- Added `RECIPE_QUANTITY_DECIMAL_PLACES` to document six-decimal recipe quantity precision.
- Scaling validates the base recipe and target servings, normalizes user-entered recipe text, preserves ingredient item references, units, and notes, and scales ingredient quantities by target servings.
- Added focused Vitest coverage for scaling, normalization while scaling, six-decimal rounding, invalid base recipes, and invalid target servings.

## Documentation Validation

- Living references now identify Recipe Scaling Domain Foundation as the active implemented milestone.
- Living docs record that recipe UI, persistence, unit conversion, availability checks, shopping-list generation, menu planning, procurement, analytics, and other higher-horizon behavior remain deferred.
- Product Horizons was not changed because the active horizon and exit criteria did not change.
- Previously observed documentation drift remains: `NEXT_MILESTONE.md` and `PROJECT_RECONSTRUCTION.md` carried stale candidate/current-milestone text before this implementation and were refreshed only where required for this milestone handoff.

## Verification Results

Focused verification passed:

- `corepack pnpm@9.15.4 exec vitest run apps/web/src/domains/recipes/domain/recipeDefinition.test.ts`

Full verification passed:

- `corepack pnpm@9.15.4 format`
- `corepack pnpm@9.15.4 typecheck`
- `corepack pnpm@9.15.4 lint`
- `corepack pnpm@9.15.4 test`
- `corepack pnpm@9.15.4 build`
- `git diff --check`

## Residual Risks

None known for the completed recipe scaling domain foundation.

## Future Approved Work

- Recipe UI, routes, persistence, migrations, and authorization.
- Recipe unit conversion.
- Ingredient availability checks.
- Shopping-list generation.
- Menu planning, procurement, forecasting, analytics, and other higher-horizon work.

## Evidence Location

This evidence is stored in `docs/handbook/reference/EVIDENCE_REPORT.md`.
