---
title: AI Engineering Operating Model
status: stable
doc_type: governance
lifecycle: living
owner: engineering
update_cadence: when the canonical Session Controller, approval boundaries, or scoring framework changes
last_reviewed: null
related:
  - ./README.md
  - ./ENGINEERING_PRINCIPLES.md
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
  - ../reference/PROJECT_MEMORY.md
  - ../reference/IMPLEMENTATION_PATTERNS.md
  - ../reference/COMMON_FAILURES.md
  - ../../PRODUCT_HORIZONS.md
---

# AI Engineering Operating Model

This document is the canonical operational contract for every future AI-assisted engineering session in Krishna's Kitchen.

## Purpose

Use this document to run engineering work from repository reconstruction through session completion without creating parallel processes. Other governance and process documents define principles, checklists, or references; this document defines the Session Controller.

## Session Controller

The Session Controller is the canonical execution workflow for every AI-assisted engineering session. It is the only execution state machine in the Engineering Operating System.

Before Repository Reconstruction begins, determine whether the request starts a new engineering session or continues a previously interrupted session. Do not create persistent session files. Repository evidence is the source of truth.

The controller advances automatically whenever the current state has met its exit conditions and the next state does not require human approval. It stops only when:

- A milestone recommendation requires approval.
- A human clarification is required.
- A commit requires approval.

Repository Reconstruction always occurs at session start or resume. If repository evidence clearly shows an interrupted session, reconstruction rebuilds context and continues from the appropriate Session Controller state instead of restarting the workflow. Milestone Selection always follows [Product Horizons](../../PRODUCT_HORIZONS.md). Implementation must remain inside the ACTIVE horizon. Verification repeats until `STATUS = READY FOR HUMAN REVIEW` or human clarification is required. Commit is never allowed without explicit approval.

### State Machine

| State | Purpose | Entry Conditions | Actions | Exit Conditions | Allowed Next States | Stop Conditions | Human Approval Requirements |
|---|---|---|---|---|---|---|---|
| Repository Reconstruction | Rebuild project understanding from repository evidence. | New session or resumed session; user request received. | Follow [Repository Refresh Protocol](./REPOSITORY_REFRESH_PROTOCOL.md). Reconstruct the current project state, validate living docs against repository reality, document drift, and identify whether evidence points to a new session or interrupted workflow continuation. | Repository state, constraints, drift, active horizon, and appropriate next controller state are understood. | Milestone Selection, Implementation, Self Review, Verification, Ready For Human Review, Waiting For Commit Approval, Commit, Blocked | Stop only if required sources are unavailable, instructions conflict, repository state is unsafe, or human clarification is required. | None unless evidence conflicts or clarification is needed. |
| Milestone Selection | Identify the next safest active-horizon micro-milestone. | Repository Reconstruction complete; implementation work is appropriate. | Recommend exactly three production-ready micro-milestones from the ACTIVE horizon. Include required strategic alignment, horizon, complexity, risk, dependency, verification, evidence value, future-horizon support without scope expansion, and architectural impact fields. Recommend exactly one and explain rejected alternatives. Automatically reject out-of-horizon work. | Three valid candidates and one recommendation are ready. | Waiting For Approval, Blocked | Stop because milestone recommendation requires approval, or because no safe recommendation exists without clarification. | Required before implementation. |
| Waiting For Approval | Hold before implementation until the human approves one milestone. | Milestone Selection produced a recommendation. | Wait for approval, rejection, redirection, or clarification. Do not implement. | Human approves exactly one milestone, redirects, or clarification changes scope. | Implementation, Repository Reconstruction, Blocked | Stop until human approval or clarification is provided. | Required. |
| Implementation | Complete only the approved milestone. | Human approved exactly one milestone. | Implement the smallest vertical slice inside the ACTIVE horizon. Follow existing architecture, ADRs, patterns, security boundaries, and scope constraints. Avoid unrelated refactoring and prohibited files. Update living docs only when required by the milestone. | Approved scope is complete or implementation cannot proceed safely. | Self Review, Blocked | Stop only if human clarification is required, scope expansion is needed, or a required authority is missing. | Not required after milestone approval unless scope, architecture, security, dependency, migration, or product intent changes. |
| Self Review | Inspect the implemented work before verification handoff. | Implementation complete. | Review security, architecture, correctness, edge cases, regressions, documentation, repository scope, and changed files. Fix issues that are inside scope. | No known in-scope review findings remain, or a finding requires human clarification. | Verification, Implementation, Blocked | Stop only if a finding requires human clarification or expanded scope. | Required only for clarification, expanded scope, or sensitive direction changes. |
| Verification | Prove the implementation is ready or identify what must be repaired. | Self Review complete, or fixes require rerun. | Run required checks such as format, typecheck, lint, tests, build, and scoped validation. If checks fail, repair within scope and repeat. After successful verification, complete Evidence Capture before presenting `STATUS = READY FOR HUMAN REVIEW`. | Verification passes, Evidence Capture is complete, and `STATUS = READY FOR HUMAN REVIEW`; or human clarification is required. | Ready For Human Review, Implementation, Self Review, Blocked | Stop only if human clarification is required. Do not stop merely because verification failed if an in-scope repair is available. | Not required for in-scope repair. Required if failures imply new scope or unclear authority. |
| Blocked | Preserve safety when progress requires a human decision or unavailable dependency. | Any state detects unclear product/security intent, conflicting authority, unsafe repository state, out-of-scope repair, unavailable required source, or repeated unexplained verification failure. | Report blocker, evidence, attempted recovery, options if known, and the smallest decision needed. | Human resolves blocker or redirects. | Repository Reconstruction, Milestone Selection, Implementation, Self Review, Verification, Waiting For Approval | Stop because human clarification is required. | Required. |
| Ready For Human Review | Present completed implementation for human review. | Verification passed; review found no commit-blocking issues. | Report status, implementation summary, files changed, findings, risks, verification results, confidence, evidence, and recommended next action. Do not commit. | Human accepts review, requests changes, asks for clarification, or explicitly approves commit. | Waiting For Commit Approval, Commit, Implementation, Blocked | Stop until human review response. | Required for commit approval or requested changes. |
| Waiting For Commit Approval | Hold before commit until the human explicitly approves commit. | Human has reviewed or accepted the ready-for-review handoff, but commit approval has not yet been granted. | Wait for explicit commit approval. Do not stage or commit. | Human explicitly approves commit, requests changes, or asks for clarification. | Commit, Implementation, Blocked | Stop because commit requires approval. | Required. |
| Commit | Commit only the approved scope. | Explicit commit approval received. | Update required living docs and evidence, confirm Product Horizons changes are allowed only when active horizon or exit criteria changed, rerun required verification, confirm diff scope, stage intended files, commit, and capture commit hash/status/evidence. | Commit succeeds and repository status is known, or commit cannot proceed safely. | Session Complete, Blocked | Stop only if human clarification is required or commit cannot proceed safely. | Explicit approval required before entering this state. |
| Session Complete | Close the session with a clear handoff. | Commit completed, or a no-commit workflow has reached its requested stop point. | Report requested final fields, verification, evidence location, git status when relevant, residual risks, and future approved work when relevant. | Final handoff delivered. | Repository Reconstruction | None. A future user request starts a new session at Repository Reconstruction. | None. |

