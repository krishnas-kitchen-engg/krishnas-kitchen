export { createInventoryService } from "./application/inventoryService";
export { createInventoryVisibilityService } from "./application/inventoryVisibilityService";
export type {
  InventoryReceivingCatalog,
  InventoryReturnCatalog,
  InventoryService,
  InventoryTransferCatalog
} from "./application/inventoryService";
export type { InventoryVisibilityService } from "./application/inventoryVisibilityService";
export type { InventoryTransactionRepository } from "./application/inventoryRepository";
export {
  calculateInventoryBalances,
  calculateItemBalance,
  calculateLocationItemBalance
} from "./domain/aggregation";
export {
  detectLowStock,
  projectInventoryBalances,
  projectInventorySummary,
  projectItemBalances,
  projectLocationBalances,
  projectTransactionHistory
} from "./domain/visibility";
export {
  createAdjustmentTransaction,
  createConsumedTransaction,
  createReceivedTransaction,
  createReceivingTransaction,
  createReservationTransaction,
  createReversalTransaction,
  createReturnedTransaction,
  createTransferTransaction,
  getReversalTargetId,
  createWastedTransaction
} from "./domain/transactionHelpers";
export type {
  CreateAdjustmentTransactionInput,
  CreateInventoryTransactionInput,
  CreateLocationTransactionInput,
  CreateReceivingTransactionInput,
  CreateReversalTransactionInput,
  CreateReturnTransactionInput,
  CreateTransferTransactionInput,
  InventoryActor,
  InventoryAuditMetadata,
  InventoryBalance,
  InventoryItemBalance,
  InventoryItemReference,
  InventoryLocationBalance,
  InventoryLocationReference,
  InventoryLowStockAlert,
  InventoryLowStockThreshold,
  InventorySummaryProjection,
  InventoryTransaction,
  InventoryTransactionDraft,
  InventoryTransactionHistoryQuery,
  InventoryTransactionScope,
  ReceivingInventoryTransactionDraft,
  ReversalInventoryTransactionDraft,
  ReturnInventoryTransactionDraft,
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
  assertValidReversalTransactionInput,
  ReversalValidationError,
  validateReversalEligibility,
  validateReversalTransactionInput
} from "./domain/reversalValidation";
export type {
  ReversalValidationErrorCode,
  ReversalValidationErrorDetail,
  ReversalValidationResult,
  ReversibleInventoryTransaction
} from "./domain/reversalValidation";
export {
  assertValidReturnTransactionInput,
  RETURN_MAX_QUANTITY,
  RETURN_UNITS,
  ReturnValidationError,
  validateReturnDestinationLocation,
  validateReturnItem,
  validateReturnQuantity,
  validateReturnSourceLocation,
  validateReturnTransactionInput,
  validateReturnUnit
} from "./domain/returnValidation";
export type {
  ReturnValidationErrorCode,
  ReturnValidationErrorDetail,
  ReturnValidationResult
} from "./domain/returnValidation";
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
