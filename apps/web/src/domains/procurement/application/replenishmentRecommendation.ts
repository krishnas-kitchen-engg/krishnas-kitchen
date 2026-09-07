import type { EntityId, ItemUnit } from "@krishnas-kitchen/types";

import type { InventoryLowStockAlert } from "@/domains/inventory";

import type {
  ItemPurchasePreferenceRecord,
  PurchaseListItemRecord,
  PurchaseRequestRecord
} from "./procurementRepository";

export type ReplenishmentCatalogItem = {
  id: EntityId;
  name: string;
};

export type ReplenishmentRecommendation = {
  alreadyPlannedQuantity: number;
  currentQuantity: number;
  itemId: EntityId;
  itemName: string;
  orderRuleApplied: boolean;
  reorderPoint: number;
  suggestedQuantity: number;
  targetStockLevel: number;
  unit: ItemUnit;
};

export type ReplenishmentRecommendationInput = {
  alerts: readonly InventoryLowStockAlert[];
  items: readonly ReplenishmentCatalogItem[];
  preferences: readonly ItemPurchasePreferenceRecord[];
  purchaseListItems: readonly PurchaseListItemRecord[];
  requests: readonly PurchaseRequestRecord[];
};

const plannedRequestStatuses = new Set(["submitted", "needs_clarification", "approved"]);
const plannedListItemStatuses = new Set([
  "pending_purchase",
  "bought",
  "partially_bought",
  "receipt_uploaded",
  "reconciled",
  "substituted"
]);

function roundQuantity(value: number): number {
  return Math.round((value + Number.EPSILON) * 1000) / 1000;
}

function roundUpToPackSize(quantity: number, packSize: number | null | undefined): number {
  if (!packSize) {
    return quantity;
  }

  return roundQuantity(Math.ceil(quantity / packSize) * packSize);
}

function getAlreadyPlannedQuantity(
  itemId: EntityId,
  unit: ItemUnit,
  requests: readonly PurchaseRequestRecord[],
  purchaseListItems: readonly PurchaseListItemRecord[]
): number {
  const requestQuantity = requests
    .filter(
      (request) =>
        request.item.type === "existing_item" &&
        request.item.itemId === itemId &&
        request.unit === unit &&
        plannedRequestStatuses.has(request.status)
    )
    .reduce((total, request) => total + request.quantity, 0);
  const listQuantity = purchaseListItems
    .filter(
      (item) =>
        item.item.type === "existing_item" &&
        item.item.itemId === itemId &&
        item.unit === unit &&
        plannedListItemStatuses.has(item.status)
    )
    .reduce((total, item) => total + item.approvedQuantity, 0);

  return roundQuantity(requestQuantity + listQuantity);
}

export function buildReplenishmentRecommendations(
  input: ReplenishmentRecommendationInput
): ReplenishmentRecommendation[] {
  const itemNames = new Map(input.items.map((item) => [item.id, item.name]));
  const preferences = new Map(
    input.preferences
      .filter((preference) => !preference.archivedAt)
      .map((preference) => [preference.itemId, preference])
  );

  return input.alerts
    .flatMap((alert): ReplenishmentRecommendation[] => {
      if (typeof alert.targetQuantity !== "number") {
        return [];
      }

      const itemName = itemNames.get(alert.itemId);

      if (!itemName) {
        return [];
      }

      const alreadyPlannedQuantity = getAlreadyPlannedQuantity(
        alert.itemId,
        alert.unit,
        input.requests,
        input.purchaseListItems
      );
      const quantityToTarget = roundQuantity(
        Math.max(alert.targetQuantity - alert.currentQuantity - alreadyPlannedQuantity, 0)
      );

      if (quantityToTarget <= 0) {
        return [];
      }

      const preference = preferences.get(alert.itemId);
      const canApplyOrderRules =
        !preference?.preferredPurchaseUnit || preference.preferredPurchaseUnit === alert.unit;
      const quantityWithMinimum = canApplyOrderRules
        ? Math.max(quantityToTarget, preference?.minimumOrderQuantity ?? 0)
        : quantityToTarget;
      const suggestedQuantity = canApplyOrderRules
        ? roundUpToPackSize(quantityWithMinimum, preference?.packSize)
        : quantityToTarget;

      return [
        {
          alreadyPlannedQuantity,
          currentQuantity: alert.currentQuantity,
          itemId: alert.itemId,
          itemName,
          orderRuleApplied: suggestedQuantity !== quantityToTarget,
          reorderPoint: alert.minimumQuantity,
          suggestedQuantity,
          targetStockLevel: alert.targetQuantity,
          unit: alert.unit
        }
      ];
    })
    .sort(
      (left, right) =>
        right.suggestedQuantity - left.suggestedQuantity ||
        left.itemName.localeCompare(right.itemName)
    );
}
