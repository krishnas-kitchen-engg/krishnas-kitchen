import type { EntityId } from "@krishnas-kitchen/types";

import type { PurchaseListItemRecord } from "./procurementRepository";

export type PurchaseListProgressSummary = {
  bought: number;
  issue: number;
  pending: number;
  received: number;
  total: number;
  totalCost: number;
};

export function createEmptyPurchaseListProgressSummary(): PurchaseListProgressSummary {
  return {
    bought: 0,
    issue: 0,
    pending: 0,
    received: 0,
    total: 0,
    totalCost: 0
  };
}

export function summarizePurchaseListProgress(
  items: readonly PurchaseListItemRecord[]
): Record<EntityId, PurchaseListProgressSummary> {
  return items.reduce<Record<EntityId, PurchaseListProgressSummary>>((summaries, item) => {
    const summary = summaries[item.purchaseListId] ?? createEmptyPurchaseListProgressSummary();
    const nextSummary = {
      ...summary,
      total: summary.total + 1,
      totalCost: summary.totalCost + (item.totalCost ?? 0)
    };

    if (item.status === "received_into_inventory") {
      nextSummary.received += 1;
    } else if (
      item.status === "bought" ||
      item.status === "partially_bought" ||
      item.status === "receipt_uploaded" ||
      item.status === "reconciled"
    ) {
      nextSummary.bought += 1;
    } else if (
      item.status === "substituted" ||
      item.status === "unavailable" ||
      item.status === "cancelled"
    ) {
      nextSummary.issue += 1;
    } else {
      nextSummary.pending += 1;
    }

    return {
      ...summaries,
      [item.purchaseListId]: nextSummary
    };
  }, {});
}
