import type { EntityId } from "@krishnas-kitchen/types";

import type {
  InventoryTransaction,
  InventoryTransactionDraft,
  InventoryTransactionScope,
  ReceivingInventoryTransactionDraft
} from "../domain/types";

export type InventoryTransactionRepository = {
  createReceivingTransaction: (
    draft: ReceivingInventoryTransactionDraft
  ) => Promise<InventoryTransaction>;
  createTransaction: (draft: InventoryTransactionDraft) => Promise<InventoryTransaction>;
  findTransactionById: (id: EntityId) => Promise<InventoryTransaction | null>;
  listTransactions: (scope: InventoryTransactionScope) => Promise<InventoryTransaction[]>;
};
