---
title: Repository Refresh Protocol
status: active
doc_type: governance
lifecycle: living
owner: engineering
update_cadence: when session startup, repository scan, or documentation synchronization expectations change
last_reviewed: null
related:
  - ./README.md
  - ./AI_ENGINEERING_OPERATING_MODEL.md
  - ./PROJECT_CONSTITUTION.md
  - ./AI_EXECUTION_PROTOCOL.md
  - ./ENGINEERING_SYSTEM.md
  - ../README.md
  - ../overview.md
  - ../reading-paths.md
  - ../existing-documentation.md
  - ../roadmap.md
  - ../conventions.md
  - ../architecture/README.md
  - ../adrs/README.md
  - ../process/README.md
  - ../operations/README.md
  - ../templates/README.md
  - ../owners/README.md
  - ../reference/README.md
---

# Repository Refresh Protocol

This protocol defines repository refresh expectations for the operating loop in [AI Engineering Operating Model](./AI_ENGINEERING_OPERATING_MODEL.md).

## Purpose

Use this document to prevent stale assumptions, documentation drift, duplicated sources of truth, and changes that ignore the current shape of the project.

## Required Repository Scan Before Implementation

Before implementation, scan:

- Current git status.
- Relevant tracked files.
- Existing documentation for the affected area.
- Existing code patterns for the affected area, when code changes are allowed.
- Tests and verification commands relevant to the work.
- Migrations and operational docs, when data or environment behavior may be affected.

The scan should be proportional to the task but cannot be skipped.

## Required Documentation To Read

At session startup, use:

- [Engineering Handbook](../README.md)
- [Reading Paths](../reading-paths.md)
- [Existing Documentation Map](../existing-documentation.md)
- [Project Constitution](./PROJECT_CONSTITUTION.md)
- [AI Execution Protocol](./AI_EXECUTION_PROTOCOL.md)

Then read the relevant section:

- [Architecture](../architecture/README.md) for design work.
- [ADRs](../adrs/README.md) for durable decisions.
- [Engineering Process](../process/README.md) for implementation workflow.
- [Operations](../operations/README.md) for environment, release, seed, and runbook work.
- [Templates](../templates/README.md) for new documentation.
- [Owner Documentation](../owners/README.md) for area responsibility.
- [Reference](../reference/README.md) for facts, terminology, roles, schema, and migration notes.

## Architecture Reconstruction

Before changing architecture-sensitive areas, reconstruct:

- Current domain boundaries.
- Data ownership.
- Authorization boundary.
- Persistence boundary.
- Offline or sync assumptions.
- Test coverage and verification gaps.
- Relevant ADRs or candidate ADRs.

Do not proceed from a mental model alone when repository evidence is available.

## Candidate Milestone Selection

Use [AI Engineering Operating Model](./AI_ENGINEERING_OPERATING_MODEL.md) for candidate milestone selection, scoring, approval boundaries, and blocked-state handling.

## Drift Detection

Look for drift between:

- Documentation and code.
- Documentation and tests.
- Older feature specs and current architecture.
- Process docs and actual verification commands.
- Migrations and schema references.
- Permission documentation and authorization behavior.

When drift is found, report it. Fix it only if the task allows that scope.

## Documentation Synchronization

Documentation synchronization means making the right knowledge visible in the right place.

Rules:

- Update living documents when their subject changes.
- Preserve historical documents when they explain past decisions.
- Link instead of duplicating content.
- Mark unresolved drift rather than silently picking a convenient source.
- Use [Handbook Conventions](../conventions.md) for new handbook documents.

## Living Document Updates

A living document should be updated when:

- Implementation behavior changes.
- Architecture changes.
- A decision supersedes prior guidance.
- Process or operations change.
- Ownership changes.
- Terminology changes.
- A new canonical source exists.

If a living document cannot be updated in the current task, call out the gap in the final report.

## Knowledge Externalization

Important reasoning should not remain trapped in a chat session.

Externalize knowledge by:

- Updating living docs when permitted.
- Creating or recommending ADRs for durable decisions.
- Linking related documents.
- Reporting drift and unresolved questions.
- Capturing verification results.
- Naming assumptions clearly.

## Session Startup Checklist

- Confirm task objective and constraints.
- Check repository status.
- Identify whether the task is documentation-only, code, tests, migrations, operations, or review.
- Read the required handbook and project docs.
- Identify affected files and owners.
- Identify top three candidate micro-milestones and one recommendation when implementation work is appropriate.
- Identify verification requirements.
- Identify human review gates.

## Session Completion Checklist

- Confirm changed files match the requested scope.
- Confirm prohibited areas were not modified.
- Run appropriate checks or explain why they were not run.
- Confirm links and front matter for handbook documentation.
- Summarize changes, risks, and follow-up recommendations.
- Do not commit unless explicitly approved.

## Living Or Historical

This is living documentation. It should change when the repository refresh workflow changes.

## Who Updates It

Engineering owns this protocol. Contributors should propose updates when session startup or completion repeatedly misses important context.

## When To Update It

Update this document when:

- New handbook sections become canonical startup reading.
- Repository scan expectations change.
- Documentation synchronization rules change.
- A repeated source of drift requires an explicit checklist item.

## Related Documents

- [Project Constitution](./PROJECT_CONSTITUTION.md)
- [AI Engineering Operating Model](./AI_ENGINEERING_OPERATING_MODEL.md)
- [AI Execution Protocol](./AI_EXECUTION_PROTOCOL.md)
- [Engineering System](./ENGINEERING_SYSTEM.md)
- [Governance Overview](./README.md)
- [Engineering Handbook](../README.md)
- [Handbook Overview](../overview.md)
- [Reading Paths](../reading-paths.md)
- [Existing Documentation Map](../existing-documentation.md)
- [Handbook Stewardship](../roadmap.md)
- [Handbook Conventions](../conventions.md)
- [Architecture](../architecture/README.md)
- [ADRs](../adrs/README.md)
- [Engineering Process](../process/README.md)
- [Operations](../operations/README.md)
- [Templates](../templates/README.md)
- [Owner Documentation](../owners/README.md)
- [Reference](../reference/README.md)
