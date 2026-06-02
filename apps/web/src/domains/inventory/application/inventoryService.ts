import type { EntityId } from "@krishnas-kitchen/types";

import { calculateInventoryBalances } from "../domain/aggregation";
import { createUndoTransaction } from "../domain/transactionHelpers";
import { assertValidInventoryTransactionDraft } from "../domain/validation";
import type {
  CreateInventoryTransactionInput,
  InventoryActor,
  InventoryAuditMetadata,
  InventoryBalance,
  InventoryTransaction,
  InventoryTransactionDraft,
  InventoryTransactionScope
} from "../domain/types";
import type { InventoryTransactionRepository } from "./inventoryRepository";

export type InventoryService = {
  createTransaction: (draft: InventoryTransactionDraft) => Promise<InventoryTransaction>;
  getBalances: (scope: InventoryTransactionScope) => Promise<InventoryBalance[]>;
  getTransactions: (scope: InventoryTransactionScope) => Promise<InventoryTransaction[]>;
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
  repository: InventoryTransactionRepository
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
