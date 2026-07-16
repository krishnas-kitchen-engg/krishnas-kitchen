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

Canonicalize Return Transaction Semantics.

## Goal

Define the canonical current return transaction behavior across architecture, feature, ADR, and living reference documentation without changing inventory behavior, migrations, or repository contracts.

## Status

Completed. Human review and commit approval received.

## Scope

- Establish that current application-created return transactions persist as `transaction_type = "returned"` with `quantity_effect = "transfer"`.
- Clarify that returns move positive quantity from source location to destination location.
- Classify migration support for `returned` plus `increase` as compatibility, not the current creation path.
- Align affected return feature docs, inventory architecture, drift, state, memory, patterns, scorecard, reconstruction, next milestone, changelog, and evidence references.
- Preserve immutable ledger behavior, positive quantity semantics, reversal behavior, migrations, Supabase policies, permissions, and runtime behavior.
- Do not implement offline queue architecture, security architecture ownership, scanning documentation consolidation, schema reference generation, or older documentation cleanup in this milestone.
- Do not commit implementation changes without explicit separate commit approval after verification and review.

## Files Affected

- `docs/INVENTORY_ARCHITECTURE.md`
- `docs/features/inventory_return.md`
- `docs/features/return_scan_workflow.md`
- `docs/handbook/reference/CURRENT_MILESTONE.md`
- `docs/handbook/reference/CURRENT_STATE.md`
- `docs/handbook/reference/NEXT_MILESTONE.md`
- `docs/handbook/reference/DOCUMENTATION_DRIFT.md`
- `docs/handbook/reference/PROJECT_MEMORY.md`
- `docs/handbook/reference/IMPLEMENTATION_PATTERNS.md`
- `docs/handbook/reference/COMMON_FAILURES.md`
- `docs/handbook/reference/CHANGELOG_SUMMARY.md`
- `docs/handbook/reference/PROJECT_SCORECARD.md`
- `docs/handbook/reference/PROJECT_RECONSTRUCTION.md`
- `docs/handbook/reference/EVIDENCE_REPORT.md`

## Known Blockers

None known for this milestone.

## Verification Status

Implementation verification is recorded in [Evidence Report](./EVIDENCE_REPORT.md).

Implementation verification passed:

- `corepack pnpm@9.15.4 format`
- `corepack pnpm@9.15.4 typecheck`
- `corepack pnpm@9.15.4 lint`
- `corepack pnpm@9.15.4 test`
- `corepack pnpm@9.15.4 build`

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
