import type { EntityId, ItemUnit } from "@krishnas-kitchen/types";
import { isNonEmptyString } from "@krishnas-kitchen/utils";

import type {
  CreateReceivingTransactionInput,
  InventoryActor,
  InventoryItemReference,
  InventoryLocationReference
} from "./types";

export const RECEIVING_MAX_QUANTITY = 1_000_000;

export const RECEIVING_UNITS = [
  "g",
  "kg",
  "ml",
  "l",
  "unit"
] as const satisfies readonly ItemUnit[];

export type ReceivingValidationErrorCode =
  | "ACTOR_INVALID"
  | "ITEM_ARCHIVED"
  | "ITEM_NOT_FOUND"
  | "ITEM_ORGANIZATION_MISMATCH"
  | "LOCATION_ARCHIVED"
  | "LOCATION_NOT_FOUND"
  | "LOCATION_ORGANIZATION_MISMATCH"
  | "LOCATION_TEMPLE_MISMATCH"
  | "QUANTITY_NOT_FINITE"
  | "QUANTITY_NOT_POSITIVE"
  | "QUANTITY_TOO_LARGE"
  | "REQUIRED_FIELD"
  | "UNIT_INVALID"
  | "UNIT_NOT_RECEIVABLE";

export type ReceivingValidationErrorDetail = {
  code: ReceivingValidationErrorCode;
  field: "actor" | "itemId" | "locationId" | "organizationId" | "quantity" | "templeId" | "unit";
  message: string;
};

export type ReceivingValidationResult =
  | {
      ok: true;
    }
  | {
      errors: ReceivingValidationErrorDetail[];
      ok: false;
    };

export class ReceivingValidationError extends Error {
  readonly errors: readonly ReceivingValidationErrorDetail[];

  constructor(errors: readonly ReceivingValidationErrorDetail[]) {
    super(errors.map((error) => error.message).join(" "));
    this.name = "ReceivingValidationError";
    this.errors = errors;
  }
}

function createReceivingError(
  code: ReceivingValidationErrorCode,
  field: ReceivingValidationErrorDetail["field"],
  message: string
): ReceivingValidationErrorDetail {
  return {
    code,
    field,
    message
  };
}

function createReceivingValidationResult(
  errors: ReceivingValidationErrorDetail[]
): ReceivingValidationResult {
  return errors.length > 0 ? { errors, ok: false } : { ok: true };
}

function pushReceivingError(
  errors: ReceivingValidationErrorDetail[],
  condition: boolean,
  code: ReceivingValidationErrorCode,
  field: ReceivingValidationErrorDetail["field"],
  message: string
): void {
  if (condition) {
    errors.push(createReceivingError(code, field, message));
  }
}

function isItemUnit(value: unknown): value is ItemUnit {
  return RECEIVING_UNITS.includes(value as ItemUnit);
}

function getReceivableUnits(item: InventoryItemReference): readonly ItemUnit[] {
  return item.receivingUnits?.length ? item.receivingUnits : [item.defaultUnit];
}

function validateReceivingActor(actor: InventoryActor): ReceivingValidationErrorDetail[] {
  if (actor.type === "user" && !isNonEmptyString(actor.userId)) {
    return [createReceivingError("ACTOR_INVALID", "actor", "User actor requires userId.")];
  }

  if (actor.type === "temporary_volunteer" && !isNonEmptyString(actor.tempSessionId)) {
    return [
      createReceivingError(
        "ACTOR_INVALID",
        "actor",
        "Temporary volunteer actor requires tempSessionId."
      )
    ];
  }

  return [];
}

export function validateReceivingQuantity(quantity: number): ReceivingValidationResult {
  const errors: ReceivingValidationErrorDetail[] = [];

  if (!Number.isFinite(quantity)) {
    errors.push(
      createReceivingError("QUANTITY_NOT_FINITE", "quantity", "Receiving quantity must be finite.")
    );
  } else {
    pushReceivingError(
      errors,
      quantity <= 0,
      "QUANTITY_NOT_POSITIVE",
      "quantity",
      "Receiving quantity must be greater than zero."
    );
    pushReceivingError(
      errors,
      quantity > RECEIVING_MAX_QUANTITY,
      "QUANTITY_TOO_LARGE",
      "quantity",
      `Receiving quantity must be ${RECEIVING_MAX_QUANTITY} or less.`
    );
  }

  return createReceivingValidationResult(errors);
}

