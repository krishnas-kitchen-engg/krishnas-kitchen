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

This protocol governs AI-assisted engineering work in Krishna's Kitchen.

It applies to documentation, code, tests, migrations, operations, and review tasks. Current task constraints always matter; when a user says documentation-only, implementation must remain documentation-only.

## Purpose

Use this document to keep AI sessions repository-first, bounded, verifiable, and aligned with the project constitution.

## Repository-First Development

AI work must begin from the repository, not assumptions.

Required behavior:

- Inspect relevant files before proposing or changing implementation.
- Use [Existing Documentation Map](../existing-documentation.md), [Reading Paths](../reading-paths.md), and the relevant handbook section before editing.
- Treat existing documentation as source material unless it is clearly superseded.
- Prefer local patterns over invented abstractions.
- Preserve user work and unrelated changes.

## Micro-Milestone Workflow

AI-assisted work should be split into small milestones:

1. Understand the request and constraints.
2. Scan the repository and documentation.
3. Reconstruct the affected architecture.
4. Identify the smallest safe change.
5. Implement or document only that milestone.
6. Verify the milestone.
7. Report what changed, what was not changed, and remaining risks.

Long tasks should produce progress updates at milestone boundaries.

## Required Planning

Before implementation, an AI session must identify:

- Scope.
- Files or areas likely affected.
- Existing docs that govern the change.
- Tests or checks needed.
- Security and data-integrity risks.
- Whether human review is required before proceeding.

For small documentation-only changes, the plan may be brief, but the repository scan still matters.

## Required Implementation Process

Implementation must:

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

Before committing, AI must:

- Summarize intended changes.
- Confirm unrelated changes are not being included.
- Run or report required verification.
- Ask for approval if the user has not already authorized the commit.

When committing is approved, commit only the intended scope.

## Conditions Requiring Human Review

Pause and request human review when:

- Instructions conflict.
- Documentation conflicts with implementation and the correct source is unclear.
- The work changes a non-negotiable invariant from [Project Constitution](./PROJECT_CONSTITUTION.md).
- A migration, destructive action, or data rewrite is required.
- Security boundaries may change.
- A new dependency, framework, or architecture pattern is proposed.
- Tests reveal behavior that contradicts the requested change.

## Prohibited Behaviors

AI must not:

- Modify application code when the task is documentation-only.
- Modify tests or migrations when prohibited.
- Move or delete files without explicit instruction.
- Commit without explicit approval.
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
- [Repository Refresh Protocol](./REPOSITORY_REFRESH_PROTOCOL.md)
- [Engineering System](./ENGINEERING_SYSTEM.md)
- [Governance Overview](./README.md)
- [Engineering Handbook](../README.md)
- [Handbook Overview](../overview.md)
- [Reading Paths](../reading-paths.md)
- [Existing Documentation Map](../existing-documentation.md)
- [Handbook Roadmap](../roadmap.md)
- [Handbook Conventions](../conventions.md)
- [Architecture](../architecture/README.md)
- [ADRs](../adrs/README.md)
- [Engineering Process](../process/README.md)
- [Operations](../operations/README.md)
- [Templates](../templates/README.md)
- [Owner Documentation](../owners/README.md)
- [Reference](../reference/README.md)

