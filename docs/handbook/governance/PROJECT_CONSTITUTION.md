---
title: Project Constitution
status: active
doc_type: governance
lifecycle: living
owner: engineering
update_cadence: when mission, invariants, or decision hierarchy changes
last_reviewed: null
related:
  - ./README.md
  - ./ENGINEERING_PRINCIPLES.md
  - ./ENGINEERING_SYSTEM.md
  - ./AI_EXECUTION_PROTOCOL.md
  - ./REPOSITORY_REFRESH_PROTOCOL.md
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

# Project Constitution

This constitution defines the enduring engineering commitments for Krishna's Kitchen.

It does not restate product, feature, or architecture details. Those remain in the existing project documentation and the relevant handbook sections.

## Purpose

Use this document to resolve engineering tradeoffs, review proposals, guide AI sessions, and protect the long-term integrity of the project.

## Project Mission

Krishna's Kitchen exists to make temple kitchen operations more reliable, auditable, volunteer-friendly, and operationally simple.

Engineering decisions should serve that mission by preserving trust in inventory, reducing volunteer friction, and keeping the system understandable over time.

## Engineering Philosophy

Use [Engineering Principles](./ENGINEERING_PRINCIPLES.md) for the concise, enduring philosophy. This constitution preserves the mission, decision hierarchy, and non-negotiable commitments.

- Build operational infrastructure, not novelty for its own sake.
- Prefer explicit, reviewable, typed, and testable designs.
- Optimize for volunteer trust and operational correctness before feature breadth.
- Keep changes small enough to understand, verify, and reverse.
- Treat documentation as part of the system, not commentary after the fact.
- Use the repository as the primary source of engineering truth.

## Architectural Principles

Architecture must be:

- Consistent with the current authoritative documentation listed in [Existing Documentation Map](../existing-documentation.md).
- Incremental and compatible with [Handbook Stewardship](../roadmap.md).
- Captured in living architecture pages or ADRs when decisions have lasting consequences.
- Simple enough for future contributors to reconstruct from code, tests, and documentation.
- Aligned with the operational constraints described in the current architecture and process documents.

For current architecture entry points, use [Architecture](../architecture/README.md).

## Security Principles

- Server-side authorization is mandatory for protected operations.
- Client-side permissions are usability signals, not final enforcement.
- Tenant and organization boundaries must be preserved.
- Secrets must not be committed or exposed through browser-visible configuration.
- Temporary or delegated access must be narrow, attributable, expiring, and reviewable.
- Security-sensitive changes require explicit review before release.

## Quality Principles

- Correctness beats speed when inventory, authorization, auditability, or data integrity is involved.
- Tests should cover the highest operational risks first.
- Type safety and validation are part of product reliability.
- Release readiness includes verification, rollback thinking, and documentation impact.
- A change is incomplete if it leaves the next contributor unable to understand its intent.

Use [Engineering Process](../process/README.md) for current process entry points.

## Documentation Principles

- Do not duplicate canonical content.
- Link to existing sources until content is intentionally migrated.
- Living documents must stay synchronized with code, tests, and decisions.
- Historical documents must be clearly marked so they are not mistaken for current guidance.
- Every significant decision should be discoverable from the handbook, an ADR, or an explicitly linked source.
- Documentation updates are required when a change alters behavior, architecture, process, operations, ownership, or terminology.

Use [Handbook Conventions](../conventions.md) for documentation structure.

## Long-Term Maintainability Principles

- Preserve the ability to reason from domain rules to implementation.
- Avoid framework churn unless the operational benefit is clear.
- Keep data history and audit trails intact.
- Prefer bounded changes over broad rewrites.
- Make ownership and update triggers explicit.
- Leave the repository easier to understand than it was before the work began.

## Decision Hierarchy

When guidance conflicts, use this order:

1. Legal, safety, privacy, and security requirements.
2. User-approved task constraints for the current work.
3. This constitution and the governance documents in this section.
4. Accepted ADRs in [ADRs](../adrs/README.md).
5. Current living architecture documentation.
6. Current tests and implementation behavior.
7. Existing historical documentation and feature notes.
8. Individual preference or convenience.

When conflict remains unresolved, pause implementation and request human review.

## Non-Negotiable Invariants

- Do not compromise inventory integrity.
- Do not bypass authorization or tenant isolation.
- Do not mutate historical records when the architecture requires append-only history.
- Do not expose secrets to client code or documentation.
- Do not make broad architectural changes without a documented decision path.
- Do not let AI-generated work proceed without repository context, verification, and human approval where required.
- Do not treat stale documentation as authoritative when code, tests, and newer governance indicate drift.
- Do not delete, move, or rewrite canonical documentation without an explicit migration plan.

## Living Or Historical

This is living documentation. It should remain stable in spirit but current in wording as governance matures.

## Who Updates It

Engineering owns this constitution. Changes should receive human review because this document governs future engineering decisions.

## When To Update It

Update this document when:

- The project mission changes.
- A non-negotiable invariant changes.
- The decision hierarchy changes.
- Governance documents introduce a conflict with this constitution.
- A repeated engineering failure reveals a missing principle.

## Related Documents

- [Governance Overview](./README.md)
- [Engineering Principles](./ENGINEERING_PRINCIPLES.md)
- [Engineering System](./ENGINEERING_SYSTEM.md)
- [AI Execution Protocol](./AI_EXECUTION_PROTOCOL.md)
- [Repository Refresh Protocol](./REPOSITORY_REFRESH_PROTOCOL.md)
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
