import type { EntityId, ItemUnit } from "@krishnas-kitchen/types";
import { isNonEmptyString } from "@krishnas-kitchen/utils";

import { ITEM_UNITS } from "@/shared/domain/itemUnits";

import type {
  CreateInventoryAdjustmentInput,
  InventoryActor,
  InventoryItemReference,
  InventoryLocationReference
} from "./types";

export const ADJUSTMENT_MAX_PHYSICAL_QUANTITY = 1_000_000;

export const ADJUSTMENT_UNITS = ITEM_UNITS;

export type AdjustmentValidationErrorCode =
  | "ACTOR_INVALID"
  | "ITEM_ARCHIVED"
  | "ITEM_NOT_FOUND"
  | "ITEM_ORGANIZATION_MISMATCH"
  | "LOCATION_ARCHIVED"
  | "LOCATION_NOT_FOUND"
  | "LOCATION_ORGANIZATION_MISMATCH"
  | "LOCATION_TEMPLE_MISMATCH"
  | "PHYSICAL_QUANTITY_NEGATIVE"
  | "PHYSICAL_QUANTITY_NOT_FINITE"
  | "PHYSICAL_QUANTITY_TOO_LARGE"
  | "REASON_REQUIRED"
  | "REQUIRED_FIELD"
  | "UNIT_INVALID"
  | "UNIT_NOT_ADJUSTABLE";

export type AdjustmentValidationErrorDetail = {
  code: AdjustmentValidationErrorCode;
  field:
    | "actor"
    | "itemId"
    | "locationId"
    | "organizationId"
    | "physicalQuantity"
    | "reason"
    | "templeId"
    | "unit";
  message: string;
};

export type AdjustmentValidationResult =
  | {
      ok: true;
    }
  | {
      errors: AdjustmentValidationErrorDetail[];
      ok: false;
    };

export class AdjustmentValidationError extends Error {
  readonly errors: readonly AdjustmentValidationErrorDetail[];

  constructor(errors: readonly AdjustmentValidationErrorDetail[]) {
    super(errors.map((error) => error.message).join(" "));
    this.name = "AdjustmentValidationError";
    this.errors = errors;
  }
}

function createAdjustmentError(
  code: AdjustmentValidationErrorCode,
  field: AdjustmentValidationErrorDetail["field"],
  message: string
): AdjustmentValidationErrorDetail {
  return {
    code,
    field,
    message
  };
}

function createAdjustmentValidationResult(
  errors: AdjustmentValidationErrorDetail[]
): AdjustmentValidationResult {
  return errors.length > 0 ? { errors, ok: false } : { ok: true };
}

function pushAdjustmentError(
  errors: AdjustmentValidationErrorDetail[],
  condition: boolean,
  code: AdjustmentValidationErrorCode,
  field: AdjustmentValidationErrorDetail["field"],
  message: string
): void {
  if (condition) {
    errors.push(createAdjustmentError(code, field, message));
  }
}

function isItemUnit(value: unknown): value is ItemUnit {
  return ADJUSTMENT_UNITS.includes(value as ItemUnit);
}

function getAdjustableUnits(item: InventoryItemReference): readonly ItemUnit[] {
  return item.adjustmentUnits?.length ? item.adjustmentUnits : [item.defaultUnit];
}

function validateAdjustmentActor(actor: InventoryActor): AdjustmentValidationErrorDetail[] {
  if (actor.type === "user" && !isNonEmptyString(actor.userId)) {
    return [createAdjustmentError("ACTOR_INVALID", "actor", "User actor requires userId.")];
  }

  if (actor.type === "temporary_volunteer" && !isNonEmptyString(actor.tempSessionId)) {
    return [
      createAdjustmentError(
        "ACTOR_INVALID",
        "actor",
        "Temporary volunteer actor requires tempSessionId."
      )
    ];
  }

  return [];
}

export function validateAdjustmentPhysicalQuantity(
  physicalQuantity: number
): AdjustmentValidationResult {
  const errors: AdjustmentValidationErrorDetail[] = [];

  if (!Number.isFinite(physicalQuantity)) {
    errors.push(
      createAdjustmentError(
        "PHYSICAL_QUANTITY_NOT_FINITE",
        "physicalQuantity",
        "Physical count must be finite."
      )
    );
  } else {
    pushAdjustmentError(
      errors,
      physicalQuantity < 0,
      "PHYSICAL_QUANTITY_NEGATIVE",
      "physicalQuantity",
      "Physical count cannot be negative."
    );
    pushAdjustmentError(
      errors,
      physicalQuantity > ADJUSTMENT_MAX_PHYSICAL_QUANTITY,
      "PHYSICAL_QUANTITY_TOO_LARGE",
      "physicalQuantity",
      `Physical count must be ${ADJUSTMENT_MAX_PHYSICAL_QUANTITY} or less.`
    );
  }

  return createAdjustmentValidationResult(errors);
}

export function validateAdjustmentReason(reason: string): AdjustmentValidationResult {
  const errors: AdjustmentValidationErrorDetail[] = [];

  pushAdjustmentError(
    errors,
    !isNonEmptyString(reason),
    "REASON_REQUIRED",
    "reason",
    "Adjustment reason is required."
  );

  return createAdjustmentValidationResult(errors);
}

