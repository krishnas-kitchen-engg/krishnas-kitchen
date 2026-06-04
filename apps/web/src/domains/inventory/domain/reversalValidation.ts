import { isNonEmptyString } from "@krishnas-kitchen/utils";

import type { CreateReversalTransactionInput, InventoryActor, InventoryTransaction } from "./types";

export type ReversibleInventoryTransaction = InventoryTransaction & {
  transactionType: "received" | "returned" | "transfer";
};

export type ReversalValidationErrorCode =
  | "ACTOR_INVALID"
  | "ALREADY_REVERSED"
  | "MISSING_DESTINATION_LOCATION"
  | "MISSING_ORIGINAL_TRANSACTION"
  | "MISSING_SOURCE_LOCATION"
  | "ORIGINAL_IS_REVERSAL"
  | "QUANTITY_NOT_FINITE"
  | "QUANTITY_NOT_POSITIVE"
  | "UNSUPPORTED_TRANSACTION_TYPE";

export type ReversalValidationErrorDetail = {
  code: ReversalValidationErrorCode;
  field:
    | "actor"
    | "destinationLocationId"
    | "quantity"
    | "reversalOfTransactionId"
    | "sourceLocationId"
    | "transactionId"
    | "transactionType";
  message: string;
};

export type ReversalValidationResult =
  | {
      ok: true;
    }
  | FailedReversalValidationResult;

export type FailedReversalValidationResult = {
  errors: ReversalValidationErrorDetail[];
  ok: false;
};

export class ReversalValidationError extends Error {
  readonly errors: readonly ReversalValidationErrorDetail[];

  constructor(errors: readonly ReversalValidationErrorDetail[]) {
    super(errors.map((error) => error.message).join(" "));
    this.name = "ReversalValidationError";
    this.errors = errors;
  }
}

function createReversalError(
  code: ReversalValidationErrorCode,
  field: ReversalValidationErrorDetail["field"],
  message: string
): ReversalValidationErrorDetail {
  return {
    code,
    field,
    message
  };
}

function createReversalValidationResult(
  errors: ReversalValidationErrorDetail[]
): ReversalValidationResult {
  return errors.length > 0 ? { errors, ok: false } : { ok: true };
}

function validateReversalActor(actor: InventoryActor): ReversalValidationErrorDetail[] {
  if (actor.type === "user" && !isNonEmptyString(actor.userId)) {
    return [createReversalError("ACTOR_INVALID", "actor", "User actor requires userId.")];
  }

  if (actor.type === "temporary_volunteer" && !isNonEmptyString(actor.tempSessionId)) {
    return [
      createReversalError(
        "ACTOR_INVALID",
        "actor",
        "Temporary volunteer actor requires tempSessionId."
      )
    ];
  }

  return [];
}

function isReversibleTransaction(
  transaction: InventoryTransaction
): transaction is ReversibleInventoryTransaction {
  return (
    transaction.transactionType === "received" ||
    transaction.transactionType === "returned" ||
    transaction.transactionType === "transfer"
  );
}

export function validateReversalEligibility(
  original: null,
  existingReversal?: InventoryTransaction | null
): FailedReversalValidationResult;
export function validateReversalEligibility(
  original: InventoryTransaction,
  existingReversal?: InventoryTransaction | null
): ReversalValidationResult;
export function validateReversalEligibility(
  original: InventoryTransaction | null,
  existingReversal?: InventoryTransaction | null
): ReversalValidationResult;
export function validateReversalEligibility(
  original: InventoryTransaction | null,
  existingReversal?: InventoryTransaction | null
): ReversalValidationResult {
  const errors: ReversalValidationErrorDetail[] = [];

  if (!original) {
    return {
      errors: [
        createReversalError(
          "MISSING_ORIGINAL_TRANSACTION",
          "transactionId",
          "Original inventory transaction was not found."
        )
      ],
      ok: false
    };
  }

  if (original.transactionType === "reversal") {
    errors.push(
      createReversalError(
        "ORIGINAL_IS_REVERSAL",
        "transactionType",
        "Reversal transactions cannot be undone."
      )
    );
  }

  if (!isReversibleTransaction(original)) {
    errors.push(
      createReversalError(
        "UNSUPPORTED_TRANSACTION_TYPE",
        "transactionType",
        "Only received, transfer, and returned transactions can be reversed."
      )
    );
  }

  if (existingReversal) {
    errors.push(
      createReversalError(
        "ALREADY_REVERSED",
        "reversalOfTransactionId",
        "Inventory transaction has already been reversed."
      )
    );
  }

  if (!Number.isFinite(original.quantity)) {
    errors.push(
      createReversalError("QUANTITY_NOT_FINITE", "quantity", "Reversal quantity must be finite.")
    );
  } else if (original.quantity <= 0) {
    errors.push(
      createReversalError(
        "QUANTITY_NOT_POSITIVE",
        "quantity",
        "Reversal quantity must be greater than zero."
      )
    );
  }

  if (original.transactionType === "received" && !original.destinationLocationId) {
    errors.push(
      createReversalError(
        "MISSING_DESTINATION_LOCATION",
        "destinationLocationId",
        "Received transactions require a destination location to reverse."
      )
    );
  }

  if (
    (original.transactionType === "transfer" || original.transactionType === "returned") &&
    !original.sourceLocationId
  ) {
    errors.push(
      createReversalError(
        "MISSING_SOURCE_LOCATION",
        "sourceLocationId",
        "Movement transactions require a source location to reverse."
      )
    );
  }

  if (
    (original.transactionType === "transfer" || original.transactionType === "returned") &&
    !original.destinationLocationId
  ) {
    errors.push(
      createReversalError(
        "MISSING_DESTINATION_LOCATION",
        "destinationLocationId",
        "Movement transactions require a destination location to reverse."
      )
    );
  }

  return createReversalValidationResult(errors);
}

export function validateReversalTransactionInput(
  original: null,
  input: CreateReversalTransactionInput,
  existingReversal?: InventoryTransaction | null
): FailedReversalValidationResult;
export function validateReversalTransactionInput(
  original: InventoryTransaction,
  input: CreateReversalTransactionInput,
  existingReversal?: InventoryTransaction | null
): ReversalValidationResult;
export function validateReversalTransactionInput(
  original: InventoryTransaction | null,
  input: CreateReversalTransactionInput,
  existingReversal?: InventoryTransaction | null
): ReversalValidationResult {
  const eligibility = validateReversalEligibility(original, existingReversal);
  const errors = eligibility.ok ? [] : [...eligibility.errors];

  errors.push(...validateReversalActor(input.actor));

  return createReversalValidationResult(errors);
}

export function assertValidReversalTransactionInput(
  original: InventoryTransaction,
  input: CreateReversalTransactionInput,
  existingReversal?: InventoryTransaction | null
): ReversibleInventoryTransaction {
  const result = validateReversalTransactionInput(original, input, existingReversal);

  if (!result.ok) {
    throw new ReversalValidationError(result.errors);
  }

  return original as ReversibleInventoryTransaction;
}
