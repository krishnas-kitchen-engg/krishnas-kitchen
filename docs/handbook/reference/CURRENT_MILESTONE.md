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

Recipe Repository Contract Foundation.

## Goal

Add the smallest production-quality recipe repository contract foundation for Horizon 1 recipe work without adding Supabase adapters, persistence implementation, migrations, RLS/RPC changes, UI, routes, authorization changes, unit conversion, procurement, vendor management, approval workflows, menu planning, or higher-horizon behavior.

## Status

Implemented and verified. Ready for human review. Commit approval remains pending.

## Scope

- Add a recipe application-layer repository contract for listing and reading recipe records.
- Define scoped list and find query types with organization and optional temple scope.
- Define recipe repository record metadata while keeping records compatible with existing recipe domain calculations.
- Add focused Vitest coverage showing scoped list/read behavior and compatibility with scaling, availability, and shopping-list domain functions.
- Preserve Product Horizons, runtime routes, UI screens, navigation, Supabase adapters, persistence implementation, schema, migrations, RLS/RPC behavior, inventory mutation behavior, auth behavior, procurement, vendor management, approval workflows, unit conversion, and higher-horizon product scope.

## Files Affected

- `apps/web/src/domains/recipes/application/recipeRepository.ts`
- `apps/web/src/domains/recipes/application/recipeRepository.test.ts`
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

- `corepack pnpm@9.15.4 exec vitest run apps/web/src/domains/recipes/application/recipeRepository.test.ts`
- `corepack pnpm@9.15.4 format`
- `corepack pnpm@9.15.4 typecheck`
- `corepack pnpm@9.15.4 lint`
- `corepack pnpm@9.15.4 test`
- `corepack pnpm@9.15.4 build`
- `git diff --check`

## Next Review

Stop for human review. Commit only after explicit commit approval.

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
