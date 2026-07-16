---
title: Technical Debt Register
status: active
doc_type: reference
lifecycle: living
owner: engineering
update_cadence: when debt is discovered, changed, resolved, or accepted
last_reviewed: null
related:
  - ./README.md
  - ./CURRENT_STATE.md
  - ./KNOWN_LIMITATIONS.md
  - ./OPEN_DECISIONS.md
  - ../templates/TECH_DEBT_TEMPLATE.md
  - ../adrs/0004-temporary-volunteer-session-model.md
  - ../adrs/0005-mobile-first-offline-pwa.md
  - ../adrs/0009-auditability-and-reversibility.md
  - ../architecture/README.md
---

# Technical Debt Register

## Purpose

This document tracks accepted or discovered technical debt.

## Current Guidance

Add debt when a known weakness is accepted temporarily. Do not use this register for speculative future work.

| Identifier | Description | Impact | Risk | Priority | Owner | Status | Planned Milestone |
|---|---|---|---|---|---|---|---|
| TD-002 | Undo versus reversal terminology required canonical vocabulary across docs, schema history, and feature docs | Future implementation could confuse event types and user-facing action names | Medium | High | Engineering | Resolved | Canonicalize Undo/Reversal Terminology |
| TD-003 | Offline queue architecture is required but not yet captured as a detailed living architecture document | Offline work may proceed without a canonical plan | Medium | Medium | Engineering | Open | Not assigned |
| TD-004 | Existing older documentation contains duplication and encoding artifacts | Contributors may struggle to identify canonical guidance | Low | Medium | Engineering | Open | Not assigned |
| TD-005 | Latest full verification results must be refreshed during each implementation milestone | Project health is harder to assess if sessions reuse stale verification evidence | Medium | Medium | Engineering | Open | Not assigned |

## Owner

Engineering owns this document.

## Update Cadence

Update when debt is discovered, changed, resolved, or accepted.

## Lifecycle

This is living documentation.

## Related Documents

- [Known Limitations](./KNOWN_LIMITATIONS.md)
- [Open Decisions](./OPEN_DECISIONS.md)
- [Technical Debt Template](../templates/TECH_DEBT_TEMPLATE.md)
- [ADR-0004: Temporary Volunteer Session Model](../adrs/0004-temporary-volunteer-session-model.md)
- [ADR-0005: Mobile-First Offline PWA](../adrs/0005-mobile-first-offline-pwa.md)
- [ADR-0009: Auditability And Reversibility](../adrs/0009-auditability-and-reversibility.md)
