---
title: Release Checklist Template
status: active
doc_type: template
lifecycle: living
owner: operations
update_cadence: when release checklist requirements change
last_reviewed: null
related:
  - ./README.md
  - ../operations/README.md
  - ../process/DEFINITION_OF_DONE.md
  - ../../execution/RELEASE_PROCESS.md
---

# Release Checklist Template

## Purpose

Use this template to prepare and validate a release.

## When To Use

Use before deploying changes to shared, staging, or production-like environments.

## Owner

Operations owns release execution. Engineering owns technical readiness. The release owner completes the checklist.

## Update Cadence

Update when release gates, environments, verification commands, or rollback expectations change.

## Lifecycle

The template is living. Completed release checklists are historical release records.

## Required Sections

```markdown
# Release Checklist: <Release>

## Scope

## Included Changes

## Excluded Changes

## Pre-Release Checks

## Migration Review

## Security Review

## Verification Commands

## Manual Validation

## Rollback Plan

## Deployment Steps

## Post-Release Validation

## Approval
```

## Optional Sections

- Communication plan.
- Monitoring plan.
- Feature flags.
- Known issues.
- Support handoff.

## Review Checklist

- Scope is explicit.
- Required checks passed or are documented.
- Migration and rollback risk is understood.
- Security-sensitive changes have approval.
- Post-release validation is concrete.

## Related Handbook Documents

- [Operations](../operations/README.md)
- [Definition of Done](../process/DEFINITION_OF_DONE.md)
- [Existing Release Process](../../execution/RELEASE_PROCESS.md)

