---
title: Current Delivery Increment
status: active
doc_type: delivery
lifecycle: living
owner: delivery
update_cadence: when the selected increment, included stories, acceptance criteria, exit criteria, risks, or blockers change
---

# Current Delivery Increment

## Purpose

Define the single customer outcome currently being prepared for delivery.

This document is the authoritative delivery scope for the active increment. It explains what is being delivered, why it was selected, what is included, what is excluded, and what evidence is required before the increment can be considered pilot-ready.

## Current Increment

Current Delivery Increment: Receiving + Inventory Visibility Pilot.

Active Horizon: Horizon 1, Core Kitchen Inventory Platform.

Delivery Status: Evidence-complete for controlled pilot review; smoke-path, seed data, receiving hardening, manager visibility, reversal validation, and pilot readiness evidence stories complete.

Readiness Status: At Risk for controlled pilot use with documented residual risks; not production-ready.

## Objective

Enable a temple kitchen volunteer to receive inventory and enable a kitchen manager to verify that the received stock appears correctly in inventory visibility and history.

## Customer Outcome

When donations or supplies arrive, the temple kitchen can record them quickly and trust the resulting inventory count.

This is the smallest complete operational workflow that can provide real pilot value with the implementation evidence currently present in the repository.

## Why This Increment Exists

This increment was selected because receiving plus inventory visibility is the closest workflow to pilot value.

Repository evidence already supports:

- Inventory transaction foundations.
- Receiving workflow implementation.
- Inventory balances derived from transaction history.
- Inventory visibility projections.
- Barcode lookup and unknown barcode handling.
- Multiple locations.
- Reversal semantics for correction.
- Mobile inventory workflow foundations.
- Existing automated tests across inventory behavior.

The increment avoids expanding product breadth before one complete temple-kitchen outcome is usable.

## Included Stories

1. Receiving Pilot Smoke Path. Status: Complete.
2. Pilot Inventory Seed Data. Status: Complete.
3. Receiving Error And Empty State Hardening. Status: Complete.
4. Manager Visibility Verification. Status: Complete.
5. Reversal And Undo Pilot Path. Status: Complete.
6. Pilot Readiness Evidence. Status: Complete.

## Included Capabilities

The increment includes only capabilities required to complete and verify the receiving-to-visibility workflow:

- Authentication needed to access the workflow.
- Role-based permission boundaries needed for receiving and inventory visibility.
- Inventory.
- Receiving.
- Inventory history.
- Inventory visibility.
- Barcode lookup.
- Barcode catalog.
- Unknown barcode workflow.
- Multiple locations.
- Reversal for mistake correction.
- Mobile-first inventory workflow experience.
- Audit trail evidence from immutable transaction history.
- Security, RLS, and RPC boundaries that affect pilot access to the included workflow.
- Testing and evidence needed to demonstrate pilot readiness.

## Excluded Scope

The following are explicitly outside this delivery increment:

- Recipe definitions, scaling, availability, and shopping-list workflows.
- Transfers as a pilot workflow.
- Returns as a pilot workflow.
- Low-stock operations as a pilot workflow.
- Full temporary volunteer onboarding as a pilot workflow unless required only for receiving access.
- Offline queue storage, replay, and runtime sync.
- Forecasting.
- Donation intelligence.
- AI recommendations.
- Menu planning.
- Festival planning.
- Volunteer scheduling.
- Analytics dashboards.
- Supplier optimization.
- Kitchen planning.
- Temple operations outside inventory receiving and visibility.
- Production readiness approval.

Existing implemented capabilities outside the increment may remain in the product, but they are not part of this increment's pilot exit criteria.

## Acceptance Criteria

The increment is complete when repository evidence demonstrates that:

- A volunteer can receive inventory on a mobile-oriented workflow with minimal guidance.
- Known barcode input resolves to an inventory item.
- Unknown or manual item entry follows a safe fallback path.
- Quantity, unit, and location inputs are validated.
- Receiving creates an immutable persisted inventory transaction.
- Inventory balances update from transaction history.
- A manager can verify received stock by item and location.
- Transaction history shows what changed, where it changed, and when it changed.
- A mistake correction path exists through reversal or undo behavior.
- Unauthorized receiving is prevented by existing permission boundaries.
- Realistic pilot data exists or can be loaded without manual source-code changes.
- Quality gates pass for the included workflow.
- Delivery readiness records remaining pilot limitations honestly.

## Pilot Exit Criteria

The increment is pilot-ready when:

- All acceptance criteria are satisfied.
- The Receiving Pilot Smoke Path has been executed and documented.
- Pilot inventory seed data is available.
- Manager visibility verification is documented.
- Correction behavior is validated for receiving mistakes.
- No unresolved blocker prevents a controlled temple pilot.
- Known limitations are documented in [Delivery Readiness](./DELIVERY_READINESS.md).
- [Capability Matrix](./CAPABILITY_MATRIX.md) marks included capabilities consistently.
- [Delivery Status](./DELIVERY_STATUS.md) records pilot readiness as ready or at risk with evidence.

## Evidence Collected

