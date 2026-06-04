import type { EntityId } from "@krishnas-kitchen/types";

import {
  shouldSuppressDuplicateBarcodeScan,
  validateBarcode,
  type InventoryBarcode,
  type InventoryBarcodeItemReference,
  type InventoryBarcodeLookupResult,
  type InventoryBarcodeScanEvent,
  type InventoryBarcodeScanInput
} from "../domain/barcode";

export type InventoryBarcodeLookupRepository = {
  findItemsByBarcode: (
    organizationId: EntityId,
    barcode: InventoryBarcode
  ) => Promise<readonly InventoryBarcodeItemReference[]>;
};

export type InventoryBarcodeLookupService = {
  lookupBarcode: (
    organizationId: EntityId,
    input: InventoryBarcodeScanInput
  ) => Promise<InventoryBarcodeLookupResult>;
  lookupScan: (
    organizationId: EntityId,
    input: InventoryBarcodeScanInput & {
      recentScans?: readonly InventoryBarcodeScanEvent[];
      scannedAt: string;
    }
  ) => Promise<
    InventoryBarcodeLookupResult | { status: "duplicate"; duplicateOf: InventoryBarcodeScanEvent }
  >;
};

export function createInventoryBarcodeLookupService(
  repository: InventoryBarcodeLookupRepository
): InventoryBarcodeLookupService {
  async function lookupBarcode(
    organizationId: EntityId,
    input: InventoryBarcodeScanInput
  ): Promise<InventoryBarcodeLookupResult> {
    const validation = validateBarcode(input);

    if (!validation.ok) {
      return {
        errors: validation.errors,
        rawValue: input.rawValue,
        status: "invalid"
      };
    }

    const items = (await repository.findItemsByBarcode(organizationId, validation.barcode)).filter(
      (item) => item.organizationId === organizationId && !item.deletedAt
    );

    if (items.length === 0) {
      return {
        barcode: validation.barcode,
        status: "unknown"
      };
    }

    if (items.length > 1) {
      return {
        barcode: validation.barcode,
        items,
        status: "ambiguous"
      };
    }

    const item = items[0];
    if (!item) {
      return {
        barcode: validation.barcode,
        status: "unknown"
      };
    }

    return {
      barcode: validation.barcode,
      item,
      status: "found"
    };
  }

  return {
    lookupBarcode,

    async lookupScan(organizationId, input) {
      const validation = validateBarcode(input);

      if (!validation.ok) {
        return {
          errors: validation.errors,
          rawValue: input.rawValue,
          status: "invalid"
        };
      }

      const duplicateCheck = shouldSuppressDuplicateBarcodeScan(
        {
          barcode: validation.barcode,
          scannedAt: input.scannedAt
        },
        input.recentScans ?? []
      );

      if (!duplicateCheck.ok) {
        return {
          duplicateOf: duplicateCheck.duplicateOf,
          status: "duplicate"
        };
      }

      return lookupBarcode(organizationId, input);
    }
  };
}
