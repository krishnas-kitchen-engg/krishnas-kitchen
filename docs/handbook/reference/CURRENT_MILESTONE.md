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
---

# Current Milestone

## Purpose

This document captures the currently active milestone so future sessions can resume with context.

## Current Guidance

Update this document whenever a milestone starts, pauses, completes, or changes scope.

## Current Active Milestone

Reconcile Temporary Volunteer Permission Drift.

## Goal

Establish the canonical temporary volunteer permission policy and align the affected documentation, code, and tests only as authorized by the approved product/security decision.

## Status

Approved for implementation. Documentation handoff and evidence report commit requested before implementation begins.

## Scope

- Confirm the intended temporary volunteer capability policy.
- Reconcile contradictions between `AUTH_ARCHITECTURE.md`, `PERMISSIONS_MATRIX.md`, current permission helpers, and affected workflow tests.
- Preserve the invariant that client-side permission helpers are usability signals, not final authorization.
- Do not modify RLS, RPC, migrations, or database authorization boundaries unless a separate approved milestone explicitly includes that work.
- Do not resolve undo/reversal terminology drift, offline queue architecture, or security architecture ownership in this milestone.
- Keep the implementation to the smallest independently verifiable vertical slice.
- Do not commit implementation changes without explicit separate commit approval after verification and review.

## Files Affected

- Implementation not started.
- Expected documentation/code areas for the approved milestone:
  - `docs/AUTH_ARCHITECTURE.md`
  - `docs/PERMISSIONS_MATRIX.md`
  - `docs/handbook/reference/DOCUMENTATION_DRIFT.md`
  - `docs/handbook/reference/OPEN_DECISIONS.md`
  - `docs/handbook/reference/TECH_DEBT.md`
  - `apps/web/src/features/auth/lib/permissions.ts`
  - affected temporary-volunteer workflow tests if behavior changes
- Documentation handoff files updated before implementation:
- `docs/handbook/reference/CURRENT_MILESTONE.md`
- `docs/handbook/reference/PROJECT_MEMORY.md`
- `docs/handbook/reference/CURRENT_STATE.md`
- `docs/handbook/reference/CHANGELOG_SUMMARY.md`
- `docs/handbook/reference/IMPLEMENTATION_PATTERNS.md`
- `docs/handbook/reference/COMMON_FAILURES.md`
- `docs/handbook/reference/NEXT_MILESTONE.md`
- `docs/handbook/reference/PROJECT_RECONSTRUCTION.md`
- `docs/handbook/reference/TECH_DEBT.md`
- `docs/handbook/reference/EVIDENCE_REPORT.md`

## Known Blockers

Implementation requires the approved product/security decision to be applied narrowly. If repository evidence remains ambiguous after reading the permission sources, stop and request the smallest missing decision instead of guessing.

## Verification Status

Pending for implementation. Documentation handoff verification is recorded in [Evidence Report](./EVIDENCE_REPORT.md).

Documentation handoff verification passed:

- `corepack pnpm@9.15.4 format`
- `corepack pnpm@9.15.4 typecheck`
- `corepack pnpm@9.15.4 lint`
- `corepack pnpm@9.15.4 test` with 59 test files and 295 tests passing.
- `corepack pnpm@9.15.4 build` with the existing Vite chunk-size warning.

Expected implementation verification:

- Targeted permission helper tests.
- Affected receive, transfer, return, and auth route tests if behavior changes.
- `corepack pnpm@9.15.4 typecheck`
- `corepack pnpm@9.15.4 lint`
- `corepack pnpm@9.15.4 test`
- `corepack pnpm@9.15.4 build`

Security review is required before commit readiness because the approved milestone touches authorization expectations.

## Next Review

Implement only the approved temporary volunteer permission drift milestone.

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
