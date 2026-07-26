---
title: Pilot Evidence
status: active
doc_type: delivery
lifecycle: living
owner: delivery
update_cadence: when pilot-facing evidence, acceptance criteria, known limitations, or readiness conclusions change
---

# Pilot Evidence

## Purpose

Record evidence that supports or blocks pilot readiness for the current delivery increment.

This document does not define product scope or implementation scope. It records evidence for [Receiving + Inventory Visibility Pilot](./CURRENT_DELIVERY_INCREMENT.md).

## Current Delivery Increment

Current Delivery Increment: Receiving + Inventory Visibility Pilot.

Pilot Readiness: At Risk.

Primary reason: smoke-path, seed data, receiving hardening, manager visibility, correction-path evidence, and readiness evidence now exist for controlled pilot review. Accessibility and performance posture remain unmeasured residual risks, and production security approval is not granted.

## Evidence Summary

| Story | Status | Evidence | Conclusion |
|---|---|---|---|
| Receiving Pilot Smoke Path | Complete | `apps/web/src/domains/inventory/application/receivingPilotSmokePath.test.ts` | Volunteer receiving persists and updates manager-visible inventory state. |
| Receiving Error And Empty State Hardening | Complete | `apps/web/src/features/inventory/receive/components/ReceivePilotHardening.test.tsx`; `apps/web/src/features/inventory/receive/screens/ReceiveInventoryScreen.test.tsx` | First-time volunteer dead ends are reduced for loading, empty, unavailable-location, unavailable-unit, and incomplete-review states. |
| Manager Visibility Verification | Complete | `apps/web/src/domains/inventory/application/receivingPilotSmokePath.test.ts`; `apps/web/src/features/inventory/components/InventoryTransactionList.test.tsx` | Manager can verify balances, item visibility, location visibility, transaction history, actor, timestamp, item, quantity, and location. |
| Pilot Inventory Seed Data | Complete | `infra/supabase/seed/VALIDATION_SEED_DATA.md`; `infra/supabase/seed/seed_validation_core.sql`; `infra/supabase/seed/seed_validation_cleanup.sql`; `apps/web/src/domains/inventory/infrastructure/supabase/validationSeedData.test.ts` | A clean staging environment can be prepared with reusable pilot seed data for receiving and manager verification. |
| Reversal And Undo Pilot Path | Complete | `apps/web/src/domains/inventory/application/reversalPilotValidation.test.ts`; `apps/web/src/features/inventory/components/InventoryTransactionList.test.tsx` | A mistaken receive can be corrected through a separate reversal transaction that restores balances and preserves audit history. |
| Pilot Readiness Evidence | Complete | This document; [Delivery Readiness](./DELIVERY_READINESS.md); [Capability Matrix](./CAPABILITY_MATRIX.md); full verification suite | The increment is evidence-complete for controlled pilot review, pilot readiness is at risk, and production readiness remains blocked. |

## Manager Visibility Verification Evidence

Acceptance criteria satisfied:

- Inventory balances are immediately correct after receiving.
- Item inventory is correct after receiving.
- Location inventory is correct after receiving.
- Transaction history reflects the receive.
- Manager can identify item, quantity, location, actor, and timestamp.
- Empty transaction history remains understandable.
- Failure states remain understandable through existing inventory error state.
- Behavior is demonstrated through automated tests.

Evidence details:

- `receivingPilotSmokePath.test.ts` proves a volunteer receives 25 kg of Sona Masoori Rice into Dry Store Pantry, then manager visibility returns the correct item/location balance, item balance, location balance, transaction history, actor, timestamp, and inventory summary.
- `InventoryTransactionList.test.tsx` proves transaction history renders manager-readable item, quantity, location, actor, and timestamp information.
- Existing `InventoryEmptyState` and `InventoryErrorState` keep empty and failure states understandable for visibility screens.

## Reversal And Undo Pilot Path Evidence

Acceptance criteria satisfied:

- Inventory balances are correct after reversing an incorrect receive.
- Transaction history clearly shows both the original receive and the reversal.
- Audit history remains immutable because the original receive is preserved and a new reversal transaction is appended.
- Manager can understand what occurred because the transaction list identifies the corrected transaction.
- Volunteer or manager can understand that correction succeeded because the corrected balance returns to zero in visibility.
- Behavior is demonstrated through automated tests.