### Automatic Transitions

The controller moves automatically through Repository Reconstruction, Implementation, Self Review, Verification, Commit, and Session Complete when their exit conditions are met and no human approval is required. It must not pause for stylistic confirmation, optional preference checks, or non-blocking uncertainty.

The controller must not automatically cross these gates:

- Milestone Selection to Implementation.
- Ready For Human Review or Waiting For Commit Approval to Commit.
- Any state to a broader scope than the approved milestone.

### Status Outputs

Implementation handoffs use `STATUS = READY FOR HUMAN REVIEW` only when implementation, self review, and verification have no known commit-blocking issues. Use `STATUS = BLOCKED` only when human clarification is required or progress would violate the Session Controller.

### Evidence Capture

Evidence Capture is part of the Verification to Ready For Human Review transition, not a separate execution state.

After successful verification and before presenting `STATUS = READY FOR HUMAN REVIEW`, identify:

- Implementation lessons.
- Implementation patterns.
- Whether [Project Memory](../reference/PROJECT_MEMORY.md) requires updating.
- Whether other required living documentation should be updated.
- Evidence that may later qualify for Evidence Promotion.

Update required living documentation when the approved scope allows it. Otherwise, report the needed update or promotion candidate in the handoff.

### Completion Reporting

Completion reports must distinguish residual risks from future approved work.

Residual risks are issues that may affect the correctness, security, reliability, maintainability, scalability, or operation of the completed milestone. Examples include known performance limitations, existing warnings, technical debt introduced by the implementation, validation limitations, external dependencies, and operational concerns. Report only risks that apply to the completed milestone.

Future approved work is planned or intentionally deferred capability outside the approved milestone. Examples include future milestones, roadmap items, recipe persistence, shopping-list generation, authorization, offline recipe behavior, and future UI work. Do not report these as residual risks unless they directly affect the completed implementation.

When completing a milestone, organize the final report as:

- Commit hash.
- Git status.
- Verification summary.
- Documentation updates.
- Residual Risks, omitted when none are known.
- Future Approved Work, omitted when no relevant roadmap items need highlighting.

## AI Responsibilities

AI is responsible for:

