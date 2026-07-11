---
title: ADR-0010 Security Review Before Commit
status: active
doc_type: adr
lifecycle: historical
owner: engineering
update_cadence: update only supersession metadata or links
last_reviewed: null
related:
  - ./README.md
  - ./ADR_GUIDE.md
  - ../governance/PROJECT_CONSTITUTION.md
  - ../governance/AI_EXECUTION_PROTOCOL.md
  - ../process/DEFINITION_OF_DONE.md
  - ../process/QUALITY_GATES.md
  - ../process/ENGINEERING_REVIEW_CHECKLIST.md
  - ../templates/SECURITY_REVIEW_TEMPLATE.md
---

# ADR-0010: Security Review Before Commit

## Status

Accepted

## Context

The project constitution states that security-sensitive changes require explicit review before release and that authorization, tenant isolation, secrets, inventory integrity, and auditability are non-negotiable concerns.

The AI execution protocol requires human review for authentication, authorization, tenant isolation, secrets, RLS policies, inventory ledger integrity, audit history, and production deployment or rollback behavior.

The Definition of Done requires security review before a milestone is committed. Quality Gates define a Security Gate, and the Engineering Review Checklist includes security, RLS, RPC, migration, and API contract review areas.

## Decision

Security-sensitive milestones must pass security review before commit readiness.

Security review is part of the engineering completion process, not an optional post-commit activity.

## Consequences

- Security-sensitive work may pause for human review.
- Commit readiness includes security review evidence or an explicit blocked state.
- RLS, RPC, auth, secrets, tenant isolation, audit, and inventory integrity changes receive stronger scrutiny.
- Documentation-only security policy changes must also be reviewed when they alter governance.

## Alternatives Considered

No documented alternative review timing is described in the current handbook source material.

## Implementation Notes

- Use the Security Gate in `QUALITY_GATES.md`.
- Use `SECURITY_REVIEW_TEMPLATE.md` for explicit security reviews when needed.
- Do not commit security-sensitive changes until the Definition of Done is satisfied and commit approval is granted.

## Related Documents

- [Project Constitution](../governance/PROJECT_CONSTITUTION.md)
- [AI Execution Protocol](../governance/AI_EXECUTION_PROTOCOL.md)
- [Definition of Done](../process/DEFINITION_OF_DONE.md)
- [Quality Gates](../process/QUALITY_GATES.md)
- [Engineering Review Checklist](../process/ENGINEERING_REVIEW_CHECKLIST.md)
- [Security Review Template](../templates/SECURITY_REVIEW_TEMPLATE.md)
- [ADR-0003: Supabase Auth And RLS Boundary](./0003-supabase-auth-and-rls-boundary.md)
- [ADR-0007: RPC Boundaries And Browser Trust](./0007-rpc-boundaries-and-browser-trust.md)

## Supersession

None.

