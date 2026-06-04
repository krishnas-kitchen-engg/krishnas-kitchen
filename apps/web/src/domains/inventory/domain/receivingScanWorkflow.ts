import type { EntityId, ItemUnit } from "@krishnas-kitchen/types";

import type { InventoryActor, InventoryBalance, InventoryTransaction } from "./types";
import type {
  InventoryBarcode,
  InventoryBarcodeItemReference,
  InventoryBarcodeLookupResult,
  InventoryBarcodeScanEvent,
  InventoryBarcodeScanInput
} from "./barcode";
import type { CameraPermissionState } from "./cameraScanning";

export type ReceivingScanPermissionResult =
  | {
      ok: true;
    }
  | {
      permission: CameraPermissionState;
      reason: "permission_not_granted";
      ok: false;
    };

export type ReceivingScanResolutionInput = InventoryBarcodeScanInput & {
  organizationId: EntityId;
  permission: CameraPermissionState;
  recentScans?: readonly InventoryBarcodeScanEvent[];
  scannedAt: string;
};

export type ReceivingManualItemOverrideInput = {
  item: InventoryBarcodeItemReference;
  organizationId: EntityId;
  reason?: string;
};

export type ReceivingResolvedItemSource = "manual_override" | "scan";

export type ReceivingResolvedItem = {
  barcode?: InventoryBarcode;
  item: InventoryBarcodeItemReference;
  organizationId: EntityId;
  source: ReceivingResolvedItemSource;
};

export type ReceivingScanResolutionResult =
  | {
      resolvedItem: ReceivingResolvedItem;
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

export type ReceivingScanReceiveInput = {
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
  resolvedItem: ReceivingResolvedItem;
  templeId: EntityId;
  unit: ItemUnit;
};

export type ReceivingScanReceiveResult = {
  balances: InventoryBalance[];
  receivedTransaction: InventoryTransaction;
  resolvedItem: ReceivingResolvedItem;
};

export function validateReceivingScanPermission(
  permission: CameraPermissionState
): ReceivingScanPermissionResult {
  return permission === "granted"
    ? { ok: true }
    : {
        ok: false,
        permission,
        reason: "permission_not_granted"
      };
}

export function createReceivingManualItemResolution(
  input: ReceivingManualItemOverrideInput
): ReceivingScanResolutionResult {
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
