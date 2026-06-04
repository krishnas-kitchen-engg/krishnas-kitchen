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

export type ReturnScanPermissionResult =
  | {
      ok: true;
    }
  | {
      permission: CameraPermissionState;
      reason: "permission_not_granted";
      ok: false;
    };

export type ReturnScanResolutionInput = InventoryBarcodeScanInput & {
  organizationId: EntityId;
  permission: CameraPermissionState;
  recentScans?: readonly InventoryBarcodeScanEvent[];
  scannedAt: string;
};

export type ReturnManualItemOverrideInput = {
  item: InventoryBarcodeItemReference;
  organizationId: EntityId;
  reason?: string;
};

export type ReturnResolvedItemSource = "manual_override" | "scan";

export type ReturnResolvedItem = {
  barcode?: InventoryBarcode;
  item: InventoryBarcodeItemReference;
  organizationId: EntityId;
  source: ReturnResolvedItemSource;
};

export type ReturnScanResolutionResult =
  | {
      resolvedItem: ReturnResolvedItem;
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

export type ReturnScanReturnInput = {
  actor: InventoryActor;
  auditMetadata?: {
    clientRequestId?: string;
    deviceId?: string;
    reason?: string;
    source?: "online" | "offline_queue" | "system";
  };
  destinationLocationId: EntityId;
  notes?: string;
  quantity: number;
  resolvedItem: ReturnResolvedItem;
  sourceLocationId: EntityId;
  templeId: EntityId;
  unit: ItemUnit;
};

export type ReturnScanReturnResult = {
  destinationBalances: InventoryBalance[];
  resolvedItem: ReturnResolvedItem;
  returnedTransaction: InventoryTransaction;
  sourceBalances: InventoryBalance[];
};

export function validateReturnScanPermission(
  permission: CameraPermissionState
): ReturnScanPermissionResult {
  return permission === "granted"
    ? { ok: true }
    : {
        ok: false,
        permission,
        reason: "permission_not_granted"
      };
}

export function createReturnManualItemResolution(
  input: ReturnManualItemOverrideInput
): ReturnScanResolutionResult {
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
