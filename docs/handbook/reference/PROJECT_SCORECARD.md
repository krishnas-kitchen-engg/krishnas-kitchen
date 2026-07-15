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
---

# Project Scorecard

## Purpose

This document tracks measurable health indicators for Krishna's Kitchen.

## Current Guidance

Track only health indicators that help choose, review, or de-risk engineering work. Prefer qualitative status when objective measurements are unavailable.

| Area | Health | Evidence | Next Improvement |
|---|---|---|---|
| Architecture Health | Good with known gaps | ADRs and architecture references establish inventory ledger, auth/RLS boundary, PWA direction, repositories, RPC boundaries, and package organization | Create focused living architecture pages only when implementation work needs them |
| Security Health | Watch | RLS, helper functions, authenticated read policies, volunteer RPCs, and security ADRs exist; temporary volunteer permissions still have documented drift | Resolve temporary volunteer permission drift before expanding volunteer capability |
| Testing Health | Watch | Vitest coverage exists across domain, repository, migration, auth, UI, and utilities; latest full-suite result is recorded in [Current State](./CURRENT_STATE.md) for the diagnostic cleanup milestone | Keep recording full verification during implementation milestones |
| Documentation Health | Good | Handbook contains canonical operating model, governance, process, templates, ADRs, living references, document index, drift register, and memory pages | Freeze EOS changes unless implementation reveals a real gap |
| Technical Debt Trend | Watch | [Technical Debt](./TECH_DEBT.md), [Documentation Drift](./DOCUMENTATION_DRIFT.md), and [Common Failures and Engineering Lessons](./COMMON_FAILURES.md) identify known issues | Address debt through approved micro-milestones instead of broad cleanup |
| Roadmap Progress | Conditional | [Next Milestone](./NEXT_MILESTONE.md) ranks three current candidates and recommends resolving temporary volunteer permission drift through human product/security decision | Human approval is required before implementation |
| Build Stability | Watch | Latest recorded verification in [Current State](./CURRENT_STATE.md) passed typecheck, lint, tests, and build with the existing Vite chunk-size warning | Continue running full verification before commit readiness |

## EOS Freeze Status

| Indicator | Status | Evidence |
|---|---|---|
| EOS Version | v1.2 | [Engineering Handbook](../README.md) |
| EOS Status | Stable | [AI Engineering Operating Model](../governance/AI_ENGINEERING_OPERATING_MODEL.md) |
| Handbook Maturity Score | 92/100 | Final EOS v1.2 freeze review |
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
