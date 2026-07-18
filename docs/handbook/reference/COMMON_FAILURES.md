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
  - ../architecture/security.md
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
| Committed milestone remains described as pending | Commit completion did not automatically refresh all current/next milestone and reconstruction references | Living milestone state refresh realigns planning docs with git history | After every commit, compare latest commit, current milestone, next milestone, scorecard, reconstruction, and evidence before recommending new work |
| Undo/reversal terminology drifts | Historical docs and migrations use different terminology | Canonical terms now distinguish user-facing undo action, persisted reversal transaction, and legacy undo compatibility | Check [ADR-0009](../adrs/0009-auditability-and-reversibility.md) and [Inventory Architecture](../../INVENTORY_ARCHITECTURE.md) before correction workflow work |
| Return semantics drift | Feature docs and migration compatibility can make current return behavior look broader than it is | Canonical terms now define current returns as `returned` plus `transfer`; `returned` plus `increase` is compatibility only | Check [ADR-0002](../adrs/0002-positive-quantities-and-quantity-effects.md), [Inventory Architecture](../../INVENTORY_ARCHITECTURE.md), and return validation tests before return workflow work |
| Offline implementation starts without architecture | Offline was required before detailed queue architecture existed | Offline sync architecture now defines queue, replay, idempotency, conflict, and authorization constraints | Implement local queue storage, replay, and idempotency only through separately approved milestones that follow [Offline Sync Architecture](../architecture/offline-sync.md) |
| Security ownership is split across status and source material | ADRs, migrations, auth docs, permission docs, and status notes described security boundaries without one living architecture owner | Security Architecture now owns durable auth/RLS/RPC/temporary-volunteer boundaries; Security Status tracks posture and review evidence | Update Security Architecture for boundary changes and Security Status for review outcomes |
| Security baseline is mistaken for production approval | Review evidence can sound like a release decision if approval status is not explicit | Security Status now records the Horizon 1 baseline separately from production security approval | State whether a review is a baseline, a required-change list, or production approval before security-sensitive commit readiness |
| Future horizon expands implementation scope | Long-term product vision can be mistaken for current implementation authority | Product Horizons now defines the active horizon and horizon rules | Reject implementation candidates outside the active horizon; allow future horizons to influence architecture only |
| Resume restarts completed workflow | A resumed session can look like a new session if reconstruction ignores current repository evidence | Session Controller now requires reconstruction first, then continuation from the evidence-backed controller state | Do not create session files; use git status, living docs, and evidence reports to determine whether to resume or restart |
| Recipe implementation becomes planning implementation | Recipe definitions sit upstream of availability, shopping lists, menu planning, procurement, and forecasting | Keep the first recipe slice domain-only and explicitly defer UI, persistence, availability, shopping-list, and higher-horizon behavior | For recipe milestones, state what is deferred and verify no routes, migrations, permissions, or planning workflows were added |
| Recipe scaling absorbs unit conversion | Serving scaling and unit conversion both change quantities, so they can be conflated | Scaling now preserves units and only multiplies quantities by the serving ratio | Treat unit conversion as a separate domain decision and do not add it opportunistically |
| Recipe availability reuses the same inventory twice | Duplicate recipe ingredient lines can share an item/unit key | Availability now allocates projected balance per recipe line instead of treating each line as independently fully stocked | Test duplicate item/unit recipe lines and keep reservations, conversion, and shopping-list generation outside availability unless separately approved |
| Recipe shopping list becomes procurement | Shortage output can be mistaken for purchase workflow ownership | Shopping-list generation now outputs shortage-only item/unit groups without vendors, approvals, persistence, or procurement behavior | Treat procurement and approval workflow as separate future milestones; keep domain shopping lists deterministic and exact-unit |

## Engineering Discoveries

