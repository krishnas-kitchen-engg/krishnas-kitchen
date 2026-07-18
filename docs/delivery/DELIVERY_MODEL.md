---
title: Delivery Management Model
status: active
doc_type: delivery
lifecycle: living
owner: delivery
update_cadence: when Delivery Management responsibilities, lifecycle semantics, authority boundaries, or document relationships change
---

# Delivery Management Model

## Purpose

Delivery Management is the product-delivery reporting system for Krishna's Kitchen.

It answers delivery questions that are intentionally separate from engineering execution:

- What are we building?
- What delivery increment is being prepared?
- How close are we to delivering usable value?
- What product capabilities are planned, in progress, complete, pilot-ready, or production-ready?
- What remains before the current delivery increment is usable?
- When is the application ready for pilot?
- When is the application ready for production?

This document defines the Delivery Management model. It does not contain operational delivery status. Operational delivery content belongs in:

- [Capability Matrix](./CAPABILITY_MATRIX.md)
- [Delivery Status](./DELIVERY_STATUS.md)
- [Delivery Readiness](./DELIVERY_READINESS.md)

## Operating Principles

Delivery Management follows these principles:

- Repository evidence is the source of truth.
- Every responsibility has exactly one canonical owner.
- Product scope is consumed from [Product Horizons](../PRODUCT_HORIZONS.md), not redefined.
- Engineering execution evidence is consumed from the Engineering Operating System, not replaced.
- Delivery documents report product delivery state, not internal engineering workflow.
- Future horizons may be visible as roadmap context but must not expand current delivery scope.
- Readiness must be evidence-based.
- Planned future work must not be reported as residual risk unless it affects the current delivery increment.
- Documentation should be updated only when its owned information changes.

## Canonical Ownership

This document is the canonical owner of:

- Delivery Management vocabulary.
- Delivery Management document responsibilities.
- Delivery lifecycle semantics.
- Capability state definitions.
- Readiness state definitions.
- Authority boundaries between Delivery Management, Product Horizons, and the Engineering Operating System.
- Repository Reconstruction expectations for Delivery Management evidence.
- Update rules for this model.

This document is not the canonical owner of:

- Product vision, roadmap, active horizon, product scope, or horizon exit criteria.
- Engineering workflow, Session Controller behavior, verification rules, approval gates, or commit behavior.
- The Current Delivery Increment.
- Capability-by-capability delivery status.
- Delivery progress summary.
- Increment, pilot, or production readiness assessment.
- Operational blockers, residual risks, future approved work, or evidence summaries.

## Authority Boundaries

Krishna's Kitchen has three separate documentation authorities.

### Product Horizons Authority

[Product Horizons](../PRODUCT_HORIZONS.md) is authoritative for:

- Product vision.
- Product roadmap.
- Product horizons.
- Current active horizon.
- Product scope.
- Explicit exclusions.
- Horizon exit criteria.

Delivery Management must consume this scope. It must not redefine it.

### Engineering Operating System Authority

The Engineering Operating System is authoritative for:

- Repository Reconstruction.
- Session Controller execution.
- Milestone selection workflow.
- Implementation discipline.
- Security-first implementation rules.
- Verification requirements.
- Human approval gates.
- Commit process.
- Engineering living-document updates.

Delivery Management consumes engineering evidence produced through this system. It must not create parallel engineering workflow.

### Delivery Management Authority

Delivery Management is authoritative for:

- Capability delivery status.
- Current Delivery Increment.
- Delivery progress toward usable product value.
- Increment readiness.
- Pilot readiness.
- Production readiness.
- Delivery blockers.
- Residual delivery risks.
- Future approved delivery work.
- Delivery evidence summaries.

Delivery Management may summarize engineering evidence, but the underlying engineering state remains owned by the Engineering Operating System.

## Precedence Rules

When documents disagree, use this precedence:

1. Product scope: [Product Horizons](../PRODUCT_HORIZONS.md).
2. Engineering execution and repository workflow: Engineering Operating System.
3. Capability delivery status: [Capability Matrix](./CAPABILITY_MATRIX.md).
4. Current delivery target and progress summary: [Delivery Status](./DELIVERY_STATUS.md).
5. Increment, pilot, and production readiness: [Delivery Readiness](./DELIVERY_READINESS.md).

If a conflict cannot be resolved through these precedence rules, record the conflict during Repository Reconstruction and request human clarification before using the conflicting information for implementation or delivery decisions.

