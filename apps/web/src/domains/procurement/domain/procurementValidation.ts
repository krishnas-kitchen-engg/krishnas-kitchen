import type { ItemUnit } from "@krishnas-kitchen/types";
import { isNonEmptyString } from "@krishnas-kitchen/utils";

import { ITEM_UNITS } from "@/shared/domain/itemUnits";

import type {
  PurchaseItemReference,
  PurchaseRequestInput,
  PurchaseRequestValidationField,
  PurchaseRequestValidationReferences
} from "./types";

export const PROCUREMENT_QUANTITY_DECIMAL_PLACES = 6;

export const PROCUREMENT_ITEM_UNITS = ITEM_UNITS;

export type ProcurementValidationErrorCode =
  | "ACTOR_REQUIRED"
  | "DUPLICATE_ITEM_CANDIDATE"
  | "EXISTING_ITEM_ARCHIVED"
  | "EXISTING_ITEM_NOT_FOUND"
  | "ITEM_REQUIRED"
  | "NEEDED_BY_INVALID"
  | "NEW_ITEM_NAME_REQUIRED"
  | "NOTES_TOO_LONG"
  | "ORGANIZATION_REQUIRED"
  | "QUANTITY_NOT_FINITE"
  | "QUANTITY_NOT_POSITIVE"
  | "TEMPLE_REQUIRED"
  | "UNIT_INVALID";

export type ProcurementValidationErrorDetail = {
  code: ProcurementValidationErrorCode;
  field: PurchaseRequestValidationField;
  message: string;
};

export type ProcurementValidationResult =
  | {
      ok: true;
    }
  | {
      errors: ProcurementValidationErrorDetail[];
      ok: false;
    };

export class ProcurementValidationError extends Error {
  readonly errors: readonly ProcurementValidationErrorDetail[];

  constructor(errors: readonly ProcurementValidationErrorDetail[]) {
    super(errors.map((error) => error.message).join(" "));
    this.name = "ProcurementValidationError";
    this.errors = errors;
  }
}

function createProcurementValidationError(
  code: ProcurementValidationErrorCode,
  field: PurchaseRequestValidationField,
  message: string
): ProcurementValidationErrorDetail {
  return {
    code,
    field,
    message
  };
}

function createProcurementValidationResult(
  errors: ProcurementValidationErrorDetail[]
): ProcurementValidationResult {
  return errors.length > 0 ? { errors, ok: false } : { ok: true };
}

function normalizeOptionalText(value: string | null | undefined): string | null {
  const normalized = value?.trim().replace(/\s+/g, " ");

  return normalized ? normalized : null;
}

function isProcurementUnit(value: unknown): value is ItemUnit {
  return PROCUREMENT_ITEM_UNITS.includes(value as ItemUnit);
}

function validateProcurementActor(input: PurchaseRequestInput): ProcurementValidationErrorDetail[] {
  if (
    input.requestedBy.type === "user" &&
    isNonEmptyString(input.requestedBy.userId) &&
    !input.requestedBy.tempSessionId
  ) {
    return [];
  }

  if (
    input.requestedBy.type === "temporary_volunteer" &&
    isNonEmptyString(input.requestedBy.tempSessionId) &&
    !input.requestedBy.userId
  ) {
    return [];
  }

  if (input.requestedBy.type === "system") {
    return [];
  }

  return [
    createProcurementValidationError(
      "ACTOR_REQUIRED",
      "requestedBy",
      "A valid requester is required."
    )
  ];
}

function validateNeededBy(value: string | null | undefined): ProcurementValidationErrorDetail[] {
  const normalized = normalizeOptionalText(value);

  if (!normalized) {
    return [];
  }

  const date = new Date(normalized);

  return Number.isNaN(date.getTime())
    ? [
        createProcurementValidationError(
          "NEEDED_BY_INVALID",
          "neededBy",
          "Needed-by date must be a valid date."
        )
      ]
    : [];
}

