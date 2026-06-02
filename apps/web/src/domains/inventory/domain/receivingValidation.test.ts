import assert from "node:assert/strict";
import { describe, it } from "vitest";

import type { CreateReceivingTransactionInput, InventoryItemReference } from "./types";
import {
  RECEIVING_MAX_QUANTITY,
  ReceivingValidationError,
  assertValidReceivingTransactionInput,
  validateReceivingLocation,
  validateReceivingQuantity,
  validateReceivingTransactionInput,
  validateReceivingUnit
} from "./receivingValidation";
import { createReceivingTransaction } from "./transactionHelpers";

const baseInput: CreateReceivingTransactionInput = {
  actor: {
    type: "user",
    userId: "user-1"
  },
  itemId: "item-1",
  locationId: "location-1",
  organizationId: "org-1",
  quantity: 12,
  templeId: "temple-1",
  unit: "kg"
};

const item: InventoryItemReference = {
  defaultUnit: "kg",
  deletedAt: null,
  id: "item-1",
  organizationId: "org-1"
};

describe("receiving validation", () => {
  it("requires positive finite quantities within the operational limit", () => {
    assert.equal(validateReceivingQuantity(1).ok, true);
    assert.equal(validateReceivingQuantity(RECEIVING_MAX_QUANTITY).ok, true);

    assert.deepEqual(validateReceivingQuantity(0), {
      errors: [
        {
          code: "QUANTITY_NOT_POSITIVE",
          field: "quantity",
          message: "Receiving quantity must be greater than zero."
        }
      ],
      ok: false
    });

    assert.equal(validateReceivingQuantity(Number.POSITIVE_INFINITY).ok, false);
    assert.equal(validateReceivingQuantity(RECEIVING_MAX_QUANTITY + 1).ok, false);
  });

  it("validates units against the item receiving units", () => {
    assert.equal(validateReceivingUnit("kg", item).ok, true);
    assert.equal(validateReceivingUnit("g", item).ok, false);

    assert.equal(
      validateReceivingUnit("unit", {
        ...item,
        receivingUnits: ["kg", "unit"]
      }).ok,
      true
    );
  });

  it("rejects archived and cross-scope receiving locations", () => {
    const result = validateReceivingLocation(
      {
        deletedAt: "2026-01-01T00:00:00.000Z",
        id: "location-1",
        organizationId: "other-org",
        templeId: "other-temple"
      },
      baseInput
    );

    assert.equal(result.ok, false);
    assert.deepEqual(
      result.errors.map((error) => error.code),
      ["LOCATION_ORGANIZATION_MISMATCH", "LOCATION_TEMPLE_MISMATCH", "LOCATION_ARCHIVED"]
    );
  });

  it("creates immutable receiving increase transaction drafts with audit metadata", () => {
    const draft = createReceivingTransaction({
      ...baseInput,
      auditMetadata: {
        deviceId: "phone-1",
        source: "offline_queue"
      },
      notes: "  delivery receipt #44  "
    });

    assert.equal(draft.transactionType, "received");
    assert.equal(draft.quantityEffect, "increase");
    assert.equal(draft.destinationLocationId, "location-1");
    assert.equal(draft.sourceLocationId, null);
    assert.equal(draft.reversalOfTransactionId, null);
    assert.equal(draft.auditMetadata.deviceId, "phone-1");
    assert.equal(draft.auditMetadata.source, "offline_queue");
    assert.equal(draft.auditMetadata.clientRequestId, draft.clientId);
    assert.equal(draft.notes, "delivery receipt #44");
  });

  it("throws receiving-specific errors for invalid receiving inputs", () => {
    assert.throws(
      () =>
        assertValidReceivingTransactionInput(
          {
            ...baseInput,
            quantity: -1
          },
          {
            item,
            location: {
              deletedAt: null,
              id: "location-1",
              organizationId: "org-1",
              templeId: "temple-1"
            }
          }
        ),
      ReceivingValidationError
    );
  });

  it("validates item and location references when supplied", () => {
    const result = validateReceivingTransactionInput(baseInput, {
      item: {
        ...item,
        deletedAt: "2026-01-01T00:00:00.000Z"
      },
      location: null
    });

    assert.equal(result.ok, false);
    assert.deepEqual(
      result.errors.map((error) => error.code),
      ["ITEM_ARCHIVED", "LOCATION_NOT_FOUND"]
    );
  });

  it("returns receiving-specific errors for missing fields and actor identity", () => {
    const result = validateReceivingTransactionInput({
      ...baseInput,
      actor: {
        type: "temporary_volunteer",
        tempSessionId: ""
      },
      itemId: "",
      locationId: "",
      organizationId: "",
      templeId: ""
    });

    assert.equal(result.ok, false);
    assert.deepEqual(
      result.errors.map((error) => error.code),
      ["REQUIRED_FIELD", "REQUIRED_FIELD", "REQUIRED_FIELD", "REQUIRED_FIELD", "ACTOR_INVALID"]
    );
  });

  it("rejects receiving items from a different organization", () => {
    const result = validateReceivingTransactionInput(baseInput, {
      item: {
        ...item,
        organizationId: "other-org"
      }
    });

    assert.equal(result.ok, false);
    assert.deepEqual(
      result.errors.map((error) => error.code),
      ["ITEM_ORGANIZATION_MISMATCH"]
    );
  });
});
