---
title: Delivery Backlog
status: active
doc_type: delivery
lifecycle: living
owner: delivery
update_cadence: when delivery outcome order, dependencies, or readiness evidence changes
---

# Delivery Backlog

## Purpose

Maintain the ordered backlog of customer outcomes for Krishna's Kitchen delivery.

This document tracks what should be delivered next from a customer-value perspective. It is not an implementation task list, sprint board, or engineering milestone plan.

## Backlog Principles

- Deliver complete customer outcomes before adding feature breadth.
- Prefer workflows that can be validated in a real temple kitchen.
- Reuse implemented inventory foundations before expanding into less complete areas.
- Keep the active horizon fixed to Horizon 1 unless [Product Horizons](../PRODUCT_HORIZONS.md) changes through the approved process.
- Treat higher-horizon work as context only.

## Ordered Delivery Backlog

| Order | Delivery Outcome | Status | Customer Value | Dependencies | Notes |
|---|---|---|---|---|---|
| 1 | Receiving + Inventory Visibility Pilot | Current | Volunteers can record received goods and managers can trust updated inventory. | Existing inventory, receiving, visibility, history, barcode, location, auth, and reversal foundations. | Current Delivery Increment. |
| 2 | Inventory Movement Pilot Expansion | Planned | Managers can move and correct stock across locations after receiving is trusted. | Receiving + Inventory Visibility Pilot. | Transfers and returns are implemented but not selected as the first pilot outcome. |
| 3 | Temporary Volunteer Operations Pilot | Planned | Temporary volunteers can perform approved kitchen actions without broad system access. | Confirmed receiving pilot permissions and role boundaries. | Scope must remain limited to Horizon 1. |
| 4 | Recipe Availability Workflow | Planned | Kitchen staff can understand whether inventory can support a recipe. | Stable inventory visibility and recipe-domain foundations. | Existing recipe domain is partial; UI, persistence, and integration remain future work. |
| 5 | Shopping List Workflow | Planned | Kitchen staff can see shortages needed to prepare selected recipes. | Recipe Availability Workflow. | Shopping-list shortage logic exists, but customer workflow remains incomplete. |
| 6 | Production Alpha Hardening | Planned | A controlled production-alpha can operate with known security, accessibility, performance, and reliability posture. | Completion or explicit deferral of Horizon 1 readiness blockers. | Includes readiness evidence, not future-horizon expansion. |

## Current Increment Stories

The current delivery increment is [Receiving + Inventory Visibility Pilot](./CURRENT_DELIVERY_INCREMENT.md).

The delivery stories are:

1. Receiving Pilot Smoke Path. Status: Complete.
2. Pilot Inventory Seed Data. Status: Complete.
3. Receiving Error And Empty State Hardening. Status: Complete.
4. Manager Visibility Verification. Status: Complete.
5. Reversal And Undo Pilot Path. Status: Complete.
6. Pilot Readiness Evidence. Status: Planned.

## Out-Of-Order Work

Do not begin later delivery outcomes until the current increment is either:

- Completed and assessed as pilot-ready.
- Explicitly paused by human delivery decision.
- Superseded by an approved delivery decision recorded in [Delivery Decisions](./DELIVERY_DECISIONS.md).

## Cross References

- [Current Delivery Increment](./CURRENT_DELIVERY_INCREMENT.md).
- [Delivery Status](./DELIVERY_STATUS.md).
- [Capability Matrix](./CAPABILITY_MATRIX.md).
- [Delivery Readiness](./DELIVERY_READINESS.md).
- [Delivery Decisions](./DELIVERY_DECISIONS.md).
- [Product Horizons](../PRODUCT_HORIZONS.md).
