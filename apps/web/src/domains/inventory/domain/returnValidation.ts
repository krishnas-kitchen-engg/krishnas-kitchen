import type { EntityId, ItemUnit } from "@krishnas-kitchen/types";
import { isNonEmptyString } from "@krishnas-kitchen/utils";

import type {
  CreateReturnTransactionInput,
  InventoryActor,
  InventoryItemReference,
  InventoryLocationReference
} from "./types";

export const RETURN_MAX_QUANTITY = 1_000_000;

export const RETURN_UNITS = ["g", "kg", "ml", "l", "unit"] as const satisfies readonly ItemUnit[];

export type ReturnValidationErrorCode =
  | "ACTOR_INVALID"
  | "DESTINATION_LOCATION_ARCHIVED"
  | "DESTINATION_LOCATION_NOT_FOUND"
  | "DESTINATION_LOCATION_ORGANIZATION_MISMATCH"
  | "DESTINATION_LOCATION_TEMPLE_MISMATCH"
  | "ITEM_ARCHIVED"
  | "ITEM_NOT_FOUND"
  | "ITEM_ORGANIZATION_MISMATCH"
  | "QUANTITY_EXCEEDS_AVAILABLE"
  | "QUANTITY_NOT_FINITE"
  | "QUANTITY_NOT_POSITIVE"
  | "QUANTITY_TOO_LARGE"
  | "REQUIRED_FIELD"
  | "SAME_LOCATION_RETURN"
  | "SOURCE_LOCATION_ARCHIVED"
  | "SOURCE_LOCATION_NOT_FOUND"
  | "SOURCE_LOCATION_ORGANIZATION_MISMATCH"
  | "SOURCE_LOCATION_TEMPLE_MISMATCH"
  | "UNIT_INVALID"
  | "UNIT_NOT_RETURNABLE";

export type ReturnValidationErrorDetail = {
  code: ReturnValidationErrorCode;
  field:
    | "actor"
    | "destinationLocationId"
    | "itemId"
    | "organizationId"
    | "quantity"
    | "sourceLocationId"
    | "templeId"
    | "unit";
  message: string;
};

export type ReturnValidationResult =
  | {
      ok: true;
    }
  | {
      errors: ReturnValidationErrorDetail[];
      ok: false;
    };

export class ReturnValidationError extends Error {
  readonly errors: readonly ReturnValidationErrorDetail[];

  constructor(errors: readonly ReturnValidationErrorDetail[]) {
    super(errors.map((error) => error.message).join(" "));
    this.name = "ReturnValidationError";
    this.errors = errors;
  }
}

function createReturnError(
  code: ReturnValidationErrorCode,
  field: ReturnValidationErrorDetail["field"],
  message: string
): ReturnValidationErrorDetail {
  return {
    code,
    field,
    message
  };
}

function createReturnValidationResult(
  errors: ReturnValidationErrorDetail[]
): ReturnValidationResult {
  return errors.length > 0 ? { errors, ok: false } : { ok: true };
}

function pushReturnError(
  errors: ReturnValidationErrorDetail[],
  condition: boolean,
  code: ReturnValidationErrorCode,
  field: ReturnValidationErrorDetail["field"],
  message: string
): void {
  if (condition) {
    errors.push(createReturnError(code, field, message));
  }
}

function isItemUnit(value: unknown): value is ItemUnit {
  return RETURN_UNITS.includes(value as ItemUnit);
}

function getReturnableUnits(item: InventoryItemReference): readonly ItemUnit[] {
  return item.returnUnits?.length ? item.returnUnits : [item.defaultUnit];
}

function validateReturnActor(actor: InventoryActor): ReturnValidationErrorDetail[] {
  if (actor.type === "user" && !isNonEmptyString(actor.userId)) {
    return [createReturnError("ACTOR_INVALID", "actor", "User actor requires userId.")];
  }

  if (actor.type === "temporary_volunteer" && !isNonEmptyString(actor.tempSessionId)) {
    return [
      createReturnError(
        "ACTOR_INVALID",
        "actor",
        "Temporary volunteer actor requires tempSessionId."
      )
    ];
  }

  return [];
}

