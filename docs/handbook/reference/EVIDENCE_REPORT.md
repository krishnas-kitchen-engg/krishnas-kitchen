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

Status: Approved for implementation. This report documents the pre-implementation repository reconstruction and documentation handoff; it does not claim the permission drift has been implemented.

## Repository Evidence

- Branch: `docs/engineering-handbook`.
- Working tree before documentation updates: clean.
- Latest commit before this report: `96a57a6 docs(handbook): refresh milestone state`.
- Source files under `apps/web/src`: 243.
- Test files under `apps/web/src`: 59.
- Supabase migration files: 12.
- Diagnostic instrumentation search: no `KK_LOGIN_DEBUG` or `console.info` matches under `apps/web/src`.

## Architecture Evidence

- Stack evidenced by manifests: React 19, Vite, TypeScript, Tailwind, Supabase, pnpm workspaces, Vitest, ESLint, Prettier.
- Accepted ADRs 0001-0010 cover inventory ledger immutability, positive quantity effects, Supabase/RLS boundaries, temporary volunteer sessions, offline PWA direction, repository pattern, RPC/browser trust, domain organization, reversibility, and security review before commit readiness.
- Architectural invariants require immutable inventory transactions, derived balances, server/database authorization, explicit repository boundaries, scoped temporary volunteer sessions, and security review before security-sensitive commit readiness.

## Permission Drift Evidence

- `docs/AUTH_ARCHITECTURE.md` describes temporary volunteers with limited inventory permissions including transfer, consume, and return.
- `docs/PERMISSIONS_MATRIX.md` says temporary volunteers cannot receive, transfer, consume, return, adjust, or undo inventory and receive only `volunteer_sessions.create`.
- `apps/web/src/features/auth/lib/permissions.ts` grants temporary volunteers `inventory.read`, `inventory.receive`, `inventory.transfer`, `inventory.consume`, and `inventory.return`.
- Receive, transfer, and return workflow tests include cases allowing temporary volunteers with the corresponding inventory permissions.

## Documentation Validation

- `CURRENT_MILESTONE.md`, `NEXT_MILESTONE.md`, `CURRENT_STATE.md`, `PROJECT_MEMORY.md`, `IMPLEMENTATION_PATTERNS.md`, `COMMON_FAILURES.md`, and `CHANGELOG_SUMMARY.md` were updated for the approved milestone handoff.
- `PROJECT_RECONSTRUCTION.md` was updated because it still carried an older ranked candidate table.
- `TECH_DEBT.md` was updated because its verification-debt wording implied no latest verification result was recorded, while current state already records the latest full verification.

## Verification Results

Passed for this documentation handoff:

- `corepack pnpm@9.15.4 format`
- `corepack pnpm@9.15.4 typecheck`
- `corepack pnpm@9.15.4 lint`
- `corepack pnpm@9.15.4 test` with 59 test files and 295 tests passing.
- `corepack pnpm@9.15.4 build`

Build note: production build completed successfully and emitted the existing Vite chunk-size warning for `dist/assets/index-C64LQRk1.js` at 590.38 kB.

## Residual Risks

- The approved milestone is security-sensitive because it affects temporary volunteer authorization expectations.
- No RLS, RPC, migration, or permission behavior changes are included in this documentation handoff.
- The implementation phase must not infer the product/security policy from stale docs alone.

## Evidence Location

This evidence is stored in `docs/handbook/reference/EVIDENCE_REPORT.md`.
