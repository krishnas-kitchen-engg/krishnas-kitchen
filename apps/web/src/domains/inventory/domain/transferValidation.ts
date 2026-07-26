import type { EntityId, ItemUnit } from "@krishnas-kitchen/types";
import { isNonEmptyString } from "@krishnas-kitchen/utils";

import type {
  CreateTransferTransactionInput,
  InventoryActor,
  InventoryItemReference,
  InventoryLocationReference
} from "./types";

export const TRANSFER_MAX_QUANTITY = 1_000_000;

export const TRANSFER_UNITS = ["g", "kg", "ml", "l", "unit"] as const satisfies readonly ItemUnit[];

export type TransferValidationErrorCode =
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
  | "SAME_LOCATION_TRANSFER"
  | "SOURCE_LOCATION_ARCHIVED"
  | "SOURCE_LOCATION_NOT_FOUND"
  | "SOURCE_LOCATION_ORGANIZATION_MISMATCH"
  | "SOURCE_LOCATION_TEMPLE_MISMATCH"
  | "UNIT_INVALID"
  | "UNIT_NOT_TRANSFERABLE";

export type TransferValidationErrorDetail = {
  code: TransferValidationErrorCode;
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

export type TransferValidationResult =
  | {
      ok: true;
    }
  | {
      errors: TransferValidationErrorDetail[];
      ok: false;
    };

export class TransferValidationError extends Error {
  readonly errors: readonly TransferValidationErrorDetail[];

  constructor(errors: readonly TransferValidationErrorDetail[]) {
    super(errors.map((error) => error.message).join(" "));
    this.name = "TransferValidationError";
    this.errors = errors;
  }
}

function createTransferError(
  code: TransferValidationErrorCode,
  field: TransferValidationErrorDetail["field"],
  message: string
): TransferValidationErrorDetail {
  return {
    code,
    field,
    message
  };
}

function createTransferValidationResult(
  errors: TransferValidationErrorDetail[]
): TransferValidationResult {
  return errors.length > 0 ? { errors, ok: false } : { ok: true };
}

function pushTransferError(
  errors: TransferValidationErrorDetail[],
  condition: boolean,
  code: TransferValidationErrorCode,
  field: TransferValidationErrorDetail["field"],
  message: string
): void {
  if (condition) {
    errors.push(createTransferError(code, field, message));
  }
}

function isItemUnit(value: unknown): value is ItemUnit {
  return TRANSFER_UNITS.includes(value as ItemUnit);
}

function getTransferableUnits(item: InventoryItemReference): readonly ItemUnit[] {
  return item.transferUnits?.length ? item.transferUnits : [item.defaultUnit];
}

function validateTransferActor(actor: InventoryActor): TransferValidationErrorDetail[] {
  if (actor.type === "user" && !isNonEmptyString(actor.userId)) {
    return [createTransferError("ACTOR_INVALID", "actor", "User actor requires userId.")];
  }

  if (actor.type === "temporary_volunteer" && !isNonEmptyString(actor.tempSessionId)) {
    return [
      createTransferError(
        "ACTOR_INVALID",
        "actor",
        "Temporary volunteer actor requires tempSessionId."
      )
    ];
  }

  return [];
}

export function validateTransferQuantity(
  quantity: number,
  availableQuantity?: number
): TransferValidationResult {
  const errors: TransferValidationErrorDetail[] = [];

  if (!Number.isFinite(quantity)) {
    errors.push(
      createTransferError("QUANTITY_NOT_FINITE", "quantity", "Transfer quantity must be finite.")
    );
  } else {
    pushTransferError(
      errors,
      quantity <= 0,
      "QUANTITY_NOT_POSITIVE",
      "quantity",
      "Transfer quantity must be greater than zero."
    );
    pushTransferError(
      errors,
      quantity > TRANSFER_MAX_QUANTITY,
      "QUANTITY_TOO_LARGE",
      "quantity",
      `Transfer quantity must be ${TRANSFER_MAX_QUANTITY} or less.`
    );
    pushTransferError(
      errors,
      typeof availableQuantity === "number" && quantity > availableQuantity,
      "QUANTITY_EXCEEDS_AVAILABLE",
      "quantity",
      "Transfer quantity cannot exceed available inventory."
    );
  }

  return createTransferValidationResult(errors);
}

export function validateTransferUnit(
  unit: ItemUnit,
  item?: InventoryItemReference | null
): TransferValidationResult {
  const errors: TransferValidationErrorDetail[] = [];

  pushTransferError(errors, !isItemUnit(unit), "UNIT_INVALID", "unit", "Transfer unit is invalid.");
  pushTransferError(
    errors,
    Boolean(item && !getTransferableUnits(item).includes(unit)),
    "UNIT_NOT_TRANSFERABLE",
    "unit",
    "Transfer unit is not allowed for this item."
  );

  return createTransferValidationResult(errors);
}

export function validateTransferItem(
  item: InventoryItemReference | null,
  organizationId: EntityId
): TransferValidationResult {
  const errors: TransferValidationErrorDetail[] = [];

  if (!item) {
    errors.push(createTransferError("ITEM_NOT_FOUND", "itemId", "Transfer item was not found."));
  } else {
    pushTransferError(
      errors,
      item.organizationId !== organizationId,
      "ITEM_ORGANIZATION_MISMATCH",
      "organizationId",
      "Transfer item must belong to the same organization."
    );
    pushTransferError(
      errors,
      Boolean(item.deletedAt),
      "ITEM_ARCHIVED",
      "itemId",
      "Archived items cannot be transferred."
    );
  }

  return createTransferValidationResult(errors);
}

export function validateTransferSourceLocation(
  location: InventoryLocationReference | null,
  input: Pick<CreateTransferTransactionInput, "organizationId" | "sourceLocationId" | "templeId">
): TransferValidationResult {
  return validateTransferLocation(location, input, {
    archivedCode: "SOURCE_LOCATION_ARCHIVED",
    archivedMessage: "Archived source locations cannot transfer inventory.",
    field: "sourceLocationId",
    notFoundCode: "SOURCE_LOCATION_NOT_FOUND",
    notFoundMessage: "Transfer source location was not found.",
    organizationCode: "SOURCE_LOCATION_ORGANIZATION_MISMATCH",
    organizationMessage: "Transfer source location must belong to the same organization.",
    templeCode: "SOURCE_LOCATION_TEMPLE_MISMATCH",
    templeMessage: "Transfer source location must belong to the same temple."
  });
}

export function validateTransferDestinationLocation(
  location: InventoryLocationReference | null,
  input: Pick<
    CreateTransferTransactionInput,
    "destinationLocationId" | "organizationId" | "templeId"
  >
): TransferValidationResult {
  return validateTransferLocation(location, input, {
    archivedCode: "DESTINATION_LOCATION_ARCHIVED",
    archivedMessage: "Archived destination locations cannot receive transferred inventory.",
    field: "destinationLocationId",
    notFoundCode: "DESTINATION_LOCATION_NOT_FOUND",
    notFoundMessage: "Transfer destination location was not found.",
    organizationCode: "DESTINATION_LOCATION_ORGANIZATION_MISMATCH",
    organizationMessage: "Transfer destination location must belong to the same organization.",
    templeCode: "DESTINATION_LOCATION_TEMPLE_MISMATCH",
    templeMessage: "Transfer destination location must belong to the same temple."
  });
}

function validateTransferLocation(
  location: InventoryLocationReference | null,
  input: Pick<CreateTransferTransactionInput, "organizationId" | "templeId">,
  messages: {
    archivedCode: TransferValidationErrorCode;
    archivedMessage: string;
    field: Extract<
      TransferValidationErrorDetail["field"],
      "destinationLocationId" | "sourceLocationId"
    >;
    notFoundCode: TransferValidationErrorCode;
    notFoundMessage: string;
    organizationCode: TransferValidationErrorCode;
    organizationMessage: string;
    templeCode: TransferValidationErrorCode;
    templeMessage: string;
  }
): TransferValidationResult {
  const errors: TransferValidationErrorDetail[] = [];

  if (!location) {
    errors.push(
      createTransferError(messages.notFoundCode, messages.field, messages.notFoundMessage)
    );
  } else {
    pushTransferError(
      errors,
      location.organizationId !== input.organizationId,
      messages.organizationCode,
      "organizationId",
      messages.organizationMessage
    );
    pushTransferError(
      errors,
      location.templeId !== input.templeId,
      messages.templeCode,
      "templeId",
      messages.templeMessage
    );
    pushTransferError(
      errors,
      Boolean(location.deletedAt),
      messages.archivedCode,
      messages.field,
      messages.archivedMessage
    );
  }

  return createTransferValidationResult(errors);
}

export function validateTransferTransactionInput(
  input: CreateTransferTransactionInput,
  references?: {
    availableQuantity?: number;
    destinationLocation?: InventoryLocationReference | null;
    item?: InventoryItemReference | null;
    sourceLocation?: InventoryLocationReference | null;
  }
): TransferValidationResult {
  const errors: TransferValidationErrorDetail[] = [];

  pushTransferError(
    errors,
    !isNonEmptyString(input.organizationId),
    "REQUIRED_FIELD",
    "organizationId",
    "organizationId is required."
  );
  pushTransferError(
    errors,
    !isNonEmptyString(input.templeId),
    "REQUIRED_FIELD",
    "templeId",
    "templeId is required."
  );
  pushTransferError(
    errors,
    !isNonEmptyString(input.itemId),
    "REQUIRED_FIELD",
    "itemId",
    "Transfer item is required."
  );
  pushTransferError(
    errors,
    !isNonEmptyString(input.sourceLocationId),
    "REQUIRED_FIELD",
    "sourceLocationId",
    "Transfer source location is required."
  );
  pushTransferError(
    errors,
    !isNonEmptyString(input.destinationLocationId),
    "REQUIRED_FIELD",
    "destinationLocationId",
    "Transfer destination location is required."
  );
  pushTransferError(
    errors,
    isNonEmptyString(input.sourceLocationId) &&
      input.sourceLocationId === input.destinationLocationId,
    "SAME_LOCATION_TRANSFER",
    "destinationLocationId",
    "Transfer source and destination locations must differ."
  );

  errors.push(...validateTransferActor(input.actor));

  const quantityValidation = validateTransferQuantity(
    input.quantity,
    references?.availableQuantity
  );
  if (!quantityValidation.ok) {
    errors.push(...quantityValidation.errors);
  }

  const unitValidation = validateTransferUnit(input.unit, references?.item);
  if (!unitValidation.ok) {
    errors.push(...unitValidation.errors);
  }

  if ("item" in (references ?? {})) {
    const itemValidation = validateTransferItem(references?.item ?? null, input.organizationId);
    if (!itemValidation.ok) {
      errors.push(...itemValidation.errors);
    }
  }

  if ("sourceLocation" in (references ?? {})) {
    const sourceValidation = validateTransferSourceLocation(
      references?.sourceLocation ?? null,
      input
    );
    if (!sourceValidation.ok) {
      errors.push(...sourceValidation.errors);
    }
  }

  if ("destinationLocation" in (references ?? {})) {
    const destinationValidation = validateTransferDestinationLocation(
      references?.destinationLocation ?? null,
      input
    );
    if (!destinationValidation.ok) {
      errors.push(...destinationValidation.errors);
    }
  }

  return createTransferValidationResult(errors);
}

export function assertValidTransferTransactionInput(
  input: CreateTransferTransactionInput,
  references?: {
    availableQuantity?: number;
    destinationLocation?: InventoryLocationReference | null;
    item?: InventoryItemReference | null;
    sourceLocation?: InventoryLocationReference | null;
  }
): CreateTransferTransactionInput {
  const result = validateTransferTransactionInput(input, references);

  if (!result.ok) {
    throw new TransferValidationError(result.errors);
  }

  return input;
}
