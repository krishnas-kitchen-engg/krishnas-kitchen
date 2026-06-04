import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { calculateLocationItemBalance } from "./aggregation";
import {
  createReceivingTransaction,
  createReversalTransaction,
  createReturnedTransaction,
  createTransferTransaction,
  getReversalTargetId
} from "./transactionHelpers";
import type { CreateReversalTransactionInput, InventoryTransaction } from "./types";
import {
  type ReversalValidationErrorCode,
  type ReversalValidationResult,
  ReversalValidationError,
  assertValidReversalTransactionInput,
  validateReversalEligibility,
  validateReversalTransactionInput
} from "./reversalValidation";

const reversalInput: CreateReversalTransactionInput = {
  actor: {
    type: "user",
    userId: "manager-1"
  },
  auditMetadata: {
    deviceId: "inventory-phone",
    reason: "entry mistake"
  },
  notes: "reverse mistaken transaction"
};

const received = {
  ...createReceivingTransaction({
    actor: {
      type: "user",
      userId: "manager-1"
    },
    itemId: "rice",
    locationId: "pantry",
    organizationId: "org-1",
    quantity: 25,
    templeId: "temple-1",
    unit: "kg"
  }),
  createdAt: "2026-06-04T08:00:00.000Z",
  id: "received-1"
} satisfies InventoryTransaction;

const transfer = {
  ...createTransferTransaction({
    actor: {
      type: "user",
      userId: "manager-1"
    },
    destinationLocationId: "pantry",
    itemId: "rice",
    organizationId: "org-1",
    quantity: 10,
    sourceLocationId: "trailer",
    templeId: "temple-1",
    unit: "kg"
  }),
  createdAt: "2026-06-04T08:10:00.000Z",
  id: "transfer-1"
} satisfies InventoryTransaction;

const returned = {
  ...createReturnedTransaction({
    actor: {
      type: "user",
      userId: "manager-1"
    },
    destinationLocationId: "pantry",
    itemId: "rice",
    organizationId: "org-1",
    quantity: 8,
    sourceLocationId: "kitchen",
    templeId: "temple-1",
    unit: "kg"
  }),
  createdAt: "2026-06-04T08:20:00.000Z",
  id: "return-1"
} satisfies InventoryTransaction;

function getErrorCodes(result: ReversalValidationResult): ReversalValidationErrorCode[] {
  assert.equal(result.ok, false);

  return result.errors.map((error) => error.code);
}

describe("reversal validation", () => {
  it("creates a positive reversal for received transactions", () => {
    const reversal = createReversalTransaction(received, reversalInput);

    assert.equal(reversal.transactionType, "reversal");
    assert.equal(reversal.quantityEffect, "decrease");
    assert.equal(reversal.quantity, 25);
    assert.equal(reversal.sourceLocationId, "pantry");
    assert.equal(reversal.destinationLocationId, null);
    assert.equal(reversal.reversalOfTransactionId, received.id);
    assert.equal(reversal.auditMetadata.reversedTransactionId, received.id);
    assert.equal(getReversalTargetId(reversal), received.id);
  });

  it("reverses transfer transactions by swapping movement locations", () => {
    const reversal = {
      ...createReversalTransaction(transfer, reversalInput),
      createdAt: "2026-06-04T08:11:00.000Z",
      id: "reversal-transfer-1"
    };

    assert.equal(reversal.quantityEffect, "transfer");
    assert.equal(reversal.quantity, 10);
    assert.equal(reversal.sourceLocationId, "pantry");
    assert.equal(reversal.destinationLocationId, "trailer");
    assert.equal(calculateLocationItemBalance([transfer, reversal], "trailer", "rice"), 0);
    assert.equal(calculateLocationItemBalance([transfer, reversal], "pantry", "rice"), 0);
  });

  it("reverses return transactions by swapping movement locations", () => {
    const reversal = {
      ...createReversalTransaction(returned, reversalInput),
      createdAt: "2026-06-04T08:21:00.000Z",
      id: "reversal-return-1"
    };

    assert.equal(reversal.quantityEffect, "transfer");
    assert.equal(reversal.quantity, 8);
    assert.equal(reversal.sourceLocationId, "pantry");
    assert.equal(reversal.destinationLocationId, "kitchen");
    assert.equal(calculateLocationItemBalance([returned, reversal], "kitchen", "rice"), 0);
    assert.equal(calculateLocationItemBalance([returned, reversal], "pantry", "rice"), 0);
  });

  it("rejects missing originals, reversals, unsupported types, and duplicate reversals", () => {
    const reversal = {
      ...createReversalTransaction(received, reversalInput),
      createdAt: "2026-06-04T08:01:00.000Z",
      id: "reversal-1"
    } satisfies InventoryTransaction;
    const consumed = {
      ...received,
      destinationLocationId: null,
      id: "consumed-1",
      quantityEffect: "decrease" as const,
      sourceLocationId: "pantry",
      transactionType: "consumed" as const
    } satisfies InventoryTransaction;

    assert.deepEqual(getErrorCodes(validateReversalEligibility(null)), [
      "MISSING_ORIGINAL_TRANSACTION"
    ]);
    assert.deepEqual(getErrorCodes(validateReversalEligibility(reversal)), [
      "ORIGINAL_IS_REVERSAL",
      "UNSUPPORTED_TRANSACTION_TYPE"
    ]);
    assert.deepEqual(getErrorCodes(validateReversalEligibility(consumed)), [
      "UNSUPPORTED_TRANSACTION_TYPE"
    ]);
    assert.deepEqual(getErrorCodes(validateReversalEligibility(received, reversal)), [
      "ALREADY_REVERSED"
    ]);
  });

  it("throws reversal-specific errors for invalid reversal requests", () => {
    assert.throws(
      () =>
        assertValidReversalTransactionInput(received, {
          ...reversalInput,
          actor: {
            type: "user",
            userId: ""
          }
        }),
      ReversalValidationError
    );

    const result = validateReversalTransactionInput(received, {
      ...reversalInput,
      actor: {
        type: "temporary_volunteer",
        tempSessionId: ""
      }
    });

    assert.equal(result.ok, false);
    assert.deepEqual(
      result.errors.map((error) => error.code),
      ["ACTOR_INVALID"]
    );
  });
});
