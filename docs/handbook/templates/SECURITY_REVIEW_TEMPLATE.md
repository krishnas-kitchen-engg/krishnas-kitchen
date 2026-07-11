---
title: Security Review Template
status: active
doc_type: template
lifecycle: living
owner: security
update_cadence: when security review requirements change
last_reviewed: null
related:
  - ./README.md
  - ../process/QUALITY_GATES.md
  - ../process/ENGINEERING_REVIEW_CHECKLIST.md
  - ../governance/PROJECT_CONSTITUTION.md
---

# Security Review Template

## Purpose

Use this template to document security review for changes that affect access, data, secrets, permissions, RLS, RPCs, or operational trust.

## When To Use

Use for authentication, authorization, tenant isolation, database access, security-definer RPCs, secret handling, auditability, or production data changes.

## Owner

Security or engineering owns the review. The milestone owner supplies implementation context.

## Update Cadence

Update when security gates or review expectations change.

## Lifecycle

The template is living. Completed reviews may be historical or attached to the milestone record.

## Required Sections

```markdown
# Security Review: <Change>

## Scope

## Assets And Data

## Actors And Permissions

## Trust Boundaries

## RLS And Database Access

## RPCs And Elevated Privileges

## Secret Handling

## Auditability

## Threats Considered

## Findings

## Required Changes

## Approval Status
```

## Optional Sections

- Abuse cases.
- Privacy impact.
- Dependency risk.
- Rollback security considerations.
- Monitoring requirements.

## Review Checklist

- Tenant isolation is preserved.
- Server-side enforcement is present where required.
- Secrets are not exposed.
- Elevated privileges are justified.
- Audit requirements are satisfied.
- Required changes are tracked.

## Related Handbook Documents

- [Quality Gates](../process/QUALITY_GATES.md)
- [Engineering Review Checklist](../process/ENGINEERING_REVIEW_CHECKLIST.md)
- [Project Constitution](../governance/PROJECT_CONSTITUTION.md)

