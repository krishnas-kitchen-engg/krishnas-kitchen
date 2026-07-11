---
title: Engineering System
status: active
doc_type: governance
lifecycle: living
owner: engineering
update_cadence: when engineering lifecycle, governance model, or knowledge system changes
last_reviewed: null
related:
  - ./README.md
  - ./AI_ENGINEERING_OPERATING_MODEL.md
  - ./PROJECT_CONSTITUTION.md
  - ./AI_EXECUTION_PROTOCOL.md
  - ./REPOSITORY_REFRESH_PROTOCOL.md
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

# Engineering System

This document explains how Krishna's Kitchen is engineered as a system of mission, decisions, documentation, code, tests, review, and operations.

## Purpose

Use this document to understand how the repository's engineering knowledge fits together and how work moves from idea to durable system behavior.

## How Krishna's Kitchen Is Engineered

Krishna's Kitchen is engineered through the repository-first operating loop defined in [AI Engineering Operating Model](./AI_ENGINEERING_OPERATING_MODEL.md).

## Relationship Between Knowledge Sources

The handbook governs navigation, ownership, and lifecycle.

ADRs record durable decisions and their consequences.

Architecture documentation explains the current intended design.

Handbook stewardship explains when documentation changes are warranted.

Code implements behavior.

Tests protect expected behavior.

Operations documentation explains how to run, validate, release, and recover the system.

Reference documentation keeps facts easy to find.

When these sources disagree, use the decision hierarchy in [Project Constitution](./PROJECT_CONSTITUTION.md).

## Milestone Lifecycle

Milestones follow the state machine and scoring framework in [AI Engineering Operating Model](./AI_ENGINEERING_OPERATING_MODEL.md). They should be small enough to review, verify, and reverse.

## Review Lifecycle

Review should verify:

- Mission alignment.
- Scope control.
- Architecture consistency.
- Security and authorization boundaries.
- Data integrity.
- Test adequacy.
- Documentation impact.
- Operational readiness.

Current process entry points live in [Engineering Process](../process/README.md).

## Documentation Lifecycle

Documents move through:

1. Draft or foundation.
2. Active living source.
3. Superseded source.
4. Historical or archived source.

Living documents are maintained with the system. Historical documents preserve context and should not be silently treated as current guidance.

Use [Handbook Conventions](../conventions.md) for lifecycle labels and required metadata.

## Governance Model

Governance is layered:

- [Project Constitution](./PROJECT_CONSTITUTION.md) defines mission, principles, hierarchy, and invariants.
- [AI Engineering Operating Model](./AI_ENGINEERING_OPERATING_MODEL.md) defines the canonical engineering operating loop.
- [AI Execution Protocol](./AI_EXECUTION_PROTOCOL.md) governs AI-assisted work.
- [Repository Refresh Protocol](./REPOSITORY_REFRESH_PROTOCOL.md) governs startup context and drift detection.
- [Handbook Conventions](../conventions.md) govern documentation structure.
- [ADRs](../adrs/README.md) govern durable architecture decisions.
- [Owner Documentation](../owners/README.md) will identify responsible areas as the handbook matures.

## Continuous Improvement Model

The engineering system improves when repeated friction becomes explicit knowledge.

Use this loop:

1. Notice recurring confusion, drift, review misses, or operational risk.
2. Decide whether it is a process, architecture, operations, ownership, or documentation issue.
3. Update the smallest appropriate living document.
4. Create an ADR if the change records a durable decision.
5. Update navigation and related links.
6. Revisit the improvement during future reviews.

## Living Or Historical

This is living documentation. It should describe the current engineering system.

## Who Updates It

Engineering owns this document. Changes should be reviewed when they alter how work is planned, reviewed, documented, or verified.

## When To Update It

Update this document when:

- The milestone lifecycle changes.
- Review expectations change.
- Documentation lifecycle changes.
- Governance structure changes.
- A new handbook section becomes central to engineering workflow.

## Related Documents

- [Project Constitution](./PROJECT_CONSTITUTION.md)
- [AI Engineering Operating Model](./AI_ENGINEERING_OPERATING_MODEL.md)
- [AI Execution Protocol](./AI_EXECUTION_PROTOCOL.md)
- [Repository Refresh Protocol](./REPOSITORY_REFRESH_PROTOCOL.md)
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
