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

Consolidate Security Architecture Ownership.

## Goal

Create the canonical living security architecture source for Horizon 1 auth, permission, RLS, RPC, and temporary volunteer boundaries without changing runtime behavior, migrations, permissions, or repository contracts.

## Status

Implemented, verified, reviewed, and approved for commit.

## Scope

- Add a living security architecture page under the handbook architecture section.
- Consolidate current Horizon 1 security boundaries from ADRs, security status, auth docs, permissions docs, Supabase notes, and migrations.
- Preserve immutable ledger behavior, positive quantity semantics, return/reversal semantics, migrations, Supabase policies, permissions, and runtime behavior.
- Do not implement local queue storage, background sync, service-worker replay, IndexedDB schema, server idempotency constraints, RLS/RPC changes, permission changes, scanning documentation consolidation, schema reference generation, or older documentation cleanup in this milestone.

## Files Affected

- `docs/handbook/architecture/security.md`
- `docs/handbook/architecture/README.md`
- `docs/handbook/reference/CURRENT_MILESTONE.md`
- `docs/handbook/reference/CURRENT_STATE.md`
- `docs/handbook/reference/SECURITY_STATUS.md`
- `docs/handbook/reference/OPEN_DECISIONS.md`
- `docs/handbook/reference/TECH_DEBT.md`
- `docs/handbook/reference/KNOWN_LIMITATIONS.md`
- `docs/handbook/reference/PROJECT_MEMORY.md`
- `docs/handbook/reference/CHANGELOG_SUMMARY.md`
- `docs/handbook/reference/PROJECT_RECONSTRUCTION.md`
- `docs/handbook/reference/PROJECT_SCORECARD.md`
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

Human review, then commit approval if accepted.

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
