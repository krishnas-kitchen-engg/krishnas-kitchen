---
title: Capability Matrix
status: active
doc_type: delivery
lifecycle: living
owner: delivery
update_cadence: when product capabilities or their delivery, current-delivery, pilot-ready, or production-ready status changes
---

# Capability Matrix

## Purpose

Provide the authoritative Delivery Management inventory of product capabilities and their delivery status.

This document answers:

- Which product capabilities are being tracked for delivery?
- Which capabilities are planned, in progress, or complete?
- Which capabilities are included in the Current Delivery Increment?
- Which capabilities are pilot-ready?
- Which capabilities are production-ready?

This document tracks product-facing capability delivery status. It does not replace engineering implementation state, milestone records, changelog history, readiness narrative, or product roadmap scope.

## Canonical Ownership

This document is the canonical owner of:

- Delivery capability inventory.
- Capability delivery state.
- Capability inclusion in the Current Delivery Increment.
- Capability pilot-readiness status.
- Capability production-readiness status.
- Capability evidence references for Delivery Management.

This document is not the canonical owner of:

- Product vision, roadmap, active horizon, product scope, explicit exclusions, or horizon exit criteria.
- Current Delivery Increment summary.
- Delivery Goal.
- Overall delivery progress narrative.
- Remaining product-facing delivery gaps.
- Increment, pilot, or production readiness narrative.
- Remaining blockers, residual risks, or future approved work.
- Engineering implementation status, verification commands, or milestone state.

## Authority Boundaries

[Product Horizons](../PRODUCT_HORIZONS.md) owns product scope. This document consumes that scope and tracks delivery status for capabilities within it.

[Delivery Status](./DELIVERY_STATUS.md) owns the Current Delivery Increment and delivery progress summary. This document records whether each capability is included in that increment.

[Delivery Readiness](./DELIVERY_READINESS.md) owns readiness narrative, blockers, residual risks, future approved work, and evidence summary. This document records readiness status by capability.

The Engineering Operating System owns engineering execution and evidence. This document consumes committed engineering evidence and does not define engineering workflow.

## Inputs

- [Product Horizons](../PRODUCT_HORIZONS.md) for active-horizon product scope and exclusions.
- [Delivery Model](./DELIVERY_MODEL.md) for capability state definitions and ownership rules.
- [Delivery Status](./DELIVERY_STATUS.md) for the Current Delivery Increment.
- [Delivery Readiness](./DELIVERY_READINESS.md) for readiness conclusions.
- [Current State](../handbook/reference/CURRENT_STATE.md) for current implementation reality.
- [Current Milestone](../handbook/reference/CURRENT_MILESTONE.md) for active or latest milestone context.
- [Changelog Summary](../handbook/reference/CHANGELOG_SUMMARY.md) for committed capability history.
- [Evidence Report](../handbook/reference/EVIDENCE_REPORT.md) for verification evidence.

## Outputs

- Authoritative delivery capability inventory.
- Capability delivery status.
- Capability current-delivery inclusion.
- Capability pilot-readiness status.
- Capability production-readiness status.
- Capability evidence references.

## Consumers

- [Delivery Status](./DELIVERY_STATUS.md).
- [Delivery Readiness](./DELIVERY_READINESS.md).
- Repository Reconstruction.
- Product and delivery reviewers.
- Engineering milestone recommendation.
- Pilot and production readiness reviewers.

## Update Triggers

Update this document when:

- A product capability is added, removed, renamed, or split in [Product Horizons](../PRODUCT_HORIZONS.md).
- A committed milestone changes capability delivery status.
- A capability enters or leaves the Current Delivery Increment.
- A capability becomes pilot-ready or production-ready.
- A readiness assessment changes a capability readiness state.
- Repository evidence proves a capability status is inaccurate.

Do not update this document when:

- Engineering internals change without product capability impact.
- Verification reruns produce no capability status change.
- Delivery narrative changes but capability states do not.
- Future-horizon ideas are discussed without active-horizon scope change.
- [Delivery Status](./DELIVERY_STATUS.md) changes wording without changing included capabilities.
- [Delivery Readiness](./DELIVERY_READINESS.md) changes wording without changing capability readiness states.

## Status Values

Use only the status values defined in [Delivery Model](./DELIVERY_MODEL.md).

Delivery State:

- Planned
- In Progress
- Complete

Current Delivery:

- Yes
- No
- Not Set