| Discovery | Impact | Future Guidance |
|---|---|---|
| The operating model must be singular | Duplicate workflow descriptions make AI drift more likely | Point governance and process docs back to [AI Engineering Operating Model](../governance/AI_ENGINEERING_OPERATING_MODEL.md) |
| Candidate milestones need explicit comparison | A single candidate can hide better or safer alternatives | Present the top three candidates and explain why only one is recommended |
| Scorecards should be qualitative unless measurements are current | Stale or invented metrics create false confidence | Track only high-value health indicators with evidence and confidence |
| Stop conditions must be explicit | AI sessions can otherwise continue through ambiguity | Stop on ADR need, conflicting priorities, unclear product/security intent, scope expansion, repeated verification failure, inconsistent repository state, conflicting handbook guidance, or low confidence |
| Completed milestone state can remain sticky | If living status docs are not refreshed after a commit, future sessions may start from stale recommendations | Treat current milestone, next milestone, scorecard, and limitations as a linked status set during milestone closeout |
| Post-commit drift can be its own smallest slice | The safest next milestone may be correcting state after a commit, not adding product behavior | Prefer a documentation-only state refresh when living docs contradict clean git history |
| Reconstruction references can preserve stale candidate tables | A refreshed candidate page does not automatically update summary reconstruction docs | Include reconstruction summaries in living-document validation when a planning commit changes active milestone state |
| Permission fixture defaults can hide restricted-session behavior | A component may look correctly tested while the fixture still grants the operation under test | Add direct helper tests for role/session permission sets and override fixture defaults in screen tests |
| Terminology fixes can look like behavior work | The words "undo" and "reversal" span UI, service, domain, schema, and legacy data contexts | First classify each reference as user action, domain event, persisted transaction type, or compatibility history; change behavior only under a separate approved milestone |
| Compatibility constraints look like current behavior | Migrations may permit historical or transitional row shapes that new application code should not create | Separate current creation semantics from read/schema compatibility in architecture docs and tests |
| Offline requirements look like current implementation | Product and architecture docs require offline capability, while source currently has only PWA tooling and offline-safe metadata | Separate requirement, current status, and future implementation in living architecture before writing queue code |
| Security posture and security architecture are different documents | A status page can age quickly, while architecture should hold durable boundaries | Keep implementation-independent security boundaries in [Security Architecture](../architecture/security.md) and record review freshness in [Security Status](./SECURITY_STATUS.md) |
| Security baseline and production readiness are different decisions | A completed review can record current risks without clearing the system for production | Include approval status and required changes in every security review record |
| Product vision looks like milestone scope | Future horizons describe legitimate long-term direction but are not active implementation scope | Include Horizon, reason it belongs to the horizon, and evidence value in every milestone recommendation |
| Evidence capture becomes workflow sprawl | Evidence promotion and living-doc updates can become a separate process if not tied to completion | Session Controller now keeps Evidence Capture inside the Verification to Ready For Human Review transition | Identify lessons, patterns, memory needs, and promotion candidates during completion without adding states |
| Recipe definitions can share inventory vocabulary | Recipe ingredients need item references and units, and the repository already owns `EntityId` and `ItemUnit` in shared types | Reusing shared types avoids parallel unit systems before recipe persistence exists | Prefer shared inventory-compatible primitives for recipe foundations unless an ADR introduces a new recipe-specific unit model |
| Recipe scaling is deterministic without persistence | Scaling can be proven before database or UI work exists | Pure domain scaling gives availability and shopping-list work a tested ingredient quantity contract | Keep recipe calculations pure until persistence and authorization are separately approved |
| Recipe availability can be proven without persistence | Availability only needs normalized recipe inputs and projected inventory item balances | Pure domain availability gives shopping-list work a tested shortage/status contract | Keep unit conversion, location policy, reservations, persistence, and procurement outside the availability foundation until separately approved |
| Recipe shopping lists can be proven without procurement | A shopping-list primitive only needs recipe availability shortages | Pure domain shopping-list generation gives UI and persistence work a stable shortage-output contract | Keep procurement, vendor management, approval workflows, and persistence outside the shopping-list foundation until separately approved |

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
- [Security Architecture](../architecture/security.md)
