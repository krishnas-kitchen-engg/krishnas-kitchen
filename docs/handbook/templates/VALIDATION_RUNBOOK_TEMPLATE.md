---
title: Validation Runbook Template
status: active
doc_type: template
lifecycle: living
owner: operations
update_cadence: when validation runbook requirements change
last_reviewed: null
related:
  - ./README.md
  - ../operations/README.md
  - ../process/DEFINITION_OF_DONE.md
  - ../../../infra/supabase/seed/VALIDATION_SEED_DATA.md
---

# Validation Runbook Template

## Purpose

Use this template to define repeatable operational validation steps for environments, releases, seed data, workflows, or incidents.

## When To Use

Use when a human operator must validate system behavior consistently across environments or releases.

## Owner

Operations or the system owner maintains the runbook. Engineering owns the template.

## Update Cadence

Update when environments, seed data, workflows, commands, or validation criteria change.

## Lifecycle

Validation runbooks are living documents while the validation process remains active.

## Required Sections

```markdown
# Validation Runbook: <Area>

## Purpose

## Environment

## Preconditions

## Test Data

## Steps

## Expected Results

## Failure Handling

## Cleanup

## Evidence To Capture

## Related Documents
```

## Optional Sections

- Rollback steps.
- Device matrix.
- Access requirements.
- Timing expectations.
- Known limitations.

## Review Checklist

- Steps are repeatable.
- Preconditions and cleanup are clear.
- Expected results are observable.
- Failure handling is documented.
- Related operations and seed docs are linked.

## Related Handbook Documents

- [Operations](../operations/README.md)
- [Definition of Done](../process/DEFINITION_OF_DONE.md)
- [Validation Seed Data](../../../infra/supabase/seed/VALIDATION_SEED_DATA.md)

