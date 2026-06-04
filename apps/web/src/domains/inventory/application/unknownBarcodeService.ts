import type { EntityId } from "@krishnas-kitchen/types";

import type { InventoryBarcode } from "../domain/barcode";
import {
  createUnknownBarcodeDraft,
  dismissUnknownBarcode,
  linkUnknownBarcode,
  mergeUnknownBarcodeScan,
  sortUnknownBarcodesForReview,
  UnknownBarcodeValidationError,
  validateUnknownBarcodeDismissal,
  validateUnknownBarcodeLink,
  validateUnknownBarcodeScanInput,
  type DismissUnknownBarcodeInput,
  type LinkUnknownBarcodeInput,
  type RecordUnknownBarcodeInput,
  type UnknownBarcodeItemReference,
  type UnknownBarcodeQuery,
  type UnknownBarcodeRecord
} from "../domain/unknownBarcode";

export type UnknownBarcodeRepository = {
  createUnknownBarcode: (
    draft: ReturnType<typeof createUnknownBarcodeDraft>
  ) => Promise<UnknownBarcodeRecord>;
  findPendingUnknownBarcodeByBarcode: (
    organizationId: EntityId,
    barcode: InventoryBarcode
  ) => Promise<UnknownBarcodeRecord | null>;
  findUnknownBarcodeById: (id: EntityId) => Promise<UnknownBarcodeRecord | null>;
  listUnknownBarcodes: (query: UnknownBarcodeQuery) => Promise<readonly UnknownBarcodeRecord[]>;
  updateUnknownBarcode: (record: UnknownBarcodeRecord) => Promise<UnknownBarcodeRecord>;
};

export type UnknownBarcodeItemRepository = {
  findItemForBarcodeLinking: (
    itemId: EntityId,
    organizationId: EntityId
  ) => Promise<UnknownBarcodeItemReference | null>;
};

export type UnknownBarcodeManagementService = {
  dismissUnknownBarcode: (
    unknownBarcodeId: EntityId,
    input: DismissUnknownBarcodeInput
  ) => Promise<UnknownBarcodeRecord>;
  linkUnknownBarcode: (
    unknownBarcodeId: EntityId,
    input: Omit<LinkUnknownBarcodeInput, "item"> & {
      itemId: EntityId;
    }
  ) => Promise<UnknownBarcodeRecord>;
  listPendingUnknownBarcodes: (
    query: Omit<UnknownBarcodeQuery, "status">
  ) => Promise<UnknownBarcodeRecord[]>;
  recordUnknownBarcode: (input: RecordUnknownBarcodeInput) => Promise<UnknownBarcodeRecord>;
};

export function createUnknownBarcodeManagementService(options: {
  itemRepository: UnknownBarcodeItemRepository;
  unknownBarcodeRepository: UnknownBarcodeRepository;
}): UnknownBarcodeManagementService {
  return {
    async dismissUnknownBarcode(unknownBarcodeId, input) {
      const record =
        await options.unknownBarcodeRepository.findUnknownBarcodeById(unknownBarcodeId);
      const validation = validateUnknownBarcodeDismissal(record, input);

      if (!validation.ok) {
        throw new UnknownBarcodeValidationError(validation.errors);
      }

      if (!record) {
        throw new Error("Validated unknown barcode record is missing.");
      }

      return options.unknownBarcodeRepository.updateUnknownBarcode(
        dismissUnknownBarcode(record, input)
      );
    },

    async linkUnknownBarcode(unknownBarcodeId, input) {
      const [record, item] = await Promise.all([
        options.unknownBarcodeRepository.findUnknownBarcodeById(unknownBarcodeId),
        options.itemRepository.findItemForBarcodeLinking(input.itemId, input.organizationId)
      ]);
      const validation = validateUnknownBarcodeLink(record, {
        ...input,
        item
      });

      if (!validation.ok) {
        throw new UnknownBarcodeValidationError(validation.errors);
      }

      if (!record || !item) {
        throw new Error("Validated unknown barcode link target is missing.");
      }

      return options.unknownBarcodeRepository.updateUnknownBarcode(
        linkUnknownBarcode(record, {
          ...input,
          item
        })
      );
    },

    async listPendingUnknownBarcodes(query) {
      const records = await options.unknownBarcodeRepository.listUnknownBarcodes({
        ...query,
        status: "pending"
      });

      return sortUnknownBarcodesForReview(records, {
        ...query,
        status: "pending"
      });
    },

    async recordUnknownBarcode(input) {
      const validation = validateUnknownBarcodeScanInput(input);

      if (!validation.ok) {
        throw new UnknownBarcodeValidationError(validation.errors);
      }

      const existingRecord =
        await options.unknownBarcodeRepository.findPendingUnknownBarcodeByBarcode(
          input.organizationId,
          validation.barcode
        );

      if (existingRecord) {
        return options.unknownBarcodeRepository.updateUnknownBarcode(
          mergeUnknownBarcodeScan(existingRecord, input)
        );
      }

      return options.unknownBarcodeRepository.createUnknownBarcode(
        createUnknownBarcodeDraft(input, validation.barcode)
      );
    }
  };
}