Pilot Ready:

- Not Assessed
- Blocked
- At Risk
- Ready

Production Ready:

- Not Assessed
- Blocked
- At Risk
- Ready

Use `Not Set` for Current Delivery until [Delivery Status](./DELIVERY_STATUS.md) defines the Current Delivery Increment.

Capability readiness columns describe individual capability readiness only. [Delivery Readiness](./DELIVERY_READINESS.md) contains the authoritative overall increment, pilot, and production readiness assessment.

Use `Not Assessed` for capability readiness until [Delivery Readiness](./DELIVERY_READINESS.md) records an evidence-backed capability readiness assessment.

`Complete` means implementation-complete according to current engineering evidence. It does not imply pilot readiness, production readiness, or overall delivery readiness; those are determined separately by [Delivery Readiness](./DELIVERY_READINESS.md).

## Capability Matrix

Current scope source: [Product Horizons](../PRODUCT_HORIZONS.md), Horizon 1, Core Kitchen Inventory Platform.

Current Delivery Increment source: [Delivery Status](./DELIVERY_STATUS.md). The framework exists, but the Current Delivery Increment has not yet been populated.

Readiness source: [Delivery Readiness](./DELIVERY_READINESS.md). Capability-level readiness has not yet been assessed; overall delivery readiness is assessed in Delivery Readiness.

