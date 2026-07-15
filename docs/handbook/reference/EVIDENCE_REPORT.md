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

This document records evidence gathered during the latest repository reconstruction and documentation handoff.

## Report

Date: 2026-07-15.

Milestone: Reconcile Temporary Volunteer Permission Drift.

Status: Implemented, verified, reviewed, and approved for commit.

## Repository Evidence

- Branch: `docs/engineering-handbook`.
- Working tree before documentation updates: clean.
- Latest committed handoff before implementation: `bdc1220 docs(handbook): record approved permission milestone`.
- Source files under `apps/web/src`: 244.
- Test files under `apps/web/src`: 60.
- Supabase migration files: 12.
- Diagnostic instrumentation search: no `KK_LOGIN_DEBUG` or `console.info` matches under `apps/web/src`.

## Architecture Evidence

- Stack evidenced by manifests: React 19, Vite, TypeScript, Tailwind, Supabase, pnpm workspaces, Vitest, ESLint, Prettier.
- Accepted ADRs 0001-0010 cover inventory ledger immutability, positive quantity effects, Supabase/RLS boundaries, temporary volunteer sessions, offline PWA direction, repository pattern, RPC/browser trust, domain organization, reversibility, and security review before commit readiness.
- Architectural invariants require immutable inventory transactions, derived balances, server/database authorization, explicit repository boundaries, scoped temporary volunteer sessions, and security review before security-sensitive commit readiness.

## Permission Drift Evidence

- Before implementation, `docs/AUTH_ARCHITECTURE.md` described temporary volunteers with limited inventory permissions including transfer, consume, and return.
- Before implementation, `docs/PERMISSIONS_MATRIX.md` said temporary volunteers could not receive, transfer, consume, return, adjust, or undo inventory and received only `volunteer_sessions.create`.
- Before implementation, `apps/web/src/features/auth/lib/permissions.ts` granted temporary volunteers `inventory.read`, `inventory.receive`, `inventory.transfer`, `inventory.consume`, and `inventory.return`.
- Before implementation, receive, transfer, and return workflow tests included cases allowing temporary volunteers with the corresponding inventory permissions.
- After implementation, temporary volunteer browser permissions are `locations.read`, `items.read`, `inventory.read`, and `volunteer_sessions.create`.
- After implementation, receive, transfer, and return screen tests assert temporary volunteers without operational permissions are blocked from operational workflows.

## Documentation Validation

- `AUTH_ARCHITECTURE.md` and `PERMISSIONS_MATRIX.md` were aligned to the read/session-only temporary volunteer browser permission policy.
- `DOCUMENTATION_DRIFT.md`, `OPEN_DECISIONS.md`, and `TECH_DEBT.md` no longer list temporary volunteer permission drift as open.
- Living status, memory, changelog, scorecard, limitation, reconstruction, and evidence references were updated for the implemented milestone.

## Verification Results

Targeted implementation verification passed:

- `corepack pnpm@9.15.4 vitest run apps/web/src/features/auth/lib/permissions.test.ts apps/web/src/features/inventory/receive/screens/ReceiveInventoryScreen.test.tsx apps/web/src/features/inventory/transfer/screens/TransferInventoryScreen.test.tsx apps/web/src/features/inventory/return/screens/ReturnInventoryScreen.test.tsx` with 4 test files and 7 tests passing.

Full implementation verification results:

- `corepack pnpm@9.15.4 format`
- `corepack pnpm@9.15.4 typecheck`
- `corepack pnpm@9.15.4 lint`
- `corepack pnpm@9.15.4 test` with 60 test files and 296 tests passing.
- `corepack pnpm@9.15.4 build`

Build note: production build completed successfully and emitted the existing Vite chunk-size warning for `dist/assets/index-CG86QxKA.js` at 590.33 kB.

## Residual Risks

- The approved milestone is security-sensitive because it affects temporary volunteer authorization expectations.
- No RLS, RPC, or migration changes are included.
- Temporary volunteers still have controlled inventory/barcode read surfaces; future write capabilities require a separate approved server-enforced design.

## Evidence Location

This evidence is stored in `docs/handbook/reference/EVIDENCE_REPORT.md`.
