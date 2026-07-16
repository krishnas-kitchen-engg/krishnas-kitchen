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
  - ../architecture/offline-sync.md
---

# Known Limitations

## Purpose

This document captures current limitations without proposing solutions.

## Current Guidance

Record reality only. Do not turn this page into a roadmap.

## Limitations

- The project is not documented as production-ready.
- Offline queueing is not implemented. The living offline-sync architecture defines the future queue and replay boundary.
- Latest full format, typecheck, lint, test, and build results are recorded in [Evidence Report](./EVIDENCE_REPORT.md); verification freshness still depends on rerunning checks during each future implementation milestone.
- Existing older docs include duplication and encoding artifacts.
- Latest Horizon 1 security review baseline is recorded in [Security Status](./SECURITY_STATUS.md), but production security approval is not granted.
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
- [Offline Sync Architecture](../architecture/offline-sync.md)
