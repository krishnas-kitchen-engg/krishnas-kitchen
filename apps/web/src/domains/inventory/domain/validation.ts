import type {
  CreateInventoryTransactionInput,
  InventoryActor,
  InventoryTransactionDraft
} from "./types";

export type InventoryValidationResult =
  | {
      ok: true;
    }
  | {
      errors: string[];
      ok: false;
    };

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function validateActor(actor: InventoryActor): string[] {
  if (actor.type === "user" && !isNonEmptyString(actor.userId)) {
    return ["User actor requires userId."];
  }

  if (actor.type === "temporary_volunteer" && !isNonEmptyString(actor.tempSessionId)) {
    return ["Temporary volunteer actor requires tempSessionId."];
  }

  return [];
}

type BaseInventoryTransactionInput = Pick<
  CreateInventoryTransactionInput,
  "actor" | "itemId" | "organizationId" | "quantity" | "templeId"
>;

export function validateBaseTransactionInput(
  input: BaseInventoryTransactionInput
): InventoryValidationResult {
  const errors = [
    !isNonEmptyString(input.organizationId) ? "organizationId is required." : null,
    !isNonEmptyString(input.templeId) ? "templeId is required." : null,
    !isNonEmptyString(input.itemId) ? "itemId is required." : null,
    input.quantity > 0 ? null : "quantity must be greater than zero.",
    ...validateActor(input.actor)
  ].filter(isNonEmptyString);

  return errors.length > 0 ? { errors, ok: false } : { ok: true };
}

export function validateInventoryTransactionDraft(
  draft: InventoryTransactionDraft
): InventoryValidationResult {
  const baseValidation = validateBaseTransactionInput(draft);
  const errors = baseValidation.ok ? [] : [...baseValidation.errors];

  if (!isNonEmptyString(draft.clientId)) {
    errors.push("clientId is required for offline-safe transaction drafts.");
  }

  if (draft.transactionType === "transfer") {
    if (!draft.sourceLocationId || !draft.destinationLocationId) {
      errors.push("Transfer transactions require source and destination locations.");
    }

    if (draft.sourceLocationId === draft.destinationLocationId) {
      errors.push("Transfer source and destination locations must differ.");
    }

    if (draft.quantityEffect !== "transfer") {
      errors.push("Transfer transactions must use transfer quantity effect.");
    }
  }

  if (draft.transactionType !== "transfer" && draft.quantityEffect === "transfer") {
    errors.push("Only transfer transactions can use transfer quantity effect.");
  }

  if (draft.quantityEffect === "increase" && !draft.destinationLocationId) {
    errors.push("Increase transactions require destinationLocationId.");
  }

  if (draft.quantityEffect === "decrease" && !draft.sourceLocationId) {
    errors.push("Decrease transactions require sourceLocationId.");
  }

  if (draft.quantityEffect === "none" && (draft.sourceLocationId || draft.destinationLocationId)) {
    errors.push("No-effect transactions should not change source or destination locations.");
  }

  return errors.length > 0 ? { errors, ok: false } : { ok: true };
}

export function assertValidInventoryTransactionDraft(
  draft: InventoryTransactionDraft
): InventoryTransactionDraft {
  const result = validateInventoryTransactionDraft(draft);

  if (!result.ok) {
    throw new Error(result.errors.join(" "));
  }

  return draft;
}
