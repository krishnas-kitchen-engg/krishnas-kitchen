import type { EntityId } from "@krishnas-kitchen/types";

import type {
  InventoryTransaction,
  InventoryTransactionDraft,
  InventoryTransactionScope
} from "../domain/types";

export type InventoryTransactionRepository = {
  createTransaction: (draft: InventoryTransactionDraft) => Promise<InventoryTransaction>;
  findTransactionById: (id: EntityId) => Promise<InventoryTransaction | null>;
  listTransactions: (scope: InventoryTransactionScope) => Promise<InventoryTransaction[]>;
};
