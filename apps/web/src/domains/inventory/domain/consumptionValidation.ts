import type { EntityId, ItemUnit } from "@krishnas-kitchen/types";
import { isNonEmptyString } from "@krishnas-kitchen/utils";

import type {
  CreateConsumptionTransactionInput,
  InventoryActor,
  InventoryItemReference,
  InventoryLocationReference
} from "./types";

export const CONSUMPTION_MAX_QUANTITY = 1_000_000;

export const CONSUMPTION_UNITS = [
  "g",
  "kg",
  "ml",
  "l",
  "unit"
] as const satisfies readonly ItemUnit[];

export type ConsumptionValidationErrorCode =
  | "ACTOR_INVALID"
  | "ITEM_ARCHIVED"
  | "ITEM_NOT_FOUND"
  | "ITEM_ORGANIZATION_MISMATCH"
  | "LOCATION_ARCHIVED"
  | "LOCATION_NOT_FOUND"
  | "LOCATION_ORGANIZATION_MISMATCH"
  | "LOCATION_TEMPLE_MISMATCH"
  | "QUANTITY_EXCEEDS_AVAILABLE"
  | "QUANTITY_NOT_FINITE"
  | "QUANTITY_NOT_POSITIVE"
  | "QUANTITY_TOO_LARGE"
  | "REQUIRED_FIELD"
  | "UNIT_INVALID"
  | "UNIT_NOT_CONSUMABLE";

export type ConsumptionValidationErrorDetail = {
  code: ConsumptionValidationErrorCode;
  field: "actor" | "itemId" | "locationId" | "organizationId" | "quantity" | "templeId" | "unit";
  message: string;
};

export type ConsumptionValidationResult =
  | {
      ok: true;
    }
  | {
      errors: ConsumptionValidationErrorDetail[];
      ok: false;
    };

export class ConsumptionValidationError extends Error {
  readonly errors: readonly ConsumptionValidationErrorDetail[];

  constructor(errors: readonly ConsumptionValidationErrorDetail[]) {
    super(errors.map((error) => error.message).join(" "));
    this.name = "ConsumptionValidationError";
    this.errors = errors;
  }
}

function createConsumptionError(
  code: ConsumptionValidationErrorCode,
  field: ConsumptionValidationErrorDetail["field"],
  message: string
): ConsumptionValidationErrorDetail {
  return {
    code,
    field,
    message
  };
}

function createConsumptionValidationResult(
  errors: ConsumptionValidationErrorDetail[]
): ConsumptionValidationResult {
  return errors.length > 0 ? { errors, ok: false } : { ok: true };
}

function pushConsumptionError(
  errors: ConsumptionValidationErrorDetail[],
  condition: boolean,
  code: ConsumptionValidationErrorCode,
  field: ConsumptionValidationErrorDetail["field"],
  message: string
): void {
  if (condition) {
    errors.push(createConsumptionError(code, field, message));
  }
}

function isItemUnit(value: unknown): value is ItemUnit {
  return CONSUMPTION_UNITS.includes(value as ItemUnit);
}

function getConsumableUnits(item: InventoryItemReference): readonly ItemUnit[] {
  return item.consumptionUnits?.length ? item.consumptionUnits : [item.defaultUnit];
}

function validateConsumptionActor(actor: InventoryActor): ConsumptionValidationErrorDetail[] {
  if (actor.type === "user" && !isNonEmptyString(actor.userId)) {
    return [createConsumptionError("ACTOR_INVALID", "actor", "User actor requires userId.")];
  }

  if (actor.type === "temporary_volunteer" && !isNonEmptyString(actor.tempSessionId)) {
    return [
      createConsumptionError(
        "ACTOR_INVALID",
        "actor",
        "Temporary volunteer actor requires tempSessionId."
      )
    ];
  }

  return [];
}

export function validateConsumptionQuantity(
  quantity: number,
  availableQuantity?: number
): ConsumptionValidationResult {
  const errors: ConsumptionValidationErrorDetail[] = [];

  if (!Number.isFinite(quantity)) {
    errors.push(
      createConsumptionError(
        "QUANTITY_NOT_FINITE",
        "quantity",
        "Consumption quantity must be finite."
      )
    );
  } else {
    pushConsumptionError(
      errors,
      quantity <= 0,
      "QUANTITY_NOT_POSITIVE",
      "quantity",
      "Consumption quantity must be greater than zero."
    );
    pushConsumptionError(
      errors,
      quantity > CONSUMPTION_MAX_QUANTITY,
      "QUANTITY_TOO_LARGE",
      "quantity",
      `Consumption quantity must be ${CONSUMPTION_MAX_QUANTITY} or less.`
    );
    pushConsumptionError(
      errors,
      typeof availableQuantity === "number" && quantity > availableQuantity,
      "QUANTITY_EXCEEDS_AVAILABLE",
      "quantity",
      "Consumption quantity cannot exceed available inventory."
    );
  }

  return createConsumptionValidationResult(errors);
}

