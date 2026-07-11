---
title: Technical Debt Template
status: active
doc_type: template
lifecycle: living
owner: engineering
update_cadence: when technical debt tracking expectations change
last_reviewed: null
related:
  - ./README.md
  - ../process/POST_IMPLEMENTATION_REVIEW.md
  - ../process/ENGINEERING_REVIEW_CHECKLIST.md
---

# Technical Debt Template

## Purpose

Use this template to record technical debt so it can be understood, prioritized, and retired deliberately.

## When To Use

Use when a known design, test, documentation, operational, or implementation weakness is accepted temporarily.

## Owner

The affected area owner owns the debt item. Engineering owns the template.

## Update Cadence

Update when impact, priority, mitigation, or ownership changes.

## Lifecycle

Debt items are living while open and historical after resolved, superseded, or accepted permanently through an ADR.

## Required Sections

```markdown
# Technical Debt: <Title>

## Summary

## Area

## Current Impact

## Risk

## Reason Accepted

## Mitigation

## Proposed Resolution

## Owner

## Priority

## Review Date

## Related Documents
```

## Optional Sections

- Affected files.
- Test gaps.
- Operational symptoms.
- ADR follow-up.
- Migration plan.

## Review Checklist

- The debt is specific.
- Impact and risk are understandable.
- Owner and review date are present.
- Mitigation exists for high-risk debt.
- Resolution path is realistic.

## Related Handbook Documents

- [Post-Implementation Review](../process/POST_IMPLEMENTATION_REVIEW.md)
- [Engineering Review Checklist](../process/ENGINEERING_REVIEW_CHECKLIST.md)
- [ADR Guide](../adrs/ADR_GUIDE.md)

