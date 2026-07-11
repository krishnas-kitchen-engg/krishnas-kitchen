---
title: Engineering Review Checklist
status: active
doc_type: process
lifecycle: living
owner: engineering
update_cadence: when engineering review expectations change
last_reviewed: null
related:
  - ./README.md
  - ./DEFINITION_OF_DONE.md
  - ./QUALITY_GATES.md
  - ./MILESTONE_LIFECYCLE.md
  - ./POST_IMPLEMENTATION_REVIEW.md
  - ../governance/PROJECT_CONSTITUTION.md
  - ../governance/AI_EXECUTION_PROTOCOL.md
  - ../governance/REPOSITORY_REFRESH_PROTOCOL.md
  - ../governance/ENGINEERING_SYSTEM.md
  - ../../execution/CODE_REVIEW_CHECKLIST.md
---

# Engineering Review Checklist

This checklist is the standard review surface for engineering milestones.

## Purpose

Use this checklist during self-review, AI review, human review, and pre-commit readiness checks.

## Architecture

- The change matches current architecture documents or documents drift.
- Domain boundaries remain clear.
- No hidden framework, state-management, or persistence pattern is introduced.
- Durable decisions are captured in an ADR or ADR recommendation.

## Security

- Authentication and authorization behavior is correct.
- Client-side checks are not treated as final enforcement.
- Tenant and organization boundaries are preserved.
- Secrets are not exposed.
- Auditability is preserved where required.

## Testing

- Relevant unit, integration, permission, and workflow tests exist.
- Regression risk is covered.
- Test data is realistic enough for the behavior under review.
- Unrun tests are documented with reasons.

## Performance

- The change avoids unnecessary repeated work, unbounded queries, or excessive rendering.
- Critical operational workflows remain fast.
- Any expected performance tradeoff is documented.

## Maintainability

- The change is cohesive and scoped.
- Existing patterns are followed.
- Naming and structure are clear.
- Complexity is justified by real need.
- Error paths are understandable.

## Documentation

- Living docs are updated when behavior, process, architecture, or operations change.
- Historical docs are not silently treated as current guidance.
- Cross-references are accurate.
- New docs follow [Handbook Conventions](../conventions.md).

## Accessibility

- UI changes preserve keyboard, screen reader, contrast, touch target, and focus expectations where applicable.
- Mobile-first operational workflows remain usable.
- Validation and error states are understandable.

## Offline Behavior

- Offline assumptions are identified.
- Queueing, replay, idempotency, and recovery risks are considered when relevant.
- Changes do not break existing offline or PWA expectations.

## Migration Safety

- Migrations are reviewed for reversibility and data safety.
- Destructive changes are avoided or explicitly approved.
- Existing data, audit history, and rollback paths are protected.

## RLS

- RLS impact is reviewed for Supabase-backed data.
- Policies enforce tenant and role boundaries.
- Broad policies are justified and reviewed.
- Client assumptions do not replace database enforcement.

## RPCs

- RPC functions are scoped and reviewed for privilege boundaries.
- Security definer behavior is intentional and documented.
- Input validation and error behavior are clear.

## Repositories

- Repository interfaces preserve domain semantics.
- Persistence adapters do not leak low-level details into UI.
- Append-only or immutable models remain intact where required.
- Idempotency and retry behavior are considered.

## API Contracts

- Public or shared contracts remain backward compatible unless a breaking change is approved.
- Types, validation, and error shapes are updated together.
- Consumers are identified and checked.

## Breaking Changes

- Breaking changes are explicit.
- Migration or rollout strategy is documented.
- Tests and docs reflect the new behavior.
- Human review has approved the risk.

## Living Or Historical

This is living documentation. It should reflect the current review standard.

## Who Updates It

Engineering owns this checklist. Reviewers should update it when recurring review misses appear.

## When To Update It

Update this document when:

- New review categories become mandatory.
- Security, RLS, migration, or offline review expectations change.
- Existing review guidance becomes stale.

## Related Documents

- [Definition of Done](./DEFINITION_OF_DONE.md)
- [Quality Gates](./QUALITY_GATES.md)
- [Milestone Lifecycle](./MILESTONE_LIFECYCLE.md)
- [Post-Implementation Review](./POST_IMPLEMENTATION_REVIEW.md)
- [Project Constitution](../governance/PROJECT_CONSTITUTION.md)
- [AI Execution Protocol](../governance/AI_EXECUTION_PROTOCOL.md)
- [Repository Refresh Protocol](../governance/REPOSITORY_REFRESH_PROTOCOL.md)
- [Engineering System](../governance/ENGINEERING_SYSTEM.md)
- [Existing Code Review Checklist](../../execution/CODE_REVIEW_CHECKLIST.md)

