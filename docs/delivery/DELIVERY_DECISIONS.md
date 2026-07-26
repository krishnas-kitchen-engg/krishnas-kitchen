---
title: Delivery Decisions
status: active
doc_type: delivery
lifecycle: living
owner: delivery
update_cadence: when delivery increment selection, sequencing, pilot scope, or readiness interpretation changes
---

# Delivery Decisions

## Purpose

Record important delivery decisions and their rationale.

This document explains why Krishna's Kitchen is delivering work in the selected order. It does not redefine product scope, engineering architecture, or implementation details.

## Decision Log

### DD-001: Select Receiving + Inventory Visibility Pilot As The First Delivery Increment

Status: Accepted.

Decision: The first formal Current Delivery Increment is Receiving + Inventory Visibility Pilot.

Rationale:

- It is the closest workflow to complete pilot value.
- It directly supports the Horizon 1 inventory platform.
- It gives a temple kitchen manager a concrete operational outcome: received goods become trusted inventory.
- It reuses existing implementation evidence across receiving, transactions, visibility, barcode handling, locations, reversal, auth, and tests.
- It avoids expanding feature breadth before one customer workflow is usable end to end.

Alternatives considered:

- Recipe route empty state: rejected because it would add feature breadth without completing a pilot workflow.
- Recipe availability workflow: deferred because recipe UI, persistence, authorization, and integration remain incomplete.
- Transfers or returns first: deferred because receiving is the natural entry point for inventory trust.

Consequences:

- Delivery work should focus on receiving through inventory visibility until the increment is pilot-ready or explicitly paused.
- Future Horizon 1 capabilities remain valid but should not displace the current increment.
- Pilot readiness must be assessed at the workflow level, not inferred from individual completed capabilities.

### DD-002: Treat Pilot Readiness As Workflow Readiness

Status: Accepted.

Decision: A capability being implemented is not enough to call the product pilot-ready. Pilot readiness requires evidence that the selected customer workflow can be used safely with known limitations.

Rationale:

- Repository evidence shows many inventory capabilities are implemented, but Delivery Management had not yet selected or assessed a complete pilot workflow.
- A temple pilot needs a trusted operational path, not a list of completed features.

Consequences:

- [Delivery Readiness](./DELIVERY_READINESS.md) remains blocked until receiving-through-visibility evidence exists.
- Capability Matrix readiness markers should not be upgraded without workflow evidence.

### DD-003: Keep Offline Queue And Replay Outside The First Pilot Increment

Status: Accepted.

Decision: Offline queue storage, replay, and runtime sync are excluded from the Receiving + Inventory Visibility Pilot unless a human delivery decision makes offline operation mandatory for the pilot.

Rationale:

- Offline-ready architecture is documented, but runtime queue and replay behavior are not implemented.
- The first pilot can still produce value in a controlled connected environment if that constraint is explicit.
- Including offline runtime behavior would materially expand the increment.

Consequences:

- Offline remains a production-readiness blocker.
- Pilot instructions must clearly state whether the pilot assumes a connected environment.

### DD-004: Delivery Documents Own Delivery State

Status: Accepted.

Decision: Delivery Management documents are the authoritative source for current delivery increment, delivery backlog, delivery status, readiness, and delivery decisions.

Rationale:

- Older execution or milestone documents may describe historical next steps that have since been completed or deferred.
- Delivery state must remain understandable without reading the full engineering history.

Consequences:

- Repository Reconstruction should prefer `docs/delivery/` for delivery status.
- Historical engineering docs should be treated as evidence, not current delivery authority.

## Maintenance Rules

Add a decision when delivery scope, sequencing, pilot readiness interpretation, or blocker handling changes.

Do not add routine implementation details here. Those belong in engineering evidence and changelog documents.
