import type { EntityId } from "@krishnas-kitchen/types";

import type { InventoryBarcode } from "../domain/barcode";
import {
  archiveBarcodeMapping,
  createBarcodeMappingDraft,
  InventoryBarcodeCatalogValidationError,
  searchBarcodeMappings,
  validateBarcodeMappingArchival,
  validateBarcodeMappingCreation,
  validateBarcodeMappingInput,
  type ArchiveInventoryBarcodeMappingInput,
  type CreateInventoryBarcodeMappingInput,
  type InventoryBarcodeCatalogItemReference,
  type InventoryBarcodeMapping,
  type InventoryBarcodeMappingDraft,
  type InventoryBarcodeMappingSearchQuery
} from "../domain/barcodeCatalog";

export type InventoryBarcodeCatalogRepository = {
  archiveBarcodeMapping: (mapping: InventoryBarcodeMapping) => Promise<InventoryBarcodeMapping>;
  createBarcodeMapping: (draft: InventoryBarcodeMappingDraft) => Promise<InventoryBarcodeMapping>;
  findActiveBarcodeMappingByBarcode: (
    organizationId: EntityId,
    barcode: InventoryBarcode
  ) => Promise<InventoryBarcodeMapping | null>;
  findBarcodeMappingById: (id: EntityId) => Promise<InventoryBarcodeMapping | null>;
  listBarcodeMappings: (organizationId: EntityId) => Promise<readonly InventoryBarcodeMapping[]>;
};

export type InventoryBarcodeCatalogItemRepository = {
  findBarcodeCatalogItem: (
    itemId: EntityId,
    organizationId: EntityId
  ) => Promise<InventoryBarcodeCatalogItemReference | null>;
};

export type InventoryBarcodeCatalogService = {
  archiveBarcodeMapping: (
    mappingId: EntityId,
    input: ArchiveInventoryBarcodeMappingInput
  ) => Promise<InventoryBarcodeMapping>;
  createBarcodeMapping: (
    input: CreateInventoryBarcodeMappingInput
  ) => Promise<InventoryBarcodeMapping>;
  searchBarcodeMappings: (
    query: InventoryBarcodeMappingSearchQuery
  ) => Promise<InventoryBarcodeMapping[]>;
};

export function createInventoryBarcodeCatalogService(options: {
  barcodeRepository: InventoryBarcodeCatalogRepository;
  itemRepository: InventoryBarcodeCatalogItemRepository;
}): InventoryBarcodeCatalogService {
  return {
    async archiveBarcodeMapping(mappingId, input) {
      const mapping = await options.barcodeRepository.findBarcodeMappingById(mappingId);
      const validation = validateBarcodeMappingArchival(mapping, input);

      if (!validation.ok) {
        throw new InventoryBarcodeCatalogValidationError(validation.errors);
      }

      if (!mapping) {
        throw new Error("Validated barcode mapping is missing.");
      }

      return options.barcodeRepository.archiveBarcodeMapping(archiveBarcodeMapping(mapping, input));
    },

    async createBarcodeMapping(input) {
      const barcodeValidation = validateBarcodeMappingInput(input);

      if (!barcodeValidation.ok) {
        throw new InventoryBarcodeCatalogValidationError(barcodeValidation.errors);
      }

      const [item, duplicateMapping] = await Promise.all([
        options.itemRepository.findBarcodeCatalogItem(input.itemId, input.organizationId),
        options.barcodeRepository.findActiveBarcodeMappingByBarcode(
          input.organizationId,
          barcodeValidation.barcode
        )
      ]);
      const creationValidation = validateBarcodeMappingCreation(input, {
        duplicateMapping,
        item
      });

      if (!creationValidation.ok) {
        throw new InventoryBarcodeCatalogValidationError(creationValidation.errors);
      }

      return options.barcodeRepository.createBarcodeMapping(
        createBarcodeMappingDraft(input, barcodeValidation.barcode)
      );
    },

    async searchBarcodeMappings(query) {
      const mappings = await options.barcodeRepository.listBarcodeMappings(query.organizationId);

      return searchBarcodeMappings(mappings, query);
    }
  };
}