| Capability | Horizon | Delivery State | Current Delivery | Pilot Ready | Production Ready | Evidence | Notes |
|---|---|---|---|---|---|---|---|
| Authentication | Horizon 1 | In Progress | Not Set | Not Assessed | Not Assessed | [Current State](../handbook/reference/CURRENT_STATE.md) | Auth providers, auth screens, route guard, and Supabase session boundaries exist. Production approval is not documented. |
| Role-based permissions | Horizon 1 | In Progress | Not Set | Not Assessed | Not Assessed | [Current State](../handbook/reference/CURRENT_STATE.md); [Changelog Summary](../handbook/reference/CHANGELOG_SUMMARY.md) | Permission boundaries exist and temporary volunteer browser permissions were reconciled. Full delivery readiness is not assessed. |
| Temporary volunteers | Horizon 1 | In Progress | Not Set | Not Assessed | Not Assessed | [Current State](../handbook/reference/CURRENT_STATE.md) | Temporary volunteer session storage, repository/RPC integration, and restricted browser permissions exist. Volunteer workflow exit criteria are not documented as complete. |
| Inventory | Horizon 1 | Complete | Not Set | Not Assessed | Not Assessed | [Current State](../handbook/reference/CURRENT_STATE.md) | Inventory domain and repository work are present across source and tests. Production readiness is not assessed. |
| Receiving | Horizon 1 | Complete | Not Set | Not Assessed | Not Assessed | [Current State](../handbook/reference/CURRENT_STATE.md); [Changelog Summary](../handbook/reference/CHANGELOG_SUMMARY.md) | Receiving workflow implementation and tests are present. |
| Transfers | Horizon 1 | Complete | Not Set | Not Assessed | Not Assessed | [Current State](../handbook/reference/CURRENT_STATE.md); [Changelog Summary](../handbook/reference/CHANGELOG_SUMMARY.md) | Transfer workflow implementation and tests are present. |
| Returns | Horizon 1 | Complete | Not Set | Not Assessed | Not Assessed | [Current State](../handbook/reference/CURRENT_STATE.md); [Changelog Summary](../handbook/reference/CHANGELOG_SUMMARY.md) | Return workflow implementation and canonical return semantics are documented. |
| Reversal | Horizon 1 | Complete | Not Set | Not Assessed | Not Assessed | [Current State](../handbook/reference/CURRENT_STATE.md); [Changelog Summary](../handbook/reference/CHANGELOG_SUMMARY.md) | Reversal semantics and implementation evidence are present. |
| Inventory history | Horizon 1 | Complete | Not Set | Not Assessed | Not Assessed | [Current State](../handbook/reference/CURRENT_STATE.md) | Inventory balances are derived from immutable transaction history. |
| Inventory visibility | Horizon 1 | Complete | Not Set | Not Assessed | Not Assessed | [Current State](../handbook/reference/CURRENT_STATE.md) | Visibility projections and related inventory work are present. |
| Barcode lookup | Horizon 1 | Complete | Not Set | Not Assessed | Not Assessed | [Current State](../handbook/reference/CURRENT_STATE.md) | Barcode lookup work is present in source and tests. |
| Barcode catalog | Horizon 1 | Complete | Not Set | Not Assessed | Not Assessed | [Current State](../handbook/reference/CURRENT_STATE.md) | Barcode catalog schema reconciliation and temporary volunteer barcode catalog RPC are present. |
| Unknown barcode workflow | Horizon 1 | Complete | Not Set | Not Assessed | Not Assessed | [Current State](../handbook/reference/CURRENT_STATE.md) | Unknown barcode handling is present in source, tests, and migrations. |
| Multiple locations | Horizon 1 | Complete | Not Set | Not Assessed | Not Assessed | [Current State](../handbook/reference/CURRENT_STATE.md) | Location-aware inventory flows are present. |
| Low stock | Horizon 1 | Complete | Not Set | Not Assessed | Not Assessed | [Current State](../handbook/reference/CURRENT_STATE.md) | Low-stock threshold migration and inventory low-stock work are present. |
| Recipe definitions | Horizon 1 | In Progress | Not Set | Not Assessed | Not Assessed | [Current State](../handbook/reference/CURRENT_STATE.md); [Evidence Report](../handbook/reference/EVIDENCE_REPORT.md) | Pure recipe definition domain foundation exists. UI and persistence remain future work. |
| Recipe scaling | Horizon 1 | In Progress | Not Set | Not Assessed | Not Assessed | [Current State](../handbook/reference/CURRENT_STATE.md); [Changelog Summary](../handbook/reference/CHANGELOG_SUMMARY.md) | Pure scaling logic exists. UI and persistence remain future work. |
| Ingredient availability | Horizon 1 | In Progress | Not Set | Not Assessed | Not Assessed | [Current State](../handbook/reference/CURRENT_STATE.md); [Changelog Summary](../handbook/reference/CHANGELOG_SUMMARY.md) | Pure exact item/unit availability logic exists. UI, persistence, and unit conversion remain future work. |
| Shopping list generation | Horizon 1 | In Progress | Not Set | Not Assessed | Not Assessed | [Current State](../handbook/reference/CURRENT_STATE.md); [Evidence Report](../handbook/reference/EVIDENCE_REPORT.md) | Pure shortage-output logic exists. UI, persistence, vendor, approval, and procurement behavior remain future work. |
| Mobile-first PWA | Horizon 1 | In Progress | Not Set | Not Assessed | Not Assessed | [Current State](../handbook/reference/CURRENT_STATE.md) | React/Vite PWA foundation and mobile inventory workflow screens exist. Delivery readiness is not assessed. |
| Offline-ready architecture | Horizon 1 | In Progress | Not Set | Not Assessed | Not Assessed | [Current State](../handbook/reference/CURRENT_STATE.md) | Offline architecture is documented. Queue storage, replay, and runtime sync are not implemented. |
| Audit trail | Horizon 1 | In Progress | Not Set | Not Assessed | Not Assessed | [Current State](../handbook/reference/CURRENT_STATE.md) | Audit logs, immutable transaction architecture, and reversibility rules exist. Production readiness is not assessed. |
| Security | Horizon 1 | In Progress | Not Set | Not Assessed | Not Assessed | [Current State](../handbook/reference/CURRENT_STATE.md) | Security architecture and baseline exist. Production security approval is not granted. |
| RLS | Horizon 1 | In Progress | Not Set | Not Assessed | Not Assessed | [Current State](../handbook/reference/CURRENT_STATE.md) | RLS is enabled on foundational tables and inventory-facing policies exist. Full readiness is not assessed. |
| RPC boundaries | Horizon 1 | In Progress | Not Set | Not Assessed | Not Assessed | [Current State](../handbook/reference/CURRENT_STATE.md) | Controlled volunteer RPCs and browser trust boundaries exist. Full readiness is not assessed. |
| Repository architecture | Horizon 1 | In Progress | Not Set | Not Assessed | Not Assessed | [Current State](../handbook/reference/CURRENT_STATE.md); [Evidence Report](../handbook/reference/EVIDENCE_REPORT.md) | Inventory repositories and recipe repository contract foundation exist. Future adapters remain. |
| Testing | Horizon 1 | In Progress | Not Set | Not Assessed | Not Assessed | [Current State](../handbook/reference/CURRENT_STATE.md); [Evidence Report](../handbook/reference/EVIDENCE_REPORT.md) | Vitest coverage exists across domains, UI reducers/screens, migrations, auth, and utilities. Production quality gate readiness is not assessed. |
| Evidence generation | Horizon 1 | In Progress | Not Set | Not Assessed | Not Assessed | [Evidence Report](../handbook/reference/EVIDENCE_REPORT.md) | Evidence reports are maintained after repository reconstruction, implementation, verification, and commit-readiness milestones. |
| Engineering documentation | Horizon 1 | In Progress | Not Set | Not Assessed | Not Assessed | [Current State](../handbook/reference/CURRENT_STATE.md); [Changelog Summary](../handbook/reference/CHANGELOG_SUMMARY.md) | Engineering Handbook and living reference layer exist. Some older docs still contain duplication and encoding artifacts. |

