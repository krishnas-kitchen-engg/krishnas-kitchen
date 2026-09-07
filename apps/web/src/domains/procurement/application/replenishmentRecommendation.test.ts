import assert from "node:assert/strict";
import { describe, it } from "vitest";

import type { InventoryLowStockAlert } from "@/domains/inventory";

import type {
  ItemPurchasePreferenceRecord,
  PurchaseListItemRecord,
  PurchaseRequestRecord
} from "./procurementRepository";
import { buildReplenishmentRecommendations } from "./replenishmentRecommendation";

const alert: InventoryLowStockAlert = {
  currentQuantity: 5,
  itemId: "mustard-seeds",
  minimumQuantity: 5,
  organizationId: "org-1",
  shortageQuantity: 0,
  targetQuantity: 20,
  templeId: "temple-1",
  unit: "lb"
};

function buildInput(
  overrides: {
    alerts?: InventoryLowStockAlert[];
    preferences?: ItemPurchasePreferenceRecord[];
    purchaseListItems?: PurchaseListItemRecord[];
    requests?: PurchaseRequestRecord[];
  } = {}
) {
  return {
    alerts: overrides.alerts ?? [alert],
    items: [{ id: "mustard-seeds", name: "Mustard Seeds" }],
    preferences: overrides.preferences ?? [],
    purchaseListItems: overrides.purchaseListItems ?? [],
    requests: overrides.requests ?? []
  };
}

describe("replenishment recommendations", () => {
  it("recommends the quantity required to reach the target", () => {
    const [recommendation] = buildReplenishmentRecommendations(buildInput());

    assert.equal(recommendation?.suggestedQuantity, 15);
    assert.equal(recommendation?.alreadyPlannedQuantity, 0);
  });

  it("subtracts active requests and purchase-list quantities", () => {
    const request = {
      item: { itemId: "mustard-seeds", type: "existing_item" },
      quantity: 4,
      status: "approved",
      unit: "lb"
    } as PurchaseRequestRecord;
    const listItem = {
      approvedQuantity: 3,
      item: { itemId: "mustard-seeds", type: "existing_item" },
      status: "pending_purchase",
      unit: "lb"
    } as PurchaseListItemRecord;
    const [recommendation] = buildReplenishmentRecommendations(
      buildInput({ purchaseListItems: [listItem], requests: [request] })
    );

    assert.equal(recommendation?.alreadyPlannedQuantity, 7);
    assert.equal(recommendation?.suggestedQuantity, 8);
  });

  it("applies minimum-order and pack-size rules in the same unit", () => {
    const preference = {
      archivedAt: null,
      itemId: "mustard-seeds",
      minimumOrderQuantity: 18,
      packSize: 10,
      preferredPurchaseUnit: "lb"
    } as ItemPurchasePreferenceRecord;
    const [recommendation] = buildReplenishmentRecommendations(
      buildInput({ preferences: [preference] })
    );

    assert.equal(recommendation?.suggestedQuantity, 20);
    assert.equal(recommendation?.orderRuleApplied, true);
  });

  it("omits covered items and alerts without targets", () => {
    const coveredRequest = {
      item: { itemId: "mustard-seeds", type: "existing_item" },
      quantity: 15,
      status: "submitted",
      unit: "lb"
    } as PurchaseRequestRecord;
    const noTarget = { ...alert, targetQuantity: null };

    assert.deepEqual(
      buildReplenishmentRecommendations(buildInput({ requests: [coveredRequest] })),
      []
    );
    assert.deepEqual(buildReplenishmentRecommendations(buildInput({ alerts: [noTarget] })), []);
  });
});
