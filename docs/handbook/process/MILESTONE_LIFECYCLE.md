---
title: Milestone Lifecycle
status: active
doc_type: process
lifecycle: living
owner: engineering
update_cadence: when milestone execution workflow changes
last_reviewed: null
related:
  - ./README.md
  - ./QUALITY_GATES.md
  - ./DEFINITION_OF_DONE.md
  - ./POST_IMPLEMENTATION_REVIEW.md
  - ./ENGINEERING_REVIEW_CHECKLIST.md
  - ../governance/PROJECT_CONSTITUTION.md
  - ../governance/AI_EXECUTION_PROTOCOL.md
  - ../governance/REPOSITORY_REFRESH_PROTOCOL.md
  - ../governance/ENGINEERING_SYSTEM.md
---

# Milestone Lifecycle

This document defines the standard lifecycle for executing an engineering milestone.

## Purpose

Use this document to plan and run implementation work from initial request through completion and next-step planning.

## 1. Planning

- Clarify the objective.
- Identify constraints and prohibited actions.
- Define success criteria.
- Identify required human review.
- Identify expected outputs.

## 2. Repository Refresh

- Check repository status.
- Read relevant handbook and existing documentation.
- Inspect affected files and tests.
- Identify current implementation patterns.
- Note drift, dirty worktree risk, and unknowns.

Use [Repository Refresh Protocol](../governance/REPOSITORY_REFRESH_PROTOCOL.md).

## 3. Architecture Reconstruction

- Reconstruct affected architecture from documentation, code, tests, and migrations.
- Identify domain boundaries, persistence boundaries, and security boundaries.
- Check relevant ADRs and candidate ADR needs.
- Confirm the milestone does not introduce hidden architecture changes.

## 4. Implementation

- Make the smallest coherent change.
- Follow existing patterns.
- Keep unrelated changes out.
- Preserve user work.
- Update docs alongside behavior when allowed.

For AI-assisted work, use [AI Execution Protocol](../governance/AI_EXECUTION_PROTOCOL.md).

## 5. Testing

- Run the checks required by scope and risk.
- Add or update tests when behavior changes.
- Use manual validation when automated tests are insufficient.
- Document any check that cannot be run.

## 6. Review

- Use [Engineering Review Checklist](./ENGINEERING_REVIEW_CHECKLIST.md).
- Validate architecture, security, tests, documentation, maintainability, and operational risk.
- Request human review when required by governance or risk.

## 7. Documentation

- Update living documents affected by the milestone.
- Link to existing sources instead of duplicating them.
- Recommend ADRs for durable decisions.
- Record unresolved drift and follow-up work.

## 8. Commit

- Confirm [Definition of Done](./DEFINITION_OF_DONE.md).
- Confirm commit approval.
- Stage only intended files.
- Commit with a focused message.
- Do not include unrelated dirty worktree changes.

## 9. Validation

- Reconfirm final repository state.
- Verify outputs match the milestone objective.
- Summarize checks and manual validation.
- Identify residual risks.

## 10. Retrospective

- Capture lessons learned.
- Identify process, docs, tests, or architecture gaps.
- Convert durable lessons into living documentation when appropriate.

## 11. Next Milestone Planning

- Identify the next smallest valuable milestone.
- List prerequisites and review gates.
- Keep future work separate from the completed milestone.

## Living Or Historical

This is living documentation. It defines the current milestone execution model.

## Who Updates It

Engineering owns this lifecycle. Changes should be reviewed when they affect how work is planned, executed, committed, or validated.

## When To Update It

Update this document when:

- Milestone workflow changes.
- Commit or review expectations change.
- New quality gates are introduced.
- Repeated milestone failures reveal missing lifecycle steps.

## Related Documents

- [Quality Gates](./QUALITY_GATES.md)
- [Definition of Done](./DEFINITION_OF_DONE.md)
- [Session Lifecycle](./SESSION_LIFECYCLE.md)
- [Post-Implementation Review](./POST_IMPLEMENTATION_REVIEW.md)
- [Engineering Review Checklist](./ENGINEERING_REVIEW_CHECKLIST.md)
- [Project Constitution](../governance/PROJECT_CONSTITUTION.md)
- [AI Execution Protocol](../governance/AI_EXECUTION_PROTOCOL.md)
- [Repository Refresh Protocol](../governance/REPOSITORY_REFRESH_PROTOCOL.md)
- [Engineering System](../governance/ENGINEERING_SYSTEM.md)