export function validateReceivingUnit(
  unit: ItemUnit,
  item?: InventoryItemReference | null
): ReceivingValidationResult {
  const errors: ReceivingValidationErrorDetail[] = [];

  pushReceivingError(
    errors,
    !isItemUnit(unit),
    "UNIT_INVALID",
    "unit",
    "Receiving unit is invalid."
  );
  pushReceivingError(
    errors,
    Boolean(item && !getReceivableUnits(item).includes(unit)),
    "UNIT_NOT_RECEIVABLE",
    "unit",
    "Receiving unit is not allowed for this item."
  );

  return createReceivingValidationResult(errors);
}

export function validateReceivingLocation(
  location: InventoryLocationReference | null,
  input: Pick<CreateReceivingTransactionInput, "locationId" | "organizationId" | "templeId">
): ReceivingValidationResult {
  const errors: ReceivingValidationErrorDetail[] = [];

  if (!location) {
    errors.push(
      createReceivingError("LOCATION_NOT_FOUND", "locationId", "Receiving location was not found.")
    );
  } else {
    pushReceivingError(
      errors,
      location.organizationId !== input.organizationId,
      "LOCATION_ORGANIZATION_MISMATCH",
      "organizationId",
      "Receiving location must belong to the same organization."
    );
    pushReceivingError(
      errors,
      location.templeId !== input.templeId,
      "LOCATION_TEMPLE_MISMATCH",
      "templeId",
      "Receiving location must belong to the same temple."
    );
    pushReceivingError(
      errors,
      Boolean(location.deletedAt),
      "LOCATION_ARCHIVED",
      "locationId",
      "Archived locations cannot receive inventory."
    );
  }

  return createReceivingValidationResult(errors);
}

export function validateReceivingItem(
  item: InventoryItemReference | null,
  organizationId: EntityId
): ReceivingValidationResult {
  const errors: ReceivingValidationErrorDetail[] = [];

  if (!item) {
    errors.push(createReceivingError("ITEM_NOT_FOUND", "itemId", "Receiving item was not found."));
  } else {
    pushReceivingError(
      errors,
      item.organizationId !== organizationId,
      "ITEM_ORGANIZATION_MISMATCH",
      "organizationId",
      "Receiving item must belong to the same organization."
    );
    pushReceivingError(
      errors,
      Boolean(item.deletedAt),
      "ITEM_ARCHIVED",
      "itemId",
      "Archived items cannot be received."
    );
  }

  return createReceivingValidationResult(errors);
}

export function validateReceivingTransactionInput(
  input: CreateReceivingTransactionInput,
  references?: {
    item?: InventoryItemReference | null;
    location?: InventoryLocationReference | null;
  }
): ReceivingValidationResult {
  const errors: ReceivingValidationErrorDetail[] = [];

  pushReceivingError(
    errors,
    !isNonEmptyString(input.organizationId),
    "REQUIRED_FIELD",
    "organizationId",
    "organizationId is required."
  );
  pushReceivingError(
    errors,
    !isNonEmptyString(input.templeId),
    "REQUIRED_FIELD",
    "templeId",
    "templeId is required."
  );
  pushReceivingError(
    errors,
    !isNonEmptyString(input.itemId),
    "REQUIRED_FIELD",
    "itemId",
    "Receiving item is required."
  );
  pushReceivingError(
    errors,
    !isNonEmptyString(input.locationId),
    "REQUIRED_FIELD",
    "locationId",
    "Receiving location is required."
  );

  errors.push(...validateReceivingActor(input.actor));

  const quantityValidation = validateReceivingQuantity(input.quantity);
  if (!quantityValidation.ok) {
    errors.push(...quantityValidation.errors);
  }

  const unitValidation = validateReceivingUnit(input.unit, references?.item);
  if (!unitValidation.ok) {
    errors.push(...unitValidation.errors);
  }

  if ("item" in (references ?? {})) {
    const itemValidation = validateReceivingItem(references?.item ?? null, input.organizationId);
    if (!itemValidation.ok) {
      errors.push(...itemValidation.errors);
    }
  }

  if ("location" in (references ?? {})) {
    const locationValidation = validateReceivingLocation(references?.location ?? null, input);
    if (!locationValidation.ok) {
      errors.push(...locationValidation.errors);
    }
  }

  return createReceivingValidationResult(errors);
}

export function assertValidReceivingTransactionInput(
  input: CreateReceivingTransactionInput,
  references?: {
    item?: InventoryItemReference | null;
    location?: InventoryLocationReference | null;
  }
): CreateReceivingTransactionInput {
  const result = validateReceivingTransactionInput(input, references);

  if (!result.ok) {
    throw new ReceivingValidationError(result.errors);
  }

  return input;
}
