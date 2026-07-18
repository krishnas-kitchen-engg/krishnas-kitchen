---
title: Post-Implementation Review
status: active
doc_type: template
lifecycle: living
owner: engineering
update_cadence: when post-implementation review requirements change
last_reviewed: null
related:
  - ./README.md
  - ./DEFINITION_OF_DONE.md
  - ./QUALITY_GATES.md
  - ./MILESTONE_LIFECYCLE.md
  - ./ENGINEERING_REVIEW_CHECKLIST.md
  - ../governance/PROJECT_CONSTITUTION.md
  - ../governance/AI_EXECUTION_PROTOCOL.md
  - ../governance/ENGINEERING_SYSTEM.md
---

# Post-Implementation Review

This reusable template captures what changed, how it was validated, residual risks for the completed milestone, and relevant future approved work.

## Purpose

Use this template before commit, handoff, or human review for completed implementation milestones.

## Template

```markdown
# Post-Implementation Review: <Milestone Name>

## Objective

<State the milestone objective and constraints.>

## Summary

<Summarize what changed and what did not change.>

## Architecture Impact

<Describe architecture impact or state "None". Link relevant docs or ADRs.>

## Security Impact

<Describe auth, RLS, tenant isolation, secrets, audit, or permission impact.>

## Database Impact

<Describe schema, migration, seed, persistence, data integrity, or rollback impact.>

## Files Changed

- `<path>`: <reason>

## Testing

<List automated checks run and results. List checks not run and why.>

## Manual Validation

<Describe manual validation, devices, workflows, or state "Not applicable".>

## Performance

<Describe performance impact or state "Not assessed / not applicable".>

## Residual Risks

<List risks that may affect the completed milestone, or state "None known".>

## Lessons Learned

<Capture reusable learning from this milestone.>

## Technical Debt

<List new, reduced, or existing debt discovered.>

## Documentation Updated

<List docs updated or documentation gaps found.>

## Future Approved Work

<List planned or intentionally deferred work outside the approved milestone.>
```

## Living Or Historical

This template is living documentation. Completed review records created from it may become historical artifacts.

## Who Updates It

Engineering owns this template. Reviewers should propose changes when recurring review gaps appear.

## When To Update It

Update this document when:

- Review expectations change.
- A new mandatory review section is needed.
- Post-implementation reports repeatedly miss important information.

## Related Documents

- [Definition of Done](./DEFINITION_OF_DONE.md)
- [Quality Gates](./QUALITY_GATES.md)
- [Milestone Lifecycle](./MILESTONE_LIFECYCLE.md)
- [Engineering Review Checklist](./ENGINEERING_REVIEW_CHECKLIST.md)
- [Project Constitution](../governance/PROJECT_CONSTITUTION.md)
- [AI Execution Protocol](../governance/AI_EXECUTION_PROTOCOL.md)
- [Engineering System](../governance/ENGINEERING_SYSTEM.md)
