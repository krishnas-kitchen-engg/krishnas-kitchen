import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { calculateInventoryBalances, calculateLocationItemBalance } from "./aggregation";
import {
  createReceivingTransaction,
  createReturnedTransaction,
  createReversalTransaction
} from "./transactionHelpers";
import type {
  CreateReturnTransactionInput,
  InventoryItemReference,
  InventoryLocationReference
} from "./types";
import {
  RETURN_MAX_QUANTITY,
  ReturnValidationError,
  assertValidReturnTransactionInput,
  validateReturnDestinationLocation,
  validateReturnQuantity,
  validateReturnSourceLocation,
  validateReturnTransactionInput,
  validateReturnUnit
} from "./returnValidation";

const baseInput: CreateReturnTransactionInput = {
  actor: {
    type: "user",
    userId: "user-1"
  },
  destinationLocationId: "pantry",
  itemId: "rice",
  organizationId: "org-1",
  quantity: 8,
  sourceLocationId: "kitchen",
  templeId: "temple-1",
  unit: "kg"
};

const item: InventoryItemReference = {
  defaultUnit: "kg",
  deletedAt: null,
  id: "rice",
  organizationId: "org-1"
};

const validLocation = (id: string): InventoryLocationReference => ({
  deletedAt: null,
  id,
  organizationId: "org-1",
  templeId: "temple-1"
});

describe("return validation", () => {
  it("requires positive finite quantities within the operational limit", () => {
    assert.equal(validateReturnQuantity(1).ok, true);
    assert.equal(validateReturnQuantity(RETURN_MAX_QUANTITY).ok, true);
    assert.equal(validateReturnQuantity(0).ok, false);
    assert.equal(validateReturnQuantity(Number.POSITIVE_INFINITY).ok, false);
    assert.equal(validateReturnQuantity(RETURN_MAX_QUANTITY + 1).ok, false);
  });

  it("rejects quantities above available projected inventory", () => {
    const result = validateReturnQuantity(9, 8);

    assert.equal(result.ok, false);
    assert.deepEqual(
      result.errors.map((error) => error.code),
      ["QUANTITY_EXCEEDS_AVAILABLE"]
    );
  });

  it("validates units against item return units", () => {
    assert.equal(validateReturnUnit("kg", item).ok, true);
    assert.equal(validateReturnUnit("g", item).ok, false);

    assert.equal(
      validateReturnUnit("unit", {
        ...item,
        returnUnits: ["kg", "unit"]
      }).ok,
      true
    );
  });

  it("rejects invalid source and destination locations", () => {
    const sourceResult = validateReturnSourceLocation(
      {
        deletedAt: "2026-01-01T00:00:00.000Z",
        id: "kitchen",
        organizationId: "other-org",
        templeId: "other-temple"
      },
      baseInput
    );
    const destinationResult = validateReturnDestinationLocation(
      {
        deletedAt: "2026-01-01T00:00:00.000Z",
        id: "pantry",
        organizationId: "other-org",
        templeId: "other-temple"
      },
      baseInput
    );

    assert.equal(sourceResult.ok, false);
    assert.deepEqual(
      sourceResult.errors.map((error) => error.code),
      [
        "SOURCE_LOCATION_ORGANIZATION_MISMATCH",
        "SOURCE_LOCATION_TEMPLE_MISMATCH",
        "SOURCE_LOCATION_ARCHIVED"
      ]
    );
    assert.equal(destinationResult.ok, false);
    assert.deepEqual(
      destinationResult.errors.map((error) => error.code),
      [
        "DESTINATION_LOCATION_ORGANIZATION_MISMATCH",
        "DESTINATION_LOCATION_TEMPLE_MISMATCH",
        "DESTINATION_LOCATION_ARCHIVED"
      ]
    );
  });

  it("prevents same-location returns", () => {
    const result = validateReturnTransactionInput({
      ...baseInput,
      destinationLocationId: "kitchen"
    });

    assert.equal(result.ok, false);
    assert.deepEqual(
      result.errors.map((error) => error.code),
      ["SAME_LOCATION_RETURN"]
    );
  });

  it("creates immutable return transaction drafts with audit metadata", () => {
    const draft = createReturnedTransaction({
      ...baseInput,
      auditMetadata: {
        deviceId: "phone-1",
        source: "offline_queue"
      },
      notes: "  unused festival rice  "
    });

    assert.equal(draft.transactionType, "returned");
    assert.equal(draft.quantityEffect, "transfer");
    assert.equal(draft.quantity, 8);
    assert.equal(draft.sourceLocationId, "kitchen");
    assert.equal(draft.destinationLocationId, "pantry");
    assert.equal(draft.reversalOfTransactionId, null);
    assert.equal(draft.auditMetadata.deviceId, "phone-1");
    assert.equal(draft.auditMetadata.source, "offline_queue");
    assert.equal(draft.auditMetadata.clientRequestId, draft.clientId);
    assert.equal(draft.notes, "unused festival rice");
  });

  it("throws return-specific errors for invalid return inputs", () => {
    assert.throws(
      () =>
        assertValidReturnTransactionInput(
          {
            ...baseInput,
            quantity: -1
          },
          {
            availableQuantity: 8,
            destinationLocation: validLocation("pantry"),
            item,
            sourceLocation: validLocation("kitchen")
          }
        ),
      ReturnValidationError
    );
  });

  it("aggregates return movement without signed transaction quantities", () => {
    const received = {
      ...createReceivingTransaction({
        ...baseInput,
        locationId: "kitchen",
        quantity: 12
      }),
      createdAt: "2026-06-04T07:00:00.000Z",
      id: "received-1"
    };
    const returned = {
      ...createReturnedTransaction(baseInput),
      createdAt: "2026-06-04T07:05:00.000Z",
      id: "return-1"
    };
    const balances = calculateInventoryBalances([received, returned]);

    assert.equal(returned.quantity, 8);
    assert.equal(calculateLocationItemBalance([received, returned], "kitchen", "rice"), 4);
    assert.equal(calculateLocationItemBalance([received, returned], "pantry", "rice"), 8);
    assert.equal(balances.length, 2);
  });

  it("supports reversal of return movement through a separate reversal transaction", () => {
    const returned = {
      ...createReturnedTransaction(baseInput),
      createdAt: "2026-06-04T07:05:00.000Z",
      id: "return-1"
    };
    const reversal = {
      ...createReversalTransaction(returned, {
        actor: {
          type: "user",
          userId: "manager-1"
        },
        auditMetadata: {
          reason: "mistake"
        }
      }),
      createdAt: "2026-06-04T07:06:00.000Z",
      id: "reversal-1"
    };

    assert.equal(reversal.transactionType, "reversal");
    assert.equal(reversal.quantityEffect, "transfer");
    assert.equal(reversal.reversalOfTransactionId, returned.id);
    assert.equal(reversal.sourceLocationId, "pantry");
    assert.equal(reversal.destinationLocationId, "kitchen");
    assert.equal(calculateLocationItemBalance([returned, reversal], "kitchen", "rice"), 0);
    assert.equal(calculateLocationItemBalance([returned, reversal], "pantry", "rice"), 0);
  });
});
