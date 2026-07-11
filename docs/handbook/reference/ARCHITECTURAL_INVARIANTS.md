---
title: Architectural Invariants
status: active
doc_type: reference
lifecycle: living
owner: engineering
update_cadence: when ADRs add, supersede, or remove invariants
last_reviewed: null
related:
  - ./README.md
  - ./CURRENT_STATE.md
  - ./OPEN_DECISIONS.md
  - ../adrs/0001-immutable-inventory-ledger.md
  - ../adrs/0002-positive-quantities-and-quantity-effects.md
  - ../adrs/0003-supabase-auth-and-rls-boundary.md
  - ../adrs/0004-temporary-volunteer-session-model.md
  - ../adrs/0005-mobile-first-offline-pwa.md
  - ../adrs/0006-repository-pattern.md
  - ../adrs/0007-rpc-boundaries-and-browser-trust.md
  - ../adrs/0008-domain-driven-package-organization.md
  - ../adrs/0009-auditability-and-reversibility.md
  - ../adrs/0010-security-review-before-commit.md
  - ../architecture/README.md
---

# Architectural Invariants

## Purpose

This document is the canonical list of architecture rules that must not change without a new ADR.

## Current Guidance

If a milestone would violate an invariant, stop and create or propose a superseding ADR before implementation.

## Invariants

- Inventory is an immutable event ledger. Related ADR: [ADR-0001](../adrs/0001-immutable-inventory-ledger.md).
- Stock balances are derived from transaction history. Related ADR: [ADR-0001](../adrs/0001-immutable-inventory-ledger.md).
- Inventory quantities are positive; direction comes from transaction semantics and `quantity_effect`. Related ADR: [ADR-0002](../adrs/0002-positive-quantities-and-quantity-effects.md).
- Browser clients are never authoritative for protected authorization decisions. Related ADRs: [ADR-0003](../adrs/0003-supabase-auth-and-rls-boundary.md), [ADR-0007](../adrs/0007-rpc-boundaries-and-browser-trust.md).
- Authorization is server/database-derived for protected data access. Related ADR: [ADR-0003](../adrs/0003-supabase-auth-and-rls-boundary.md).
- RLS protects table access. Related ADR: [ADR-0003](../adrs/0003-supabase-auth-and-rls-boundary.md).
- Temporary volunteers use scoped session records and must not receive unrestricted table access. Related ADRs: [ADR-0004](../adrs/0004-temporary-volunteer-session-model.md), [ADR-0007](../adrs/0007-rpc-boundaries-and-browser-trust.md).
- Repository boundaries remain explicit between UI/application code and Supabase adapters. Related ADR: [ADR-0006](../adrs/0006-repository-pattern.md).
- Domain, feature, shared integration, and package boundaries remain explicit. Related ADR: [ADR-0008](../adrs/0008-domain-driven-package-organization.md).
- Operational workflows are mobile-first and preserve a path toward offline operation. Related ADR: [ADR-0005](../adrs/0005-mobile-first-offline-pwa.md).
- Inventory-changing actions must remain auditable and reversible without mutating history. Related ADR: [ADR-0009](../adrs/0009-auditability-and-reversibility.md).
- Security reviews precede security-sensitive commit readiness. Related ADR: [ADR-0010](../adrs/0010-security-review-before-commit.md).

## Owner

Engineering owns this document.

## Update Cadence

Update when ADRs add, supersede, or remove invariants.

## Lifecycle

This is living documentation.

## Related Documents

- [Current State](./CURRENT_STATE.md)
- [Open Decisions](./OPEN_DECISIONS.md)
- [ADR Index](../adrs/README.md)
- [Architecture](../architecture/README.md)

