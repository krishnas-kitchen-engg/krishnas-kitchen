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
  - ../governance/AI_ENGINEERING_OPERATING_MODEL.md
  - ../governance/PROJECT_CONSTITUTION.md
  - ../governance/AI_EXECUTION_PROTOCOL.md
  - ../governance/REPOSITORY_REFRESH_PROTOCOL.md
  - ../governance/ENGINEERING_SYSTEM.md
---

# Milestone Lifecycle

This document summarizes the milestone lifecycle. The canonical operating loop, state machine, scoring framework, and approval boundaries live in [AI Engineering Operating Model](../governance/AI_ENGINEERING_OPERATING_MODEL.md).

## Purpose

Use this document to plan and run implementation work from initial request through completion and next-step planning.

## Lifecycle Summary

Use the state machine in [AI Engineering Operating Model](../governance/AI_ENGINEERING_OPERATING_MODEL.md):

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

Use [Repository Refresh Protocol](../governance/REPOSITORY_REFRESH_PROTOCOL.md) for refresh details, [Quality Gates](./QUALITY_GATES.md) for pass/fail gates, [Engineering Review Checklist](./ENGINEERING_REVIEW_CHECKLIST.md) for review detail, and [Definition of Done](./DEFINITION_OF_DONE.md) for commit readiness.

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
- [AI Engineering Operating Model](../governance/AI_ENGINEERING_OPERATING_MODEL.md)
- [Project Constitution](../governance/PROJECT_CONSTITUTION.md)
- [AI Execution Protocol](../governance/AI_EXECUTION_PROTOCOL.md)
- [Repository Refresh Protocol](../governance/REPOSITORY_REFRESH_PROTOCOL.md)
- [Engineering System](../governance/ENGINEERING_SYSTEM.md)
