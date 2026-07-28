import type { EntityId } from "@krishnas-kitchen/types";

import type { InventoryActor, InventoryService } from "@/domains/inventory";

import type { PurchaseInventoryReceiveInput, ProcurementActor } from "../domain/types";
import type { PurchaseListItemRecord, PurchaserListRepository } from "./procurementRepository";

type ReceivablePurchaseListItemRecord = PurchaseListItemRecord & {
  item: {
    itemId: EntityId;
    type: "existing_item";
  };
  purchasedQuantity: number;
};

export class PurchaseInventoryReceivingValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PurchaseInventoryReceivingValidationError";
  }
}

export type PurchaseInventoryReceivingResult = {
  inventoryTransactionId: EntityId;
  item: PurchaseListItemRecord;
};

export type PurchaseInventoryReceivingService = {
  receivePurchasedItem: (
    input: PurchaseInventoryReceiveInput
  ) => Promise<PurchaseInventoryReceivingResult>;
};

function toInventoryActor(actor: ProcurementActor): InventoryActor {
  if (actor.type === "user" && actor.userId) {
    return {
      type: actor.type,
      userId: actor.userId
    };
  }

  if (actor.type === "temporary_volunteer" && actor.tempSessionId) {
    return {
      tempSessionId: actor.tempSessionId,
      type: actor.type
    };
  }

  return {
    type: "system"
  };
}

function assertValidReceiveInput(input: PurchaseInventoryReceiveInput) {
  if (!input.itemId.trim()) {
    throw new PurchaseInventoryReceivingValidationError("Purchase list item is required.");
  }

  if (!input.locationId.trim()) {
    throw new PurchaseInventoryReceivingValidationError("Inventory receive location is required.");
  }

  if (input.receivedBy.type !== "user" || !input.receivedBy.userId?.trim()) {
    throw new PurchaseInventoryReceivingValidationError("A signed-in receiver is required.");
  }

  if (input.notes && input.notes.trim().length > 500) {
    throw new PurchaseInventoryReceivingValidationError(
      "Receive notes must be 500 characters or fewer."
    );
  }
}

function assertReceivablePurchaseItem(
  item: PurchaseListItemRecord | null
): ReceivablePurchaseListItemRecord {
  if (!item) {
    throw new PurchaseInventoryReceivingValidationError("Purchase list item was not found.");
  }

  if (item.item.type !== "existing_item") {
    throw new PurchaseInventoryReceivingValidationError(
      "New item suggestions must be added to the inventory catalog before receiving."
    );
  }

  if (item.inventoryTransactionId || item.status === "received_into_inventory") {
    throw new PurchaseInventoryReceivingValidationError(
      "This purchase has already been received into inventory."
    );
  }

  if (
    item.status !== "bought" &&
    item.status !== "partially_bought" &&
    item.status !== "receipt_uploaded"
  ) {
    throw new PurchaseInventoryReceivingValidationError(
      "Only bought purchases can be received into inventory."
    );
  }

  if (!item.purchasedQuantity || item.purchasedQuantity <= 0) {
    throw new PurchaseInventoryReceivingValidationError(
      "Purchased quantity is required before receiving into inventory."
    );
  }

  return item as ReceivablePurchaseListItemRecord;
}

export function createPurchaseInventoryReceivingService(options: {
  inventoryService: InventoryService;
  repository: PurchaserListRepository;
}): PurchaseInventoryReceivingService {
  return {
    async receivePurchasedItem(input) {
      assertValidReceiveInput(input);

      const item = assertReceivablePurchaseItem(
        await options.repository.findPurchaseListItemById({
          itemId: input.itemId,
          organizationId: input.organizationId,
          templeId: input.templeId
        })
      );
      const receivedBy = toInventoryActor(input.receivedBy);
      const inventoryTransaction = await options.inventoryService.receiveInventory({
        actor: receivedBy,
        auditMetadata: {
          reason: "procurement_purchase_receive",
          source: "online"
        },
        itemId: item.item.itemId,
        locationId: input.locationId,
        notes: input.notes?.trim() || `Received from purchase list item ${item.id}.`,
        organizationId: input.organizationId,
        quantity: item.purchasedQuantity,
        templeId: input.templeId,
        unit: item.unit
      });

      try {
        const receivedItem = await options.repository.markPurchaseListItemReceived({
          ...input,
          inventoryTransactionId: inventoryTransaction.id,
          notes: input.notes?.trim() || null
        });

        return {
          inventoryTransactionId: inventoryTransaction.id,
          item: receivedItem
        };
      } catch (error) {
        try {
          await options.inventoryService.undoTransaction(inventoryTransaction.id, {
            actor: receivedBy,
            auditMetadata: {
              reason: "procurement_receive_link_failed",
              source: "system"
            },
            notes: `Automatic reversal because purchase receive linkage failed for ${item.id}.`
          });
        } catch (rollbackError) {
          throw new Error(
            `Purchase receive linkage failed and rollback failed. Original error: ${
              error instanceof Error ? error.message : "unknown"
            }. Rollback error: ${
              rollbackError instanceof Error ? rollbackError.message : "unknown"
            }.`
          );
        }

        throw error;
      }
    }
  };
}