export function validateReturnQuantity(
  quantity: number,
  availableQuantity?: number
): ReturnValidationResult {
  const errors: ReturnValidationErrorDetail[] = [];

  if (!Number.isFinite(quantity)) {
    errors.push(
      createReturnError("QUANTITY_NOT_FINITE", "quantity", "Return quantity must be finite.")
    );
  } else {
    pushReturnError(
      errors,
      quantity <= 0,
      "QUANTITY_NOT_POSITIVE",
      "quantity",
      "Return quantity must be greater than zero."
    );
    pushReturnError(
      errors,
      quantity > RETURN_MAX_QUANTITY,
      "QUANTITY_TOO_LARGE",
      "quantity",
      `Return quantity must be ${RETURN_MAX_QUANTITY} or less.`
    );
    pushReturnError(
      errors,
      typeof availableQuantity === "number" && quantity > availableQuantity,
      "QUANTITY_EXCEEDS_AVAILABLE",
      "quantity",
      "Return quantity cannot exceed available inventory."
    );
  }

  return createReturnValidationResult(errors);
}

export function validateReturnUnit(
  unit: ItemUnit,
  item?: InventoryItemReference | null
): ReturnValidationResult {
  const errors: ReturnValidationErrorDetail[] = [];

  pushReturnError(errors, !isItemUnit(unit), "UNIT_INVALID", "unit", "Return unit is invalid.");
  pushReturnError(
    errors,
    Boolean(item && !getReturnableUnits(item).includes(unit)),
    "UNIT_NOT_RETURNABLE",
    "unit",
    "Return unit is not allowed for this item."
  );

  return createReturnValidationResult(errors);
}

export function validateReturnItem(
  item: InventoryItemReference | null,
  organizationId: EntityId
): ReturnValidationResult {
  const errors: ReturnValidationErrorDetail[] = [];

  if (!item) {
    errors.push(createReturnError("ITEM_NOT_FOUND", "itemId", "Return item was not found."));
  } else {
    pushReturnError(
      errors,
      item.organizationId !== organizationId,
      "ITEM_ORGANIZATION_MISMATCH",
      "organizationId",
      "Return item must belong to the same organization."
    );
    pushReturnError(
      errors,
      Boolean(item.deletedAt),
      "ITEM_ARCHIVED",
      "itemId",
      "Archived items cannot be returned."
    );
  }

  return createReturnValidationResult(errors);
}

export function validateReturnSourceLocation(
  location: InventoryLocationReference | null,
  input: Pick<CreateReturnTransactionInput, "organizationId" | "sourceLocationId" | "templeId">
): ReturnValidationResult {
  return validateReturnLocation(location, input, {
    archivedCode: "SOURCE_LOCATION_ARCHIVED",
    archivedMessage: "Archived source locations cannot return inventory.",
    field: "sourceLocationId",
    notFoundCode: "SOURCE_LOCATION_NOT_FOUND",
    notFoundMessage: "Return source location was not found.",
    organizationCode: "SOURCE_LOCATION_ORGANIZATION_MISMATCH",
    organizationMessage: "Return source location must belong to the same organization.",
    templeCode: "SOURCE_LOCATION_TEMPLE_MISMATCH",
    templeMessage: "Return source location must belong to the same temple."
  });
}

export function validateReturnDestinationLocation(
  location: InventoryLocationReference | null,
  input: Pick<CreateReturnTransactionInput, "destinationLocationId" | "organizationId" | "templeId">
): ReturnValidationResult {
  return validateReturnLocation(location, input, {
    archivedCode: "DESTINATION_LOCATION_ARCHIVED",
    archivedMessage: "Archived destination locations cannot receive returned inventory.",
    field: "destinationLocationId",
    notFoundCode: "DESTINATION_LOCATION_NOT_FOUND",
    notFoundMessage: "Return destination location was not found.",
    organizationCode: "DESTINATION_LOCATION_ORGANIZATION_MISMATCH",
    organizationMessage: "Return destination location must belong to the same organization.",
    templeCode: "DESTINATION_LOCATION_TEMPLE_MISMATCH",
    templeMessage: "Return destination location must belong to the same temple."
  });
}

