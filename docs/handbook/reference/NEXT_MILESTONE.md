---
title: Next Milestone
status: active
doc_type: reference
lifecycle: living
owner: engineering
update_cadence: when the highest-priority candidate implementation milestone changes, is approved, is rejected, or is replaced
last_reviewed: null
related:
  - ./README.md
  - ./CURRENT_MILESTONE.md
  - ./OPEN_DECISIONS.md
  - ./TECH_DEBT.md
  - ../governance/AI_ENGINEERING_OPERATING_MODEL.md
  - ../process/MILESTONE_LIFECYCLE.md
  - ../process/QUALITY_GATES.md
  - ../adrs/0010-security-review-before-commit.md
  - ../architecture/README.md
---

# Next Milestone

## Purpose

This document records the highest-priority candidate implementation milestone.

## Current Guidance

Do not use this page as a broad roadmap. It should contain exactly one candidate micro-milestone.

The candidate must be marked:

- Status: Candidate
- Approval: Pending Human Approval

AI sessions must use [AI Engineering Operating Model](../governance/AI_ENGINEERING_OPERATING_MODEL.md) to score and justify this candidate after repository refresh and audit. Implementation must not begin until the human approves the candidate. Commit approval remains a separate later gate.

## Status

Candidate

## Approval

Pending Human Approval

## Objective

Resolve the current temporary volunteer login diagnostic work into a clean, verified micro-milestone.

This candidate exists because the current working tree contains temporary volunteer login and navigation debug instrumentation in auth/routing files. The candidate is not approved for implementation.

## Scope

- Inspect the existing temporary volunteer login diagnostic changes.
- Decide whether the debug instrumentation should be removed, replaced by a tested fix, or preserved for an explicitly approved debugging session.
- Keep the milestone limited to the temporary volunteer login/navigation path.
- Do not change the temporary volunteer permission model.
- Do not change RLS, RPCs, migrations, or architecture.
- Expected affected areas if approved: `apps/web/src/features/auth/providers/AuthProvider.tsx`, `apps/web/src/features/auth/screens/LoginScreen.tsx`, `apps/web/src/app/routes/router.ts`, and existing relevant auth or route tests only if behavior changes.

## Dependencies

- Human approval of this candidate milestone.
- Milestone scoring using [AI Engineering Operating Model](../governance/AI_ENGINEERING_OPERATING_MODEL.md).
- Review of current dirty worktree changes before editing.
- Relevant auth, route, and temporary volunteer session tests.
- Security review because the area touches authentication/session flow.

## Risks

- Auth/session flow is security-sensitive.
- Current dirty worktree changes may be user work and must be preserved unless the user approves changing them.
- Temporary volunteer permissions are documented as drift and must not be silently redefined.

## Expected Deliverables

- Clean temporary volunteer login/navigation behavior.
- No stray debug logging unless explicitly approved as a diagnostic artifact.
- Updated or confirmed tests for affected auth/routing behavior.
- Living documentation updates only if behavior, risk, or milestone status changes.

## Milestone Score

| Criterion | Score | Rationale |
|---|---:|---|
| Architecture Alignment | 4 | Candidate stays within existing auth/routing boundaries and does not change architecture. |
| Roadmap Alignment | 4 | Candidate addresses current unfinished auth/session diagnostic work before new application development. |
| Security Risk | 3 | Auth/session flow is security-sensitive and requires review, but scope is narrow. |
| Complexity | 4 | Expected change is small if limited to diagnostic cleanup or focused fix. |
| Blast Radius | 4 | Expected files are localized to login, auth provider, and router behavior. |
| Testability | 4 | Relevant auth, route, and volunteer session tests exist or can be run. |
| Reversibility | 4 | Diagnostic cleanup or focused auth/routing change should be easy to revert. |
| Dependencies | 4 | Main dependency is human approval and current dirty worktree review. |
| Expected Value | 4 | Resolving unfinished auth diagnostic work reduces risk before further development. |
| Confidence | 3 | Repository evidence shows dirty debug instrumentation; final behavior intent still requires approval. |

Recommendation: Request Human Decision. The candidate is likely the right next implementation step, but it touches auth/session flow and current dirty worktree changes.

## Validation Plan

- Run relevant auth and route tests.
- Run typecheck, lint, full tests, and build before commit readiness if implementation is approved.
- Manually validate temporary volunteer login/navigation if a local app run is required by the implemented change.

## Owner

Engineering owns this document.

## Update Cadence

Update when the highest-priority candidate implementation milestone changes, is approved, is rejected, or is replaced.

## Lifecycle

This is living documentation.

## Related Documents

- [Current Milestone](./CURRENT_MILESTONE.md)
- [Open Decisions](./OPEN_DECISIONS.md)
- [Technical Debt](./TECH_DEBT.md)
- [AI Engineering Operating Model](../governance/AI_ENGINEERING_OPERATING_MODEL.md)
- [Milestone Lifecycle](../process/MILESTONE_LIFECYCLE.md)
- [Quality Gates](../process/QUALITY_GATES.md)
