import {
  createInventoryBarcodeCatalogService,
  type InventoryBarcodeCatalogItemRepository,
  type InventoryBarcodeCatalogRepository,
  type InventoryBarcodeCatalogService
} from "../application/barcodeCatalogService";
import {
  createInventoryBarcodeLookupService,
  type InventoryBarcodeLookupRepository,
  type InventoryBarcodeLookupService
} from "../application/barcodeLookupService";
import {
  createCameraScanningService,
  type CameraDeviceAdapter,
  type CameraPermissionAdapter,
  type CameraScanningClock,
  type CameraScanningService
} from "../application/cameraScanningService";
import {
  createInventoryCatalogQueryService,
  type InventoryCatalogQueryRepository,
  type InventoryCatalogQueryService
} from "../application/inventoryCatalogQueryService";
import type { InventoryTransactionRepository } from "../application/inventoryRepository";
import { createInventoryService, type InventoryService } from "../application/inventoryService";
import {
  createConsumptionScanWorkflowService,
  type ConsumptionScanWorkflowService
} from "../application/consumptionScanWorkflowService";
import {
  createInventoryVisibilityService,
  type InventoryLowStockThresholdRepository,
  type InventoryVisibilityService
} from "../application/inventoryVisibilityService";
import {
  createReceivingScanWorkflowService,
  type ReceivingScanWorkflowService
} from "../application/receivingScanWorkflowService";
import {
  createReturnScanWorkflowService,
  type ReturnScanWorkflowService
} from "../application/returnScanWorkflowService";
import {
  createTransferScanWorkflowService,
  type TransferScanWorkflowService
} from "../application/transferScanWorkflowService";
import {
  createUnknownBarcodeManagementService,
  type UnknownBarcodeItemRepository,
  type UnknownBarcodeManagementService,
  type UnknownBarcodeRepository
} from "../application/unknownBarcodeService";

export type InventoryRepositoryAdapters = {
  barcodeCatalogItemRepository: InventoryBarcodeCatalogItemRepository;
  barcodeCatalogRepository: InventoryBarcodeCatalogRepository;
  barcodeLookupRepository: InventoryBarcodeLookupRepository;
  catalogQueryRepository: InventoryCatalogQueryRepository;
  lowStockThresholdRepository: InventoryLowStockThresholdRepository;
  transactionRepository: InventoryTransactionRepository;
  unknownBarcodeItemRepository: UnknownBarcodeItemRepository;
  unknownBarcodeRepository: UnknownBarcodeRepository;
};

export type InventoryCameraAdapters = {
  cameraDevice: CameraDeviceAdapter;
  clock?: CameraScanningClock;
  permission: CameraPermissionAdapter;
};

export type InventoryServiceFactoryInput = {
  cameraAdapters?: InventoryCameraAdapters;
  repositories: InventoryRepositoryAdapters;
};

export type InventoryServiceBundle = {
  barcodeCatalog: InventoryBarcodeCatalogService;
  barcodeLookup: InventoryBarcodeLookupService;
  cameraScanning: CameraScanningService | null;
  catalogQueries: InventoryCatalogQueryService;
  consumptionWorkflow: ConsumptionScanWorkflowService;
  inventory: InventoryService;
  receivingWorkflow: ReceivingScanWorkflowService;
  returnWorkflow: ReturnScanWorkflowService;
  transferWorkflow: TransferScanWorkflowService;
  unknownBarcodes: UnknownBarcodeManagementService;
  visibility: InventoryVisibilityService;
};

