import type { InventoryBarcodeLookupService } from "./barcodeLookupService";
import type { InventoryService } from "./inventoryService";
import type { InventoryVisibilityService } from "./inventoryVisibilityService";
import {
  createTransferManualItemResolution,
  validateTransferScanPermission,
  type TransferManualItemOverrideInput,
  type TransferScanResolutionInput,
  type TransferScanResolutionResult,
  type TransferScanTransferInput,
  type TransferScanTransferResult
} from "../domain/transferScanWorkflow";

export type TransferScanWorkflowService = {
  resolveManualItem: (
    input: TransferManualItemOverrideInput
  ) => Promise<TransferScanResolutionResult>;
  resolveScan: (input: TransferScanResolutionInput) => Promise<TransferScanResolutionResult>;
  transferResolvedItem: (input: TransferScanTransferInput) => Promise<TransferScanTransferResult>;
};

export function createTransferScanWorkflowService(options: {
  barcodeLookupService: InventoryBarcodeLookupService;
  inventoryService: InventoryService;
  visibilityService: InventoryVisibilityService;
}): TransferScanWorkflowService {
  return {
    resolveManualItem(input) {
      return Promise.resolve(createTransferManualItemResolution(input));
    },

    async resolveScan(input) {
      const permission = validateTransferScanPermission(input.permission);
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
    },

    async transferResolvedItem(input) {
      const transferTransaction = await options.inventoryService.transferInventory({
        actor: input.actor,
        auditMetadata: {
          reason:
            input.resolvedItem.source === "manual_override"
              ? "manual_item_override"
              : "barcode_scan_transfer",
          ...input.auditMetadata
        },
        destinationLocationId: input.destinationLocationId,
        itemId: input.resolvedItem.item.id,
        notes: input.notes,
        organizationId: input.resolvedItem.organizationId,
        quantity: input.quantity,
        sourceLocationId: input.sourceLocationId,
        templeId: input.templeId,
        unit: input.unit
      });
      const [sourceBalances, destinationBalances] = await Promise.all([
        options.visibilityService.getVisibleBalances({
          itemId: input.resolvedItem.item.id,
          locationId: input.sourceLocationId,
          organizationId: input.resolvedItem.organizationId,
          templeId: input.templeId
        }),
        options.visibilityService.getVisibleBalances({
          itemId: input.resolvedItem.item.id,
          locationId: input.destinationLocationId,
          organizationId: input.resolvedItem.organizationId,
          templeId: input.templeId
        })
      ]);

      return {
        destinationBalances,
        resolvedItem: input.resolvedItem,
        sourceBalances,
        transferTransaction
      };
    }
  };
}
