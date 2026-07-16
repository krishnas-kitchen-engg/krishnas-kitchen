---
title: Evidence Report
status: active
doc_type: reference
lifecycle: living
owner: engineering
update_cadence: after repository reconstruction, implementation, verification, or commit-readiness milestones
last_reviewed: null
related:
  - ./CURRENT_MILESTONE.md
  - ./CURRENT_STATE.md
  - ./NEXT_MILESTONE.md
  - ./PROJECT_RECONSTRUCTION.md
  - ./PROJECT_MEMORY.md
  - ./IMPLEMENTATION_PATTERNS.md
  - ./COMMON_FAILURES.md
  - ../governance/AI_ENGINEERING_OPERATING_MODEL.md
  - ../process/QUALITY_GATES.md
---

# Evidence Report

## Purpose

This document records evidence gathered during the latest repository reconstruction, implementation, verification, and commit-readiness handoff.

## Report

Date: 2026-07-16.

Milestone: Canonicalize Undo/Reversal Terminology.

Status: Implemented, verified, reviewed, and approved for commit.

## Repository Evidence

- Branch: `docs/engineering-handbook`.
- Working tree before implementation: clean.
- Latest committed baseline before implementation: `235fc25 fix(auth): restrict temporary volunteer permissions`.
- Source files under `apps/web/src`: 244.
- Test files under `apps/web/src`: 60.
- Supabase migration files: 12.
- Relevant source behavior already created current corrections as `transactionType: "reversal"`.
- Mapper/repository tests already preserved legacy `undo` rows for read compatibility.

## Architecture Evidence

- [Inventory Architecture](../../INVENTORY_ARCHITECTURE.md) now defines canonical correction terminology.
- [ADR-0009](../adrs/0009-auditability-and-reversibility.md) now records the same terminology under the accepted auditability and reversibility decision.
- `undo` is the user-facing action and application service operation.
- `reversal` is the domain event and current persisted inventory correction transaction type.
- `reversal_of_transaction_id` links a reversal transaction to the original transaction.
- Legacy persisted `undo` rows remain read-compatible history only and should not be created by new application code.

## Implementation Evidence

- No TypeScript source, tests, migrations, RLS policies, RPCs, or runtime behavior were changed.
- `docs/INVENTORY_ARCHITECTURE.md` and `docs/SYSTEM_ARCHITECTURE.md` no longer list `undo` as the current correction transaction type.
- `docs/features/inventory_receiving_persistence.md` and `docs/features/inventory_transfer.md` now describe undo as the action and reversal as the persisted correction transaction.
- `DOCUMENTATION_DRIFT.md`, `OPEN_DECISIONS.md`, and `TECH_DEBT.md` record DD-002, OD-002, and TD-002 as resolved.
- Living state, milestone, next milestone, memory, implementation patterns, common failures, changelog, scorecard, limitations, and reconstruction references were updated for the implemented milestone.

## Documentation Validation

- Active drift no longer lists undo/reversal terminology as unresolved.
- Active open decisions no longer include undo/reversal terminology.
- Known limitations no longer claim undo/reversal terminology is not canonical.
- Remaining open drift/debt is outside this milestone: return semantics, offline queue architecture, security architecture ownership, older documentation duplication, stack docs drift, schema reference drift, naming drift, and historical process overlap.

## Verification Results

Full implementation verification passed:

- `corepack pnpm@9.15.4 format`
- `corepack pnpm@9.15.4 typecheck`
- `corepack pnpm@9.15.4 lint`
- `corepack pnpm@9.15.4 test` with 60 test files and 296 tests passing
- `corepack pnpm@9.15.4 build`

Build note: production build completed successfully and emitted the existing Vite chunk-size warning.

## Residual Risks

- The milestone is documentation-only and depends on current code behavior remaining unchanged.
- Legacy persisted `undo` compatibility remains in migrations and mappers by design.
- Return transaction semantics remain a separate documented drift item.
- Offline queue architecture remains undefined as a detailed living architecture document.

## Evidence Location

This evidence is stored in `docs/handbook/reference/EVIDENCE_REPORT.md`.
