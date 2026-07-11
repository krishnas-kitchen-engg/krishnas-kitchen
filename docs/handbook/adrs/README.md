---
title: Architecture Decision Records
status: foundation
doc_type: index
lifecycle: living
owner: engineering
update_cadence: whenever ADRs are added or superseded
last_reviewed: null
related:
  - ../README.md
  - ../architecture/README.md
  - ./ADR_GUIDE.md
  - ./0001-immutable-inventory-ledger.md
  - ./0002-positive-quantities-and-quantity-effects.md
  - ./0003-supabase-auth-and-rls-boundary.md
  - ./0004-temporary-volunteer-session-model.md
  - ./0005-mobile-first-offline-pwa.md
  - ./0006-repository-pattern.md
  - ./0007-rpc-boundaries-and-browser-trust.md
  - ./0008-domain-driven-package-organization.md
  - ./0009-auditability-and-reversibility.md
  - ./0010-security-review-before-commit.md
  - ../templates/ADR_TEMPLATE.md
  - ../templates/README.md
---

# Architecture Decision Records

ADRs capture important engineering decisions and the context behind them.

## Purpose

This section will hold decision records for architectural choices that should remain understandable after the implementation changes.

Do not use ADRs to duplicate architecture docs. Use ADRs to explain why a decision was made, what alternatives were considered, and what consequences follow.

## ADR Framework

- [ADR Guide](./ADR_GUIDE.md)
- [ADR Template](../templates/ADR_TEMPLATE.md)

## ADR Index

| ADR | Status | Topic |
|---|---|---|
| [ADR-0001](./0001-immutable-inventory-ledger.md) | Accepted | Immutable inventory ledger |
| [ADR-0002](./0002-positive-quantities-and-quantity-effects.md) | Accepted | Positive quantities and quantity effects |
| [ADR-0003](./0003-supabase-auth-and-rls-boundary.md) | Accepted | Supabase Auth and RLS boundary |
| [ADR-0004](./0004-temporary-volunteer-session-model.md) | Accepted | Temporary volunteer session model |
| [ADR-0005](./0005-mobile-first-offline-pwa.md) | Accepted | Mobile-first offline PWA |
| [ADR-0006](./0006-repository-pattern.md) | Accepted | Repository pattern |
| [ADR-0007](./0007-rpc-boundaries-and-browser-trust.md) | Accepted | RPC boundaries and browser trust |
| [ADR-0008](./0008-domain-driven-package-organization.md) | Accepted | Domain-driven package organization |
| [ADR-0009](./0009-auditability-and-reversibility.md) | Accepted | Auditability and reversibility |
| [ADR-0010](./0010-security-review-before-commit.md) | Accepted | Security review before commit |

## Reading Order

For inventory architecture, read:

1. [ADR-0001: Immutable Inventory Ledger](./0001-immutable-inventory-ledger.md)
2. [ADR-0002: Positive Quantities And Quantity Effects](./0002-positive-quantities-and-quantity-effects.md)
3. [ADR-0009: Auditability And Reversibility](./0009-auditability-and-reversibility.md)

For authorization and browser trust, read:

1. [ADR-0003: Supabase Auth And RLS Boundary](./0003-supabase-auth-and-rls-boundary.md)
2. [ADR-0004: Temporary Volunteer Session Model](./0004-temporary-volunteer-session-model.md)
3. [ADR-0007: RPC Boundaries And Browser Trust](./0007-rpc-boundaries-and-browser-trust.md)
4. [ADR-0010: Security Review Before Commit](./0010-security-review-before-commit.md)

For application organization and delivery shape, read:

1. [ADR-0005: Mobile-First Offline PWA](./0005-mobile-first-offline-pwa.md)
2. [ADR-0006: Repository Pattern](./0006-repository-pattern.md)
3. [ADR-0008: Domain-Driven Package Organization](./0008-domain-driven-package-organization.md)

## Supersession Guidance

Accepted ADRs are historical decision records. Do not rewrite them to reflect a later architecture change.

When a decision changes:

1. Create the next numbered ADR.
2. Mark the old ADR as superseded.
3. Link the old ADR to the new ADR.
4. Link the new ADR to the old ADR.
5. Update this index, relevant architecture documents, and related roadmap items.

## Living Or Historical

This index is living documentation. Individual ADRs are historical records once accepted. Superseding an ADR should create a new ADR and update this index.

## Who Updates It

Engineering updates this index. The owner of a decision writes or updates the relevant ADR entry.

## When To Update It

Update this section when:

- A new ADR is proposed, accepted, superseded, or archived.
- An architecture page references a new decision.
- A decision needs explicit historical context.

## Related Documents

- [ADR Guide](./ADR_GUIDE.md)
- [Architecture](../architecture/README.md)
- [ADR Template](../templates/ADR_TEMPLATE.md)
- [Templates](../templates/README.md)
- [Handbook Conventions](../conventions.md)