export function createInventoryServiceBundle(
  input: InventoryServiceFactoryInput
): InventoryServiceBundle {
  const catalogQueries = createInventoryCatalogQueryService({
    catalogRepository: input.repositories.catalogQueryRepository,
    transactionRepository: input.repositories.transactionRepository
  });
  const inventory = createInventoryService(input.repositories.transactionRepository, {
    adjustmentCatalog: {
      async findAdjustmentItem(itemId, scope) {
        const item = await catalogQueries.findItemById(scope.organizationId, itemId);

        return item
          ? {
              defaultUnit: item.defaultUnit,
              deletedAt: item.deletedAt,
              id: item.id,
              organizationId: item.organizationId
            }
          : null;
      },
      async findAdjustmentLocation(locationId, scope) {
        const location = await catalogQueries.findLocationById(
          scope.organizationId,
          scope.templeId,
          locationId
        );

        return location
          ? {
              deletedAt: location.deletedAt,
              id: location.id,
              organizationId: location.organizationId,
              templeId: location.templeId
            }
          : null;
      }
    },
    consumptionCatalog: {
      async findConsumptionItem(itemId, scope) {
        const item = await catalogQueries.findItemById(scope.organizationId, itemId);

        return item
          ? {
              defaultUnit: item.defaultUnit,
              deletedAt: item.deletedAt,
              id: item.id,
              organizationId: item.organizationId,
              ...(item.consumptionUnits ? { consumptionUnits: item.consumptionUnits } : {})
            }
          : null;
      },
      async findConsumptionLocation(locationId, scope) {
        const location = await catalogQueries.findLocationById(
          scope.organizationId,
          scope.templeId,
          locationId
        );

        return location
          ? {
              deletedAt: location.deletedAt,
              id: location.id,
              organizationId: location.organizationId,
              templeId: location.templeId
            }
          : null;
      }
    },
    receivingCatalog: {
      async findReceivingItem(itemId, scope) {
        const item = await catalogQueries.findItemById(scope.organizationId, itemId);

        return item
          ? {
              defaultUnit: item.defaultUnit,
              deletedAt: item.deletedAt,
              id: item.id,
              organizationId: item.organizationId,
              ...(item.receivingUnits ? { receivingUnits: item.receivingUnits } : {})
            }
          : null;
      },
      async findReceivingLocation(locationId, scope) {
        const location = await catalogQueries.findLocationById(
          scope.organizationId,
          scope.templeId,
          locationId
        );

        return location
          ? {
              deletedAt: location.deletedAt,
              id: location.id,
              organizationId: location.organizationId,
              templeId: location.templeId
            }
          : null;
      }
    }
  });
  const visibility = createInventoryVisibilityService(input.repositories.transactionRepository, {
    lowStockThresholdRepository: input.repositories.lowStockThresholdRepository
  });
  const barcodeLookup = createInventoryBarcodeLookupService(
    input.repositories.barcodeLookupRepository
  );
  const barcodeCatalog = createInventoryBarcodeCatalogService({
    barcodeRepository: input.repositories.barcodeCatalogRepository,
    itemRepository: input.repositories.barcodeCatalogItemRepository
  });
  const unknownBarcodes = createUnknownBarcodeManagementService({
    itemRepository: input.repositories.unknownBarcodeItemRepository,
    unknownBarcodeRepository: input.repositories.unknownBarcodeRepository
  });
  const receivingWorkflow = createReceivingScanWorkflowService({
    barcodeLookupService: barcodeLookup,
    inventoryService: inventory,
    visibilityService: visibility
  });
  const transferWorkflow = createTransferScanWorkflowService({
    barcodeLookupService: barcodeLookup,
    inventoryService: inventory,
    visibilityService: visibility
  });
  const returnWorkflow = createReturnScanWorkflowService({
    barcodeLookupService: barcodeLookup,
    inventoryService: inventory,
    visibilityService: visibility
  });
  const consumptionWorkflow = createConsumptionScanWorkflowService({
    barcodeLookupService: barcodeLookup,
    inventoryService: inventory,
    visibilityService: visibility
  });
  const cameraScanning = input.cameraAdapters
    ? createCameraScanningService({
        barcodeLookupService: barcodeLookup,
        cameraDevice: input.cameraAdapters.cameraDevice,
        ...(input.cameraAdapters.clock ? { clock: input.cameraAdapters.clock } : {}),
        permission: input.cameraAdapters.permission
      })
    : null;

  return {
    barcodeCatalog,
    barcodeLookup,
    cameraScanning,
    catalogQueries,
    consumptionWorkflow,
    inventory,
    receivingWorkflow,
    returnWorkflow,
    transferWorkflow,
    unknownBarcodes,
    visibility
  };
}
