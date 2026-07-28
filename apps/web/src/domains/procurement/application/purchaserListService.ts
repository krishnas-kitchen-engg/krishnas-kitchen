import type { EntityId } from "@krishnas-kitchen/types";

import type { PurchaseListItemProgressInput } from "../domain/types";
import type { PurchaseListItemRecord, PurchaserListRepository } from "./procurementRepository";

export class PurchaserListValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PurchaserListValidationError";
  }
}

export type PurchaserListService = {
  listAssignedPurchaseListItems: (query: {
    organizationId: EntityId;
    purchaserUserId: EntityId;
    templeId: EntityId;
  }) => Promise<readonly PurchaseListItemRecord[]>;
  updatePurchaseListItemProgress: (
    input: PurchaseListItemProgressInput
  ) => Promise<PurchaseListItemRecord>;
};

function assertValidProgressInput(input: PurchaseListItemProgressInput) {
  if (!input.itemId.trim()) {
    throw new PurchaserListValidationError("Purchase list item is required.");
  }

  if (input.purchasedBy.type !== "user" || !input.purchasedBy.userId?.trim()) {
    throw new PurchaserListValidationError("A signed-in purchaser is required.");
  }

  if (
    (input.status === "bought" || input.status === "partially_bought") &&
    (!input.purchasedQuantity || input.purchasedQuantity <= 0)
  ) {
    throw new PurchaserListValidationError("Purchased quantity must be greater than zero.");
  }

  if (
    (input.status === "unavailable" || input.status === "substituted") &&
    input.purchasedQuantity !== undefined &&
    input.purchasedQuantity !== null &&
    input.purchasedQuantity < 0
  ) {
    throw new PurchaserListValidationError("Purchased quantity cannot be negative.");
  }

  if (input.unitCost !== undefined && input.unitCost !== null && input.unitCost < 0) {
    throw new PurchaserListValidationError("Unit cost cannot be negative.");
  }

  if (input.totalCost !== undefined && input.totalCost !== null && input.totalCost < 0) {
    throw new PurchaserListValidationError("Total cost cannot be negative.");
  }

  if (input.notes && input.notes.trim().length > 500) {
    throw new PurchaserListValidationError("Purchaser notes must be 500 characters or fewer.");
  }
}

export function createPurchaserListService(
  repository: PurchaserListRepository
): PurchaserListService {
  return {
    listAssignedPurchaseListItems(query) {
      return repository.listAssignedPurchaseListItems(query);
    },

    updatePurchaseListItemProgress(input) {
      assertValidProgressInput(input);

      return repository.updatePurchaseListItemProgress({
        ...input,
        notes: input.notes?.trim() || null,
        purchasedAt: new Date().toISOString()
      });
    }
  };
}
