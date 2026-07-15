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

Completed. Human review and commit approval received.

## Scope

- Confirm the intended temporary volunteer capability policy as read/session-only for browser permissions.
- Reconcile contradictions between `AUTH_ARCHITECTURE.md`, `PERMISSIONS_MATRIX.md`, current permission helpers, and affected workflow tests.
- Preserve the invariant that client-side permission helpers are usability signals, not final authorization.
- Do not modify RLS, RPC, migrations, or database authorization boundaries unless a separate approved milestone explicitly includes that work.
- Do not resolve undo/reversal terminology drift, offline queue architecture, or security architecture ownership in this milestone.
- Keep the implementation to the smallest independently verifiable vertical slice.
- Do not commit implementation changes without explicit separate commit approval after verification and review.

## Files Affected

- Expected documentation/code areas for the approved milestone:
  - `docs/AUTH_ARCHITECTURE.md`
  - `docs/PERMISSIONS_MATRIX.md`
  - `docs/handbook/reference/DOCUMENTATION_DRIFT.md`
  - `docs/handbook/reference/OPEN_DECISIONS.md`
  - `docs/handbook/reference/TECH_DEBT.md`
  - `apps/web/src/features/auth/lib/permissions.ts`
  - affected temporary-volunteer workflow tests if behavior changes
- Implementation files updated:
  - `apps/web/src/features/auth/lib/permissions.ts`
  - `apps/web/src/features/auth/lib/permissions.test.ts`
  - `apps/web/src/features/inventory/receive/screens/ReceiveInventoryScreen.test.tsx`
  - `apps/web/src/features/inventory/transfer/screens/TransferInventoryScreen.test.tsx`
  - `apps/web/src/features/inventory/return/screens/ReturnInventoryScreen.test.tsx`
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

None known for this milestone.

## Verification Status

Implementation verification is recorded in [Evidence Report](./EVIDENCE_REPORT.md).

Implementation verification:

- Targeted permission helper and affected receive, transfer, and return screen tests passed.
- `corepack pnpm@9.15.4 format` passed.
- `corepack pnpm@9.15.4 typecheck` passed.
- `corepack pnpm@9.15.4 lint` passed.
- `corepack pnpm@9.15.4 test` passed with 60 test files and 296 tests.
- `corepack pnpm@9.15.4 build` passed with the existing Vite chunk-size warning.

Security review is required before commit readiness because the approved milestone touches authorization expectations.

## Next Review

Fresh EOS candidate selection after this commit.

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