## Higher-Horizon Capabilities

Higher-horizon capabilities are visible in [Product Horizons](../PRODUCT_HORIZONS.md) for architectural context. They are not active delivery capabilities until the active horizon changes with explicit human approval.

Do not add Horizon 2, Horizon 3, or Horizon 4 capabilities to the active Capability Matrix unless [Product Horizons](../PRODUCT_HORIZONS.md) promotes or includes them in the active horizon.

## Repository Reconstruction Expectations

Repository Reconstruction should use this document to determine:

- Which product capabilities are tracked for Delivery Management.
- Which capabilities are included in the Current Delivery Increment.
- Which capabilities are planned, in progress, or complete.
- Which capabilities are pilot-ready or production-ready.
- Which evidence supports capability status.

Repository Reconstruction should treat `Not Set` and `Not Assessed` as unknown delivery information, not as completion, readiness, or failure.

If this document conflicts with [Product Horizons](../PRODUCT_HORIZONS.md), Product Horizons remains authoritative for product scope.

If this document conflicts with [Delivery Status](./DELIVERY_STATUS.md), Delivery Status remains authoritative for the Current Delivery Increment and delivery progress summary.

If this document conflicts with [Delivery Readiness](./DELIVERY_READINESS.md), Delivery Readiness remains authoritative for readiness narrative, blockers, residual risks, future approved work, and evidence summary.

## Cross References

- [Product Horizons](../PRODUCT_HORIZONS.md).
- [Delivery Model](./DELIVERY_MODEL.md).
- [Delivery Status](./DELIVERY_STATUS.md).
- [Delivery Readiness](./DELIVERY_READINESS.md).
- [Current State](../handbook/reference/CURRENT_STATE.md).
- [Current Milestone](../handbook/reference/CURRENT_MILESTONE.md).
- [Changelog Summary](../handbook/reference/CHANGELOG_SUMMARY.md).
- [Evidence Report](../handbook/reference/EVIDENCE_REPORT.md).

## Relationship To The Engineering Operating System

This document consumes committed engineering outcomes and verification evidence.

It does not define:

- Engineering milestones.
- Implementation scope.
- Verification requirements.
- Approval gates.
- Session Controller behavior.
- Commit behavior.
- Engineering living-document update rules.

## Relationship To Product Horizons

[Product Horizons](../PRODUCT_HORIZONS.md) defines product capabilities and active horizon scope. This document tracks delivery status for those capabilities.

Do not add capabilities here that are not supported by Product Horizons.

Do not use this document to promote horizons, expand scope, or justify out-of-horizon implementation.

## Relationship To Other Delivery Management Documents

- [Delivery Model](./DELIVERY_MODEL.md) defines capability vocabulary, readiness vocabulary, and ownership rules.
- [Delivery Status](./DELIVERY_STATUS.md) owns the Current Delivery Increment and summarizes delivery progress from this matrix.
- [Delivery Readiness](./DELIVERY_READINESS.md) owns readiness narrative, blockers, residual risks, future approved work, and evidence summary.

This document may reference those documents, but it must not take over their responsibilities.

## Maintenance Rules

Maintain this document as a capability inventory, not a roadmap, engineering changelog, or readiness report.

When updating this document:

- Use [Product Horizons](../PRODUCT_HORIZONS.md) as the scope source.
- Use repository evidence for delivery state.
- Use [Delivery Status](./DELIVERY_STATUS.md) for Current Delivery Increment inclusion.
- Use [Delivery Readiness](./DELIVERY_READINESS.md) for readiness state.
- Keep notes concise and evidence-backed.
- Avoid estimating completion without evidence.

Do not update this document for implementation details that do not change product-facing capability status.