Evidence details:

- `reversalPilotValidation.test.ts` proves a mistaken 25 kg receive into Dry Store Pantry can be corrected by `undoTransaction`, creating a separate `reversal` transaction linked to the original receive.
- The same test proves visible balances return to zero and transaction history contains both actions in deterministic order.
- `InventoryTransactionList.test.tsx` proves reversal history shows the original transaction being corrected.

## Pilot Inventory Seed Data Evidence

Acceptance criteria satisfied:

- A clean environment can be prepared for pilot use using documented seed data.
- The seeded environment supports volunteer receiving through a permanent validation volunteer account with `inventory.receive` permission.
- Barcode lookup is supported by active Rice, Oil, Milk, and Vegetables barcode mappings.
- Manual item selection is supported by seeded Rice, Oil, Milk, and Vegetables catalog rows.
- Inventory visibility and manager verification are supported by seeded organization, temple, location, item, transaction, and manager-role data.
- The reversal workflow is supported by a seeded Oil reversal transaction and deterministic transaction fixtures that can be reset.
- The seed runbook documents setup sequence, seeded data, assumptions, and limitations.

Evidence details:

- `seed_validation_core.sql` now seeds `validation.volunteer@krishnas-kitchen.test` and `validation.manager@krishnas-kitchen.test` with database-backed `public.user_roles` rows.
- `seed_validation_core.sql` seeds the current increment data surface: organization, temples, permanent users, temporary session fixtures, inventory items, item barcodes, locations, starting transactions, reversal transaction history, unknown barcode rows, and low-stock thresholds.
- `seed_validation_cleanup.sql` removes the seeded validation volunteer and scoped validation data so pilot setup can be repeated without table truncation.
- `VALIDATION_SEED_DATA.md` documents the Receiving + Inventory Visibility Pilot setup path, test credentials, barcodes, manual item choices, locations, reversal evidence, low-stock context, assumptions, and limitations.
- `validationSeedData.test.ts` guards the pilot-critical seed and runbook coverage.

## Pilot Readiness Evidence

Acceptance criteria satisfied:

- The selected delivery increment has one documented customer outcome: a volunteer receives inventory and a manager verifies the resulting stock through inventory visibility and history.
- Receiving smoke-path evidence proves barcode resolution, volunteer receiving, immutable transaction persistence, balance projection, item projection, location projection, transaction history, actor, timestamp, and inventory summary behavior.
- Receiving hardening evidence proves loading, empty, unavailable-location, unavailable-unit, and incomplete-review states do not leave the volunteer at an unexplained dead end.
- Manager visibility evidence proves a manager-readable transaction history with item, quantity, location, actor, timestamp, and reversal-target information.
- Reversal evidence proves a mistaken receive can be corrected by appending a reversal transaction while preserving immutable audit history.
- Seed evidence proves a repeatable controlled staging setup exists for pilot validation.
- Delivery Readiness records the increment as ready for controlled pilot review, pilot readiness as at risk, and production readiness as blocked.
- Capability Matrix marks included capabilities consistently for pilot readiness.
- Remaining limitations are documented as residual risks instead of hidden blockers.

Evidence details:

- The evidence set covers the active increment's included capabilities only and does not promote transfer, return, recipes, shopping lists, offline runtime sync, production approval, or higher-horizon work into pilot scope.
- Accessibility and performance posture are not measured by a dedicated tool in the current repository. They remain residual pilot risks requiring human acceptance or a follow-up validation milestone before live pilot operation.
- Production security approval is absent and remains a production blocker.

## Known Limitations

- Accessibility and performance posture for the selected workflow are not measured by a dedicated tool in the current repository.
- Production security approval is not granted; this blocks production readiness, not controlled pilot scoping.

## Cross References

- [Current Delivery Increment](./CURRENT_DELIVERY_INCREMENT.md).
- [Delivery Status](./DELIVERY_STATUS.md).
- [Delivery Readiness](./DELIVERY_READINESS.md).
- [Capability Matrix](./CAPABILITY_MATRIX.md).
