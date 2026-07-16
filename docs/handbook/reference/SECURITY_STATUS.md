---
title: Security Status
status: active
doc_type: reference
lifecycle: living
owner: engineering
update_cadence: after security-sensitive milestones or security review
last_reviewed: 2026-07-16
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
  - ../architecture/security.md
  - ../../AUTH_ARCHITECTURE.md
  - ../../PERMISSIONS_MATRIX.md
  - ../../../infra/supabase/README.md
---

# Security Status

## Purpose

This document summarizes current security mechanisms and known security work.

## Current Guidance

Use this page before security-sensitive milestones. It is a status document, not a replacement for security review. Durable security architecture belongs in [Security Architecture](../architecture/security.md).

## Implemented Security Mechanisms

- Supabase Auth is documented as the browser session source.
- RLS is enabled on foundational Supabase tables.
- Database helper functions derive authenticated user organization, roles, and temple scope.
- Authenticated inventory read policies exist for inventory-facing tables.
- Temporary volunteer session validation and inventory read access use controlled security-definer RPCs.
- Volunteer session RPCs validate active, unexpired, non-revoked session state.
- The handbook requires security review before security-sensitive commit readiness.

## Remaining Security Work

- Continue adding explicit policies for new write paths before production use.
- Convert security review findings into focused implementation milestones before production hardening.

## Latest Security Review Baseline

Date: 2026-07-16.

Scope: Horizon 1 authentication, authorization, RLS/RPC boundaries, temporary volunteer session access, inventory read/write boundary posture, offline replay constraints, auditability, and living security documentation.

Assets/Data: organizations, temples, users, user roles, inventory items, item barcodes, locations, inventory transactions, volunteer sessions, unknown barcodes, low-stock thresholds, and audit logs.

Actors/Permissions: authenticated users with permanent roles, temporary volunteers with read/session-only browser permissions, anonymous clients using controlled temporary-volunteer RPCs, and system/database execution contexts.

Trust Boundaries: browser clients remain untrusted for protected authorization. Supabase Auth is the browser session source. PostgreSQL RLS, helper functions, and controlled RPCs are the authoritative data-access boundary.

RLS/Database Access: foundational tables have RLS enabled. Authenticated inventory read policies use database-derived organization and temple scope. Temporary volunteer direct anonymous table access is intentionally avoided for documented volunteer inventory read surfaces.

RPCs/Elevated Privileges: security-definer RPCs exist for temporary volunteer join-code validation, restore, refresh, logout cleanup, inventory read, barcode lookup/catalog, low-stock, unknown-barcode, and transaction visibility. Review confirmed these documented surfaces derive scope from active, unexpired, non-revoked volunteer session records rather than browser-supplied organization/temple authority.

Secret Handling: no new secrets, environment variables, credential material, or logging behavior were introduced by this documentation-only review baseline.

Auditability: the foundational schema includes immutable audit logs, inventory transactions carry actor metadata, and inventory architecture continues to require immutable ledger behavior. Future offline replay must preserve audit/client request metadata and server/database authority.

Threats Considered: cross-organization/temple access, temporary volunteer privilege expansion, browser-forged organization or temple scope, expired/revoked volunteer session reuse, direct anonymous table reads, unauthorized inventory writes, offline replay authorization bypass, duplicate replay, and stale documentation overstating security readiness.

Findings:

- No commit-blocking documentation or architecture issues were found for the current Horizon 1 baseline.
- Temporary volunteer browser permissions remain read/session-only.
- Existing controlled RPC surfaces validate active volunteer sessions before returning volunteer inventory data.
- The project is not documented as production-ready.
- Offline queue/replay is not implemented and must not be added without server-side validation, idempotency, fail-closed authorization, and conflict handling.
- New protected write paths require explicit RLS/RPC/server-side enforcement before production use.
- Temporary volunteer write capability remains out of scope until an approved server-enforced write model exists.

Required Changes: none required for this documentation-only baseline. Future security-sensitive implementation must rerun security review before commit readiness.

Approval Status: baseline recorded for Horizon 1 planning and evidence. This is not a production security approval.

## RLS Status

RLS is enabled on foundational tables. Authenticated inventory read policies exist. Temporary volunteer direct anonymous table access is intentionally avoided for documented volunteer RPC surfaces.

## RPC Status

Controlled security-definer RPCs exist for temporary volunteer session validation/restoration/refresh/logout cleanup and volunteer inventory/barcode read surfaces.

## Authentication

Supabase Auth supports authenticated sessions. Temporary volunteers use session records rather than permanent roles.

## Authorization

Server/database-derived authorization is the authoritative boundary. Client-side permission helpers are not final enforcement. Temporary volunteer browser permissions are limited to read/session capabilities and do not include inventory-changing operations.

## Audit

The foundational schema includes immutable `audit_logs`. Inventory transactions carry audit metadata and immutable ledger behavior.

## Known Risks

- Security review baseline is recorded, but production security approval is not granted.
- Offline queue/replay behavior is not implemented.
- Future protected write paths and any temporary volunteer write capability require explicit server/database enforcement before production use.

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
- [Security Architecture](../architecture/security.md)
- [Auth Architecture](../../AUTH_ARCHITECTURE.md)
- [Permissions Matrix](../../PERMISSIONS_MATRIX.md)
- [Supabase README](../../../infra/supabase/README.md)
