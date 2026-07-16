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

Milestone: Canonicalize Return Transaction Semantics.

Status: Implemented, verified, reviewed, and approved for commit.

## Repository Evidence

- Branch: `docs/engineering-handbook`.
- Working tree before implementation: clean.
- Latest committed baseline before implementation: `d801255 docs(inventory): canonicalize undo reversal terminology`.
- Source files under `apps/web/src`: 244.
- Test files under `apps/web/src`: 60.
- Supabase migration files: 12.
- Relevant source behavior already creates current returns as `transactionType: "returned"` and `quantityEffect: "transfer"`.
- Return validation and service tests already verify source decrease, destination increase, and reversal behavior.

## Architecture Evidence

- [Inventory Architecture](../../INVENTORY_ARCHITECTURE.md) now defines canonical return semantics.
- [ADR-0002](../adrs/0002-positive-quantities-and-quantity-effects.md) was reviewed as the accepted positive-quantity decision; current return behavior is recorded in living architecture instead of rewriting the historical ADR.
- Current application-created returns use `transaction_type = "returned"`.
- Current application-created returns use `quantity_effect = "transfer"`.
- Returns move positive quantity from source location to destination location.
- Migration support for `returned` plus `increase` remains compatibility only.

## Implementation Evidence

- No TypeScript source, tests, migrations, RLS policies, RPCs, permissions, or runtime behavior were changed.
- `docs/INVENTORY_ARCHITECTURE.md` now documents the Return Model.
- `docs/features/inventory_return.md` and `docs/features/return_scan_workflow.md` now describe persisted return semantics explicitly.
- `DOCUMENTATION_DRIFT.md` records DD-003 as resolved.
- Living state, milestone, next milestone, memory, implementation patterns, common failures, changelog, scorecard, and reconstruction references were updated for the implemented milestone.

## Documentation Validation

- Active drift no longer lists return semantics as unresolved.
- Current return semantics no longer conflict with migration compatibility language.
- Remaining open drift/debt is outside this milestone: offline queue architecture, security architecture ownership, mobile UI duplication, scanning documentation overlap, stack docs drift, schema reference drift, naming drift, and historical process overlap.

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
- Migration compatibility for `returned` plus `increase` remains by design.
- Offline queue architecture remains undefined as a detailed living architecture document.
- Security architecture ownership remains distributed across status, architecture, ADR, and migration references.

## Evidence Location

This evidence is stored in `docs/handbook/reference/EVIDENCE_REPORT.md`.
