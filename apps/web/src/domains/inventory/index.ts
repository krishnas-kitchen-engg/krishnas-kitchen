export { createInventoryService } from "./application/inventoryService";
export type {
  InventoryReceivingCatalog,
  InventoryService,
  InventoryTransferCatalog
} from "./application/inventoryService";
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
  InventoryTransactionScope,
  ReceivingInventoryTransactionDraft,
  TransferInventoryTransactionDraft
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
  assertValidTransferTransactionInput,
  TRANSFER_MAX_QUANTITY,
  TRANSFER_UNITS,
  TransferValidationError,
  validateTransferDestinationLocation,
  validateTransferItem,
  validateTransferQuantity,
  validateTransferSourceLocation,
  validateTransferTransactionInput,
  validateTransferUnit
} from "./domain/transferValidation";
export type {
  TransferValidationErrorCode,
  TransferValidationErrorDetail,
  TransferValidationResult
} from "./domain/transferValidation";
export {
  assertValidInventoryTransactionDraft,
  validateBaseTransactionInput,
  validateInventoryTransactionDraft
} from "./domain/validation";
export {
  assertPersistableReceivingTransactionDraft,
  InventoryPersistenceError,
  mapReceivingTransactionDraftToInsert
} from "./infrastructure/supabase/receivingPersistence";
export { createSupabaseInventoryTransactionRepository } from "./infrastructure/supabase/supabaseInventoryTransactionRepository";
