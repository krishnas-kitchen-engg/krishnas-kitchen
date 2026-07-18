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
  - ./PROJECT_MEMORY.md
  - ./IMPLEMENTATION_PATTERNS.md
  - ./COMMON_FAILURES.md
  - ./SECURITY_STATUS.md
  - ./TECH_DEBT.md
  - ./KNOWN_LIMITATIONS.md
  - ../governance/AI_ENGINEERING_OPERATING_MODEL.md
  - ../adrs/0001-immutable-inventory-ledger.md
  - ../adrs/0003-supabase-auth-and-rls-boundary.md
  - ../adrs/0005-mobile-first-offline-pwa.md
  - ../adrs/0010-security-review-before-commit.md
  - ../architecture/README.md
  - ../architecture/offline-sync.md
---

# Project Scorecard

## Purpose

This document tracks measurable health indicators for Krishna's Kitchen.

## Current Guidance

Track only health indicators that help choose, review, or de-risk engineering work. Prefer qualitative status when objective measurements are unavailable.

| Area | Health | Evidence | Next Improvement |
|---|---|---|---|
| Architecture Health | Good with known gaps | ADRs and architecture references establish inventory ledger, auth/RLS boundary, PWA direction, offline sync boundary, security architecture, repositories, RPC boundaries, package organization, and recipe definition/scaling/availability domain foundations | Keep architecture updates tied to approved active-horizon milestones |
| Security Health | Watch | RLS, helper functions, authenticated read policies, volunteer RPCs, security architecture, security ADRs, and the Horizon 1 security review baseline exist; temporary volunteer browser permissions are restricted to read/session capabilities | Convert review findings into focused milestones before production hardening or permission expansion |
| Testing Health | Watch | Vitest coverage exists across domain, repository, migration, auth, UI, and utilities; latest full-suite result is recorded in [Evidence Report](./EVIDENCE_REPORT.md) | Keep recording full verification during implementation milestones |
| Documentation Health | Good | Handbook contains the frozen Session Controller, Product Horizons, governance, process, templates, ADRs, living references, document index, drift register, and memory pages | Keep EOS changes implementation-driven only |
| Technical Debt Trend | Watch | Undo/reversal terminology drift, return semantics drift, and offline architecture drift are resolved; [Technical Debt](./TECH_DEBT.md), [Documentation Drift](./DOCUMENTATION_DRIFT.md), and [Common Failures and Engineering Lessons](./COMMON_FAILURES.md) identify remaining known issues | Address remaining debt through approved micro-milestones instead of broad cleanup |
| Roadmap Progress | Conditional | Temporary volunteer permission drift, undo/reversal terminology drift, return semantics drift, offline architecture drift, security architecture ownership, living state refresh, security review baseline recording, EOS Session Controller freeze, recipe definition foundation, recipe scaling foundation, and recipe availability foundation have been reconciled | Select the next active-horizon application or documentation micro-milestone through the Session Controller after the current human-review gate |
| Build Stability | Watch | Latest recorded verification in [Current State](./CURRENT_STATE.md) passed typecheck, lint, tests, and build with the existing Vite chunk-size warning | Continue running full verification before commit readiness |

## EOS Freeze Status

| Indicator | Status | Evidence |
|---|---|---|
| EOS Version | See changelog | [Changelog Summary](./CHANGELOG_SUMMARY.md) |
| EOS Status | Frozen for production use | [AI Engineering Operating Model](../governance/AI_ENGINEERING_OPERATING_MODEL.md) |
| Handbook Maturity Score | High | Session Controller freeze review |
| Future EOS Changes | Implementation-driven only | Future changes require a real deficiency discovered during application work |

## Owner

Engineering owns this document.

## Update Cadence

Update after every milestone or scorecard-impacting review.

## Lifecycle

This is living documentation.

## Related Documents

- [Current State](./CURRENT_STATE.md)
- [Project Memory](./PROJECT_MEMORY.md)
- [Implementation Patterns](./IMPLEMENTATION_PATTERNS.md)
- [Common Failures and Engineering Lessons](./COMMON_FAILURES.md)
- [Security Status](./SECURITY_STATUS.md)
- [Technical Debt](./TECH_DEBT.md)
- [Known Limitations](./KNOWN_LIMITATIONS.md)
- [AI Engineering Operating Model](../governance/AI_ENGINEERING_OPERATING_MODEL.md)
- [ADR Index](../adrs/README.md)
- [Architecture](../architecture/README.md)
