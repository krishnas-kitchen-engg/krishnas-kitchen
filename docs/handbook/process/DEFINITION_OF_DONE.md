---
title: Definition of Done
status: active
doc_type: process
lifecycle: living
owner: engineering
update_cadence: when milestone completion requirements change
last_reviewed: null
related:
  - ./README.md
  - ./QUALITY_GATES.md
  - ./MILESTONE_LIFECYCLE.md
  - ./POST_IMPLEMENTATION_REVIEW.md
  - ./ENGINEERING_REVIEW_CHECKLIST.md
  - ../governance/PROJECT_CONSTITUTION.md
  - ../governance/AI_EXECUTION_PROTOCOL.md
  - ../governance/REPOSITORY_REFRESH_PROTOCOL.md
  - ../governance/ENGINEERING_SYSTEM.md
  - ../../execution/DEFINITION_OF_DONE.md
---

# Definition of Done

This document defines the minimum completion bar before any engineering milestone may be committed.

It operationalizes the governance documents. It does not replace their principles.

## Purpose

Use this document at the end of every milestone to decide whether the work is complete enough to commit or hand off for review.

## Mandatory Completion Requirements

A milestone is done only when every applicable item below is satisfied or explicitly documented as not applicable.

### Implementation Complete

- The requested scope is implemented.
- The implementation matches the accepted plan or documents the reason for deviation.
- No unrelated code, test, migration, or documentation changes are included.
- User-provided constraints were respected.

### Tests

- Relevant automated tests were added or updated when behavior changed.
- Existing relevant tests were run.
- Failing tests are resolved or documented as unrelated with evidence.
- Untested risk is documented in the final report.

### Lint

- Applicable lint checks pass.
- Any lint check not run is documented with the reason.

### Typecheck

- Applicable typecheck commands pass.
- Type safety was not weakened to force completion.
- Any typecheck not run is documented with the reason.

### Build

- Applicable build checks pass for implementation milestones.
- Build failures are resolved or documented as pre-existing with evidence.
- Documentation-only milestones do not require an application build unless the documentation tooling requires one.

### Security Review

- Authentication and authorization impact was considered.
- Tenant isolation and RLS impact was considered.
- Secret handling impact was considered.
- Security-sensitive changes received or are waiting for human review.

### Architecture Review

- The work remains consistent with current architecture documents and accepted ADRs.
- Any architecture drift is documented.
- Durable architecture decisions are captured in an ADR or recommended for ADR creation.

### Documentation Updates

- User-facing behavior, developer workflow, operations, or architecture changes are documented.
- Existing documentation is linked rather than duplicated.
- Documentation-only work follows [Handbook Conventions](../conventions.md).

### Living Document Updates

- Living documents affected by the milestone are updated.
- If living documents cannot be updated within scope, the gap is listed in the final report.

### Manual Validation

- The changed workflow was manually validated when automation is insufficient.
- Mobile, accessibility, offline, or operational validation was performed when relevant.
- Manual validation gaps are documented.

### Completion Reporting

- Residual risks that apply to the completed milestone are named.
- Planned or intentionally deferred capabilities are listed separately as Future Approved Work when relevant.
- Rollback or recovery considerations are documented when relevant.

## Commit Rule

Do not commit until the Definition of Done is satisfied and commit approval has been given. See [AI Execution Protocol](../governance/AI_EXECUTION_PROTOCOL.md) for commit approval requirements.

## Living Or Historical

This is living documentation. It defines the current completion bar for engineering milestones.

## Who Updates It

Engineering owns this document. Changes should be reviewed when they alter commit readiness or verification expectations.

## When To Update It

Update this document when:

- Required checks change.
- Security, architecture, or documentation gates change.
- Manual validation expectations change.
- Repeated milestone failures reveal missing completion criteria.

## Related Documents

- [Engineering Process](./README.md)
- [Quality Gates](./QUALITY_GATES.md)
- [Milestone Lifecycle](./MILESTONE_LIFECYCLE.md)
- [Post-Implementation Review](./POST_IMPLEMENTATION_REVIEW.md)
- [Engineering Review Checklist](./ENGINEERING_REVIEW_CHECKLIST.md)
- [Project Constitution](../governance/PROJECT_CONSTITUTION.md)
- [AI Execution Protocol](../governance/AI_EXECUTION_PROTOCOL.md)
- [Repository Refresh Protocol](../governance/REPOSITORY_REFRESH_PROTOCOL.md)
- [Engineering System](../governance/ENGINEERING_SYSTEM.md)
