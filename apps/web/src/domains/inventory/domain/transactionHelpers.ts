import type {
  EntityId,
  InventoryQuantityEffect,
  InventoryTransactionType
} from "@krishnas-kitchen/types";

import { createUuid } from "@/shared/lib/uuid";

import { assertValidInventoryTransactionDraft } from "./validation";
import { assertValidInventoryAdjustmentInput } from "./adjustmentValidation";
import { assertValidConsumptionTransactionInput } from "./consumptionValidation";
import { assertValidReceivingTransactionInput } from "./receivingValidation";
import { assertValidReversalTransactionInput } from "./reversalValidation";
import { assertValidReturnTransactionInput } from "./returnValidation";
import { assertValidTransferTransactionInput } from "./transferValidation";
import type {
  CreateAdjustmentTransactionInput,
  CreateInventoryAdjustmentInput,
  CreateConsumptionTransactionInput,
  CreateInventoryTransactionInput,
  CreateLocationTransactionInput,
  CreateReceivingTransactionInput,
  CreateReversalTransactionInput,
  CreateReturnTransactionInput,
  CreateTransferTransactionInput,
  InventoryTransaction,
  InventoryTransactionDraft,
  ReceivingInventoryTransactionDraft,
  ReversalInventoryTransactionDraft,
  ReturnInventoryTransactionDraft,
  TransferInventoryTransactionDraft
} from "./types";

function createClientId(): EntityId {
  return createUuid();
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
  input: CreateConsumptionTransactionInput
): InventoryTransactionDraft {
  const validInput = assertValidConsumptionTransactionInput(input);

  return assertValidInventoryTransactionDraft({
    ...createBaseDraft(validInput, "consumed", "decrease"),
    destinationLocationId: null,
    sourceLocationId: validInput.locationId
  });
}

export function createReturnedTransaction(
  input: CreateReturnTransactionInput
): ReturnInventoryTransactionDraft {
  const validInput = assertValidReturnTransactionInput(input);

  return assertValidInventoryTransactionDraft({
    ...createBaseDraft(validInput, "returned", "transfer"),
    destinationLocationId: validInput.destinationLocationId,
    sourceLocationId: validInput.sourceLocationId
  }) as ReturnInventoryTransactionDraft;
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

export function createInventoryAdjustmentTransaction(
  input: CreateInventoryAdjustmentInput,
  currentQuantity: number
): InventoryTransactionDraft | null {
  const validInput = assertValidInventoryAdjustmentInput(input);
  const quantityDelta = validInput.physicalQuantity - currentQuantity;

  if (quantityDelta === 0) {
    return null;
  }

  return createAdjustmentTransaction({
    actor: validInput.actor,
    auditMetadata: {
      reason: validInput.reason.trim(),
      source: "online",
      ...validInput.auditMetadata
    },
    direction: quantityDelta > 0 ? "increase" : "decrease",
    itemId: validInput.itemId,
    locationId: validInput.locationId,
    notes: validInput.notes,
    organizationId: validInput.organizationId,
    quantity: Math.abs(quantityDelta),
    templeId: validInput.templeId,
    unit: validInput.unit
  });
}

export function createTransferTransaction(
  input: CreateTransferTransactionInput
): TransferInventoryTransactionDraft {
  const validInput = assertValidTransferTransactionInput(input);

  return assertValidInventoryTransactionDraft({
    ...createBaseDraft(validInput, "transfer", "transfer"),
    destinationLocationId: validInput.destinationLocationId,
    sourceLocationId: validInput.sourceLocationId
  }) as TransferInventoryTransactionDraft;
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

export function createReversalTransaction(
  original: InventoryTransaction,
  input: CreateReversalTransactionInput
): ReversalInventoryTransactionDraft {
  const validOriginal = assertValidReversalTransactionInput(original, input);
  const base = createBaseDraft(
    {
      actor: input.actor,
      auditMetadata: {
        reason: "reversal",
        reversedTransactionId: validOriginal.id,
        ...input.auditMetadata
      },
      itemId: validOriginal.itemId,
      notes: input.notes,
      organizationId: validOriginal.organizationId,
      quantity: validOriginal.quantity,
      templeId: validOriginal.templeId,
      unit: validOriginal.unit
    },
    "reversal",
    getInverseEffect(validOriginal.quantityEffect)
  );

  const draft: InventoryTransactionDraft =
    validOriginal.quantityEffect === "transfer"
      ? {
          ...base,
          destinationLocationId: validOriginal.sourceLocationId,
          reversalOfTransactionId: validOriginal.id,
          sourceLocationId: validOriginal.destinationLocationId
        }
      : {
          ...base,
          destinationLocationId:
            validOriginal.quantityEffect === "decrease" ? validOriginal.sourceLocationId : null,
          reversalOfTransactionId: validOriginal.id,
          sourceLocationId:
            validOriginal.quantityEffect === "increase" ? validOriginal.destinationLocationId : null
        };

  return assertValidInventoryTransactionDraft(draft) as ReversalInventoryTransactionDraft;
}

export function getReversalTargetId(
  transaction: Pick<InventoryTransactionDraft, "auditMetadata" | "reversalOfTransactionId">
): EntityId | null {
  return (
    transaction.reversalOfTransactionId ?? transaction.auditMetadata.reversedTransactionId ?? null
  );
}
