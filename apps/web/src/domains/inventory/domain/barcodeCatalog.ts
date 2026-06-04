import type { EntityId } from "@krishnas-kitchen/types";

import type {
  BarcodeValidationErrorDetail,
  InventoryBarcode,
  InventoryBarcodeScanInput
} from "./barcode";
import { validateBarcode } from "./barcode";
import type { InventoryActor } from "./types";

export type InventoryBarcodeMappingStatus = "active" | "archived";

export type InventoryBarcodeCatalogItemReference = {
  deletedAt: string | null;
  id: EntityId;
  organizationId: EntityId;
};

export type InventoryBarcodeMapping = {
  archivedAt: string | null;
  archivedBy: InventoryActor | null;
  archiveReason: string | null;
  barcode: InventoryBarcode;
  createdAt: string;
  createdBy: InventoryActor;
  id: EntityId;
  itemId: EntityId;
  notes: string | null;
  organizationId: EntityId;
  sourceUnknownBarcodeId: EntityId | null;
  updatedAt: string;
};

export type InventoryBarcodeMappingDraft = Omit<
  InventoryBarcodeMapping,
  "createdAt" | "id" | "updatedAt"
> & {
  clientId: EntityId;
};

export type CreateInventoryBarcodeMappingInput = InventoryBarcodeScanInput & {
  actor: InventoryActor;
  clientId: EntityId;
  createdAt: string;
  itemId: EntityId;
  notes?: string;
  organizationId: EntityId;
  sourceUnknownBarcodeId?: EntityId;
};

export type ArchiveInventoryBarcodeMappingInput = {
  actor: InventoryActor;
  archivedAt: string;
  organizationId: EntityId;
  reason?: string;
};

export type InventoryBarcodeMappingSearchQuery = {
  itemId?: EntityId;
  limit?: number;
  organizationId: EntityId;
  searchText?: string;
  status?: InventoryBarcodeMappingStatus;
};

export type InventoryBarcodeCatalogValidationErrorCode =
  | "BARCODE_DUPLICATE"
  | "BARCODE_INVALID"
  | "ITEM_ARCHIVED"
  | "ITEM_NOT_FOUND"
  | "ITEM_ORGANIZATION_MISMATCH"
  | "MAPPING_ARCHIVED"
  | "MAPPING_NOT_FOUND"
  | "ORGANIZATION_MISMATCH";

export type InventoryBarcodeCatalogValidationErrorDetail = {
  barcodeErrors?: readonly BarcodeValidationErrorDetail[];
  code: InventoryBarcodeCatalogValidationErrorCode;
  field: "barcode" | "item" | "mapping" | "organizationId";
  message: string;
};

export type InventoryBarcodeCatalogValidationResult =
  | {
      ok: true;
    }
  | {
      errors: InventoryBarcodeCatalogValidationErrorDetail[];
      ok: false;
    };

export type InventoryBarcodeMappingValidationResult =
  | {
      barcode: InventoryBarcode;
      ok: true;
    }
  | {
      errors: InventoryBarcodeCatalogValidationErrorDetail[];
      ok: false;
    };

export class InventoryBarcodeCatalogValidationError extends Error {
  readonly errors: readonly InventoryBarcodeCatalogValidationErrorDetail[];

  constructor(errors: readonly InventoryBarcodeCatalogValidationErrorDetail[]) {
    super("Inventory barcode catalog validation failed.");
    this.name = "InventoryBarcodeCatalogValidationError";
    this.errors = errors;
  }
}

function createBarcodeCatalogError(
  code: InventoryBarcodeCatalogValidationErrorCode,
  field: InventoryBarcodeCatalogValidationErrorDetail["field"],
  message: string,
  barcodeErrors?: readonly BarcodeValidationErrorDetail[]
): InventoryBarcodeCatalogValidationErrorDetail {
  return {
    ...(barcodeErrors ? { barcodeErrors } : {}),
    code,
    field,
    message
  };
}

function compareText(left: string, right: string): number {
  return left.localeCompare(right, "en", { sensitivity: "base" });
}

function normalizeNotes(value: string | undefined): string | null {
  const trimmedValue = value?.trim();

  return trimmedValue ? trimmedValue : null;
}

function applyLimit<T>(values: T[], limit: number | undefined): T[] {
  return typeof limit === "number" ? values.slice(0, Math.max(limit, 0)) : values;
}

function isMappingActive(mapping: InventoryBarcodeMapping): boolean {
  return !mapping.archivedAt;
}

function matchesBarcodeMappingSearch(
  mapping: InventoryBarcodeMapping,
  searchText: string
): boolean {
  const normalizedSearch = searchText.trim().toLocaleLowerCase();

  return (
    !normalizedSearch ||
    mapping.id.toLocaleLowerCase().includes(normalizedSearch) ||
    mapping.itemId.toLocaleLowerCase().includes(normalizedSearch) ||
    mapping.barcode.format.toLocaleLowerCase().includes(normalizedSearch) ||
    mapping.barcode.value.toLocaleLowerCase().includes(normalizedSearch)
  );
}

