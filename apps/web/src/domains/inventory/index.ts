export { createInventoryService } from "./application/inventoryService";
export type { InventoryService } from "./application/inventoryService";
export type { InventoryTransactionRepository } from "./application/inventoryRepository";
export {
  calculateInventoryBalances,
  calculateItemBalance,
  calculateLocationItemBalance
} from "./domain/aggregation";
export {
  createAdjustmentTransaction,
  createConsumedTransaction,
  createReceivedTransaction,
  createReservationTransaction,
  createReturnedTransaction,
  createTransferTransaction,
  createUndoTransaction,
  createWastedTransaction
} from "./domain/transactionHelpers";
export type {
  CreateAdjustmentTransactionInput,
  CreateInventoryTransactionInput,
  CreateLocationTransactionInput,
  CreateTransferTransactionInput,
  InventoryActor,
  InventoryAuditMetadata,
  InventoryBalance,
  InventoryTransaction,
  InventoryTransactionDraft,
  InventoryTransactionScope
} from "./domain/types";
export {
  assertValidInventoryTransactionDraft,
  validateBaseTransactionInput,
  validateInventoryTransactionDraft
} from "./domain/validation";
export { createSupabaseInventoryTransactionRepository } from "./infrastructure/supabase/supabaseInventoryTransactionRepository";
