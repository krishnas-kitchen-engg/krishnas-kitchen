---
title: Project Scorecard
status: active
doc_type: reference
lifecycle: living
owner: engineering
update_cadence: after every milestone or scorecard-impacting review
last_reviewed: null
related:
  - ./README.md
  - ./CURRENT_STATE.md
  - ./SECURITY_STATUS.md
  - ./TECH_DEBT.md
  - ./KNOWN_LIMITATIONS.md
  - ../adrs/0001-immutable-inventory-ledger.md
  - ../adrs/0003-supabase-auth-and-rls-boundary.md
  - ../adrs/0005-mobile-first-offline-pwa.md
  - ../adrs/0010-security-review-before-commit.md
  - ../architecture/README.md
---

# Project Scorecard

## Purpose

This document tracks measurable health indicators for Krishna's Kitchen.

## Current Guidance

Use status, evidence, confidence, and next improvement to make project health visible without inventing precision.

| Area | Current Status | Evidence | Confidence | Next Improvement |
|---|---|---|---|---|
| Architecture | Established foundation with gaps | Architecture docs and ADRs exist for inventory, auth/RLS, PWA, repositories, RPCs, package organization | Medium | Create living architecture pages for current-state areas |
| Security | Implemented foundations, review needed | RLS enabled, helper functions, authenticated read policies, volunteer RPCs, security ADRs | Medium | Consolidate security/RLS architecture and resolve permission drift |
| Testing | Broad automated coverage exists | Vitest scripts and many domain, repository, migration, auth, and UI tests exist | Medium | Run full suite and record latest verification result |
| Documentation | Stable handbook foundation | Governance, process, templates, ADRs, reference layer, document index, drift register, and health report exist | High | Resolve documented drift and migrate older docs only when needed |
| Performance | Requirements documented, status not measured | Performance goals exist in system architecture | Low | Add measured performance validation for critical workflows |
| Offline | Architecture requirement exists, implementation incomplete | PWA/offline docs exist; offline queue remains a documented gap | Medium | Create living offline sync architecture and implementation plan |
| Accessibility | Review requirement exists, status not measured | Process checklist includes accessibility | Low | Add accessibility validation expectations to relevant runbooks |
| Technical Debt | Initial register created | `TECH_DEBT.md` exists | Medium | Prioritize and assign debt items |
| Maintainability | Strong structural patterns | Domain/features/shared/package boundaries, repository pattern, ADRs | Medium | Add owner docs for major areas |
| Developer Experience | Handbook and scripts exist | pnpm scripts, process docs, templates, reading paths | Medium | Add current verification baseline and onboarding runbook |

## Owner

Engineering owns this document.

## Update Cadence

Update after every milestone or scorecard-impacting review.

## Lifecycle

This is living documentation.

## Related Documents

- [Current State](./CURRENT_STATE.md)
- [Security Status](./SECURITY_STATUS.md)
- [Technical Debt](./TECH_DEBT.md)
- [Known Limitations](./KNOWN_LIMITATIONS.md)
- [ADR Index](../adrs/README.md)
- [Architecture](../architecture/README.md)