## Inputs

Delivery Management uses these inputs:

- [Product Horizons](../PRODUCT_HORIZONS.md) for product vision, active horizon, product scope, exclusions, and horizon exit criteria.
- Engineering Operating System governance documents for engineering workflow authority.
- [Current State](../handbook/reference/CURRENT_STATE.md) for current implementation reality.
- [Current Milestone](../handbook/reference/CURRENT_MILESTONE.md) for the active or most recent engineering milestone.
- [Changelog Summary](../handbook/reference/CHANGELOG_SUMMARY.md) for committed implementation history.
- [Evidence Report](../handbook/reference/EVIDENCE_REPORT.md) for verification and evidence summaries.
- [Security Status](../handbook/reference/SECURITY_STATUS.md) when security posture affects readiness.
- [Known Limitations](../handbook/reference/KNOWN_LIMITATIONS.md) when limitations affect delivery readiness.
- Repository files, tests, migrations, and commits when living documents require validation.

## Outputs

This model produces:

- Delivery vocabulary.
- Delivery document ownership rules.
- Delivery lifecycle semantics.
- Capability state definitions.
- Readiness state definitions.
- Authority boundary rules.
- Repository Reconstruction expectations for delivery evidence.
- Update triggers for this model.

Other Delivery Management outputs are owned elsewhere:

- Capability inventory and capability-level status: [Capability Matrix](./CAPABILITY_MATRIX.md).
- Current delivery target and progress summary: [Delivery Status](./DELIVERY_STATUS.md).
- Readiness, blockers, residual risks, future approved work, and evidence summary: [Delivery Readiness](./DELIVERY_READINESS.md).

## Consumers

This model is consumed by:

- Repository Reconstruction.
- Product and delivery reviewers.
- Engineering milestone recommendation.
- Human pilot-readiness reviewers.
- Human production-readiness reviewers.
- Future maintainers updating delivery documentation.

## Update Triggers

Update this document when:

- Delivery Management document responsibilities change.
- Delivery lifecycle semantics change.
- Capability state definitions change.
- Readiness state definitions change.
- Authority boundaries change.
- Cross-document relationships change.
- Repository Reconstruction expectations for delivery evidence change.

Do not update this document when:

- A milestone completes.
- Capability delivery status changes.
- The Current Delivery Increment changes.
- Delivery progress changes.
- Increment, pilot, or production readiness changes.
- Blockers, residual risks, future approved work, or evidence summaries change.
- Wording changes are merely stylistic and do not improve clarity or correctness.

## Delivery Document Set

Delivery Management consists of exactly these documents:

- [Delivery Management Model](./DELIVERY_MODEL.md)
- [Capability Matrix](./CAPABILITY_MATRIX.md)
- [Delivery Status](./DELIVERY_STATUS.md)
- [Delivery Readiness](./DELIVERY_READINESS.md)

Do not add another Delivery Management document unless one of these documents would otherwise gain unrelated responsibilities that cannot be cleanly separated.

## Delivery Lifecycle

Delivery Management uses this lifecycle:

1. Product scope is defined in [Product Horizons](../PRODUCT_HORIZONS.md).
2. Product capabilities are tracked in [Capability Matrix](./CAPABILITY_MATRIX.md).
3. The current delivery target and product-facing progress are summarized in [Delivery Status](./DELIVERY_STATUS.md).
4. Increment, pilot, and production readiness are assessed in [Delivery Readiness](./DELIVERY_READINESS.md).
5. Engineering implementation and verification evidence is consumed from the Engineering Operating System.
6. Delivery documents are updated only when their canonical responsibilities change.

This lifecycle is informational. It is not an engineering execution state machine.

## Capability Model

A capability is a product-facing unit of value that can be planned, delivered, assessed, and explained to a delivery reviewer.

Capabilities must come from [Product Horizons](../PRODUCT_HORIZONS.md) or from active-horizon implementation evidence that clearly supports that scope.

Capabilities should be phrased from the product perspective. They should not be internal implementation tasks, refactors, files, test cases, or architectural techniques unless the active horizon identifies them as product-enabling capabilities.

## Capability States

[Capability Matrix](./CAPABILITY_MATRIX.md) uses these states.

### Planned

The capability belongs to the product scope but has no completed delivery implementation recorded in repository evidence.

Use this state when:

- Product Horizons supports the capability.
- No committed implementation evidence shows user-facing delivery progress.

