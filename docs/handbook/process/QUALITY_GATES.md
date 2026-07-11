---
title: Quality Gates
status: active
doc_type: process
lifecycle: living
owner: engineering
update_cadence: when engineering review gates change
last_reviewed: null
related:
  - ./README.md
  - ./DEFINITION_OF_DONE.md
  - ./MILESTONE_LIFECYCLE.md
  - ./ENGINEERING_REVIEW_CHECKLIST.md
  - ../governance/PROJECT_CONSTITUTION.md
  - ../governance/AI_EXECUTION_PROTOCOL.md
  - ../governance/REPOSITORY_REFRESH_PROTOCOL.md
  - ../governance/ENGINEERING_SYSTEM.md
---

# Quality Gates

Quality gates define the progressive checks that every milestone must pass before it can be considered complete.

## Purpose

Use this document during planning, implementation, review, and completion. Every milestone must pass every applicable gate.

## Gate 1: Scope Gate

Pass when:

- The objective is clear.
- Constraints are recorded.
- Out-of-scope areas are identified.
- Human review requirements are known.

## Gate 2: Repository Refresh Gate

Pass when:

- Current git status is known.
- Relevant docs, code, tests, migrations, and operations notes have been read.
- Existing drift or dirty worktree risk is noted.
- The work is grounded in repository evidence.

Use [Repository Refresh Protocol](../governance/REPOSITORY_REFRESH_PROTOCOL.md).

## Gate 3: Architecture Gate

Pass when:

- Current architecture has been reconstructed for the affected area.
- Existing architecture docs and ADRs have been checked.
- No hidden architectural rewrite is being introduced.
- Architecture drift is documented.

## Gate 4: Security Gate

Pass when:

- Auth, RLS, tenant isolation, secrets, auditability, and privilege boundaries are considered.
- Security-sensitive changes receive human review.
- No client-only permission check is treated as final enforcement.

## Gate 5: Implementation Gate

Pass when:

- The change is cohesive and scoped.
- Existing patterns are followed.
- Unrelated files are untouched.
- Error handling and validation match operational risk.

## Gate 6: Testing Gate

Pass when:

- Relevant automated checks have passed.
- New or changed behavior has appropriate coverage.
- Manual validation is complete where needed.
- Unrun checks and residual risk are documented.

## Gate 7: Documentation Gate

Pass when:

- Living docs affected by the change are updated.
- Historical docs are not silently rewritten as current guidance.
- New docs follow [Handbook Conventions](../conventions.md).
- Cross-references are accurate.

## Gate 8: Release Gate

Pass when:

- Rollback or recovery impact is understood.
- Migration safety has been reviewed when relevant.
- Operational validation needs are documented.
- The milestone satisfies [Definition of Done](./DEFINITION_OF_DONE.md).

## Living Or Historical

This is living documentation. It defines current engineering gates.

## Who Updates It

Engineering owns this document. Gate changes should be reviewed because they affect every implementation milestone.

## When To Update It

Update this document when:

- A new mandatory gate is introduced.
- A gate becomes obsolete.
- Review or release expectations change.
- Repeated defects reveal missing gate criteria.

## Related Documents

- [Definition of Done](./DEFINITION_OF_DONE.md)
- [Milestone Lifecycle](./MILESTONE_LIFECYCLE.md)
- [Engineering Review Checklist](./ENGINEERING_REVIEW_CHECKLIST.md)
- [Project Constitution](../governance/PROJECT_CONSTITUTION.md)
- [AI Execution Protocol](../governance/AI_EXECUTION_PROTOCOL.md)
- [Repository Refresh Protocol](../governance/REPOSITORY_REFRESH_PROTOCOL.md)
- [Engineering System](../governance/ENGINEERING_SYSTEM.md)

