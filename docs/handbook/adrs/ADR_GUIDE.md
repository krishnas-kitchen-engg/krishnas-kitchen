---
title: ADR Guide
status: active
doc_type: reference
lifecycle: living
owner: engineering
update_cadence: when ADR policy, numbering, or review expectations change
last_reviewed: null
related:
  - ./README.md
  - ../templates/ADR_TEMPLATE.md
  - ../architecture/README.md
  - ../roadmap.md
  - ../process/QUALITY_GATES.md
  - ../process/ENGINEERING_REVIEW_CHECKLIST.md
  - ../governance/PROJECT_CONSTITUTION.md
---

# ADR Guide

This guide defines how Krishna's Kitchen records architecture decisions.

## Purpose

Use this guide to decide when an ADR is required, how to number it, how to review it, and how ADRs relate to architecture, implementation, and roadmap documents.

## When ADRs Are Required

Create or propose an ADR when a decision:

- Changes architecture boundaries.
- Changes data ownership or persistence strategy.
- Changes authorization, RLS, tenant isolation, or trust boundaries.
- Introduces or removes a major dependency or framework.
- Changes offline, sync, release, or operational recovery strategy.
- Establishes a durable invariant future work must respect.
- Resolves a recurring disagreement or ambiguous design choice.

Do not create ADRs for routine implementation details, temporary task notes, or feature requirements that do not change durable design.

## ADR Lifecycle

- `proposed`: under discussion and not yet binding.
- `accepted`: binding until superseded.
- `rejected`: preserved as context but not binding.
- `superseded`: replaced by a later ADR.

Accepted ADRs are historical decision records. Do not rewrite their decision text to match later reality. Add supersession links instead.

## Superseded ADRs

When a decision changes:

- Create a new ADR with the new decision.
- Mark the old ADR as superseded.
- Link both ADRs to each other.
- Update affected architecture docs and roadmap items.

## ADR Numbering

Use sequential four-digit numbering:

```text
ADR-0001-short-title.md
ADR-0002-short-title.md
```

Do not reuse numbers. If an ADR is rejected or superseded, its number remains reserved.

## Review Process

Before acceptance:

- Confirm the decision is durable enough for an ADR.
- Review alternatives and consequences.
- Check the decision against [Project Constitution](../governance/PROJECT_CONSTITUTION.md).
- Check applicable [Quality Gates](../process/QUALITY_GATES.md).
- Link related architecture, roadmap, feature, and implementation documents.
- Get human review for security, database, migration, or authorization decisions.

## Relationship To Architecture Docs

Architecture docs describe the current intended design. ADRs explain why durable decisions were made.

Architecture docs should link to accepted ADRs that justify the design. ADRs should link back to architecture docs affected by the decision.

## Relationship To Implementation

Implementation should conform to accepted ADRs. When implementation needs to diverge, create or propose a new ADR instead of silently drifting.

Code comments should not replace ADRs. Use code comments for local implementation context and ADRs for durable design decisions.

## Relationship To Roadmap

Roadmap items may identify candidate ADRs. Accepted ADRs may create roadmap work when implementation, migration, documentation, or operational changes are needed.

Use [Roadmap Item Template](../templates/ROADMAP_ITEM_TEMPLATE.md) when a decision produces follow-up work.

## Living Or Historical

This guide is living documentation. Individual ADRs are historical after acceptance.

## Who Updates It

Engineering owns this guide.

## When To Update It

Update this guide when:

- ADR policy changes.
- Numbering changes.
- Review requirements change.
- ADR relationships with architecture, implementation, or roadmap change.

## Related Documents

- [ADR Index](./README.md)
- [ADR Template](../templates/ADR_TEMPLATE.md)
- [Architecture](../architecture/README.md)
- [Handbook Roadmap](../roadmap.md)
- [Quality Gates](../process/QUALITY_GATES.md)
- [Engineering Review Checklist](../process/ENGINEERING_REVIEW_CHECKLIST.md)
- [Project Constitution](../governance/PROJECT_CONSTITUTION.md)

