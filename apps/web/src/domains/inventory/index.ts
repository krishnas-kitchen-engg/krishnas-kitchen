export { createInventoryBarcodeLookupService } from "./application/barcodeLookupService";
export { createCameraScanningService } from "./application/cameraScanningService";
export { createInventoryService } from "./application/inventoryService";
export { createInventoryVisibilityService } from "./application/inventoryVisibilityService";
export { createReceivingScanWorkflowService } from "./application/receivingScanWorkflowService";
export { createTransferScanWorkflowService } from "./application/transferScanWorkflowService";
export type {
  InventoryBarcodeLookupRepository,
  InventoryBarcodeLookupService
} from "./application/barcodeLookupService";
export type {
  CameraDeviceAdapter,
  CameraPermissionAdapter,
  CameraScanningClock,
  CameraScanningService
} from "./application/cameraScanningService";
export type {
  InventoryReceivingCatalog,
  InventoryReturnCatalog,
  InventoryService,
  InventoryTransferCatalog
} from "./application/inventoryService";
export type { InventoryVisibilityService } from "./application/inventoryVisibilityService";
export type { ReceivingScanWorkflowService } from "./application/receivingScanWorkflowService";
export type { TransferScanWorkflowService } from "./application/transferScanWorkflowService";
export type { InventoryTransactionRepository } from "./application/inventoryRepository";
export {
  calculateInventoryBalances,
  calculateItemBalance,
  calculateLocationItemBalance
} from "./domain/aggregation";
export {
  inferBarcodeFormats,
  normalizeBarcode,
  shouldSuppressDuplicateBarcodeScan,
  validateBarcode,
  validateBarcodeCandidates
} from "./domain/barcode";
export type {
  BarcodeValidationErrorCode,
  BarcodeValidationErrorDetail,
  BarcodeValidationResult,
  DuplicateBarcodeScanResult,
  InventoryBarcode,
  InventoryBarcodeFormat,
  InventoryBarcodeItemReference,
  InventoryBarcodeLookupQuery,
  InventoryBarcodeLookupResult,
  InventoryBarcodeScanEvent,
  InventoryBarcodeScanInput
} from "./domain/barcode";
export {
  addCameraScanEvent,
  createCameraScanSession,
  markCameraSessionActive,
  markCameraSessionStopped,
  updateCameraSessionTorch
} from "./domain/cameraScanning";
export type {
  CameraPermissionState,
  CameraScanEventInput,
  CameraScanIgnoredReason,
  CameraScanProcessingResult,
  CameraScanSession,
  CameraScanSessionInput,
  CameraScanSessionStatus,
  CameraTorchState
} from "./domain/cameraScanning";
export {
  createReceivingManualItemResolution,
  validateReceivingScanPermission
} from "./domain/receivingScanWorkflow";
export {
  createTransferManualItemResolution,
  validateTransferScanPermission
} from "./domain/transferScanWorkflow";
export type {
  ReceivingManualItemOverrideInput,
  ReceivingResolvedItem,
  ReceivingResolvedItemSource,
  ReceivingScanPermissionResult,
  ReceivingScanReceiveInput,
  ReceivingScanReceiveResult,
  ReceivingScanResolutionInput,
  ReceivingScanResolutionResult
} from "./domain/receivingScanWorkflow";
export type {
  TransferManualItemOverrideInput,
  TransferResolvedItem,
  TransferResolvedItemSource,
  TransferScanPermissionResult,
  TransferScanResolutionInput,
  TransferScanResolutionResult,
  TransferScanTransferInput,
  TransferScanTransferResult
} from "./domain/transferScanWorkflow";
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