export function validateBarcodeMappingInput(
  input: CreateInventoryBarcodeMappingInput
): InventoryBarcodeMappingValidationResult {
  const validation = validateBarcode(input);

  if (!validation.ok) {
    return {
      errors: [
        createBarcodeCatalogError(
          "BARCODE_INVALID",
          "barcode",
          "Barcode mapping requires a valid barcode.",
          validation.errors
        )
      ],
      ok: false
    };
  }

  return {
    barcode: validation.barcode,
    ok: true
  };
}

export function validateBarcodeMappingCreation(
  input: CreateInventoryBarcodeMappingInput,
  dependencies: {
    duplicateMapping: InventoryBarcodeMapping | null;
    item: InventoryBarcodeCatalogItemReference | null;
  }
): InventoryBarcodeCatalogValidationResult {
  const errors: InventoryBarcodeCatalogValidationErrorDetail[] = [];

  if (!dependencies.item) {
    errors.push(createBarcodeCatalogError("ITEM_NOT_FOUND", "item", "Item was not found."));
  } else {
    if (dependencies.item.organizationId !== input.organizationId) {
      errors.push(
        createBarcodeCatalogError(
          "ITEM_ORGANIZATION_MISMATCH",
          "item",
          "Item belongs to another organization."
        )
      );
    }

    if (dependencies.item.deletedAt) {
      errors.push(createBarcodeCatalogError("ITEM_ARCHIVED", "item", "Item is archived."));
    }
  }

  if (dependencies.duplicateMapping && isMappingActive(dependencies.duplicateMapping)) {
    errors.push(
      createBarcodeCatalogError(
        "BARCODE_DUPLICATE",
        "barcode",
        "Barcode is already mapped to an active item."
      )
    );
  }

  return errors.length > 0 ? { errors, ok: false } : { ok: true };
}

export function validateBarcodeMappingArchival(
  mapping: InventoryBarcodeMapping | null,
  input: ArchiveInventoryBarcodeMappingInput
): InventoryBarcodeCatalogValidationResult {
  if (!mapping) {
    return {
      errors: [
        createBarcodeCatalogError("MAPPING_NOT_FOUND", "mapping", "Barcode mapping was not found.")
      ],
      ok: false
    };
  }

  if (mapping.organizationId !== input.organizationId) {
    return {
      errors: [
        createBarcodeCatalogError(
          "ORGANIZATION_MISMATCH",
          "organizationId",
          "Barcode mapping belongs to another organization."
        )
      ],
      ok: false
    };
  }

  if (!isMappingActive(mapping)) {
    return {
      errors: [
        createBarcodeCatalogError("MAPPING_ARCHIVED", "mapping", "Barcode mapping is archived.")
      ],
      ok: false
    };
  }

  return { ok: true };
}

export function createBarcodeMappingDraft(
  input: CreateInventoryBarcodeMappingInput,
  barcode: InventoryBarcode
): InventoryBarcodeMappingDraft {
  return {
    archivedAt: null,
    archivedBy: null,
    archiveReason: null,
    barcode,
    clientId: input.clientId,
    createdBy: input.actor,
    itemId: input.itemId,
    notes: normalizeNotes(input.notes),
    organizationId: input.organizationId,
    sourceUnknownBarcodeId: input.sourceUnknownBarcodeId ?? null
  };
}

export function archiveBarcodeMapping(
  mapping: InventoryBarcodeMapping,
  input: ArchiveInventoryBarcodeMappingInput
): InventoryBarcodeMapping {
  return {
    ...mapping,
    archivedAt: input.archivedAt,
    archivedBy: input.actor,
    archiveReason: normalizeNotes(input.reason),
    updatedAt: input.archivedAt
  };
}

export function searchBarcodeMappings(
  mappings: readonly InventoryBarcodeMapping[],
  query: InventoryBarcodeMappingSearchQuery
): InventoryBarcodeMapping[] {
  const searchText = query.searchText ?? "";

  return applyLimit(
    mappings
      .filter(
        (mapping) =>
          mapping.organizationId === query.organizationId &&
          (!query.itemId || mapping.itemId === query.itemId) &&
          (!query.status ||
            (query.status === "active" ? isMappingActive(mapping) : !isMappingActive(mapping))) &&
          matchesBarcodeMappingSearch(mapping, searchText)
      )
      .sort(
        (left, right) =>
          compareText(left.itemId, right.itemId) ||
          compareText(left.barcode.format, right.barcode.format) ||
          compareText(left.barcode.value, right.barcode.value) ||
          compareText(left.id, right.id)
      ),
    query.limit
  );
}
