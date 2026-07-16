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
---

# Open Decisions

## Purpose

This document tracks unresolved architectural questions.

## Current Guidance

Only include decisions that are unresolved. When resolved, create or link an ADR if the decision is durable.

| Decision | Context | Options | Required Information | Decision Owner | Target Milestone |
|---|---|---|---|---|---|
| OD-004 Living security architecture ownership | Security status is distributed across docs, migrations, and ADRs | Create a dedicated auth/RLS/security architecture page; keep status only in reference docs | Confirm owner and scope | Engineering | Not assigned |

## Resolved Decisions

| Decision | Resolution | Evidence |
|---|---|---|
| OD-002 Undo versus reversal terminology | `undo` is the user-facing action and service operation; `reversal` is the domain event and current persisted correction transaction type; legacy persisted `undo` rows remain read-compatible history only. | [Inventory Architecture](../../INVENTORY_ARCHITECTURE.md); [ADR-0009](../adrs/0009-auditability-and-reversibility.md) |
| OD-003 Offline queue architecture | Offline writes must use the existing inventory domain and repository boundary. A future queue stores validated drafts, preserves audit/client request metadata, replays through authoritative server/database write paths, remains idempotent, fails closed on authorization or conflict errors, and does not bypass RLS/RPC/security constraints. | [Offline Sync Architecture](../architecture/offline-sync.md); [ADR-0005](../adrs/0005-mobile-first-offline-pwa.md) |

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