function validateQuantity(quantity: number): ProcurementValidationErrorDetail[] {
  if (!Number.isFinite(quantity)) {
    return [
      createProcurementValidationError(
        "QUANTITY_NOT_FINITE",
        "quantity",
        "Requested quantity must be finite."
      )
    ];
  }

  if (quantity <= 0) {
    return [
      createProcurementValidationError(
        "QUANTITY_NOT_POSITIVE",
        "quantity",
        "Requested quantity must be greater than zero."
      )
    ];
  }

  return [];
}

function validateItemReference(
  item: PurchaseItemReference,
  references?: PurchaseRequestValidationReferences
): ProcurementValidationErrorDetail[] {
  const errors: ProcurementValidationErrorDetail[] = [];

  if (item.type === "existing_item") {
    if (!isNonEmptyString(item.itemId)) {
      errors.push(
        createProcurementValidationError(
          "ITEM_REQUIRED",
          "item.itemId",
          "Existing item is required."
        )
      );
    }

    if (references && !references.item) {
      errors.push(
        createProcurementValidationError(
          "EXISTING_ITEM_NOT_FOUND",
          "item.itemId",
          "Selected item was not found."
        )
      );
    }

    if (references?.item?.deletedAt) {
      errors.push(
        createProcurementValidationError(
          "EXISTING_ITEM_ARCHIVED",
          "item.itemId",
          "Archived items cannot be requested for purchase."
        )
      );
    }

    return errors;
  }

  if (!isNonEmptyString(item.suggestedName)) {
    errors.push(
      createProcurementValidationError(
        "NEW_ITEM_NAME_REQUIRED",
        "item.suggestedName",
        "Suggested item name is required."
      )
    );
  }

  if ((references?.duplicateCandidates?.length ?? 0) > 0) {
    errors.push(
      createProcurementValidationError(
        "DUPLICATE_ITEM_CANDIDATE",
        "item.suggestedName",
        "Review similar existing items before suggesting a new item."
      )
    );
  }

  return errors;
}

export function normalizePurchaseRequestInput(input: PurchaseRequestInput): PurchaseRequestInput {
  const notes = normalizeOptionalText(input.notes);
  const neededBy = normalizeOptionalText(input.neededBy);

  return {
    ...input,
    item:
      input.item.type === "new_item_suggestion"
        ? {
            ...input.item,
            category: normalizeOptionalText(input.item.category),
            suggestedName: input.item.suggestedName.trim().replace(/\s+/g, " ")
          }
        : input.item,
    ...(neededBy ? { neededBy } : { neededBy: null }),
    ...(notes ? { notes } : { notes: null }),
    quantity: Number(input.quantity.toFixed(PROCUREMENT_QUANTITY_DECIMAL_PLACES))
  };
}

export function validatePurchaseRequestInput(
  input: PurchaseRequestInput,
  references?: PurchaseRequestValidationReferences
): ProcurementValidationResult {
  const errors: ProcurementValidationErrorDetail[] = [];

  if (!isNonEmptyString(input.organizationId)) {
    errors.push(
      createProcurementValidationError(
        "ORGANIZATION_REQUIRED",
        "organizationId",
        "Organization is required."
      )
    );
  }

  if (!isNonEmptyString(input.templeId)) {
    errors.push(
      createProcurementValidationError("TEMPLE_REQUIRED", "templeId", "Temple is required.")
    );
  }

  errors.push(...validateProcurementActor(input));
  errors.push(...validateItemReference(input.item, references));
  errors.push(...validateQuantity(input.quantity));
  errors.push(...validateNeededBy(input.neededBy));

  if (!isProcurementUnit(input.unit)) {
    errors.push(createProcurementValidationError("UNIT_INVALID", "unit", "Unit is invalid."));
  }

  if ((normalizeOptionalText(input.notes)?.length ?? 0) > 500) {
    errors.push(
      createProcurementValidationError(
        "NOTES_TOO_LONG",
        "notes",
        "Request notes must be 500 characters or less."
      )
    );
  }

  return createProcurementValidationResult(errors);
}

export function assertValidPurchaseRequestInput(
  input: PurchaseRequestInput,
  references?: PurchaseRequestValidationReferences
): PurchaseRequestInput {
  const result = validatePurchaseRequestInput(input, references);

  if (!result.ok) {
    throw new ProcurementValidationError(result.errors);
  }

  return input;
}
