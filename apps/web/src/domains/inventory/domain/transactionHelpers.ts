import type {
  EntityId,
  InventoryQuantityEffect,
  InventoryTransactionType
} from "@krishnas-kitchen/types";

import { assertValidInventoryTransactionDraft } from "./validation";
import { assertValidReceivingTransactionInput } from "./receivingValidation";
import type {
  CreateAdjustmentTransactionInput,
  CreateInventoryTransactionInput,
  CreateLocationTransactionInput,
  CreateReceivingTransactionInput,
  CreateTransferTransactionInput,
  InventoryTransaction,
  InventoryTransactionDraft,
  ReceivingInventoryTransactionDraft
} from "./types";

function createClientId(): EntityId {
  return crypto.randomUUID();
}

function createBaseDraft(
  input: CreateInventoryTransactionInput,
  transactionType: InventoryTransactionType,
  quantityEffect: InventoryQuantityEffect
): Omit<InventoryTransactionDraft, "destinationLocationId" | "sourceLocationId"> {
  const clientId = createClientId();

  return {
    actor: input.actor,
    auditMetadata: {
      clientRequestId: clientId,
      source: "online",
      ...input.auditMetadata
    },
    clientId,
    itemId: input.itemId,
    notes: input.notes?.trim() || null,
    organizationId: input.organizationId,
    quantity: input.quantity,
    quantityEffect,
    reversalOfTransactionId: null,
    templeId: input.templeId,
    transactionType,
    unit: input.unit
  };
}

export function createReceivedTransaction(
  input: CreateLocationTransactionInput
): InventoryTransactionDraft {
  return assertValidInventoryTransactionDraft({
    ...createBaseDraft(input, "received", "increase"),
    destinationLocationId: input.locationId,
    sourceLocationId: null
  });
}

export function createReceivingTransaction(
  input: CreateReceivingTransactionInput
): ReceivingInventoryTransactionDraft {
  return createReceivedTransaction(
    assertValidReceivingTransactionInput(input)
  ) as ReceivingInventoryTransactionDraft;
}

export function createConsumedTransaction(
  input: CreateLocationTransactionInput
): InventoryTransactionDraft {
  return assertValidInventoryTransactionDraft({
    ...createBaseDraft(input, "consumed", "decrease"),
    destinationLocationId: null,
    sourceLocationId: input.locationId
  });
}

export function createReturnedTransaction(
  input: CreateLocationTransactionInput
): InventoryTransactionDraft {
  return assertValidInventoryTransactionDraft({
    ...createBaseDraft(input, "returned", "increase"),
    destinationLocationId: input.locationId,
    sourceLocationId: null
  });
}

export function createWastedTransaction(
  input: CreateLocationTransactionInput
): InventoryTransactionDraft {
  return assertValidInventoryTransactionDraft({
    ...createBaseDraft(input, "wasted", "decrease"),
    destinationLocationId: null,
    sourceLocationId: input.locationId
  });
}

export function createReservationTransaction(
  input: CreateInventoryTransactionInput
): InventoryTransactionDraft {
  return assertValidInventoryTransactionDraft({
    ...createBaseDraft(input, "reservation", "none"),
    destinationLocationId: null,
    sourceLocationId: null
  });
}

export function createAdjustmentTransaction(
  input: CreateAdjustmentTransactionInput
): InventoryTransactionDraft {
  return assertValidInventoryTransactionDraft({
    ...createBaseDraft(input, "adjusted", input.direction),
    destinationLocationId: input.direction === "increase" ? input.locationId : null,
    sourceLocationId: input.direction === "decrease" ? input.locationId : null
  });
}

export function createTransferTransaction(
  input: CreateTransferTransactionInput
): InventoryTransactionDraft {
  return assertValidInventoryTransactionDraft({
    ...createBaseDraft(input, "transfer", "transfer"),
    destinationLocationId: input.destinationLocationId,
    sourceLocationId: input.sourceLocationId
  });
}

function getInverseEffect(effect: InventoryQuantityEffect): InventoryQuantityEffect {
  if (effect === "increase") {
    return "decrease";
  }

  if (effect === "decrease") {
    return "increase";
  }

  return effect;
}

export function createUndoTransaction(
  original: InventoryTransaction,
  input: Pick<CreateInventoryTransactionInput, "actor" | "auditMetadata" | "notes">
): InventoryTransactionDraft {
  const base = createBaseDraft(
    {
      actor: input.actor,
      auditMetadata: {
        reason: "undo",
        reversedTransactionId: original.id,
        ...input.auditMetadata
      },
      itemId: original.itemId,
      notes: input.notes,
      organizationId: original.organizationId,
      quantity: original.quantity,
      templeId: original.templeId,
      unit: original.unit
    },
    "undo",
    getInverseEffect(original.quantityEffect)
  );

  const draft: InventoryTransactionDraft =
    original.quantityEffect === "transfer"
      ? {
          ...base,
          destinationLocationId: original.sourceLocationId,
          reversalOfTransactionId: original.id,
          sourceLocationId: original.destinationLocationId
        }
      : {
          ...base,
          destinationLocationId:
            original.quantityEffect === "decrease" ? original.sourceLocationId : null,
          reversalOfTransactionId: original.id,
          sourceLocationId:
            original.quantityEffect === "increase" ? original.destinationLocationId : null
        };

  return assertValidInventoryTransactionDraft(draft);
}
