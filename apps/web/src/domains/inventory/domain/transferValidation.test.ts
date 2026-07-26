import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { calculateInventoryBalances, calculateLocationItemBalance } from "./aggregation";
import { createReceivingTransaction, createTransferTransaction } from "./transactionHelpers";
import type {
  CreateTransferTransactionInput,
  InventoryItemReference,
  InventoryLocationReference
} from "./types";
import {
  TRANSFER_MAX_QUANTITY,
  TransferValidationError,
  assertValidTransferTransactionInput,
  validateTransferDestinationLocation,
  validateTransferQuantity,
  validateTransferSourceLocation,
  validateTransferTransactionInput,
  validateTransferUnit
} from "./transferValidation";

const baseInput: CreateTransferTransactionInput = {
  actor: {
    type: "user",
    userId: "user-1"
  },
  destinationLocationId: "pantry",
  itemId: "rice",
  organizationId: "org-1",
  quantity: 10,
  sourceLocationId: "trailer",
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

describe("transfer validation", () => {
  it("requires positive finite quantities within the operational limit", () => {
    assert.equal(validateTransferQuantity(1).ok, true);
    assert.equal(validateTransferQuantity(TRANSFER_MAX_QUANTITY).ok, true);
    assert.equal(validateTransferQuantity(0).ok, false);
    assert.equal(validateTransferQuantity(Number.POSITIVE_INFINITY).ok, false);
    assert.equal(validateTransferQuantity(TRANSFER_MAX_QUANTITY + 1).ok, false);
  });

  it("rejects quantities above available projected inventory", () => {
    const result = validateTransferQuantity(11, 10);

    assert.equal(result.ok, false);
    assert.deepEqual(
      result.errors.map((error) => error.code),
      ["QUANTITY_EXCEEDS_AVAILABLE"]
    );
  });

  it("validates units against item transfer units", () => {
    assert.equal(validateTransferUnit("kg", item).ok, true);
    assert.equal(validateTransferUnit("g", item).ok, false);

    assert.equal(
      validateTransferUnit("unit", {
        ...item,
        transferUnits: ["kg", "unit"]
      }).ok,
      true
    );
  });

  it("rejects invalid source and destination locations", () => {
    const sourceResult = validateTransferSourceLocation(
      {
        deletedAt: "2026-01-01T00:00:00.000Z",
        id: "trailer",
        organizationId: "other-org",
        templeId: "other-temple"
      },
      baseInput
    );
    const destinationResult = validateTransferDestinationLocation(
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

  it("prevents same-location transfers", () => {
    const result = validateTransferTransactionInput({
      ...baseInput,
      destinationLocationId: "trailer"
    });

    assert.equal(result.ok, false);
    assert.deepEqual(
      result.errors.map((error) => error.code),
      ["SAME_LOCATION_TRANSFER"]
    );
  });

  it("creates immutable transfer transaction drafts with audit metadata", () => {
    const draft = createTransferTransaction({
      ...baseInput,
      auditMetadata: {
        deviceId: "phone-1",
        source: "offline_queue"
      },
      notes: "  trailer restock  "
    });

    assert.equal(draft.transactionType, "transfer");
    assert.equal(draft.quantityEffect, "transfer");
    assert.equal(draft.quantity, 10);
    assert.equal(draft.sourceLocationId, "trailer");
    assert.equal(draft.destinationLocationId, "pantry");
    assert.equal(draft.reversalOfTransactionId, null);
    assert.equal(draft.auditMetadata.deviceId, "phone-1");
    assert.equal(draft.auditMetadata.source, "offline_queue");
    assert.equal(draft.auditMetadata.clientRequestId, draft.clientId);
    assert.equal(draft.notes, "trailer restock");
  });

  it("throws transfer-specific errors for invalid transfer inputs", () => {
    assert.throws(
      () =>
        assertValidTransferTransactionInput(
          {
            ...baseInput,
            quantity: -1
          },
          {
            availableQuantity: 10,
            destinationLocation: validLocation("pantry"),
            item,
            sourceLocation: validLocation("trailer")
          }
        ),
      TransferValidationError
    );
  });

  it("aggregates transfer semantics without signed transaction quantities", () => {
    const received = {
      ...createReceivingTransaction({
        ...baseInput,
        locationId: "trailer",
        quantity: 20
      }),
      createdAt: "2026-06-03T07:00:00.000Z",
      id: "received-1"
    };
    const transfer = {
      ...createTransferTransaction(baseInput),
      createdAt: "2026-06-03T07:05:00.000Z",
      id: "transfer-1"
    };
    const balances = calculateInventoryBalances([received, transfer]);

    assert.equal(transfer.quantity, 10);
    assert.equal(calculateLocationItemBalance([received, transfer], "trailer", "rice"), 10);
    assert.equal(calculateLocationItemBalance([received, transfer], "pantry", "rice"), 10);
    assert.equal(balances.length, 2);
  });
});
