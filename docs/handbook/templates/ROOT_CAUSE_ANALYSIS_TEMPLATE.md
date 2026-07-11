---
title: Root Cause Analysis Template
status: active
doc_type: template
lifecycle: living
owner: engineering
update_cadence: when incident review expectations change
last_reviewed: null
related:
  - ./README.md
  - ../operations/README.md
  - ../process/ENGINEERING_REVIEW_CHECKLIST.md
---

# Root Cause Analysis Template

## Purpose

Use this template to analyze a defect, incident, data issue, security concern, or operational failure without assigning blame.

## When To Use

Use when an issue reveals a gap in architecture, tests, process, documentation, operations, or review.

## Owner

The incident or area owner writes the RCA. Engineering owns the template.

## Update Cadence

Update when RCA practice or required incident evidence changes.

## Lifecycle

The template is living. Completed RCAs are historical records.

## Required Sections

```markdown
# Root Cause Analysis: <Issue>

## Summary

## Impact

## Timeline

## Detection

## Root Cause

## Contributing Factors

## Resolution

## Prevention

## Documentation Updates

## Follow-Up Actions

## Related Documents
```

## Optional Sections

- Customer or operator impact.
- Data correction plan.
- Security review.
- Monitoring gaps.
- Test gaps.
- Decision or ADR follow-up.

## Review Checklist

- Root cause is specific and evidence-based.
- Contributing factors include process and documentation gaps.
- Prevention actions are owned.
- Follow-up actions are trackable.
- Living docs that need updates are identified.

## Related Handbook Documents

- [Operations](../operations/README.md)
- [Engineering Review Checklist](../process/ENGINEERING_REVIEW_CHECKLIST.md)
- [Repository Refresh Protocol](../governance/REPOSITORY_REFRESH_PROTOCOL.md)

