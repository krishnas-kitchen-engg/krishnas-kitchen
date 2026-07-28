export { createInventoryBarcodeLookupService } from "./application/barcodeLookupService";
export { createInventoryBarcodeCatalogService } from "./application/barcodeCatalogService";
export { createCameraScanningService } from "./application/cameraScanningService";
export { createInventoryCatalogQueryService } from "./application/inventoryCatalogQueryService";
export {
  createItemManagementService,
  ITEM_MANAGEMENT_UNITS,
  ItemManagementValidationError
} from "./application/itemManagementService";
export { createLocationManagementService } from "./application/locationManagementService";
export { createInventoryService } from "./application/inventoryService";
export { createInventoryVisibilityService } from "./application/inventoryVisibilityService";
export { createConsumptionScanWorkflowService } from "./application/consumptionScanWorkflowService";
export { createReceivingScanWorkflowService } from "./application/receivingScanWorkflowService";
export { createReturnScanWorkflowService } from "./application/returnScanWorkflowService";
export { createTransferScanWorkflowService } from "./application/transferScanWorkflowService";
export { createUnknownBarcodeManagementService } from "./application/unknownBarcodeService";
export { InventoryIntegrationProvider } from "./integration/InventoryIntegrationContext";
export { InventoryProviderBridge } from "./integration/InventoryProviderBridge";
export {
  useInventoryAvailability,
  useOptionalInventoryServices,
  useInventoryServices
} from "./integration/inventoryServiceHooks";
export { createInventoryServiceBundle } from "./integration/inventoryServiceFactory";
export {
  getInventoryPermissionFlags,
  resolveInventoryActor,
  useCameraScanning,
  useInventoryActor,
  useInventoryBarcodeCatalog,
  useInventoryBarcodeLookup,
  useInventoryCatalogQueries,
  useInventoryPermissions,
  useInventoryVisibility,
  useConsumptionWorkflow,
  useReceivingWorkflow,
  useReturnWorkflow,
  useTransferWorkflow,
  useUnknownBarcodeManagement
} from "./integration/inventoryHooks";
export type {
  InventoryBarcodeLookupRepository,
  InventoryBarcodeLookupService
} from "./application/barcodeLookupService";
export type {
  InventoryBarcodeCatalogItemRepository,
  InventoryBarcodeCatalogRepository,
  InventoryBarcodeCatalogService
} from "./application/barcodeCatalogService";
export type {
  CameraDeviceAdapter,
  CameraPermissionAdapter,
  CameraScanningClock,
  CameraScanningService
} from "./application/cameraScanningService";
export type {
  InventoryCatalogQueryRepository,
  InventoryCatalogQueryService
} from "./application/inventoryCatalogQueryService";
export type {
  CreateManagedItemInput,
  ItemManagementRepository,
  ItemManagementScope,
  ItemManagementService,
  ManagedInventoryItem,
  UpdateManagedItemInput
} from "./application/itemManagementService";
export type {
  CreateManagedLocationInput,
  LocationManagementRepository,
  LocationManagementScope,
  LocationManagementService,
  ManagedInventoryLocation,
  UpdateManagedLocationInput
} from "./application/locationManagementService";
export type { ConsumptionScanWorkflowService } from "./application/consumptionScanWorkflowService";
export type {
  InventoryAdjustmentCatalog,
  InventoryReceivingCatalog,
  InventoryConsumptionCatalog,
  InventoryReturnCatalog,
  InventoryService,
  InventoryTransferCatalog
} from "./application/inventoryService";
export type {
  InventoryLowStockThresholdRepository,
  InventoryVisibilityService
} from "./application/inventoryVisibilityService";
export type { ReceivingScanWorkflowService } from "./application/receivingScanWorkflowService";
export type { ReturnScanWorkflowService } from "./application/returnScanWorkflowService";
export type { TransferScanWorkflowService } from "./application/transferScanWorkflowService";
export type { InventoryTransactionRepository } from "./application/inventoryRepository";
export type {
  UnknownBarcodeItemRepository,
  UnknownBarcodeManagementService,
  UnknownBarcodeRepository
} from "./application/unknownBarcodeService";
export type {
  InventoryAvailabilityContextValue,
  InventoryIntegrationContextValue,
  InventoryProviderStatus
} from "./integration/inventoryContextValue";
export type {
  InventoryCameraAdapters,
  InventoryRepositoryAdapters,
  InventoryServiceBundle,
  InventoryServiceFactoryInput
} from "./integration/inventoryServiceFactory";
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
  archiveBarcodeMapping,
  createBarcodeMappingDraft,
  InventoryBarcodeCatalogValidationError,
  searchBarcodeMappings,
  validateBarcodeMappingArchival,
  validateBarcodeMappingCreation,
  validateBarcodeMappingInput
} from "./domain/barcodeCatalog";
export type {
  ArchiveInventoryBarcodeMappingInput,
  CreateInventoryBarcodeMappingInput,
  InventoryBarcodeCatalogItemReference,
  InventoryBarcodeCatalogValidationErrorCode,
  InventoryBarcodeCatalogValidationErrorDetail,
  InventoryBarcodeCatalogValidationResult,
  InventoryBarcodeMapping,
  InventoryBarcodeMappingDraft,
  InventoryBarcodeMappingSearchQuery,
  InventoryBarcodeMappingStatus,
  InventoryBarcodeMappingValidationResult
} from "./domain/barcodeCatalog";
export {
  filterActiveCatalogItems,
  filterActiveCatalogLocations,
  filterCatalogBarcodes,
  matchesCatalogSearch,
  rankFrequentlyUsedLocations,
  rankRecentItems
} from "./domain/catalog";
export type {
  InventoryCatalogBarcode,
  InventoryCatalogItem,
  InventoryCatalogLocation,
  InventoryCatalogLocationQuery,
  InventoryCatalogSearchQuery,
  InventoryCatalogUsageQuery,
  InventoryFrequentLocation,
  InventoryRecentItem
} from "./domain/catalog";
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
  createConsumptionManualItemResolution,
  validateConsumptionScanPermission
} from "./domain/consumptionScanWorkflow";
export {
  createReceivingManualItemResolution,
  validateReceivingScanPermission
} from "./domain/receivingScanWorkflow";
export {
  createReturnManualItemResolution,
  validateReturnScanPermission
} from "./domain/returnScanWorkflow";
export {
  createTransferManualItemResolution,
  validateTransferScanPermission
} from "./domain/transferScanWorkflow";
export {
  createUnknownBarcodeDraft,
  dismissUnknownBarcode,
  linkUnknownBarcode,
  mergeUnknownBarcodeScan,
  sortUnknownBarcodesForReview,
  UnknownBarcodeValidationError,
  validateUnknownBarcodeDismissal,
  validateUnknownBarcodeLink,
  validateUnknownBarcodePending,
  validateUnknownBarcodeScanInput
} from "./domain/unknownBarcode";
export type {
  ConsumptionManualItemOverrideInput,
  ConsumptionResolvedItem,
  ConsumptionResolvedItemSource,
  ConsumptionScanConsumeInput,
  ConsumptionScanConsumeResult,
  ConsumptionScanPermissionResult,
  ConsumptionScanResolutionInput,
  ConsumptionScanResolutionResult
} from "./domain/consumptionScanWorkflow";
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
  ReturnManualItemOverrideInput,
  ReturnResolvedItem,
  ReturnResolvedItemSource,
  ReturnScanPermissionResult,
  ReturnScanResolutionInput,
  ReturnScanResolutionResult,
  ReturnScanReturnInput,
  ReturnScanReturnResult
} from "./domain/returnScanWorkflow";
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
export type {
  DismissUnknownBarcodeInput,
  LinkUnknownBarcodeInput,
  RecordUnknownBarcodeInput,
  UnknownBarcodeDraft,
  UnknownBarcodeItemReference,
  UnknownBarcodeQuery,
  UnknownBarcodeRecord,
  UnknownBarcodeStatus,
  UnknownBarcodeValidationErrorCode,
  UnknownBarcodeValidationErrorDetail,
  UnknownBarcodeValidationResult,
  UnknownBarcodeWorkflowContext
} from "./domain/unknownBarcode";
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
  createInventoryAdjustmentTransaction,
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
  CreateInventoryAdjustmentInput,
  CreateConsumptionTransactionInput,
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
  ADJUSTMENT_MAX_PHYSICAL_QUANTITY,
  ADJUSTMENT_UNITS,
  AdjustmentValidationError,
  assertValidInventoryAdjustmentInput,
  validateAdjustmentItem,
  validateAdjustmentLocation,
  validateAdjustmentPhysicalQuantity,
  validateAdjustmentReason,
  validateAdjustmentUnit,
  validateInventoryAdjustmentInput
} from "./domain/adjustmentValidation";
export type {
  AdjustmentValidationErrorCode,
  AdjustmentValidationErrorDetail,
  AdjustmentValidationResult
} from "./domain/adjustmentValidation";
export {
  assertValidConsumptionTransactionInput,
  CONSUMPTION_MAX_QUANTITY,
  CONSUMPTION_UNITS,
  ConsumptionValidationError,
  validateConsumptionItem,
  validateConsumptionLocation,
  validateConsumptionQuantity,
  validateConsumptionTransactionInput,
  validateConsumptionUnit
} from "./domain/consumptionValidation";
export type {
  ConsumptionValidationErrorCode,
  ConsumptionValidationErrorDetail,
  ConsumptionValidationResult
} from "./domain/consumptionValidation";
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
export {
  createSupabaseInventoryRepositoryAdapters,
  UnsupportedInventoryRepositoryAdapterError
} from "./infrastructure/supabase/supabaseInventoryRepositoryAdapters";
export { createSupabaseInventoryTransactionRepository } from "./infrastructure/supabase/supabaseInventoryTransactionRepository";
export { createSupabaseItemManagementRepository } from "./infrastructure/supabase/supabaseItemManagementRepository";
export { createSupabaseLocationManagementRepository } from "./infrastructure/supabase/supabaseLocationManagementRepository";
