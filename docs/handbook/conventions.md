---
title: Handbook Conventions
status: foundation
doc_type: conventions
lifecycle: living
owner: engineering
update_cadence: when documentation standards change
last_reviewed: null
related:
  - ./README.md
  - ./governance/README.md
  - ./templates/README.md
  - ./governance/PROJECT_CONSTITUTION.md
  - ./governance/AI_EXECUTION_PROTOCOL.md
---

# Handbook Conventions

These conventions keep the handbook navigable as it grows.

## Purpose

Use this page when creating or reviewing handbook documentation. It defines structure, lifecycle labels, ownership expectations, and linking rules.

## Required Front Matter

Every handbook document should include:

```yaml
---
title: Document Title
status: draft | foundation | active | superseded | archived
doc_type: index | overview | architecture | adr | process | runbook | template | reference | owner
lifecycle: living | historical
owner: engineering | product | operations | security | area-owner
update_cadence: when relevant changes occur
last_reviewed: null
related:
  - ./related-document.md
---
```

## Required Sections

Every handbook document should explain:

- Purpose.
- Whether it is living or historical.
- Who updates it.
- When it should be updated.
- Related documents.

## Lifecycle Labels

- `living`: expected to stay current as the system changes.
- `historical`: preserved for context, not updated as the system changes.

## Status Labels

- `draft`: proposed but not yet relied on.
- `foundation`: structural placeholder or initial handbook framework.
- `active`: current source for its topic.
- `superseded`: replaced by another document.
- `archived`: retained for history only.

## Linking Rules

- Prefer relative links within the repository.
- Link to existing documents instead of restating their content.
- Add bidirectional links when a document becomes canonical.
- Link ADRs from the architecture pages they support.
- Link operations runbooks from the systems they operate.

## Naming Rules

- Use lowercase kebab-case filenames for new handbook documents.
- Use `README.md` only for section landing pages.
- Keep titles human-readable and stable.

## Living Or Historical

This page is living documentation.

## Who Updates It

Engineering updates this page when documentation conventions change.

## When To Update It

Update this page before applying a new convention broadly.

## Related Documents

- [Engineering Handbook Index](./README.md)
- [Governance Overview](./governance/README.md)
- [Project Constitution](./governance/PROJECT_CONSTITUTION.md)
- [AI Execution Protocol](./governance/AI_EXECUTION_PROTOCOL.md)
- [Templates](./templates/README.md)
