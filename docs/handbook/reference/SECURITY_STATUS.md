---
title: Security Status
status: active
doc_type: reference
lifecycle: living
owner: engineering
update_cadence: after security-sensitive milestones or security review
last_reviewed: null
related:
  - ./README.md
  - ./CURRENT_STATE.md
  - ./OPEN_DECISIONS.md
  - ./TECH_DEBT.md
  - ../adrs/0003-supabase-auth-and-rls-boundary.md
  - ../adrs/0004-temporary-volunteer-session-model.md
  - ../adrs/0007-rpc-boundaries-and-browser-trust.md
  - ../adrs/0010-security-review-before-commit.md
  - ../architecture/README.md
  - ../../AUTH_ARCHITECTURE.md
  - ../../PERMISSIONS_MATRIX.md
  - ../../../infra/supabase/README.md
---

# Security Status

## Purpose

This document summarizes current security mechanisms and known security work.

## Current Guidance

Use this page before security-sensitive milestones. It is a status document, not a replacement for security review.

## Implemented Security Mechanisms

- Supabase Auth is documented as the browser session source.
- RLS is enabled on foundational Supabase tables.
- Database helper functions derive authenticated user organization, roles, and temple scope.
- Authenticated inventory read policies exist for inventory-facing tables.
- Temporary volunteer session validation and inventory read access use controlled security-definer RPCs.
- Volunteer session RPCs validate active, unexpired, non-revoked session state.
- The handbook requires security review before security-sensitive commit readiness.

## Remaining Security Work

- Reconcile temporary volunteer permission documentation and implementation expectations.
- Consolidate RLS/security architecture into a living architecture document.
- Record latest security review results for security-sensitive areas.
- Continue adding explicit policies for new write paths before production use.

## RLS Status

RLS is enabled on foundational tables. Authenticated inventory read policies exist. Temporary volunteer direct anonymous table access is intentionally avoided for documented volunteer RPC surfaces.

## RPC Status

Controlled security-definer RPCs exist for temporary volunteer session validation/restoration/refresh/logout cleanup and volunteer inventory/barcode read surfaces.

## Authentication

Supabase Auth supports authenticated sessions. Temporary volunteers use session records rather than permanent roles.

## Authorization

Server/database-derived authorization is the authoritative boundary. Client-side permission helpers are not final enforcement.

## Audit

The foundational schema includes immutable `audit_logs`. Inventory transactions carry audit metadata and immutable ledger behavior.

## Known Risks

- Temporary volunteer permission drift remains unresolved.
- Security status is distributed across docs, ADRs, and migrations rather than a dedicated living security architecture page.
- Latest full security review result is not recorded.

## Owner

Engineering owns this document.

## Update Cadence

Update after security-sensitive milestones or security review.

## Lifecycle

This is living documentation.

## Related Documents

- [Current State](./CURRENT_STATE.md)
- [Open Decisions](./OPEN_DECISIONS.md)
- [Technical Debt](./TECH_DEBT.md)
- [ADR-0003: Supabase Auth And RLS Boundary](../adrs/0003-supabase-auth-and-rls-boundary.md)
- [ADR-0004: Temporary Volunteer Session Model](../adrs/0004-temporary-volunteer-session-model.md)
- [ADR-0007: RPC Boundaries And Browser Trust](../adrs/0007-rpc-boundaries-and-browser-trust.md)
- [ADR-0010: Security Review Before Commit](../adrs/0010-security-review-before-commit.md)
- [Auth Architecture](../../AUTH_ARCHITECTURE.md)
- [Permissions Matrix](../../PERMISSIONS_MATRIX.md)
- [Supabase README](../../../infra/supabase/README.md)

