---
title: AI Engineering Operating Model
status: active
doc_type: governance
lifecycle: living
owner: engineering
update_cadence: when the canonical engineering workflow, approval boundaries, state machine, or scoring framework changes
last_reviewed: null
related:
  - ./README.md
  - ./PROJECT_CONSTITUTION.md
  - ./AI_EXECUTION_PROTOCOL.md
  - ./REPOSITORY_REFRESH_PROTOCOL.md
  - ./ENGINEERING_SYSTEM.md
  - ../process/MILESTONE_LIFECYCLE.md
  - ../process/SESSION_LIFECYCLE.md
  - ../process/QUALITY_GATES.md
  - ../process/ENGINEERING_REVIEW_CHECKLIST.md
  - ../reference/CURRENT_STATE.md
  - ../reference/CURRENT_MILESTONE.md
  - ../reference/NEXT_MILESTONE.md
  - ../reference/PROJECT_SCORECARD.md
---

# AI Engineering Operating Model

This document is the canonical operational contract for every future AI-assisted engineering session in Krishna's Kitchen.

## Purpose

Use this document to run engineering work from repository refresh through commit readiness without creating parallel processes. Other governance and process documents define principles, checklists, or references; this document defines the operating loop.

## Operating Loop

Every engineering session follows this sequence:

1. Repository refresh.
2. Repository audit.
3. Candidate micro-milestone proposal.
4. Human approval.
5. Implementation.
6. Verification.
7. Engineering review.
8. Living documentation update.
9. Commit approval.
10. Commit.

Do not skip from refresh or audit directly into implementation. Do not treat implementation approval as commit approval.

## AI Responsibilities

AI is responsible for:

- Reconstructing repository state from current files, documentation, tests, migrations, and git status.
- Auditing partially completed work, dirty worktree risk, documentation drift, relevant technical debt, and known limitations.
- Selecting exactly one candidate micro-milestone.
- Explaining why that candidate is next using the scoring framework in this document.
- Waiting for human approval before implementation.
- Implementing only the approved milestone.
- Running applicable verification.
- Performing self-review, architecture review, security review, repository review, and documentation review.
- Updating required living documentation when the milestone changes current state.
- Reporting residual risk, confidence, and commit readiness.
- Requesting separate commit approval before committing.

## Human Responsibilities

The human is responsible for:

- Approving, rejecting, or redirecting the candidate micro-milestone.
- Providing product or operational intent when repository evidence is insufficient.
- Approving security-sensitive direction when required by governance.
- Approving or rejecting the commit after implementation, verification, review, and living documentation updates.

## Decision Authority

Use the decision hierarchy in [Project Constitution](./PROJECT_CONSTITUTION.md).

AI may decide implementation details that are local, reversible, consistent with existing patterns, and inside the approved milestone.

Human approval is required for:

- Candidate milestone approval.
- Commit approval.
- Architecture changes.
- Security boundary changes.
- Migrations or destructive data changes.
- New dependencies, frameworks, or durable operating patterns.
- Resolving product intent when documentation and implementation disagree.

## Approval Boundaries

Milestone approval authorizes implementation of exactly one candidate micro-milestone.

Commit approval authorizes staging and committing only the reviewed, intended scope.

Approval to inspect, plan, or propose does not authorize implementation. Approval to implement does not authorize commit.

## Candidate Milestone Selection

After repository refresh and audit, propose exactly one candidate micro-milestone.

The candidate must be:

- The highest-priority next implementation step supported by repository evidence.
- Small enough for one engineering session.
- Independently verifiable.
- Independently reversible.
- Consistent with accepted ADRs and architectural invariants.
- Explicitly scored using the milestone scoring framework.
- Recorded in [Next Milestone](../reference/NEXT_MILESTONE.md) with Status: Candidate and Approval: Pending Human Approval when living documentation updates are in scope.

If no safe candidate can be identified, enter Blocked and request human direction.

## Engineering Session State Machine

