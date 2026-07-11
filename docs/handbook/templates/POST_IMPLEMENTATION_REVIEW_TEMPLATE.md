---
title: Post-Implementation Review Template
status: active
doc_type: template
lifecycle: living
owner: engineering
update_cadence: when implementation review structure changes
last_reviewed: null
related:
  - ./README.md
  - ../process/POST_IMPLEMENTATION_REVIEW.md
  - ../process/DEFINITION_OF_DONE.md
  - ../process/ENGINEERING_REVIEW_CHECKLIST.md
---

# Post-Implementation Review Template

## Purpose

Use this template to summarize a completed milestone before handoff, review, or commit.

## When To Use

Use after implementation milestones, especially when code, tests, migrations, operations, security, or architecture changed.

## Owner

The milestone implementer writes the review. Engineering owns the template.

## Update Cadence

Update when post-implementation review expectations change.

## Lifecycle

The template is living. Individual reviews are historical once recorded.

## Required Sections

```markdown
# Post-Implementation Review: <Milestone>

## Objective

## Summary

## Architecture Impact

## Security Impact

## Database Impact

## Files Changed

## Testing

## Manual Validation

## Performance

## Lessons Learned

## Technical Debt

## Documentation Updated

## Future Work
```

## Optional Sections

- Rollback notes.
- Release notes.
- Screenshots or evidence.
- Accessibility validation.
- Open questions.

## Review Checklist

- The summary distinguishes changed and unchanged areas.
- Validation is specific.
- Risks and follow-up are named.
- Documentation updates or gaps are listed.
- Human review needs are clear.

## Related Handbook Documents

- [Post-Implementation Review](../process/POST_IMPLEMENTATION_REVIEW.md)
- [Definition of Done](../process/DEFINITION_OF_DONE.md)
- [Engineering Review Checklist](../process/ENGINEERING_REVIEW_CHECKLIST.md)