function validateReturnLocation(
  location: InventoryLocationReference | null,
  input: Pick<CreateReturnTransactionInput, "organizationId" | "templeId">,
  messages: {
    archivedCode: ReturnValidationErrorCode;
    archivedMessage: string;
    field: Extract<
      ReturnValidationErrorDetail["field"],
      "destinationLocationId" | "sourceLocationId"
    >;
    notFoundCode: ReturnValidationErrorCode;
    notFoundMessage: string;
    organizationCode: ReturnValidationErrorCode;
    organizationMessage: string;
    templeCode: ReturnValidationErrorCode;
    templeMessage: string;
  }
): ReturnValidationResult {
  const errors: ReturnValidationErrorDetail[] = [];

  if (!location) {
    errors.push(createReturnError(messages.notFoundCode, messages.field, messages.notFoundMessage));
  } else {
    pushReturnError(
      errors,
      location.organizationId !== input.organizationId,
      messages.organizationCode,
      "organizationId",
      messages.organizationMessage
    );
    pushReturnError(
      errors,
      location.templeId !== input.templeId,
      messages.templeCode,
      "templeId",
      messages.templeMessage
    );
    pushReturnError(
      errors,
      Boolean(location.deletedAt),
      messages.archivedCode,
      messages.field,
      messages.archivedMessage
    );
  }

  return createReturnValidationResult(errors);
}

export function validateReturnTransactionInput(
  input: CreateReturnTransactionInput,
  references?: {
    availableQuantity?: number;
    destinationLocation?: InventoryLocationReference | null;
    item?: InventoryItemReference | null;
    sourceLocation?: InventoryLocationReference | null;
  }
): ReturnValidationResult {
  const errors: ReturnValidationErrorDetail[] = [];

  pushReturnError(
    errors,
    !isNonEmptyString(input.organizationId),
    "REQUIRED_FIELD",
    "organizationId",
    "organizationId is required."
  );
  pushReturnError(
    errors,
    !isNonEmptyString(input.templeId),
    "REQUIRED_FIELD",
    "templeId",
    "templeId is required."
  );
  pushReturnError(
    errors,
    !isNonEmptyString(input.itemId),
    "REQUIRED_FIELD",
    "itemId",
    "Return item is required."
  );
  pushReturnError(
    errors,
    !isNonEmptyString(input.sourceLocationId),
    "REQUIRED_FIELD",
    "sourceLocationId",
    "Return source location is required."
  );
  pushReturnError(
    errors,
    !isNonEmptyString(input.destinationLocationId),
    "REQUIRED_FIELD",
    "destinationLocationId",
    "Return destination location is required."
  );
  pushReturnError(
    errors,
    isNonEmptyString(input.sourceLocationId) &&
      input.sourceLocationId === input.destinationLocationId,
    "SAME_LOCATION_RETURN",
    "destinationLocationId",
    "Return source and destination locations must differ."
  );

  errors.push(...validateReturnActor(input.actor));

  const quantityValidation = validateReturnQuantity(input.quantity, references?.availableQuantity);
  if (!quantityValidation.ok) {
    errors.push(...quantityValidation.errors);
  }

  const unitValidation = validateReturnUnit(input.unit, references?.item);
  if (!unitValidation.ok) {
    errors.push(...unitValidation.errors);
  }

  if ("item" in (references ?? {})) {
    const itemValidation = validateReturnItem(references?.item ?? null, input.organizationId);
    if (!itemValidation.ok) {
      errors.push(...itemValidation.errors);
    }
  }

  if ("sourceLocation" in (references ?? {})) {
    const sourceValidation = validateReturnSourceLocation(
      references?.sourceLocation ?? null,
      input
    );
    if (!sourceValidation.ok) {
      errors.push(...sourceValidation.errors);
    }
  }

  if ("destinationLocation" in (references ?? {})) {
    const destinationValidation = validateReturnDestinationLocation(
      references?.destinationLocation ?? null,
      input
    );
    if (!destinationValidation.ok) {
      errors.push(...destinationValidation.errors);
    }
  }

  return createReturnValidationResult(errors);
}

export function assertValidReturnTransactionInput(
  input: CreateReturnTransactionInput,
  references?: {
    availableQuantity?: number;
    destinationLocation?: InventoryLocationReference | null;
    item?: InventoryItemReference | null;
    sourceLocation?: InventoryLocationReference | null;
  }
): CreateReturnTransactionInput {
  const result = validateReturnTransactionInput(input, references);

  if (!result.ok) {
    throw new ReturnValidationError(result.errors);
  }

  return input;
}