| State | Inputs | Outputs | Exit Conditions | Failure Conditions |
|---|---|---|---|---|
| Repository Reconstruction | User request, git status, handbook reading paths, current docs | Reconstructed project state and constraints | Required sources read and current state understood | Required sources unavailable or instructions conflict |
| Repository Audit | Reconstructed state, git diff/status, relevant docs/code/tests/migrations | Audit findings, dirty worktree risks, drift, technical debt | Risks and relevant unfinished work identified | Unsafe dirty worktree or contradictory authority cannot be resolved |
| Candidate Generation | Audit findings, roadmap, ADRs, invariants, scorecard | Exactly one candidate micro-milestone and score | Candidate is small, verifiable, reversible, and justified | No safe candidate or insufficient product/security intent |
| Human Approval Pending | Candidate proposal and score | Approval, rejection, or redirection | Human approves implementation | Human rejects, redirects, or does not provide required decision |
| Implementation | Approved candidate, affected files, local patterns | Focused implementation changes | Scope implemented without unrelated changes | Scope expands, architecture changes needed, or blocked dependency appears |
| Testing | Implemented changes and verification plan | Typecheck, lint, tests, build, or scoped checks | Applicable checks pass or documented not applicable | Failing checks not understood or cannot be fixed in scope |
| Repair | Failed verification or review finding | Focused fixes | Failures fixed and verification returns to Testing | Fix requires new scope, architecture change, or human decision |
| Review | Verified changes, governance, checklists | Self-review, architecture, security, repository, documentation review | Required findings resolved or documented | Security/architecture risk unresolved |
| Documentation Update | Reviewed changes, living docs | Updated living docs or documented gap | Required living docs updated or gap reported | Documentation change would exceed approved scope |
| Commit Approval Pending | Final diff, verification results, review summary | Human commit approval or rejection | Human approves commit | Human rejects commit or requests more work |
| Completed | Approved commit or no-commit handoff | Final report and clean handoff | User receives summary, risks, validation, and next candidate | Final state cannot be explained clearly |
| Blocked | Missing authority, unsafe state, unavailable dependency | Blocker report and requested decision | Human resolves blocker or redirects | Same blocker persists across resumed attempts |
| Failed | Unrecoverable verification, data, security, or tooling failure | Failure report and recovery recommendation | Human chooses recovery path | Failure affects repository integrity or cannot be diagnosed |

## Milestone Scoring Framework

Score each proposed candidate from 1 to 5. Higher is better. For risk-oriented criteria, a higher score means the risk is lower or better contained.

| Criterion | Score 1 | Score 3 | Score 5 |
|---|---|---|---|
| Architecture Alignment | Conflicts or unclear | Mostly aligned with known gaps | Clearly aligned with ADRs and invariants |
| Roadmap Alignment | Not supported | Related but not explicit | Directly supported by current milestone, next milestone, roadmap, or debt |
| Security Risk | High unresolved security risk | Some review needed | Low or well-contained risk |
| Complexity | Broad or hard to reason about | Moderate | Small and simple |
| Blast Radius | Cross-cutting or production-sensitive | Several files or flows | Localized |
| Testability | Hard to verify | Partially testable | Clear automated or manual validation |
| Reversibility | Hard to undo | Reversible with care | Easy to revert or isolate |
| Dependencies | Many unresolved dependencies | Some dependencies | Few or none |
| Expected Value | Low or speculative | Useful | High operational or engineering value |
| Confidence | Low evidence | Some evidence | Strong repository evidence |

Recommendation:

- Proceed: alignment, testability, reversibility, expected value, and confidence are high; risk, complexity, blast radius, and dependencies are low or manageable.
- Request Human Decision: product intent, security posture, architecture direction, or ownership is unclear.
- Defer: value is lower than risk, complexity, blast radius, or dependencies.
- Block: implementation would violate an invariant, require unapproved architecture change, or proceed without required authority.

## Review Requirements

Self-review checks scope, correctness, maintainability, and verification evidence.

Architecture review checks ADRs, architectural invariants, boundaries, dependencies, data ownership, and unintended design changes.

