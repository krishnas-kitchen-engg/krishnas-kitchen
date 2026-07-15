---
title: Known Limitations
status: active
doc_type: reference
lifecycle: living
owner: engineering
update_cadence: when limitations are discovered, resolved, or reclassified
last_reviewed: null
related:
  - ./README.md
  - ./CURRENT_STATE.md
  - ./TECH_DEBT.md
  - ./OPEN_DECISIONS.md
  - ../adrs/0004-temporary-volunteer-session-model.md
  - ../adrs/0005-mobile-first-offline-pwa.md
  - ../adrs/0009-auditability-and-reversibility.md
  - ../architecture/README.md
---

# Known Limitations

## Purpose

This document captures current limitations without proposing solutions.

## Current Guidance

Record reality only. Do not turn this page into a roadmap.

## Limitations

- The project is not documented as production-ready.
- Temporary volunteer permission documentation is inconsistent across current docs and observed tests.
- Undo and reversal terminology is not fully canonical across docs and schema history.
- Offline queueing is an architectural requirement, but detailed living architecture for offline sync is not present.
- Latest full test, lint, typecheck, and build results are recorded for the diagnostic cleanup milestone, but verification freshness still depends on rerunning checks during each future implementation milestone.
- Existing older docs include duplication and encoding artifacts.
- Security status exists across multiple docs and migrations, but a dedicated living security architecture page is not yet present.
- Accessibility status is not measured in current living docs.
- Performance status is not measured in current living docs.

## Owner

Engineering owns this document.

## Update Cadence

Update when limitations are discovered, resolved, or reclassified as technical debt or approved future work.

## Lifecycle

This is living documentation.

## Related Documents

- [Current State](./CURRENT_STATE.md)
- [Technical Debt](./TECH_DEBT.md)
- [Open Decisions](./OPEN_DECISIONS.md)
- [ADR-0004: Temporary Volunteer Session Model](../adrs/0004-temporary-volunteer-session-model.md)
- [ADR-0005: Mobile-First Offline PWA](../adrs/0005-mobile-first-offline-pwa.md)
- [ADR-0009: Auditability And Reversibility](../adrs/0009-auditability-and-reversibility.md)
