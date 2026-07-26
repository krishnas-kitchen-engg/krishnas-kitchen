import type { EntityId, ItemUnit } from "@krishnas-kitchen/types";

import type {
  InventoryBarcode,
  InventoryBarcodeItemReference,
  InventoryBarcodeLookupResult,
  InventoryBarcodeScanEvent,
  InventoryBarcodeScanInput
} from "./barcode";
import type { CameraPermissionState } from "./cameraScanning";
import type { InventoryActor, InventoryBalance, InventoryTransaction } from "./types";

export type ConsumptionScanPermissionResult =
  | {
      ok: true;
    }
  | {
      permission: CameraPermissionState;
      reason: "permission_not_granted";
      ok: false;
    };

export type ConsumptionScanResolutionInput = InventoryBarcodeScanInput & {
  organizationId: EntityId;
  permission: CameraPermissionState;
  recentScans?: readonly InventoryBarcodeScanEvent[];
  scannedAt: string;
};

export type ConsumptionManualItemOverrideInput = {
  item: InventoryBarcodeItemReference;
  organizationId: EntityId;
  reason?: string;
};

export type ConsumptionResolvedItemSource = "manual_override" | "scan";

export type ConsumptionResolvedItem = {
  barcode?: InventoryBarcode;
  item: InventoryBarcodeItemReference;
  organizationId: EntityId;
  source: ConsumptionResolvedItemSource;
};

export type ConsumptionScanResolutionResult =
  | {
      resolvedItem: ConsumptionResolvedItem;
      status: "resolved";
    }
  | {
      duplicateOf: InventoryBarcodeScanEvent;
      status: "duplicate";
    }
  | {
      lookupResult: Extract<InventoryBarcodeLookupResult, { status: "invalid" }>;
      status: "invalid";
    }
  | {
      lookupResult: Extract<InventoryBarcodeLookupResult, { status: "unknown" }>;
      status: "unknown";
    }
  | {
      lookupResult: Extract<InventoryBarcodeLookupResult, { status: "ambiguous" }>;
      status: "ambiguous";
    }
  | {
      permission: CameraPermissionState;
      status: "permission_denied";
    };

export type ConsumptionScanConsumeInput = {
  actor: InventoryActor;
  auditMetadata?: {
    clientRequestId?: string;
    deviceId?: string;
    reason?: string;
    source?: "online" | "offline_queue" | "system";
  };
  locationId: EntityId;
  notes?: string;
  quantity: number;
  resolvedItem: ConsumptionResolvedItem;
  templeId: EntityId;
  unit: ItemUnit;
};

export type ConsumptionScanConsumeResult = {
  consumedTransaction: InventoryTransaction;
  locationBalances: InventoryBalance[];
  resolvedItem: ConsumptionResolvedItem;
};

export function validateConsumptionScanPermission(
  permission: CameraPermissionState
): ConsumptionScanPermissionResult {
  return permission === "granted"
    ? { ok: true }
    : {
        ok: false,
        permission,
        reason: "permission_not_granted"
      };
}

export function createConsumptionManualItemResolution(
  input: ConsumptionManualItemOverrideInput
): ConsumptionScanResolutionResult {
  if (input.item.organizationId !== input.organizationId || input.item.deletedAt) {
    return {
      lookupResult: {
        barcode: {
          format: "qr",
          value: input.item.id
        },
        status: "unknown"
      },
      status: "unknown"
    };
  }

  return {
    resolvedItem: {
      item: input.item,
      organizationId: input.organizationId,
      source: "manual_override"
    },
    status: "resolved"
  };
}
