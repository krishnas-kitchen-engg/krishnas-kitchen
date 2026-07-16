---
title: Security Architecture
status: active
doc_type: architecture
lifecycle: living
owner: engineering
update_cadence: when auth, permissions, RLS, RPC boundaries, volunteer session security, or security review outcomes change
last_reviewed: null
related:
  - ./README.md
  - ../reference/SECURITY_STATUS.md
  - ../reference/OPEN_DECISIONS.md
  - ../reference/TECH_DEBT.md
  - ../adrs/0003-supabase-auth-and-rls-boundary.md
  - ../adrs/0004-temporary-volunteer-session-model.md
  - ../adrs/0007-rpc-boundaries-and-browser-trust.md
  - ../adrs/0010-security-review-before-commit.md
  - ../../AUTH_ARCHITECTURE.md
  - ../../PERMISSIONS_MATRIX.md
  - ../../../infra/supabase/README.md
---

# Security Architecture

## Purpose

This document is the canonical living architecture source for Krishna's Kitchen
Horizon 1 security boundaries.

Use it before auth, permission, RLS, RPC, temporary volunteer, offline replay, or
inventory-write milestones. [Security Status](../reference/SECURITY_STATUS.md)
records current posture and review notes; this page records the durable
architecture.

## Horizon Boundary

This page covers Horizon 1, Core Kitchen Inventory Platform security:

- Supabase Auth session identity.
- Application role and permission ergonomics.
- Temporary volunteer session constraints.
- Supabase/PostgreSQL RLS and helper functions.
- Controlled RPC boundaries for untrusted browser clients.
- Inventory auditability and immutable operational evidence.

Future horizons may require broader analytics, planning, or temple operations
authorization. They may influence this architecture, but they must not expand
current implementation scope without a separate active-horizon milestone.

## Core Principles

- Server/database authorization is authoritative.
- Browser permissions are usability hints, not enforcement.
- RLS, constraints, and controlled security-definer RPCs are security-sensitive
  boundaries.
- Temporary volunteers are session-scoped participants, not permanent roles.
- Inventory history must remain attributable and auditable.
- Security-sensitive changes require review before commit readiness.

## Identity And Session Model

Supabase Auth is the browser session source for authenticated users. App-facing
auth state may derive profile, organization, temple, role, and permission context
for UI behavior, but protected data access must still be enforced by the
database boundary.

Temporary volunteers use `volunteer_sessions` records rather than permanent user
roles. A valid temporary volunteer session must remain scoped, active,
unexpired, non-revoked, and attributable.

## Authorization Boundary

Protected authorization decisions belong at the Supabase/PostgreSQL boundary.
RLS policies, database helper functions, constraints, and controlled RPCs are the
authoritative enforcement layer.

Client-side permission helpers may hide, disable, or guide UI flows. They must
not be treated as proof that a user or temporary volunteer can read or write
protected data.

## RLS Boundary

Foundational migrations enable RLS on core tables. Current authenticated
inventory read policies exist for inventory-facing tables. Database helper
functions derive authenticated organization, role, and temple scope.

New protected tables or write paths must define explicit RLS, constraint, RPC,
or server-side enforcement before production use. Do not rely on UI gating or
browser-provided organization, temple, role, or permission claims.

## RPC Boundary

Browser clients are untrusted. Anonymous or temporary-volunteer access to
security-sensitive volunteer-session and inventory-read surfaces uses controlled
security-definer RPCs instead of direct anonymous table policies.

RPCs must derive scope from database state and validate browser-held identifiers
against active records. Anonymous execution grants must remain narrow,
intentional, and reviewed.

## Temporary Volunteer Permissions

Temporary volunteer browser permissions are restricted to:

- `locations.read`
- `items.read`
- `inventory.read`
- `volunteer_sessions.create`

Temporary volunteers do not receive inventory-changing, item-editing, audit,
user, role, temple, organization, administrative, or undo/reversal permissions in
the browser permission model.

Future temporary volunteer write capability requires a separate approved
server-enforced write model before permissions are expanded.

## Inventory Security

Inventory balances are derived from immutable transaction history. Security work
must preserve:

- positive quantity semantics
- quantity-effect semantics
- return semantics as `returned` plus `transfer`
- undo/reversal terminology and audit history
- actor or temporary volunteer attribution where applicable
- repository boundaries between domain logic and persistence

## Offline Replay Constraint

Offline queue storage and replay are not implemented. Future offline replay must
submit queued actions through authoritative server/database write paths and fail
closed when authorization, scope, validation, conflict, or session checks fail.

Queued temporary volunteer actions must not replay if the server can no longer
validate the temporary volunteer session or permission at replay time.

## Implemented Mechanisms

- Supabase Auth session integration is documented and present in the app.
- RLS is enabled on foundational tables.
- Database helper functions derive authenticated organization, role, and temple
  context.
- Authenticated inventory read policies exist for inventory-facing tables.
- Controlled security-definer RPCs exist for temporary volunteer session
  validation, restoration, refresh, logout cleanup, inventory visibility reads,
  and barcode catalog reads.
- Temporary volunteer browser permissions are read/session-only.
- ADR-0010 requires security review before security-sensitive commit readiness.

## Known Gaps

- Latest full security review results are not recorded.
- Offline queue storage, replay workers, and server idempotency constraints are
  not implemented.
- New protected write paths need explicit enforcement before production use.

## Update Triggers

Update this page when:

- auth, role, permission, or temporary volunteer semantics change
- RLS policies or helper functions change
- security-definer RPC surfaces change
- offline replay, server idempotency, or queued writes are implemented
- a security review changes accepted risk or production readiness

## Related Documents

- [Security Status](../reference/SECURITY_STATUS.md)
- [ADR-0003: Supabase Auth And RLS Boundary](../adrs/0003-supabase-auth-and-rls-boundary.md)
- [ADR-0004: Temporary Volunteer Session Model](../adrs/0004-temporary-volunteer-session-model.md)
- [ADR-0007: RPC Boundaries And Browser Trust](../adrs/0007-rpc-boundaries-and-browser-trust.md)
- [ADR-0010: Security Review Before Commit](../adrs/0010-security-review-before-commit.md)
- [Authentication and Authorization Architecture](../../AUTH_ARCHITECTURE.md)
- [Permissions Matrix](../../PERMISSIONS_MATRIX.md)
- [Supabase README](../../../infra/supabase/README.md)
