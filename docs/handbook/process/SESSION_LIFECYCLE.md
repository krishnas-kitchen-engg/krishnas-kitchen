---
title: Session Lifecycle
status: active
doc_type: process
lifecycle: living
owner: engineering
update_cadence: when AI or contributor session workflow changes
last_reviewed: null
related:
  - ./README.md
  - ./MILESTONE_LIFECYCLE.md
  - ./DEFINITION_OF_DONE.md
  - ./QUALITY_GATES.md
  - ../governance/AI_ENGINEERING_OPERATING_MODEL.md
  - ../governance/AI_EXECUTION_PROTOCOL.md
  - ../governance/REPOSITORY_REFRESH_PROTOCOL.md
  - ../governance/ENGINEERING_SYSTEM.md
  - ../governance/PROJECT_CONSTITUTION.md
---

# Session Lifecycle

This document summarizes session lifecycle expectations. The canonical state machine, operating loop, and approval boundaries live in [AI Engineering Operating Model](../governance/AI_ENGINEERING_OPERATING_MODEL.md).

## Purpose

Use this document to keep each session grounded in repository context and to ensure knowledge does not disappear at session completion.

## Startup

- Confirm objective and constraints.
- Identify whether the session is documentation, code, tests, migrations, operations, review, or planning.
- Check current repository status.
- Identify prohibited actions.

## Operating States

Use the state machine in [AI Engineering Operating Model](../governance/AI_ENGINEERING_OPERATING_MODEL.md) for session states, inputs, outputs, exit conditions, and failure conditions.

Use [Repository Refresh Protocol](../governance/REPOSITORY_REFRESH_PROTOCOL.md) for refresh details, [Quality Gates](./QUALITY_GATES.md) for pass/fail gates, and [Definition of Done](./DEFINITION_OF_DONE.md) for completion criteria.

## Knowledge Externalization

- Record durable decisions in ADRs or recommend ADR creation.
- Update living docs when allowed.
- Report unresolved drift.
- Name assumptions and risks.
- Recommend exactly one next candidate milestone when appropriate.

## Living Or Historical

This is living documentation. It defines the current engineering session workflow.

## Who Updates It

Engineering owns this document. AI workflow changes should be reflected here.

## When To Update It

Update this document when:

- Session startup requirements change.
- Verification expectations change.
- Knowledge externalization expectations change.
- AI execution protocol changes.

## Related Documents

- [Milestone Lifecycle](./MILESTONE_LIFECYCLE.md)
- [Quality Gates](./QUALITY_GATES.md)
- [Definition of Done](./DEFINITION_OF_DONE.md)
- [Engineering Review Checklist](./ENGINEERING_REVIEW_CHECKLIST.md)
- [AI Engineering Operating Model](../governance/AI_ENGINEERING_OPERATING_MODEL.md)
- [Project Constitution](../governance/PROJECT_CONSTITUTION.md)
- [AI Execution Protocol](../governance/AI_EXECUTION_PROTOCOL.md)
- [Repository Refresh Protocol](../governance/REPOSITORY_REFRESH_PROTOCOL.md)
- [Engineering System](../governance/ENGINEERING_SYSTEM.md)