Security review checks authentication, authorization, RLS, RPCs, tenant isolation, secrets, browser trust, auditability, and abuse risk.

Repository review checks dirty worktree handling, unrelated changes, file ownership, generated artifacts, and commit scope.

Documentation review checks living documents, drift, cross-references, and whether durable decisions need ADRs.

## Commit Readiness

A milestone is commit-ready only when:

- The approved scope is complete.
- Applicable verification passes or exceptions are documented.
- Required reviews are complete.
- Required living documentation is updated.
- Residual risks are documented.
- The final diff contains only intended files.
- Human commit approval has been granted.

## Confidence Thresholds

Use High confidence only when repository evidence, tests, and documentation agree.

Use Medium confidence when the change is supported but some validation or documentation is partial.

Use Low confidence when product intent, security posture, architecture, tests, or current implementation evidence is unclear.

Do not implement with Low confidence without human approval that explicitly accepts the uncertainty.

## Escalation Rules

Escalate to the human when:

- Instructions conflict.
- Documentation and code disagree and the authoritative source is unclear.
- A candidate changes architecture, security boundaries, migrations, dependencies, or non-negotiable invariants.
- Dirty worktree changes affect the candidate and ownership is unclear.
- Verification failures imply broader behavior changes.
- The milestone score recommends Request Human Decision, Defer, or Block.

## Failure Recovery

When implementation or verification fails:

1. Stop broadening scope.
2. Identify the smallest failing unit.
3. Repair only within the approved milestone.
4. Re-run the relevant verification.
5. Escalate if repair requires new scope or authority.
6. Report the failure, recovery attempt, and remaining risk.

## Drift Detection

During refresh, audit, review, and documentation update, look for drift between:

- Handbook governance and process docs.
- Living docs and implementation.
- ADRs and current architecture.
- Feature specs and current behavior.
- Migrations and schema references.
- Permission docs and authorization behavior.
- Tests and documented expectations.

Record unresolved drift in [Documentation Drift](../reference/DOCUMENTATION_DRIFT.md) when documentation updates are in scope; otherwise report it in the final handoff.

## Repository-First Reconstruction

Every session begins from repository evidence, not conversation memory.

Minimum reconstruction sources:

- [Engineering Handbook](../README.md)
- [Reading Paths](../reading-paths.md)
- This operating model
- [Current State](../reference/CURRENT_STATE.md)
- [Current Milestone](../reference/CURRENT_MILESTONE.md)
- [Next Milestone](../reference/NEXT_MILESTONE.md)
- Relevant ADRs, architecture docs, process docs, code, tests, and migrations for the task

## Living Or Historical

This is living documentation. It is the canonical AI engineering operating contract.

## Who Updates It

Engineering owns this document. Changes should receive human review because they govern every future engineering session.

## When To Update It

Update this document when:

- The operating loop changes.
- Approval boundaries change.
- The state machine changes.
- The milestone scoring framework changes.
- Repeated engineering sessions reveal missing escalation or recovery rules.

## Related Documents

- [Governance Overview](./README.md)
- [Project Constitution](./PROJECT_CONSTITUTION.md)
- [AI Execution Protocol](./AI_EXECUTION_PROTOCOL.md)
- [Repository Refresh Protocol](./REPOSITORY_REFRESH_PROTOCOL.md)
- [Engineering System](./ENGINEERING_SYSTEM.md)
- [Milestone Lifecycle](../process/MILESTONE_LIFECYCLE.md)
- [Session Lifecycle](../process/SESSION_LIFECYCLE.md)
- [Quality Gates](../process/QUALITY_GATES.md)
- [Engineering Review Checklist](../process/ENGINEERING_REVIEW_CHECKLIST.md)
- [Current State](../reference/CURRENT_STATE.md)
- [Current Milestone](../reference/CURRENT_MILESTONE.md)
- [Next Milestone](../reference/NEXT_MILESTONE.md)
- [Project Scorecard](../reference/PROJECT_SCORECARD.md)
