---
title: Offline Sync Architecture
status: active
doc_type: architecture
lifecycle: living
owner: engineering
update_cadence: when offline queue, replay, idempotency, conflict, or sync behavior changes
last_reviewed: null
related:
  - ./README.md
  - ../adrs/0005-mobile-first-offline-pwa.md
  - ../adrs/0003-supabase-auth-and-rls-boundary.md
  - ../adrs/0007-rpc-boundaries-and-browser-trust.md
  - ../../PRODUCT_HORIZONS.md
  - ../../SYSTEM_ARCHITECTURE.md
  - ../../INVENTORY_ARCHITECTURE.md
  - ../../MVP_SCOPE.md
  - ../../../apps/web/src/domains/inventory/application/inventoryRepository.ts
  - ../../../apps/web/src/domains/inventory/domain/types.ts
---

# Offline Sync Architecture

## Purpose

This page defines the canonical offline-sync architecture for Krishna's Kitchen.
It separates the offline requirement from current implementation status so future
work can add queue behavior without weakening inventory integrity, auditability,
or server-side authorization.

## Current Status

Offline capability is an architectural requirement. The application currently has
PWA tooling and offline-safe inventory draft metadata, but it does not yet
implement a durable local transaction queue or replay worker.

This architecture belongs to Horizon 1, Core Kitchen Inventory Platform, because
Horizon 1 includes mobile-first PWA, offline-ready architecture, inventory audit
trail, repository architecture, security, testing, and evidence generation.
Future horizons may rely on reliable offline inventory evidence, but this page
does not implement future kitchen planning, forecasting, analytics, or temple
operations capabilities.

Current implementation evidence:

- The web app uses Vite PWA tooling.
- Inventory drafts require a `clientId` for offline-safe creation.
- Inventory audit metadata supports `clientRequestId`, `deviceId`, `reason`, and
  `source`, including `source = "offline_queue"`.
- Inventory services depend on repository contracts instead of direct Supabase
  writes.
- The Supabase repository adapter is the current online persistence adapter.

## Architecture Decision

Offline writes must enter the system through the existing inventory domain and
repository boundary.

The future offline queue must store validated inventory transaction drafts and
replay them through a repository implementation or repository-adjacent sync
adapter. It must not bypass domain validation, immutable transaction semantics,
RLS, RPC boundaries, or server/database authorization.

## Boundary Model

The offline sync boundary has four layers:

1. Domain validation creates an inventory transaction draft with positive
   quantity, canonical transaction type, quantity effect, actor, scope, and
   audit metadata.
2. A queue adapter may persist the validated draft locally when the device is
   offline or when online persistence fails with a retriable connectivity error.
3. A replay adapter submits queued drafts to the authoritative server/database
   write path when connectivity returns.
4. Supabase, RLS, RPCs, constraints, and policies remain authoritative for
   authorization, tenant isolation, and persistence.

The browser queue is a delivery mechanism. It is not an authorization boundary
and is not the source of truth.

## Queue Record Requirements

A queued inventory write must preserve:

- `clientId`
- `auditMetadata.clientRequestId`
- `auditMetadata.deviceId` when available
- `auditMetadata.source = "offline_queue"`
- actor identity or temporary volunteer session attribution
- organization and temple scope
- item, location, quantity, unit, transaction type, and quantity effect
- creation intent timestamp for diagnostics
- retry status and last error for supportability

Queued records must not store secrets or privileged server-derived claims.

## Replay Requirements

Replay must be idempotent. A repeated queued draft with the same client request
identity must not create duplicate inventory effects.

Replay must:

- preserve append-only inventory history
- preserve positive quantity semantics
- preserve return and transfer movement semantics
- preserve undo/reversal semantics
- fail closed on authorization, scope, validation, or conflict errors
- surface non-retriable failures to a human recovery workflow
- retain enough audit metadata to diagnose replay behavior

## Conflict Policy

Offline replay must not silently repair inventory conflicts by mutating existing
transactions. If a queued write cannot be applied safely, it must remain failed
or pending human review.

Allowed automatic behavior:

- retry transient connectivity or server availability failures
- skip already-applied idempotent requests after confirming they represent the
  same client request

Disallowed automatic behavior:

- editing historical inventory transactions
- changing quantity or location to fit current stock
- granting permissions based on cached browser state
- replaying expired or unauthorized temporary volunteer actions as a different
  actor

## Security Requirements

Offline sync must preserve the project security model:

- Server-side authorization remains mandatory.
- Client-side permissions are usability hints only.
- RLS, RPCs, constraints, and security-definer functions remain authoritative.
- Temporary volunteer sessions remain restricted, expiring, attributable, and
  non-equivalent to permanent user roles.
- Queued actions by temporary volunteers must fail if the server can no longer
  validate the session or permission at replay time.

## Current Non-Implementation Boundary

This page does not implement:

- local queue storage
- background sync
- service-worker replay
- IndexedDB schema
- online/offline UI states
- server idempotency constraints
- new RLS policies or RPCs

Those require separate approved milestones.

## Verification Expectations

Future offline implementation milestones should include:

- unit tests for queue record creation and validation
- replay idempotency tests
- retry/failure classification tests
- authorization failure tests
- temporary volunteer expiration/revocation replay tests
- inventory aggregation regression tests after replay
- build, typecheck, lint, and full test verification

## Owner

Engineering owns this document.

## Update Cadence

Update when offline queue storage, replay, idempotency, conflict, security, or
sync behavior changes.

## Lifecycle

This is living architecture documentation.
