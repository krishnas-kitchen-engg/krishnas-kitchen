---
title: AI Execution Protocol
status: active
doc_type: governance
lifecycle: living
owner: engineering
update_cadence: when AI-assisted engineering workflow changes
last_reviewed: null
related:
  - ./README.md
  - ./AI_ENGINEERING_OPERATING_MODEL.md
  - ./PROJECT_CONSTITUTION.md
  - ./REPOSITORY_REFRESH_PROTOCOL.md
  - ./ENGINEERING_SYSTEM.md
  - ../README.md
  - ../overview.md
  - ../reading-paths.md
  - ../existing-documentation.md
  - ../roadmap.md
  - ../conventions.md
  - ../architecture/README.md
  - ../adrs/README.md
  - ../process/README.md
  - ../operations/README.md
  - ../templates/README.md
  - ../owners/README.md
  - ../reference/README.md
---

# AI Execution Protocol

This protocol defines AI-specific execution rules for Krishna's Kitchen.

The canonical operating loop, state machine, scoring framework, approval boundaries, confidence thresholds, and escalation rules live in [AI Engineering Operating Model](./AI_ENGINEERING_OPERATING_MODEL.md).

This document applies those rules to AI behavior. Current task constraints always matter; when a user says documentation-only, implementation must remain documentation-only.

## Purpose

Use this document to keep AI behavior repository-first, bounded, verifiable, and aligned with the operating model and project constitution.

## Repository-First Development

AI work must begin from the repository, not assumptions.

Required behavior:

- Inspect relevant files before proposing or changing implementation.
- Use [Existing Documentation Map](../existing-documentation.md), [Reading Paths](../reading-paths.md), and the relevant handbook section before editing.
- Treat existing documentation as source material unless it is clearly superseded.
- Prefer local patterns over invented abstractions.
- Preserve user work and unrelated changes.

## Operating Model

Follow [AI Engineering Operating Model](./AI_ENGINEERING_OPERATING_MODEL.md) for:

- The engineering operating loop.
- AI and human responsibilities.
- Candidate milestone selection.
- Milestone scoring.
- Human approval and commit approval boundaries.
- State transitions.
- Review, escalation, confidence, and failure recovery rules.

## Required Planning

Before implementation, an AI session must identify:

- Scope.
- Files or areas likely affected.
- Existing docs that govern the change.
- Tests or checks needed.
- Security and data-integrity risks.
- Whether human review is required before proceeding.
- Whether the candidate milestone has been approved for implementation.
- Why this candidate is the next highest-priority implementation milestone.

For small documentation-only changes, the plan may be brief, but the repository scan still matters.

## Required Implementation Process

Implementation must:

- Begin only after the candidate milestone is approved.
- Stay within the requested scope.
- Respect explicit prohibitions on code, tests, migrations, file moves, deletion, or commits.
- Avoid broad rewrites unless explicitly requested and reviewed.
- Keep changes cohesive and reviewable.
- Update documentation when behavior, process, ownership, or architecture changes.
- Avoid creating duplicate sources of truth.

## Testing Requirements

Testing expectations scale with risk:

- Documentation-only changes require link and metadata sanity checks where practical.
- Code changes require the relevant type, lint, unit, integration, or build checks.
- Security, authorization, inventory, persistence, and migration changes require stronger verification.
- If required checks cannot be run, the final report must say so clearly.

Use [Engineering Process](../process/README.md) and existing process documents for current verification commands and expectations.

## Security Review Requirements

Human review is required before AI work proceeds when a change affects:

- Authentication or authorization.
- Tenant isolation.
- Secrets or environment handling.
- RLS policies or database access boundaries.
- Inventory ledger integrity.
- Audit history.
- Production deployment or rollback behavior.

Security-sensitive documentation should link to the relevant architecture, ADR, or operation page instead of inventing new policy in isolation.

## Documentation Update Requirements

AI sessions must update or recommend updates to documentation when work changes:

- Architecture.
- Public behavior.
- Developer workflow.
- Operational procedures.
- Test strategy.
- Release process.
- Ownership.
- Terminology.
- ADR status.

Documentation changes must follow [Handbook Conventions](../conventions.md).

## Commit Approval Process

AI must not commit unless explicitly asked.

Implementation approval and commit approval are separate gates. Approval to implement a candidate milestone does not authorize a commit.

Before committing, AI must:

- Summarize intended changes.
- Confirm unrelated changes are not being included.
- Run or report required verification.
- Ask for approval if the user has not already authorized the commit.

When committing is approved, commit only the intended scope.

## Conditions Requiring Human Review

Use the escalation rules in [AI Engineering Operating Model](./AI_ENGINEERING_OPERATING_MODEL.md). Pause and request human review whenever the operating model requires escalation.

## Prohibited Behaviors

AI must not:

- Modify application code when the task is documentation-only.
- Modify tests or migrations when prohibited.
- Move or delete files without explicit instruction.
- Commit without explicit approval.
- Begin implementation before candidate milestone approval.
- Rewrite canonical documentation without a migration plan.
- Duplicate architecture or feature content instead of linking to it.
- Hide failed checks.
- Treat generated assumptions as repository facts.
- Bypass review for security, migration, authorization, or inventory integrity changes.

## Living Or Historical

This is living documentation. It should evolve as the team learns how AI assistance succeeds or fails in this repository.

## Who Updates It

Engineering owns this protocol. Changes should be reviewed by the people who rely on AI sessions for engineering work.

## When To Update It

Update this document when:

- AI workflow expectations change.
- Repeated AI mistakes reveal missing guidance.
- Verification or commit policy changes.
- New required review gates are introduced.

## Related Documents

- [Project Constitution](./PROJECT_CONSTITUTION.md)
- [AI Engineering Operating Model](./AI_ENGINEERING_OPERATING_MODEL.md)
- [Repository Refresh Protocol](./REPOSITORY_REFRESH_PROTOCOL.md)
- [Engineering System](./ENGINEERING_SYSTEM.md)
- [Governance Overview](./README.md)
- [Engineering Handbook](../README.md)
- [Handbook Overview](../overview.md)
- [Reading Paths](../reading-paths.md)
- [Existing Documentation Map](../existing-documentation.md)
- [Handbook Stewardship](../roadmap.md)
- [Handbook Conventions](../conventions.md)
- [Architecture](../architecture/README.md)
- [ADRs](../adrs/README.md)
- [Engineering Process](../process/README.md)
- [Operations](../operations/README.md)
- [Templates](../templates/README.md)
- [Owner Documentation](../owners/README.md)
- [Reference](../reference/README.md)
