---
title: Common Failures and Engineering Lessons
status: active
doc_type: reference
lifecycle: living
owner: engineering
update_cadence: when recurring failures or engineering discoveries are discovered, resolved, or prevented
last_reviewed: null
related:
  - ./README.md
  - ./PROJECT_MEMORY.md
  - ./IMPLEMENTATION_PATTERNS.md
  - ./DOCUMENTATION_DRIFT.md
  - ./TECH_DEBT.md
  - ../governance/AI_ENGINEERING_OPERATING_MODEL.md
---

# Common Failures and Engineering Lessons

## Purpose

This document records recurring issues, likely root causes, fixes, prevention guidance, and concise engineering discoveries.

Use it to prevent repeated mistakes and surface practical lessons. Keep durable institutional memory in [Project Memory](./PROJECT_MEMORY.md), and keep detailed investigations in root-cause analyses or milestone reviews when needed.

## Failure Register

| Failure | Root Cause | Fix | Prevention |
|---|---|---|---|
| Workflow stops when no approved milestone exists | Candidate proposal and approval were not explicitly separated | Operating model now requires top candidates and one recommendation before human approval | Keep [Next Milestone](./NEXT_MILESTONE.md) populated with candidate options |
| AI expands handbook infrastructure instead of returning to app work | Stewardship rules were unclear | Handbook stewardship now limits new docs to real gaps | Prefer updating existing living docs and cite [Handbook Stewardship](../roadmap.md) |
| Debug instrumentation remains in auth flow | Diagnostic work was left in dirty app files | Temporary volunteer login diagnostics were removed and verified with source search, full tests, typecheck, lint, and build | Check dirty worktree during repository audit and search for diagnostic markers before commit readiness |
| Permission work uses wrong temporary-volunteer source | Documentation drift exists between auth docs, permissions matrix, and feature docs | Resolve through a focused permission/authorization milestone | Check [Documentation Drift](./DOCUMENTATION_DRIFT.md) and [Open Decisions](./OPEN_DECISIONS.md) before auth work |
| Permission tests inherit broad fixture defaults | Auth test helpers default to operational permissions even when a test is about restricted temporary sessions | Set exact permission arrays in restricted-session tests and add source-level permission helper coverage | Treat permissions as part of the test input, not ambient fixture background |
| Reconstruction docs lag behind next milestone state | Candidate updates did not reach every living reconstruction reference | Refresh stale reconstruction references during the next documentation handoff | Cross-check [Project Reconstruction](./PROJECT_RECONSTRUCTION.md), [Current Milestone](./CURRENT_MILESTONE.md), and [Next Milestone](./NEXT_MILESTONE.md) before committing planning docs |
| Undo/reversal terminology drifts | Historical docs and migrations use different terminology | Canonical terms now distinguish user-facing undo action, persisted reversal transaction, and legacy undo compatibility | Check [ADR-0009](../adrs/0009-auditability-and-reversibility.md) and [Inventory Architecture](../../INVENTORY_ARCHITECTURE.md) before correction workflow work |
| Offline implementation starts without architecture | Offline is required but detailed queue architecture is incomplete | Create or approve a focused offline architecture milestone before offline writes | Score offline work carefully for dependencies and confidence |

## Engineering Discoveries

| Discovery | Impact | Future Guidance |
|---|---|---|
| The operating model must be singular | Duplicate workflow descriptions make AI drift more likely | Point governance and process docs back to [AI Engineering Operating Model](../governance/AI_ENGINEERING_OPERATING_MODEL.md) |
| Candidate milestones need explicit comparison | A single candidate can hide better or safer alternatives | Present the top three candidates and explain why only one is recommended |
| Scorecards should be qualitative unless measurements are current | Stale or invented metrics create false confidence | Track only high-value health indicators with evidence and confidence |
| Stop conditions must be explicit | AI sessions can otherwise continue through ambiguity | Stop on ADR need, conflicting priorities, unclear product/security intent, scope expansion, repeated verification failure, inconsistent repository state, conflicting handbook guidance, or low confidence |
| Completed milestone state can remain sticky | If living status docs are not refreshed after a commit, future sessions may start from stale recommendations | Treat current milestone, next milestone, scorecard, and limitations as a linked status set during milestone closeout |
| Reconstruction references can preserve stale candidate tables | A refreshed candidate page does not automatically update summary reconstruction docs | Include reconstruction summaries in living-document validation when a planning commit changes active milestone state |
| Permission fixture defaults can hide restricted-session behavior | A component may look correctly tested while the fixture still grants the operation under test | Add direct helper tests for role/session permission sets and override fixture defaults in screen tests |
| Terminology fixes can look like behavior work | The words "undo" and "reversal" span UI, service, domain, schema, and legacy data contexts | First classify each reference as user action, domain event, persisted transaction type, or compatibility history; change behavior only under a separate approved milestone |

## Owner

Engineering owns this document.

## Update Cadence

Update when a failure recurs, a discovery changes future behavior, or a prevention rule changes.

## Lifecycle

This is living documentation.

## Related Documents

- [Project Memory](./PROJECT_MEMORY.md)
- [Implementation Patterns](./IMPLEMENTATION_PATTERNS.md)
- [Documentation Drift](./DOCUMENTATION_DRIFT.md)
- [Technical Debt](./TECH_DEBT.md)
- [AI Engineering Operating Model](../governance/AI_ENGINEERING_OPERATING_MODEL.md)
