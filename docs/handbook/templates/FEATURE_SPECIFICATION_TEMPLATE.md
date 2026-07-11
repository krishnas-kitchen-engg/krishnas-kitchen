---
title: Feature Specification Template
status: active
doc_type: template
lifecycle: living
owner: engineering
update_cadence: when feature specification requirements change
last_reviewed: null
related:
  - ./README.md
  - ../process/MILESTONE_LIFECYCLE.md
  - ../process/DEFINITION_OF_DONE.md
  - ../process/QUALITY_GATES.md
  - ../../execution/FEATURE_TEMPLATE.md
---

# Feature Specification Template

## Purpose

Use this template to define a feature before implementation without duplicating architecture documents.

## When To Use

Use for user-facing workflows, operational features, domain capabilities, or feature-sized implementation milestones.

## Owner

The feature owner maintains the specification until the feature is delivered or superseded.

## Update Cadence

Update during planning and implementation whenever scope, acceptance criteria, risk, or dependencies change.

## Lifecycle

Feature specs are living while active and historical after delivery unless promoted into canonical documentation.

## Required Sections

```markdown
# <Feature Name>

## Objective

## User Or Operator Need

## Scope

## Out Of Scope

## Roles And Permissions

## Workflow

## Architecture References

## Data And Persistence Impact

## Security Considerations

## Offline And Operational Behavior

## Acceptance Criteria

## Test Plan

## Documentation Impact

## Risks

## Related Documents
```

## Optional Sections

- UX notes.
- Rollout plan.
- Migration plan.
- Performance expectations.
- Accessibility expectations.
- Open questions.

## Review Checklist

- Scope is bounded.
- Architecture is referenced instead of duplicated.
- Permissions and security are explicit.
- Acceptance criteria are testable.
- Documentation impact is named.
- Risks and unknowns are visible.

## Related Handbook Documents

- [Milestone Lifecycle](../process/MILESTONE_LIFECYCLE.md)
- [Definition of Done](../process/DEFINITION_OF_DONE.md)
- [Quality Gates](../process/QUALITY_GATES.md)
- [Existing Feature Template](../../execution/FEATURE_TEMPLATE.md)

