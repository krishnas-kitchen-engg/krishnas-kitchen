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
---

# Open Decisions

## Purpose

This document tracks unresolved architectural questions.

## Current Guidance

Only include decisions that are unresolved. When resolved, create or link an ADR if the decision is durable.

| Decision | Context | Options | Required Information | Decision Owner | Target Milestone |
|---|---|---|---|---|---|
| OD-001 Temporary volunteer operational permissions | Current docs conflict on whether temporary volunteers can receive, transfer, consume, or return inventory | Restrict to read/session only; allow scoped operational permissions; split by session type | Confirm intended product behavior and server enforcement model | Engineering | Not assigned |
| OD-002 Undo versus reversal terminology | Docs and schema history use both `undo` and `reversal` | Canonicalize event type as reversal and UI action as undo; retain both terms with explicit meanings; choose another mapping | Confirm current implementation and desired user-facing language | Engineering | Not assigned |
| OD-003 Offline queue architecture | Offline is required, but detailed living architecture is absent | Client-side queue through repository contract; service-worker-backed flow; defer writes until online-only milestone | Confirm storage, replay, idempotency, and conflict strategy | Engineering | Not assigned |
| OD-004 Living security architecture ownership | Security status is distributed across docs, migrations, and ADRs | Create a dedicated auth/RLS/security architecture page; keep status only in reference docs | Confirm owner and scope | Engineering | Not assigned |

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