export function validateConsumptionUnit(
  unit: ItemUnit,
  item?: InventoryItemReference | null
): ConsumptionValidationResult {
  const errors: ConsumptionValidationErrorDetail[] = [];

  pushConsumptionError(
    errors,
    !isItemUnit(unit),
    "UNIT_INVALID",
    "unit",
    "Consumption unit is invalid."
  );
  pushConsumptionError(
    errors,
    Boolean(item && !getConsumableUnits(item).includes(unit)),
    "UNIT_NOT_CONSUMABLE",
    "unit",
    "Consumption unit is not allowed for this item."
  );

  return createConsumptionValidationResult(errors);
}

export function validateConsumptionItem(
  item: InventoryItemReference | null,
  organizationId: EntityId
): ConsumptionValidationResult {
  const errors: ConsumptionValidationErrorDetail[] = [];

  if (!item) {
    errors.push(
      createConsumptionError("ITEM_NOT_FOUND", "itemId", "Consumption item was not found.")
    );
  } else {
    pushConsumptionError(
      errors,
      item.organizationId !== organizationId,
      "ITEM_ORGANIZATION_MISMATCH",
      "organizationId",
      "Consumption item must belong to the same organization."
    );
    pushConsumptionError(
      errors,
      Boolean(item.deletedAt),
      "ITEM_ARCHIVED",
      "itemId",
      "Archived items cannot be consumed."
    );
  }

  return createConsumptionValidationResult(errors);
}

export function validateConsumptionLocation(
  location: InventoryLocationReference | null,
  input: Pick<CreateConsumptionTransactionInput, "locationId" | "organizationId" | "templeId">
): ConsumptionValidationResult {
  const errors: ConsumptionValidationErrorDetail[] = [];

  if (!location) {
    errors.push(
      createConsumptionError(
        "LOCATION_NOT_FOUND",
        "locationId",
        "Consumption location was not found."
      )
    );
  } else {
    pushConsumptionError(
      errors,
      location.organizationId !== input.organizationId,
      "LOCATION_ORGANIZATION_MISMATCH",
      "organizationId",
      "Consumption location must belong to the same organization."
    );
    pushConsumptionError(
      errors,
      location.templeId !== input.templeId,
      "LOCATION_TEMPLE_MISMATCH",
      "templeId",
      "Consumption location must belong to the same temple."
    );
    pushConsumptionError(
      errors,
      Boolean(location.deletedAt),
      "LOCATION_ARCHIVED",
      "locationId",
      "Archived locations cannot consume inventory."
    );
  }

  return createConsumptionValidationResult(errors);
}

export function validateConsumptionTransactionInput(
  input: CreateConsumptionTransactionInput,
  references?: {
    availableQuantity?: number;
    item?: InventoryItemReference | null;
    location?: InventoryLocationReference | null;
  }
): ConsumptionValidationResult {
  const errors: ConsumptionValidationErrorDetail[] = [];

  pushConsumptionError(
    errors,
    !isNonEmptyString(input.organizationId),
    "REQUIRED_FIELD",
    "organizationId",
    "organizationId is required."
  );
  pushConsumptionError(
    errors,
    !isNonEmptyString(input.templeId),
    "REQUIRED_FIELD",
    "templeId",
    "templeId is required."
  );
  pushConsumptionError(
    errors,
    !isNonEmptyString(input.itemId),
    "REQUIRED_FIELD",
    "itemId",
    "Consumption item is required."
  );
  pushConsumptionError(
    errors,
    !isNonEmptyString(input.locationId),
    "REQUIRED_FIELD",
    "locationId",
    "Consumption location is required."
  );

  errors.push(...validateConsumptionActor(input.actor));

  const quantityValidation = validateConsumptionQuantity(
    input.quantity,
    references?.availableQuantity
  );
  if (!quantityValidation.ok) {
    errors.push(...quantityValidation.errors);
  }

  const unitValidation = validateConsumptionUnit(input.unit, references?.item);
  if (!unitValidation.ok) {
    errors.push(...unitValidation.errors);
  }

  if ("item" in (references ?? {})) {
    const itemValidation = validateConsumptionItem(references?.item ?? null, input.organizationId);
    if (!itemValidation.ok) {
      errors.push(...itemValidation.errors);
    }
  }

  if ("location" in (references ?? {})) {
    const locationValidation = validateConsumptionLocation(references?.location ?? null, input);
    if (!locationValidation.ok) {
      errors.push(...locationValidation.errors);
    }
  }

  return createConsumptionValidationResult(errors);
}

export function assertValidConsumptionTransactionInput(
  input: CreateConsumptionTransactionInput,
  references?: {
    availableQuantity?: number;
    item?: InventoryItemReference | null;
    location?: InventoryLocationReference | null;
  }
): CreateConsumptionTransactionInput {
  const result = validateConsumptionTransactionInput(input, references);

  if (!result.ok) {
    throw new ConsumptionValidationError(result.errors);
  }

  return input;
}
