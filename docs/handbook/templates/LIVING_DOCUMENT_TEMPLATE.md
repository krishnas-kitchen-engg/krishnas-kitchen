---
title: Living Document Template
status: active
doc_type: template
lifecycle: living
owner: engineering
update_cadence: when living document conventions change
last_reviewed: null
related:
  - ./README.md
  - ../conventions.md
  - ../governance/REPOSITORY_REFRESH_PROTOCOL.md
---

# Living Document Template

## Purpose

Use this template for documents that must remain current as the system changes.

## When To Use

Use for architecture, process, operations, ownership, reference, or roadmap documents that future contributors should rely on.

## Owner

The area owner maintains the document. Engineering owns the template.

## Update Cadence

Update whenever the documented behavior, decision, process, or ownership changes.

## Lifecycle

Living documents stay current until superseded or archived.

## Required Sections

```markdown
---
title: <Title>
status: draft | foundation | active | superseded | archived
doc_type: <type>
lifecycle: living
owner: <owner>
update_cadence: <trigger>
last_reviewed: null
related:
  - <relative-link>
---

# <Title>

## Purpose

## Current Guidance

## Owner

## Update Cadence

## Lifecycle

## Related Documents
```

## Optional Sections

- Known gaps.
- Review history.
- Open questions.
- Examples.
- Migration notes.

## Review Checklist

- Front matter is complete.
- Current guidance is clear.
- Update triggers are explicit.
- Related documents are linked.
- It does not duplicate a more canonical source.

## Related Handbook Documents

- [Handbook Conventions](../conventions.md)
- [Repository Refresh Protocol](../governance/REPOSITORY_REFRESH_PROTOCOL.md)
- [Existing Documentation Map](../existing-documentation.md)