- Reconstructing repository state from current files, documentation, tests, migrations, and git status.
- Auditing partially completed work, dirty worktree risk, documentation drift, relevant technical debt, and known limitations.
- Presenting the top three candidate micro-milestones.
- Recommending exactly one candidate for approval.
- Explaining why the recommendation is next using the scoring framework in this document.
- Waiting for human approval before implementation.
- Implementing only the approved milestone.
- Running applicable verification.
- Performing self-review, architecture review, security review, repository review, and documentation review.
- Updating required living documentation when the milestone changes current state.
- Reporting residual risks, future approved work when relevant, confidence, and commit readiness.
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

After repository refresh and audit, present the top three candidate micro-milestones and recommend exactly one for approval.

Candidate milestones must come from the active horizon in [Product Horizons](../../PRODUCT_HORIZONS.md). Architecture should support future horizons. Implementation must remain inside the ACTIVE horizon. If a candidate is outside the active horizon, reject it automatically and explain why instead of recommending it.

Each candidate must be:

- Small enough for one engineering session.
- Independently verifiable.
- Independently reversible.
- Consistent with accepted ADRs and architectural invariants.
- Inside the active product horizon.
- Explicitly scored using the milestone scoring framework.
- Recorded in [Next Milestone](../reference/NEXT_MILESTONE.md) when living documentation updates are in scope.

Every milestone recommendation must include:

- Strategic alignment.
- Current horizon.
- Reason it belongs to that horizon.
- Evidence value.
- How it supports future horizons without expanding scope.
- Confidence percentage.
- Assumptions.
- Uncertainties.
- Reasons alternative candidates were not recommended.

Every implementation milestone must answer:

- Does this maximize progress within the ACTIVE horizon?
- Does this avoid making future horizons harder to implement?

If no safe candidate can be recommended, enter Blocked and request human direction.

## State Machine Authority

Use the [Session Controller](#session-controller) for execution states, state transitions, automatic progression, stop conditions, and approval gates. Do not create or follow a second state machine in process or reference documents.

## Milestone Scoring Framework

Score each proposed candidate from 1 to 5. Higher is better. For risk-oriented criteria, a higher score means the risk is lower or better contained.

| Criterion | Score 1 | Score 3 | Score 5 |
|---|---|---|---|
| Architecture Alignment | Conflicts or unclear | Mostly aligned with known gaps | Clearly aligned with ADRs and invariants |
| Roadmap Alignment | Outside active horizon or not supported | Related to active horizon but not explicit | Directly supported by the active horizon, current milestone, next milestone, roadmap, or debt |
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

Every recommendation must state confidence percentage, assumptions, uncertainties, and why the other candidates were not recommended.

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
- Residual risks that apply to the completed milestone are documented.
- The final diff contains only intended files.
- Human commit approval has been granted.

## Confidence Thresholds

Use High confidence only when repository evidence, tests, and documentation agree.

Use Medium confidence when the change is supported but some validation or documentation is partial.

Use Low confidence when product intent, security posture, architecture, tests, or current implementation evidence is unclear.

Do not implement with Low confidence without human approval that explicitly accepts the uncertainty.

## Stop Conditions

Route to Blocked and request human guidance when:

- An ADR is required before safe implementation.
- Roadmap priorities conflict.
- Product intent is unclear.
- Security requirements are ambiguous.
- The implementation would exceed one approved micro-milestone.
- Verification repeatedly fails without a clear root cause.
- Repository state is inconsistent or dirty worktree ownership is unclear.
- Handbook guidance conflicts and the decision hierarchy does not resolve it.
- Confidence falls below the threshold required for the work.

When one of these conditions is met, the Session Controller stops because human clarification is required. Report the blocker, evidence, options if known, and the smallest decision needed to continue.

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
6. Report the failure, recovery attempt, and residual risk.

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

The Session Controller defines when reconstruction happens and where the session should continue afterward. [Repository Refresh Protocol](./REPOSITORY_REFRESH_PROTOCOL.md) defines how to execute the repository scan.

Use the required reading and scan rules in [Repository Refresh Protocol](./REPOSITORY_REFRESH_PROTOCOL.md). Product Horizons remains mandatory because it defines the active horizon for milestone selection.

## Living Or Historical

This is living documentation. It is the canonical AI engineering operating contract.

## Who Updates It

Engineering owns this document. Changes should receive human review because they govern every future engineering session.

## When To Update It

Update this document when:

- The Session Controller changes.
- Approval boundaries change.
- The milestone scoring framework changes.
- Repeated engineering sessions reveal missing escalation or recovery rules.

Do not update this document for speculative improvement. Future EOS changes require implementation-driven justification.

## Related Documents

- [Governance Overview](./README.md)
- [Engineering Principles](./ENGINEERING_PRINCIPLES.md)
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
- [Project Memory](../reference/PROJECT_MEMORY.md)
- [Implementation Patterns](../reference/IMPLEMENTATION_PATTERNS.md)
- [Common Failures and Engineering Lessons](../reference/COMMON_FAILURES.md)