Receiving Pilot Smoke Path evidence:

- Test: `apps/web/src/domains/inventory/application/receivingPilotSmokePath.test.ts`.
- Scenario: a volunteer scans a realistic rice barcode, receives 25 kg into Dry Store Pantry, the transaction persists, manager visibility shows the updated item/location balance, and transaction history exposes the received transaction with audit metadata.
- Verification: the targeted smoke-path test passed.
- Validation commands: typecheck, lint, full test suite, and build passed after the story.

Story acceptance status: Receiving Pilot Smoke Path satisfies its story acceptance criteria.

Receiving Error And Empty State Hardening evidence:

- Tests: `apps/web/src/features/inventory/receive/components/ReceivePilotHardening.test.tsx` and `apps/web/src/features/inventory/receive/screens/ReceiveInventoryScreen.test.tsx`.
- Scenario: receiving UI shows loading guidance before catalog data arrives, gives volunteers a manager-action path when no manual item matches, explains unavailable receiving locations and units, and prevents volunteers from reviewing incomplete receiving details.
- Verification: receiving-focused tests passed.

Story acceptance status: Receiving Error And Empty State Hardening satisfies its story acceptance criteria.

Manager Visibility Verification evidence:

- Tests: `apps/web/src/domains/inventory/application/receivingPilotSmokePath.test.ts` and `apps/web/src/features/inventory/components/InventoryTransactionList.test.tsx`.
- Scenario: after a volunteer receives 25 kg of Sona Masoori Rice into Dry Store Pantry, manager visibility returns correct visible balances, item balances, location balances, transaction history, actor, timestamp, item, quantity, location, and inventory summary.
- Verification: targeted manager visibility tests passed.
- Evidence record: [Pilot Evidence](./PILOT_EVIDENCE.md).

Story acceptance status: Manager Visibility Verification satisfies its story acceptance criteria.

Reversal And Undo Pilot Path evidence:

- Tests: `apps/web/src/domains/inventory/application/reversalPilotValidation.test.ts` and `apps/web/src/features/inventory/components/InventoryTransactionList.test.tsx`.
- Scenario: after a mistaken 25 kg receiving transaction, a manager uses the existing undo service operation to create a separate reversal transaction. Inventory balances return to zero, the original receive remains immutable, transaction history shows both actions, and the reversal identifies the corrected transaction.
- Verification: targeted reversal pilot validation tests passed.
- Evidence record: [Pilot Evidence](./PILOT_EVIDENCE.md).

Story acceptance status: Reversal And Undo Pilot Path satisfies its story acceptance criteria.

Pilot Inventory Seed Data evidence:

- Seed assets: `infra/supabase/seed/seed_validation_cleanup.sql`, `infra/supabase/seed/seed_validation_core.sql`, and `infra/supabase/seed/VALIDATION_SEED_DATA.md`.
- Test: `apps/web/src/domains/inventory/infrastructure/supabase/validationSeedData.test.ts`.
- Scenario: a clean staging Supabase database can be reset with cleanup and core seed scripts, then used by a permanent validation volunteer to receive inventory and by a validation manager to verify inventory visibility, barcodes, manual item selection, transaction history, low-stock context, and reversal visibility.
- Verification: seed-data regression test passed.
- Evidence record: [Pilot Evidence](./PILOT_EVIDENCE.md).

Story acceptance status: Pilot Inventory Seed Data satisfies its story acceptance criteria.

Pilot Readiness Evidence:

- Evidence record: [Pilot Evidence](./PILOT_EVIDENCE.md).
- Readiness authority: [Delivery Readiness](./DELIVERY_READINESS.md).
- Capability status authority: [Capability Matrix](./CAPABILITY_MATRIX.md).
- Conclusion: increment readiness is ready for controlled pilot review, pilot readiness is at risk with documented residual risks, and production readiness remains blocked.
- Verification expectation: typecheck, lint, tests, and build must pass before human review of this evidence-complete increment.

Story acceptance status: Pilot Readiness Evidence satisfies its story acceptance criteria.

## Current Blockers

- No known blocker prevents human review of a controlled Receiving + Inventory Visibility Pilot.
- Production security approval is not granted; this blocks production readiness, not controlled pilot scoping.
- Accessibility and performance posture for the selected workflow remain residual pilot risks until measured.

## Relationship To Other Delivery Documents

- [Delivery Status](./DELIVERY_STATUS.md) summarizes this increment and overall delivery progress.
- [Capability Matrix](./CAPABILITY_MATRIX.md) records which capabilities are included in this increment.
- [Delivery Readiness](./DELIVERY_READINESS.md) assesses increment, pilot, and production readiness.
- [Delivery Backlog](./DELIVERY_BACKLOG.md) orders future customer outcomes.
- [Delivery Decisions](./DELIVERY_DECISIONS.md) records why this increment was selected.

## Maintenance Rules

Update this document only when the active delivery increment changes or when evidence changes the increment scope, acceptance criteria, exit criteria, risks, or blockers.

Do not use this document as an engineering task tracker. Stories here represent delivery outcomes, not implementation steps.
