import type { InventoryTransactionInsert } from "./inventoryTransactionMapper";
import { mapInventoryTransactionDraftToInsert } from "./inventoryTransactionMapper";
import type { ReceivingInventoryTransactionDraft } from "../../domain/types";
import { validateInventoryTransactionDraft } from "../../domain/validation";

export class InventoryPersistenceError extends Error {
  override readonly cause: unknown;
  readonly operation: "create_receiving_transaction" | "create_transaction";

  constructor(operation: InventoryPersistenceError["operation"], message: string, cause?: unknown) {
    super(message);
    this.name = "InventoryPersistenceError";
    this.cause = cause;
    this.operation = operation;
  }
}

export function assertPersistableReceivingTransactionDraft(
  draft: ReceivingInventoryTransactionDraft
): ReceivingInventoryTransactionDraft {
  const errors: string[] = [];
  const draftValidation = validateInventoryTransactionDraft(draft);

  if (!draftValidation.ok) {
    errors.push(...draftValidation.errors);
  }

  if (draft.transactionType !== "received") {
    errors.push("Receiving persistence requires received transaction type.");
  }

  if (draft.quantityEffect !== "increase") {
    errors.push("Receiving persistence requires increase quantity effect.");
  }

  if (draft.quantity <= 0) {
    errors.push("Receiving persistence requires positive quantity.");
  }

  if (!draft.destinationLocationId) {
    errors.push("Receiving persistence requires destinationLocationId.");
  }

  if (draft.sourceLocationId !== null) {
    errors.push("Receiving persistence requires null sourceLocationId.");
  }

  if (draft.reversalOfTransactionId !== null) {
    errors.push("Receiving persistence cannot persist reversal ids.");
  }

  if (!draft.auditMetadata.clientRequestId) {
    errors.push("Receiving persistence requires auditMetadata.clientRequestId.");
  }

  if (errors.length > 0) {
    throw new InventoryPersistenceError("create_receiving_transaction", errors.join(" "));
  }

  return draft;
}

export function mapReceivingTransactionDraftToInsert(
  draft: ReceivingInventoryTransactionDraft
): InventoryTransactionInsert {
  return mapInventoryTransactionDraftToInsert(assertPersistableReceivingTransactionDraft(draft));
}
