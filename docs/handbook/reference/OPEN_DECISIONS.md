---
title: Open Decisions
status: active
doc_type: reference
lifecycle: living
owner: engineering
update_cadence: when open decisions are added, resolved, or deferred
last_reviewed: null
related:
  - ./README.md
  - ./CURRENT_STATE.md
  - ./NEXT_MILESTONE.md
  - ./TECH_DEBT.md
  - ../adrs/ADR_GUIDE.md
  - ../adrs/0004-temporary-volunteer-session-model.md
  - ../adrs/0005-mobile-first-offline-pwa.md
  - ../adrs/0009-auditability-and-reversibility.md
  - ../architecture/README.md
  - ../architecture/offline-sync.md
  - ../architecture/security.md
---

# Open Decisions

## Purpose

This document tracks unresolved architectural questions.

## Current Guidance

Only include decisions that are unresolved. When resolved, create or link an ADR if the decision is durable.

No open decisions are currently recorded.

## Resolved Decisions

| Decision | Resolution | Evidence |
|---|---|---|
| OD-002 Undo versus reversal terminology | `undo` is the user-facing action and service operation; `reversal` is the domain event and current persisted correction transaction type; legacy persisted `undo` rows remain read-compatible history only. | [Inventory Architecture](../../INVENTORY_ARCHITECTURE.md); [ADR-0009](../adrs/0009-auditability-and-reversibility.md) |
| OD-003 Offline queue architecture | Offline writes must use the existing inventory domain and repository boundary. A future queue stores validated drafts, preserves audit/client request metadata, replays through authoritative server/database write paths, remains idempotent, fails closed on authorization or conflict errors, and does not bypass RLS/RPC/security constraints. | [Offline Sync Architecture](../architecture/offline-sync.md); [ADR-0005](../adrs/0005-mobile-first-offline-pwa.md) |
| OD-004 Living security architecture ownership | Security architecture ownership is resolved by a dedicated living architecture page. Security status remains a posture/review reference; durable auth/RLS/RPC/temporary-volunteer boundaries live in the architecture page. | [Security Architecture](../architecture/security.md); [Security Status](./SECURITY_STATUS.md); [ADR-0003](../adrs/0003-supabase-auth-and-rls-boundary.md); [ADR-0004](../adrs/0004-temporary-volunteer-session-model.md); [ADR-0007](../adrs/0007-rpc-boundaries-and-browser-trust.md) |

## Owner

Engineering owns this document.

## Update Cadence

Update when open decisions are added, resolved, or deferred.

## Lifecycle

This is living documentation.

## Related Documents

- [Current State](./CURRENT_STATE.md)
- [Next Milestone](./NEXT_MILESTONE.md)
- [Technical Debt](./TECH_DEBT.md)
- [ADR Guide](../adrs/ADR_GUIDE.md)
- [ADR-0004: Temporary Volunteer Session Model](../adrs/0004-temporary-volunteer-session-model.md)
- [ADR-0005: Mobile-First Offline PWA](../adrs/0005-mobile-first-offline-pwa.md)
- [ADR-0009: Auditability And Reversibility](../adrs/0009-auditability-and-reversibility.md)
- [Offline Sync Architecture](../architecture/offline-sync.md)
- [Security Architecture](../architecture/security.md)
