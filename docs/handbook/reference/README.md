---
title: Reference
status: active
doc_type: index
lifecycle: living
owner: engineering
update_cadence: when canonical reference material changes
last_reviewed: null
related:
  - ../README.md
  - ./CURRENT_STATE.md
  - ./CURRENT_MILESTONE.md
  - ./NEXT_MILESTONE.md
  - ./PROJECT_MEMORY.md
  - ./IMPLEMENTATION_PATTERNS.md
  - ./COMMON_FAILURES.md
  - ./PROJECT_SCORECARD.md
  - ./TECH_DEBT.md
  - ./SECURITY_STATUS.md
  - ./KNOWN_LIMITATIONS.md
  - ./OPEN_DECISIONS.md
  - ./CHANGELOG_SUMMARY.md
  - ./ARCHITECTURAL_INVARIANTS.md
  - ./DOCUMENT_INDEX.md
  - ./DOCUMENTATION_DRIFT.md
  - ./HANDBOOK_HEALTH_REPORT.md
  - ../governance/AI_ENGINEERING_OPERATING_MODEL.md
  - ../../DATABASE_SCHEMA.md
  - ../../PERMISSIONS_MATRIX.md
  - ../../AUTH_ROLE_MIGRATION_NOTES.md
---

# Reference

Reference documentation should provide concise, current facts that contributors can rely on while building or reviewing changes.

## Purpose

This section holds the living memory of the project: current state, active and next milestones, project memory, implementation patterns, common failures and engineering lessons, scorecard, technical debt, security status, limitations, open decisions, changelog summary, and architectural invariants.

Use these documents before planning or implementing work. They describe current reality and must be updated as milestones change that reality.

[Next Milestone](./NEXT_MILESTONE.md) records the top three candidate implementation micro-milestones and the recommended candidate. Candidate milestones are planning artifacts until a human explicitly approves implementation.

[AI Engineering Operating Model](../governance/AI_ENGINEERING_OPERATING_MODEL.md) defines how these living references are used during repository refresh, audit, candidate scoring, implementation, review, and commit readiness.

## Reading Order

For session startup:

1. [Current State](./CURRENT_STATE.md)
2. [Current Milestone](./CURRENT_MILESTONE.md)
3. [Project Memory](./PROJECT_MEMORY.md)
4. [Implementation Patterns](./IMPLEMENTATION_PATTERNS.md)
5. [Common Failures and Engineering Lessons](./COMMON_FAILURES.md)
6. [Next Milestone](./NEXT_MILESTONE.md)
7. [Architectural Invariants](./ARCHITECTURAL_INVARIANTS.md)
8. [Document Index](./DOCUMENT_INDEX.md)
9. [Documentation Drift](./DOCUMENTATION_DRIFT.md)
10. [Open Decisions](./OPEN_DECISIONS.md)

For risk review:

1. [Project Scorecard](./PROJECT_SCORECARD.md)
2. [Security Status](./SECURITY_STATUS.md)
3. [Technical Debt](./TECH_DEBT.md)
4. [Known Limitations](./KNOWN_LIMITATIONS.md)
5. [Handbook Health Report](./HANDBOOK_HEALTH_REPORT.md)

For historical orientation:

1. [Changelog Summary](./CHANGELOG_SUMMARY.md)
2. [ADR Index](../adrs/README.md)
3. [Existing Documentation Map](../existing-documentation.md)

## Living Documents

- [Current State](./CURRENT_STATE.md)
- [Current Milestone](./CURRENT_MILESTONE.md)
- [Next Milestone](./NEXT_MILESTONE.md)
- [Project Memory](./PROJECT_MEMORY.md)
- [Implementation Patterns](./IMPLEMENTATION_PATTERNS.md)
- [Common Failures and Engineering Lessons](./COMMON_FAILURES.md)
- [Project Scorecard](./PROJECT_SCORECARD.md)
- [Technical Debt](./TECH_DEBT.md)
- [Security Status](./SECURITY_STATUS.md)
- [Known Limitations](./KNOWN_LIMITATIONS.md)
- [Open Decisions](./OPEN_DECISIONS.md)
- [Changelog Summary](./CHANGELOG_SUMMARY.md)
- [Architectural Invariants](./ARCHITECTURAL_INVARIANTS.md)
- [Document Index](./DOCUMENT_INDEX.md)
- [Documentation Drift](./DOCUMENTATION_DRIFT.md)
- [Handbook Health Report](./HANDBOOK_HEALTH_REPORT.md)

## Living-Document Responsibilities

- Update [Current State](./CURRENT_STATE.md) after every implementation milestone or major documentation milestone.
- Update [Current Milestone](./CURRENT_MILESTONE.md) when a milestone starts, pauses, completes, or changes scope.
- Update [Next Milestone](./NEXT_MILESTONE.md) when candidate implementation milestones change, are approved, are rejected, or are replaced.
- Update [Project Memory](./PROJECT_MEMORY.md) when durable project understanding changes.
- Update [Implementation Patterns](./IMPLEMENTATION_PATTERNS.md) when reusable implementation patterns change.
- Update [Common Failures and Engineering Lessons](./COMMON_FAILURES.md) when recurring failures, engineering discoveries, or prevention guidance changes.
- Update [Project Scorecard](./PROJECT_SCORECARD.md) when project health evidence changes.
- Update [Technical Debt](./TECH_DEBT.md) when debt is found, changed, resolved, or accepted.
- Update [Security Status](./SECURITY_STATUS.md) after security-sensitive milestones or reviews.
- Update [Known Limitations](./KNOWN_LIMITATIONS.md) when limitations are discovered or resolved.
- Update [Open Decisions](./OPEN_DECISIONS.md) when decisions are opened, resolved, or deferred.
- Update [Changelog Summary](./CHANGELOG_SUMMARY.md) after meaningful engineering milestones.
- Update [Architectural Invariants](./ARCHITECTURAL_INVARIANTS.md) when ADRs change invariants.
- Update [Document Index](./DOCUMENT_INDEX.md) when repository-owned Markdown documents are added, reclassified, or superseded.
- Update [Documentation Drift](./DOCUMENTATION_DRIFT.md) when contradictions are discovered, resolved, or reclassified.
- Update [Handbook Health Report](./HANDBOOK_HEALTH_REPORT.md) after handbook structure changes or documentation audits.

## Current Source Documents

- [Database Schema](../../DATABASE_SCHEMA.md)
- [Permissions Matrix](../../PERMISSIONS_MATRIX.md)
- [Auth Role Migration Notes](../../AUTH_ROLE_MIGRATION_NOTES.md)
- [Project README environment variables](../../../README.md#environment-variables)

## Candidate Reference Areas

Create new reference pages only when active work needs a concise current source that existing documentation cannot provide.

## Living Or Historical

This section landing page is living documentation. Reference pages should normally be living documents. Migration notes may be historical after completion.

## Who Updates It

Engineering updates this section. Area owners should keep reference pages current with implementation and architecture decisions.

## When To Update It

Update this section when:

- A canonical reference changes.
- A role, permission, schema entity, transaction type, or environment variable changes.
- A migration note is completed or superseded.

## Related Documents

- [Architecture](../architecture/README.md)
- [ADR Index](../adrs/README.md)
- [AI Engineering Operating Model](../governance/AI_ENGINEERING_OPERATING_MODEL.md)
- [Existing Documentation Map](../existing-documentation.md)