export function validateAdjustmentUnit(
  unit: ItemUnit,
  item?: InventoryItemReference | null
): AdjustmentValidationResult {
  const errors: AdjustmentValidationErrorDetail[] = [];

  pushAdjustmentError(
    errors,
    !isItemUnit(unit),
    "UNIT_INVALID",
    "unit",
    "Adjustment unit is invalid."
  );
  pushAdjustmentError(
    errors,
    Boolean(item && !getAdjustableUnits(item).includes(unit)),
    "UNIT_NOT_ADJUSTABLE",
    "unit",
    "Adjustment unit is not allowed for this item."
  );

  return createAdjustmentValidationResult(errors);
}

export function validateAdjustmentItem(
  item: InventoryItemReference | null,
  organizationId: EntityId
): AdjustmentValidationResult {
  const errors: AdjustmentValidationErrorDetail[] = [];

  if (!item) {
    errors.push(
      createAdjustmentError("ITEM_NOT_FOUND", "itemId", "Adjustment item was not found.")
    );
  } else {
    pushAdjustmentError(
      errors,
      item.organizationId !== organizationId,
      "ITEM_ORGANIZATION_MISMATCH",
      "organizationId",
      "Adjustment item must belong to the same organization."
    );
    pushAdjustmentError(
      errors,
      Boolean(item.deletedAt),
      "ITEM_ARCHIVED",
      "itemId",
      "Archived items cannot be adjusted."
    );
  }

  return createAdjustmentValidationResult(errors);
}

export function validateAdjustmentLocation(
  location: InventoryLocationReference | null,
  input: Pick<CreateInventoryAdjustmentInput, "locationId" | "organizationId" | "templeId">
): AdjustmentValidationResult {
  const errors: AdjustmentValidationErrorDetail[] = [];

  if (!location) {
    errors.push(
      createAdjustmentError(
        "LOCATION_NOT_FOUND",
        "locationId",
        "Adjustment location was not found."
      )
    );
  } else {
    pushAdjustmentError(
      errors,
      location.organizationId !== input.organizationId,
      "LOCATION_ORGANIZATION_MISMATCH",
      "organizationId",
      "Adjustment location must belong to the same organization."
    );
    pushAdjustmentError(
      errors,
      location.templeId !== input.templeId,
      "LOCATION_TEMPLE_MISMATCH",
      "templeId",
      "Adjustment location must belong to the same temple."
    );
    pushAdjustmentError(
      errors,
      Boolean(location.deletedAt),
      "LOCATION_ARCHIVED",
      "locationId",
      "Archived locations cannot be adjusted."
    );
  }

  return createAdjustmentValidationResult(errors);
}

export function validateInventoryAdjustmentInput(
  input: CreateInventoryAdjustmentInput,
  references?: {
    item?: InventoryItemReference | null;
    location?: InventoryLocationReference | null;
  }
): AdjustmentValidationResult {
  const errors: AdjustmentValidationErrorDetail[] = [];

  pushAdjustmentError(
    errors,
    !isNonEmptyString(input.organizationId),
    "REQUIRED_FIELD",
    "organizationId",
    "organizationId is required."
  );
  pushAdjustmentError(
    errors,
    !isNonEmptyString(input.templeId),
    "REQUIRED_FIELD",
    "templeId",
    "templeId is required."
  );
  pushAdjustmentError(
    errors,
    !isNonEmptyString(input.itemId),
    "REQUIRED_FIELD",
    "itemId",
    "Adjustment item is required."
  );
  pushAdjustmentError(
    errors,
    !isNonEmptyString(input.locationId),
    "REQUIRED_FIELD",
    "locationId",
    "Adjustment location is required."
  );

  errors.push(...validateAdjustmentActor(input.actor));

  const quantityValidation = validateAdjustmentPhysicalQuantity(input.physicalQuantity);
  if (!quantityValidation.ok) {
    errors.push(...quantityValidation.errors);
  }

  const reasonValidation = validateAdjustmentReason(input.reason);
  if (!reasonValidation.ok) {
    errors.push(...reasonValidation.errors);
  }

  const unitValidation = validateAdjustmentUnit(input.unit, references?.item);
  if (!unitValidation.ok) {
    errors.push(...unitValidation.errors);
  }

  if ("item" in (references ?? {})) {
    const itemValidation = validateAdjustmentItem(references?.item ?? null, input.organizationId);
    if (!itemValidation.ok) {
      errors.push(...itemValidation.errors);
    }
  }

  if ("location" in (references ?? {})) {
    const locationValidation = validateAdjustmentLocation(references?.location ?? null, input);
    if (!locationValidation.ok) {
      errors.push(...locationValidation.errors);
    }
  }

  return createAdjustmentValidationResult(errors);
}

export function assertValidInventoryAdjustmentInput(
  input: CreateInventoryAdjustmentInput,
  references?: {
    item?: InventoryItemReference | null;
    location?: InventoryLocationReference | null;
  }
): CreateInventoryAdjustmentInput {
  const result = validateInventoryAdjustmentInput(input, references);

  if (!result.ok) {
    throw new AdjustmentValidationError(result.errors);
  }

  return input;
}