Do not use this state for:

- Work outside Product Horizons.
- Speculative ideas.
- Future-horizon work that is not part of the active delivery scope.

### In Progress

The capability has partial committed implementation or approved active engineering work, but it is not complete for its current product scope.

Use this state when:

- Repository evidence shows partial implementation.
- Current or recent milestones directly advance the capability.
- Remaining capability work is still needed before it can be considered complete.

Do not use this state merely because the capability is planned.

### Complete

The capability is implemented for its current product scope and supported by repository evidence.

Use this state when:

- Implementation exists.
- Verification evidence supports the capability.
- Known gaps do not prevent the capability from satisfying its current delivery definition.

Do not use this state when:

- Verification is missing.
- The capability works only through undocumented assumptions.
- Required user-facing behavior remains absent.

### Included In Current Delivery

The capability is part of the Current Delivery Increment owned by [Delivery Status](./DELIVERY_STATUS.md).

Use this marker when:

- Delivery Status includes the capability in the Current Delivery Increment.

Do not use this marker to create scope. Scope still comes from [Product Horizons](../PRODUCT_HORIZONS.md), and the current delivery target still comes from [Delivery Status](./DELIVERY_STATUS.md).

### Pilot Ready

The capability satisfies pilot readiness expectations in [Delivery Readiness](./DELIVERY_READINESS.md).

Use this marker when:

- The capability is suitable for controlled pilot use.
- Known limitations, security posture, and evidence are acceptable for pilot conditions.

Do not use this marker when readiness has not been assessed.

### Production Ready

The capability satisfies production readiness expectations in [Delivery Readiness](./DELIVERY_READINESS.md).

Use this marker when:

- The capability is suitable for real production operation.
- Verification, security, reliability, operational concerns, and evidence support production use.

Do not use this marker when readiness is only assumed from implementation completion.

## Readiness Model

Readiness is the evidence-based determination that a delivery target is usable under a specific operating condition.

[Delivery Readiness](./DELIVERY_READINESS.md) owns:

- Increment Readiness.
- Pilot Readiness.
- Production Readiness.
- Remaining Blockers.
- Residual Risks.
- Future Approved Work.
- Evidence Summary.

Readiness must not be inferred from completion alone. A capability or increment may be complete but not pilot-ready or production-ready.

## Readiness States

[Delivery Readiness](./DELIVERY_READINESS.md) uses these readiness states.

### Not Assessed

No readiness assessment has been completed.

Use this state when:

- Evidence has not been reviewed.
- Criteria have not been evaluated.
- The readiness document intentionally has no operational conclusion yet.

### Blocked

Known blockers prevent readiness.

Use this state when:

- A required capability is absent.
- A security, reliability, correctness, data, or operational issue prevents safe use.
- Human clarification is required before readiness can be determined.

### At Risk

Readiness may be achievable, but unresolved issues or evidence gaps remain.

Use this state when:

- Known risks do not fully block readiness but require attention.
- Evidence is incomplete.
- Operational confidence is limited.

### Ready

The delivery target satisfies the relevant readiness expectations.

Use this state only when:

- Evidence supports the conclusion.
- Known blockers are absent.
- Residual risks are documented and acceptable for the readiness level.

## Delivery Progress Model

Delivery progress is a product-facing assessment of movement toward usable value.

Delivery progress is not the same as:

- Engineering task completion.
- Number of commits.
- Number of tests.
- Lines of code changed.
- Milestone count.

[Delivery Status](./DELIVERY_STATUS.md) owns the delivery progress summary. It should use capability status, readiness, and repository evidence to explain how close the current delivery increment is to usable value.

When exact completion cannot be supported by evidence, Delivery Status should avoid unsupported percentages and use evidence-backed qualitative progress instead.

## Current Delivery Increment Model

The Current Delivery Increment is the delivery target currently being prepared for usable value.

[Delivery Status](./DELIVERY_STATUS.md) is the canonical owner of:

- Current Delivery Increment.
- Delivery Goal.
- Included Capabilities.
- Excluded Capabilities.
- Overall Delivery Completion.
- Remaining product-facing delivery gaps.

Repository Reconstruction should be able to determine the current delivery target from [Delivery Status](./DELIVERY_STATUS.md) alone.

## Blockers, Residual Risks, And Future Approved Work

[Delivery Readiness](./DELIVERY_READINESS.md) owns delivery blockers, residual risks, and future approved work.

