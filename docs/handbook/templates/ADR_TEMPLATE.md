---
title: ADR Template
status: active
doc_type: template
lifecycle: living
owner: engineering
update_cadence: when ADR structure or review expectations change
last_reviewed: null
related:
  - ./README.md
  - ../adrs/ADR_GUIDE.md
  - ../adrs/README.md
  - ../architecture/README.md
  - ../process/QUALITY_GATES.md
  - ../process/ENGINEERING_REVIEW_CHECKLIST.md
---

# ADR Template

## Purpose

Use this template to record a durable architecture decision, its context, and its consequences.

## When To Use

Use for decisions that affect architecture, data model, security boundaries, operational behavior, major dependencies, or long-term maintainability.

## Owner

Engineering owns ADR format. The decision owner writes the ADR.

## Update Cadence

ADRs are historical once accepted. Update only status, links, typo fixes, or supersession metadata. Create a new ADR for a new decision.

## Lifecycle

An ADR starts as proposed, becomes accepted or rejected, and may later be superseded.

## Required Sections

```markdown
# ADR-0000: <Decision Title>

## Status

Proposed | Accepted | Rejected | Superseded

## Context

<What problem, constraint, or opportunity required a decision?>

## Decision

<What decision was made?>

## Consequences

<What becomes easier, harder, safer, riskier, or more constrained?>

## Alternatives Considered

- <Alternative>: <reason accepted or rejected>

## Implementation Notes

<How implementation should reflect this decision. Link code areas only when useful.>

## Related Documents

- <Architecture docs, process docs, stewardship items, feature specs, or prior ADRs>

## Supersession

<If superseded, link the replacing ADR. Otherwise "None".>
```

## Optional Sections

- Decision drivers.
- Migration plan.
- Rollback considerations.
- Security review notes.
- Operational impact.
- Open questions.

## Review Checklist

- The decision is specific and durable.
- The context explains why a decision was necessary.
- Alternatives are real options, not straw choices.
- Consequences include tradeoffs.
- Related architecture and stewardship documents are linked.
- Supersession status is clear.

## Related Handbook Documents

- [ADR Guide](../adrs/ADR_GUIDE.md)
- [ADR Index](../adrs/README.md)
- [Architecture](../architecture/README.md)
- [Quality Gates](../process/QUALITY_GATES.md)
- [Engineering Review Checklist](../process/ENGINEERING_REVIEW_CHECKLIST.md)
