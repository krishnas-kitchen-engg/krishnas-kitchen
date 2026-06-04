import type { EntityId } from "@krishnas-kitchen/types";

import { calculateInventoryBalances } from "../domain/aggregation";
import {
  createReceivingTransaction,
  createTransferTransaction,
  createUndoTransaction
} from "../domain/transactionHelpers";
import {
  ReceivingValidationError,
  validateReceivingTransactionInput
} from "../domain/receivingValidation";
import {
  TransferValidationError,
  validateTransferTransactionInput
} from "../domain/transferValidation";
import { assertValidInventoryTransactionDraft } from "../domain/validation";
import type {
  CreateInventoryTransactionInput,
  CreateReceivingTransactionInput,
  CreateTransferTransactionInput,
  InventoryActor,
  InventoryAuditMetadata,
  InventoryBalance,
  InventoryItemReference,
  InventoryLocationReference,
  InventoryTransaction,
  InventoryTransactionDraft,
  InventoryTransactionScope
} from "../domain/types";
import type { InventoryTransactionRepository } from "./inventoryRepository";

export type InventoryReceivingCatalog = {
  findReceivingItem: (
    itemId: EntityId,
    scope: Pick<CreateReceivingTransactionInput, "organizationId">
  ) => Promise<InventoryItemReference | null>;
  findReceivingLocation: (
    locationId: EntityId,
    scope: Pick<CreateReceivingTransactionInput, "organizationId" | "templeId">
  ) => Promise<InventoryLocationReference | null>;
};

export type InventoryTransferCatalog = {
  findTransferDestinationLocation: (
    locationId: EntityId,
    scope: Pick<CreateTransferTransactionInput, "organizationId" | "templeId">
  ) => Promise<InventoryLocationReference | null>;
  findTransferItem: (
    itemId: EntityId,
    scope: Pick<CreateTransferTransactionInput, "organizationId">
  ) => Promise<InventoryItemReference | null>;
  findTransferSourceLocation: (
    locationId: EntityId,
    scope: Pick<CreateTransferTransactionInput, "organizationId" | "templeId">
  ) => Promise<InventoryLocationReference | null>;
};

export type InventoryService = {
  createTransaction: (draft: InventoryTransactionDraft) => Promise<InventoryTransaction>;
  getBalances: (scope: InventoryTransactionScope) => Promise<InventoryBalance[]>;
  getTransactions: (scope: InventoryTransactionScope) => Promise<InventoryTransaction[]>;
  receiveInventory: (input: CreateReceivingTransactionInput) => Promise<InventoryTransaction>;
  transferInventory: (input: CreateTransferTransactionInput) => Promise<InventoryTransaction>;
  undoTransaction: (
    transactionId: EntityId,
    input: {
      actor: InventoryActor;
      auditMetadata?: InventoryAuditMetadata;
      notes?: string;
    }
  ) => Promise<InventoryTransaction>;
};

export function createInventoryService(
  repository: InventoryTransactionRepository,
  options: {
    receivingCatalog?: InventoryReceivingCatalog;
    transferCatalog?: InventoryTransferCatalog;
  } = {}
): InventoryService {
  return {
    async createTransaction(draft) {
      return repository.createTransaction(assertValidInventoryTransactionDraft(draft));
    },

    async getBalances(scope) {
      return calculateInventoryBalances(await repository.listTransactions(scope));
    },

    async getTransactions(scope) {
      return repository.listTransactions(scope);
    },

    async receiveInventory(input) {
      const item = await options.receivingCatalog?.findReceivingItem(input.itemId, {
        organizationId: input.organizationId
      });
      const location = await options.receivingCatalog?.findReceivingLocation(input.locationId, {
        organizationId: input.organizationId,
        templeId: input.templeId
      });
      const validation = validateReceivingTransactionInput(
        input,
        options.receivingCatalog ? { item: item ?? null, location: location ?? null } : undefined
      );

      if (!validation.ok) {
        throw new ReceivingValidationError(validation.errors);
      }

      return repository.createReceivingTransaction(createReceivingTransaction(input));
    },

    async transferInventory(input) {
      const item = await options.transferCatalog?.findTransferItem(input.itemId, {
        organizationId: input.organizationId
      });
      const sourceLocation = await options.transferCatalog?.findTransferSourceLocation(
        input.sourceLocationId,
        {
          organizationId: input.organizationId,
          templeId: input.templeId
        }
      );
      const destinationLocation = await options.transferCatalog?.findTransferDestinationLocation(
        input.destinationLocationId,
        {
          organizationId: input.organizationId,
          templeId: input.templeId
        }
      );
      const validation = validateTransferTransactionInput(
        input,
        options.transferCatalog
          ? {
              destinationLocation: destinationLocation ?? null,
              item: item ?? null,
              sourceLocation: sourceLocation ?? null
            }
          : undefined
      );

      if (!validation.ok) {
        throw new TransferValidationError(validation.errors);
      }

      return repository.createTransaction(createTransferTransaction(input));
    },

    async undoTransaction(transactionId, input) {
      const originalTransaction = await repository.findTransactionById(transactionId);

      if (!originalTransaction) {
        throw new Error("Inventory transaction was not found.");
      }

      if (originalTransaction.transactionType === "undo") {
        throw new Error("Undo transactions cannot be undone.");
      }

      return repository.createTransaction(createUndoTransaction(originalTransaction, input));
    }
  };
}

export type InventoryTransactionFactory<TInput extends CreateInventoryTransactionInput> = (
  input: TInput
) => InventoryTransactionDraft;
