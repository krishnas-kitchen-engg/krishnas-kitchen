---
title: Current Milestone
status: active
doc_type: reference
lifecycle: living
owner: engineering
update_cadence: at the start, review, and completion of every milestone
last_reviewed: null
related:
  - ./README.md
  - ./CURRENT_STATE.md
  - ./NEXT_MILESTONE.md
  - ./CHANGELOG_SUMMARY.md
  - ../governance/AI_ENGINEERING_OPERATING_MODEL.md
  - ../process/MILESTONE_LIFECYCLE.md
  - ../process/SESSION_LIFECYCLE.md
  - ../process/DEFINITION_OF_DONE.md
  - ../adrs/0010-security-review-before-commit.md
  - ../architecture/README.md
  - ../architecture/offline-sync.md
  - ../architecture/security.md
---

# Current Milestone

## Purpose

This document captures the currently active milestone so future sessions can resume with context.

## Current Guidance

Update this document whenever a milestone starts, pauses, completes, or changes scope.

## Current Active Milestone

Recipe Scaling Domain Foundation.

## Goal

Add the smallest production-quality recipe scaling domain foundation for Horizon 1 recipe work without adding UI, persistence, migrations, availability checks, shopping-list generation, menu planning, procurement, or higher-horizon behavior.

## Status

Implemented, verified, human-approved, and committed.

## Scope

- Add a recipe scaling helper that scales ingredient quantities from base servings to target servings.
- Reuse existing recipe definition validation and normalization before scaling.
- Preserve ingredient item references, units, and notes while updating quantities.
- Round scaled ingredient quantities to a documented six-decimal domain precision.
- Add focused Vitest coverage for scaling, normalization during scaling, rounding, and validation errors.
- Preserve Product Horizons, runtime routes, UI screens, navigation, Supabase schema, migrations, RLS/RPC behavior, inventory behavior, auth behavior, availability checks, shopping-list generation, and higher-horizon product scope.

## Files Affected

- `apps/web/src/domains/recipes/domain/recipeDefinition.ts`
- `apps/web/src/domains/recipes/domain/recipeDefinition.test.ts`
- `apps/web/src/domains/recipes/index.ts`
- `docs/handbook/reference/CURRENT_MILESTONE.md`
- `docs/handbook/reference/CURRENT_STATE.md`
- `docs/handbook/reference/NEXT_MILESTONE.md`
- `docs/handbook/reference/PROJECT_MEMORY.md`
- `docs/handbook/reference/IMPLEMENTATION_PATTERNS.md`
- `docs/handbook/reference/COMMON_FAILURES.md`
- `docs/handbook/reference/CHANGELOG_SUMMARY.md`
- `docs/handbook/reference/PROJECT_RECONSTRUCTION.md`
- `docs/handbook/reference/PROJECT_SCORECARD.md`
- `docs/handbook/reference/EVIDENCE_REPORT.md`

## Known Blockers

None known for this milestone.

## Verification Status

Implementation verification is recorded in [Evidence Report](./EVIDENCE_REPORT.md).

Verification passed:

- `corepack pnpm@9.15.4 format`
- `corepack pnpm@9.15.4 typecheck`
- `corepack pnpm@9.15.4 lint`
- `corepack pnpm@9.15.4 test`
- `corepack pnpm@9.15.4 build`
- `git diff --check`

## Next Review

Session complete. Start the next session with repository reconstruction and active-horizon milestone selection.

## Owner

Engineering owns this document.

## Update Cadence

Update at milestone start, pause, completion, or scope change.

## Lifecycle

This is living documentation.

## Related Documents

- [Current State](./CURRENT_STATE.md)
- [Next Milestone](./NEXT_MILESTONE.md)
- [Changelog Summary](./CHANGELOG_SUMMARY.md)
- [AI Engineering Operating Model](../governance/AI_ENGINEERING_OPERATING_MODEL.md)
- [Milestone Lifecycle](../process/MILESTONE_LIFECYCLE.md)
- [Session Lifecycle](../process/SESSION_LIFECYCLE.md)
- [Definition of Done](../process/DEFINITION_OF_DONE.md)
- [Security Architecture](../architecture/security.md)
