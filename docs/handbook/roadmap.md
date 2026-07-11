---
title: Handbook Stewardship
status: stable
doc_type: roadmap
lifecycle: living
owner: engineering
update_cadence: when a genuine handbook governance, process, reference, or architecture gap is discovered
last_reviewed: null
related:
  - ./README.md
  - ./existing-documentation.md
  - ./governance/README.md
  - ./governance/PROJECT_CONSTITUTION.md
  - ./governance/AI_ENGINEERING_OPERATING_MODEL.md
  - ./governance/AI_EXECUTION_PROTOCOL.md
  - ./governance/REPOSITORY_REFRESH_PROTOCOL.md
  - ./governance/ENGINEERING_SYSTEM.md
---

# Handbook Stewardship

The Engineering Handbook is stable. Future work should primarily extend application functionality, not expand handbook infrastructure.

## Purpose

Use this page to decide whether a proposed handbook change is necessary. Do not use it as a standing roadmap for handbook expansion.

## Stewardship Rules

- Add handbook infrastructure only when a real governance, process, reference, architecture, ownership, or operations gap blocks engineering work.
- Prefer updating the smallest existing living document.
- Link existing project documentation instead of migrating it by default.
- Preserve historical source documents unless an explicit cleanup milestone is approved.
- Record unresolved contradictions in [Documentation Drift](./reference/DOCUMENTATION_DRIFT.md).

## Accepted Future Work

Future handbook work is appropriate when it:

- Resolves documented drift.
- Captures a new durable decision in an ADR.
- Updates living state after implementation.
- Adds an operations runbook required by actual operations.
- Clarifies ownership for an active engineering area.
- Repairs broken navigation or stale cross-references.

## Deferred Work

Do not create new handbook sections, templates, or process layers unless a concrete need appears during application work.

## Living Or Historical

This is living documentation. It should keep handbook stewardship narrow and practical.

## Who Updates It

Engineering updates this page. Area owners should request updates only when handbook stewardship affects active work.

## When To Update It

Update this page when:

- A real handbook gap blocks or risks engineering work.
- A handbook expansion proposal is accepted or rejected.
- The project changes how it stewards documentation.

## Related Documents

- [Engineering Handbook Index](./README.md)
- [Existing Documentation Map](./existing-documentation.md)
- [Governance Overview](./governance/README.md)
- [AI Engineering Operating Model](./governance/AI_ENGINEERING_OPERATING_MODEL.md)
- [Project Constitution](./governance/PROJECT_CONSTITUTION.md)
- [AI Execution Protocol](./governance/AI_EXECUTION_PROTOCOL.md)
- [Repository Refresh Protocol](./governance/REPOSITORY_REFRESH_PROTOCOL.md)
- [Engineering System](./governance/ENGINEERING_SYSTEM.md)
