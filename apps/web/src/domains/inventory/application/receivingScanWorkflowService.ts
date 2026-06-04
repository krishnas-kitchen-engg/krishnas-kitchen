import type { InventoryBarcodeLookupService } from "./barcodeLookupService";
import type { InventoryService } from "./inventoryService";
import type { InventoryVisibilityService } from "./inventoryVisibilityService";
import {
  createReceivingManualItemResolution,
  validateReceivingScanPermission,
  type ReceivingManualItemOverrideInput,
  type ReceivingScanReceiveInput,
  type ReceivingScanReceiveResult,
  type ReceivingScanResolutionInput,
  type ReceivingScanResolutionResult
} from "../domain/receivingScanWorkflow";

export type ReceivingScanWorkflowService = {
  receiveResolvedItem: (input: ReceivingScanReceiveInput) => Promise<ReceivingScanReceiveResult>;
  resolveManualItem: (
    input: ReceivingManualItemOverrideInput
  ) => Promise<ReceivingScanResolutionResult>;
  resolveScan: (input: ReceivingScanResolutionInput) => Promise<ReceivingScanResolutionResult>;
};

export function createReceivingScanWorkflowService(options: {
  barcodeLookupService: InventoryBarcodeLookupService;
  inventoryService: InventoryService;
  visibilityService: InventoryVisibilityService;
}): ReceivingScanWorkflowService {
  return {
    async receiveResolvedItem(input) {
      const receivedTransaction = await options.inventoryService.receiveInventory({
        actor: input.actor,
        auditMetadata: {
          reason:
            input.resolvedItem.source === "manual_override"
              ? "manual_item_override"
              : "barcode_scan_receiving",
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
      const balances = await options.visibilityService.getVisibleBalances({
        itemId: input.resolvedItem.item.id,
        locationId: input.locationId,
        organizationId: input.resolvedItem.organizationId,
        templeId: input.templeId
      });

      return {
        balances,
        receivedTransaction,
        resolvedItem: input.resolvedItem
      };
    },

    resolveManualItem(input) {
      return Promise.resolve(createReceivingManualItemResolution(input));
    },

    async resolveScan(input) {
      const permission = validateReceivingScanPermission(input.permission);
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