Remaining blockers are issues that prevent increment, pilot, or production readiness.

Residual risks are issues that may affect correctness, security, reliability, maintainability, scalability, or operation of the current delivery increment.

Future approved work is planned capability intentionally outside the current delivery increment or readiness assessment.

Do not report future approved work as residual risk unless it directly affects the completed or current delivery increment.

## Repository Reconstruction Expectations

Repository Reconstruction should determine without ambiguity:

- Current product scope from [Product Horizons](../PRODUCT_HORIZONS.md).
- Current Delivery Increment from [Delivery Status](./DELIVERY_STATUS.md).
- Delivery progress from [Delivery Status](./DELIVERY_STATUS.md) and [Capability Matrix](./CAPABILITY_MATRIX.md).
- Delivery readiness from [Delivery Readiness](./DELIVERY_READINESS.md).

Repository Reconstruction should treat missing operational content as unknown, not as complete, blocked, or ready.

Repository Reconstruction should document drift when:

- Product Horizons and Delivery Management disagree about product scope.
- Capability Matrix and Delivery Status disagree about included capabilities.
- Delivery Status and Delivery Readiness disagree about the current delivery increment.
- Delivery Readiness claims readiness without supporting evidence.
- Delivery documents report product progress that repository evidence does not support.

## Cross References

- [Product Horizons](../PRODUCT_HORIZONS.md).
- [Current State](../handbook/reference/CURRENT_STATE.md).
- [Current Milestone](../handbook/reference/CURRENT_MILESTONE.md).
- [Changelog Summary](../handbook/reference/CHANGELOG_SUMMARY.md).
- [Evidence Report](../handbook/reference/EVIDENCE_REPORT.md).
- [Security Status](../handbook/reference/SECURITY_STATUS.md).
- [Known Limitations](../handbook/reference/KNOWN_LIMITATIONS.md).
- [Capability Matrix](./CAPABILITY_MATRIX.md).
- [Delivery Status](./DELIVERY_STATUS.md).
- [Delivery Readiness](./DELIVERY_READINESS.md).

## Relationship To The Engineering Operating System

Delivery Management consumes engineering evidence after work is reconstructed, implemented, verified, reviewed, and committed through the Engineering Operating System.

Delivery Management does not define:

- Session Controller states.
- Engineering implementation scope.
- Milestone approval rules.
- Verification commands.
- Self-review requirements.
- Commit readiness.
- Engineering living-document update rules.

Engineering milestones may update Delivery Management documents only when the approved scope includes documentation updates or the milestone changes delivery information owned by those documents.

## Relationship To Product Horizons

[Product Horizons](../PRODUCT_HORIZONS.md) defines product vision, product roadmap, active horizon, product scope, explicit exclusions, and horizon exit criteria.

Delivery Management tracks delivery progress against Product Horizons. It must not:

- Redefine product scope.
- Promote horizons.
- Add implementation scope outside the active horizon.
- Treat future-horizon work as current delivery work.

Future horizons may inform architecture through the Engineering Operating System, but they do not expand Delivery Management operational scope for the current delivery increment.

## Relationship To Other Delivery Management Documents

[Capability Matrix](./CAPABILITY_MATRIX.md) owns:

- Capability inventory for Delivery Management.
- Capability delivery state.
- Capability inclusion in the Current Delivery Increment.
- Capability pilot readiness.
- Capability production readiness.

[Delivery Status](./DELIVERY_STATUS.md) owns:

- Current Delivery Increment.
- Delivery Goal.
- Included Capabilities.
- Excluded Capabilities.
- Overall Delivery Completion.
- Product-facing delivery progress summary.
- Remaining product-facing delivery gaps.

[Delivery Readiness](./DELIVERY_READINESS.md) owns:

- Increment Readiness.
- Pilot Readiness.
- Production Readiness.
- Remaining Blockers.
- Residual Risks.
- Future Approved Work.
- Evidence Summary.

These documents may reference each other, but ownership remains singular.

## Maintenance Rules

Maintain this document as a model, not a status report.

When updating this document:

- Preserve the four-document Delivery Management architecture.
- Keep Product Horizons as the only product scope authority.
- Keep the Engineering Operating System as the only engineering execution authority.
- Keep operational delivery content out of this document.
- Prefer clarification over new concepts.
- Remove duplication when it appears.

Do not update this document to record ordinary milestone progress, readiness changes, or capability status changes.

