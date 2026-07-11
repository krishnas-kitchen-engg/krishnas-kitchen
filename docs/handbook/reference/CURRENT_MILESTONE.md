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

Finalize Engineering Operating System v1.2.

## Goal

Complete, simplify, stabilize, and freeze the Engineering Operating System before returning to application development.

## Status

Approved for freeze. Engineering principles, stop conditions, lessons learned, broadened engineering lessons, candidate recommendation requirements, scorecard simplification, and v1.2 Stable status have been added.

## Scope

- Create `ENGINEERING_PRINCIPLES.md`.
- Add stop conditions to `AI_ENGINEERING_OPERATING_MODEL.md`.
- Add durable lessons learned to `PROJECT_MEMORY.md`.
- Broaden `COMMON_FAILURES.md` into common failures and engineering lessons.
- Ensure `NEXT_MILESTONE.md` records expected value, architecture impact, security impact, testing strategy, and reasons alternatives were not recommended.
- Simplify `PROJECT_SCORECARD.md` to high-value health indicators.
- Mark the EOS Stable at v1.2.
- Cross-reference affected handbook documents and remove stale prior EOS framing.
- Do not modify application code.
- Do not modify tests.
- Do not modify migrations.
- Do not modify build or package configuration.
- Do not move or delete files.
- Do not commit.

## Files Affected

- `docs/handbook/reference/CURRENT_MILESTONE.md`
- `docs/handbook/reference/CURRENT_STATE.md`
- `docs/handbook/reference/CHANGELOG_SUMMARY.md`
- `docs/handbook/reference/README.md`
- `docs/handbook/reference/NEXT_MILESTONE.md`
- `docs/handbook/reference/PROJECT_MEMORY.md`
- `docs/handbook/reference/COMMON_FAILURES.md`
- `docs/handbook/reference/DOCUMENT_INDEX.md`
- `docs/handbook/reference/PROJECT_SCORECARD.md`
- `docs/handbook/README.md`
- `docs/handbook/reading-paths.md`
- `docs/handbook/governance/README.md`
- `docs/handbook/governance/PROJECT_CONSTITUTION.md`
- `docs/handbook/governance/AI_ENGINEERING_OPERATING_MODEL.md`
- `docs/handbook/governance/ENGINEERING_PRINCIPLES.md`

## Known Blockers

None for this documentation/process milestone.

## Verification Status

Completed documentation/process review:

- New governance document includes front matter, owner, update cadence, and related links.
- `NEXT_MILESTONE.md` presents three candidates and the required recommendation fields.
- `PROJECT_SCORECARD.md` tracks only high-value health indicators.
- The operating model records stop conditions and remains the canonical workflow contract.
- EOS v1.2 is marked Stable.
- Changed scope remains documentation/process only.

Application tests are not required for this documentation-only milestone.

## Next Review

User review of the updated workflow before any commit approval.

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
