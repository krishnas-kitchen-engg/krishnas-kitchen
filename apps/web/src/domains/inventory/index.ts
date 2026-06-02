export { createInventoryService } from "./application/inventoryService";
export type { InventoryReceivingCatalog, InventoryService } from "./application/inventoryService";
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
  createReceivingTransaction,
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
} from "./domain/types";
export {
  assertValidReceivingTransactionInput,
  RECEIVING_MAX_QUANTITY,
  RECEIVING_UNITS,
  ReceivingValidationError,
  validateReceivingItem,
  validateReceivingLocation,
  validateReceivingQuantity,
  validateReceivingTransactionInput,
  validateReceivingUnit
} from "./domain/receivingValidation";
export type {
  ReceivingValidationErrorCode,
  ReceivingValidationErrorDetail,
  ReceivingValidationResult
} from "./domain/receivingValidation";
export {
  assertValidInventoryTransactionDraft,
  validateBaseTransactionInput,
  validateInventoryTransactionDraft
} from "./domain/validation";
export { createSupabaseInventoryTransactionRepository } from "./infrastructure/supabase/supabaseInventoryTransactionRepository";
