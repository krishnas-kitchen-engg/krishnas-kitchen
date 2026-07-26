import type { InventoryBarcodeLookupService } from "./barcodeLookupService";
import type { InventoryService } from "./inventoryService";
import type { InventoryVisibilityService } from "./inventoryVisibilityService";
import {
  createConsumptionManualItemResolution,
  validateConsumptionScanPermission,
  type ConsumptionManualItemOverrideInput,
  type ConsumptionScanConsumeInput,
  type ConsumptionScanConsumeResult,
  type ConsumptionScanResolutionInput,
  type ConsumptionScanResolutionResult
} from "../domain/consumptionScanWorkflow";

export type ConsumptionScanWorkflowService = {
  consumeResolvedItem: (
    input: ConsumptionScanConsumeInput
  ) => Promise<ConsumptionScanConsumeResult>;
  resolveManualItem: (
    input: ConsumptionManualItemOverrideInput
  ) => Promise<ConsumptionScanResolutionResult>;
  resolveScan: (input: ConsumptionScanResolutionInput) => Promise<ConsumptionScanResolutionResult>;
};

export function createConsumptionScanWorkflowService(options: {
  barcodeLookupService: InventoryBarcodeLookupService;
  inventoryService: InventoryService;
  visibilityService: InventoryVisibilityService;
}): ConsumptionScanWorkflowService {
  return {
    async consumeResolvedItem(input) {
      const consumedTransaction = await options.inventoryService.consumeInventory({
        actor: input.actor,
        auditMetadata: {
          reason:
            input.resolvedItem.source === "manual_override"
              ? "manual_consumption_item_selection"
              : "barcode_scan_consumption",
          ...input.auditMetadata
        },
        itemId: input.resolvedItem.item.id,
        locationId: input.locationId,
        notes: input.notes,
        organizationId: input.resolvedItem.organizationId,
        quantity: input.quantity,
        templeId: input.templeId,
        unit: input.unit
      });
      const locationBalances = await options.visibilityService.getVisibleBalances({
        itemId: input.resolvedItem.item.id,
        locationId: input.locationId,
        organizationId: input.resolvedItem.organizationId,
        templeId: input.templeId
      });

      return {
        consumedTransaction,
        locationBalances,
        resolvedItem: input.resolvedItem
      };
    },

    resolveManualItem(input) {
      return Promise.resolve(createConsumptionManualItemResolution(input));
    },

    async resolveScan(input) {
      const permission = validateConsumptionScanPermission(input.permission);
      if (!permission.ok) {
        return {
          permission: permission.permission,
          status: "permission_denied"
        };
      }

      const lookupResult = await options.barcodeLookupService.lookupScan(input.organizationId, {
        ...(input.format ? { format: input.format } : {}),
        rawValue: input.rawValue,
        ...(input.recentScans ? { recentScans: input.recentScans } : {}),
        scannedAt: input.scannedAt
      });

      if (lookupResult.status === "duplicate") {
        return {
          duplicateOf: lookupResult.duplicateOf,
          status: "duplicate"
        };
      }

      if (lookupResult.status === "found") {
        return {
          resolvedItem: {
            barcode: lookupResult.barcode,
            item: lookupResult.item,
            organizationId: input.organizationId,
            source: "scan"
          },
          status: "resolved"
        };
      }

      if (lookupResult.status === "invalid") {
        return {
          lookupResult,
          status: "invalid"
        };
      }

      if (lookupResult.status === "unknown") {
        return {
          lookupResult,
          status: "unknown"
        };
      }

      return {
        lookupResult,
        status: "ambiguous"
      };
    }
  };
}
