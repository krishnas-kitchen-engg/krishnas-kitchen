---
title: Test Plan Template
status: active
doc_type: template
lifecycle: living
owner: engineering
update_cadence: when test planning expectations change
last_reviewed: null
related:
  - ./README.md
  - ../process/DEFINITION_OF_DONE.md
  - ../process/QUALITY_GATES.md
  - ../../execution/TESTING_STRATEGY.md
---

# Test Plan Template

## Purpose

Use this template to define verification for a feature, milestone, bug fix, migration, or operational workflow.

## When To Use

Use when behavior changes, risk is high, manual validation is needed, or testing expectations are not obvious.

## Owner

The milestone owner writes the test plan. Engineering owns the template.

## Update Cadence

Update when testing standards or verification layers change.

## Lifecycle

Test plans are living during active implementation and historical after delivery unless promoted into a runbook.

## Required Sections

```markdown
# Test Plan: <Milestone>

## Scope

## Risks Covered

## Automated Tests

## Manual Validation

## Security And Permission Tests

## Data And Migration Tests

## Offline Or Recovery Tests

## Accessibility And Mobile Tests

## Required Commands

## Exit Criteria

## Known Gaps
```

## Optional Sections

- Test data.
- Device matrix.
- Performance tests.
- Exploratory testing notes.
- Regression checklist.

## Review Checklist

- Tests map to acceptance criteria and risks.
- Required commands are explicit.
- Manual validation is specific.
- Gaps and not-applicable areas are documented.
- High-risk areas receive stronger coverage.

## Related Handbook Documents

- [Definition of Done](../process/DEFINITION_OF_DONE.md)
- [Quality Gates](../process/QUALITY_GATES.md)
- [Existing Testing Strategy](../../execution/TESTING_STRATEGY.md)

