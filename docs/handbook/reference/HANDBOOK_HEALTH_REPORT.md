---
title: Handbook Health Report
status: active
doc_type: reference
lifecycle: living
owner: engineering
update_cadence: after handbook structure changes or documentation audits
last_reviewed: null
related:
  - ./README.md
  - ./DOCUMENT_INDEX.md
  - ./DOCUMENTATION_DRIFT.md
  - ./PROJECT_SCORECARD.md
  - ../README.md
  - ../governance/AI_ENGINEERING_OPERATING_MODEL.md
  - ../governance/README.md
  - ../process/README.md
  - ../templates/README.md
  - ../adrs/README.md
  - ../architecture/README.md
---

# Handbook Health Report

## Purpose

This document scores the Engineering Handbook as a documentation system.

## Current Guidance

Scores use a 1-5 scale where 5 means strong and currently usable, 3 means usable with notable gaps, and 1 means not yet reliable.

| Area | Score | Evidence | Remaining Work |
|---|---:|---|---|
| Governance | 5 | Constitution, AI Engineering Operating Model, AI protocol, repository refresh protocol, and engineering system exist and are cross-linked. | Keep the operating model as the single workflow contract. |
| Process | 5 | Process docs now support the operating model instead of duplicating it. Definition of Done, quality gates, milestone/session lifecycle, review checklist, and review template exist. | Update only when real implementation milestones reveal a process gap. |
| Architecture | 4 | Architecture landing page and ADRs exist and point to current source documents without duplicating them. | Create living architecture pages only when active application work requires them. |
| Reference | 4 | Current state, milestones, scorecard, debt, security status, limitations, open decisions, changelog, invariants, drift, and index exist. | Add focused schema, permission, terminology, or migration references only when needed. |
| Templates | 5 | Template library covers ADRs, architecture, features, living docs, reviews, RCA, security, tests, validation, release, future work, and debt. | Avoid adding templates without repeated need. |
| ADRs | 4 | Ten initial ADRs capture implemented/documented decisions and are indexed with reading order. | Add ADRs only when new durable decisions are made; resolve terminology drift through ADR or reference updates. |
| Living Docs | 4 | Living reference layer exists and records current state and known gaps. | Keep updated after every milestone; add latest verification baseline. |
| Delivery Management | 4 | Delivery model, current increment, capability matrix, delivery backlog, delivery decisions, delivery status, and delivery readiness docs now exist as a separate product-delivery reporting layer. | Complete Receiving + Inventory Visibility Pilot evidence and update readiness from future repository evidence. |
| Navigation | 5 | Handbook README and reading paths route future AI sessions through the operating model before supporting docs. | Maintain only when entry points change. |
| Cross-linking | 5 | Handbook pages link to governance, operating model, process, templates, ADRs, reference, and existing source docs. | Repair stale links when found. |
| Consistency | 4 | Handbook workflow is consolidated around the operating model; known project-document drift remains recorded. | Resolve documented contradictions in `DOCUMENTATION_DRIFT.md` through focused milestones. |
| Completeness | 4 | Governance/process/template/ADR/reference infrastructure is complete enough for stable use. | Add living architecture or reference pages only when application work needs them. |
| Maintainability | 5 | Front matter, owners, cadence, related docs, lifecycle expectations, stewardship policy, and operating model exist. | Keep future handbook changes narrow. |

## Audit Results

- Handbook pages have front matter.
- Handbook pages include `related` front matter.
- ADRs are referenced from the ADR index.
- Templates are reachable from the template index.
- Relative handbook links resolve.
- Reading paths remain valid.

## Remaining Handbook Gaps

- Documentation drift is recorded but unresolved.
- Latest full verification result is not captured in living docs.
- Older docs remain in place by design and should be migrated only through focused milestones.
- Delivery Management is active, and Receiving + Inventory Visibility Pilot is the selected Current Delivery Increment. Pilot readiness remains blocked pending workflow evidence.

## Owner

Engineering owns this document.

## Update Cadence

Update after handbook structure changes or documentation audits.

## Lifecycle

This is living documentation.

## Related Documents

- [Document Index](./DOCUMENT_INDEX.md)
- [Documentation Drift](./DOCUMENTATION_DRIFT.md)
- [Project Scorecard](./PROJECT_SCORECARD.md)
- [AI Engineering Operating Model](../governance/AI_ENGINEERING_OPERATING_MODEL.md)
- [Engineering Handbook](../README.md)
- [Architecture](../architecture/README.md)
