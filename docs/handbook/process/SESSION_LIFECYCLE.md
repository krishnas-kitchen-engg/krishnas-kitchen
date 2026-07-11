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
  - ../governance/AI_EXECUTION_PROTOCOL.md
  - ../governance/REPOSITORY_REFRESH_PROTOCOL.md
  - ../governance/ENGINEERING_SYSTEM.md
  - ../governance/PROJECT_CONSTITUTION.md
---

# Session Lifecycle

This document defines how every AI-assisted or contributor engineering session begins, proceeds, and ends.

## Purpose

Use this document to keep each session grounded in repository context and to ensure knowledge does not disappear at session completion.

## Startup

- Confirm objective and constraints.
- Identify whether the session is documentation, code, tests, migrations, operations, review, or planning.
- Check current repository status.
- Identify prohibited actions.

## Repository Reconstruction

- Read required governance documents.
- Read relevant handbook sections.
- Read existing source documents linked from the handbook.
- Inspect affected code, tests, migrations, or operations files when the task allows.
- Reconstruct the current state before making changes.

Use [Repository Refresh Protocol](../governance/REPOSITORY_REFRESH_PROTOCOL.md).

## Planning

- Define the smallest safe milestone.
- Identify quality gates.
- Identify verification commands.
- Identify documentation updates.
- Identify required human review.

## Implementation

- Work within the stated scope.
- Preserve unrelated changes.
- Follow existing repository patterns.
- Avoid broad rewrites.
- Keep progress aligned with the plan.

## Verification

- Run applicable checks.
- Validate documentation links and front matter for docs work.
- Run tests, lint, typecheck, and build when applicable.
- Document checks that were not run.

## Documentation

- Update living documents when permitted and required.
- Link rather than duplicate source material.
- Identify documentation drift when it cannot be fixed in scope.

## Review

- Apply [Engineering Review Checklist](./ENGINEERING_REVIEW_CHECKLIST.md).
- Confirm [Quality Gates](./QUALITY_GATES.md).
- Confirm [Definition of Done](./DEFINITION_OF_DONE.md).
- Request human review when required.

## Completion

- Summarize files changed.
- Summarize validation.
- Summarize risks and follow-up.
- Confirm prohibited areas were not modified.
- Do not commit unless explicitly approved.

## Knowledge Externalization

- Record durable decisions in ADRs or recommend ADR creation.
- Update living docs when allowed.
- Report unresolved drift.
- Name assumptions and risks.
- Recommend the next milestone.

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
- [Project Constitution](../governance/PROJECT_CONSTITUTION.md)
- [AI Execution Protocol](../governance/AI_EXECUTION_PROTOCOL.md)
- [Repository Refresh Protocol](../governance/REPOSITORY_REFRESH_PROTOCOL.md)
- [Engineering System](../governance/ENGINEERING_SYSTEM.md)

