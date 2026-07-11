---
title: Architecture Document Template
status: active
doc_type: template
lifecycle: living
owner: engineering
update_cadence: when architecture document structure changes
last_reviewed: null
related:
  - ./README.md
  - ../architecture/README.md
  - ../adrs/ADR_GUIDE.md
  - ../process/QUALITY_GATES.md
  - ../process/ENGINEERING_REVIEW_CHECKLIST.md
---

# Architecture Document Template

## Purpose

Use this template for living architecture documents that describe current intended system design.

## When To Use

Use when a domain, subsystem, integration, boundary, or operational architecture needs a canonical current-state document.

## Owner

The owning engineering area maintains the document. Engineering owns the template.

## Update Cadence

Update when architecture, implementation behavior, ADRs, operations, or ownership changes.

## Lifecycle

Architecture documents are usually living. Mark historical only when preserved for context after replacement.

## Required Sections

```markdown
# <Architecture Area>

## Purpose

## Current State

## Boundaries

## Responsibilities

## Key Flows

## Data Ownership

## Security And Authorization

## Operational Considerations

## Related ADRs

## Known Gaps

## Related Documents
```

## Optional Sections

- Diagrams.
- Sequence flows.
- Offline behavior.
- Performance considerations.
- Migration path.
- Testing strategy.
- Open questions.

## Review Checklist

- It describes current intended architecture, not stale plans.
- It links ADRs for durable decisions.
- It avoids duplicating feature specs.
- Security, data ownership, and operational boundaries are explicit.
- Known gaps and drift are visible.

## Related Handbook Documents

- [Architecture](../architecture/README.md)
- [ADR Guide](../adrs/ADR_GUIDE.md)
- [Quality Gates](../process/QUALITY_GATES.md)
- [Engineering Review Checklist](../process/ENGINEERING_REVIEW_CHECKLIST.md)

