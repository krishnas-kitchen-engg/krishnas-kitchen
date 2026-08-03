import assert from "node:assert/strict";
import { describe, it } from "vitest";

import {
  ConsumptionValidationError,
  assertValidConsumptionTransactionInput,
  validateConsumptionTransactionInput
} from "./consumptionValidation";
import type { CreateConsumptionTransactionInput } from "./types";

const validInput: CreateConsumptionTransactionInput = {
  actor: {
    type: "user",
    userId: "volunteer-1"
  },
  itemId: "rice",
  locationId: "pantry",
  organizationId: "org-1",
  quantity: 5,
  templeId: "temple-1",
  unit: "kg"
};

const activeItem = {
  consumptionUnits: ["kg"] as const,
  defaultUnit: "kg" as const,
  deletedAt: null,
  id: "rice",
  organizationId: "org-1"
};

const activeLocation = {
  deletedAt: null,
  id: "pantry",
  organizationId: "org-1",
  templeId: "temple-1"
};

describe("consumption validation", () => {
  it("accepts active scoped inventory consumption within available balance", () => {
    const result = validateConsumptionTransactionInput(validInput, {
      availableQuantity: 10,
      item: activeItem,
      location: activeLocation
    });

    assert.deepEqual(result, { ok: true });
  });

  it("rejects consumption above available balance", () => {
    const result = validateConsumptionTransactionInput(validInput, {
      availableQuantity: 4,
      item: activeItem,
      location: activeLocation
    });

    assert.equal(result.ok, false);
    assert.equal(result.ok ? null : result.errors[0]?.code, "QUANTITY_EXCEEDS_AVAILABLE");
  });

  it("rejects invalid quantities and units", () => {
    const result = validateConsumptionTransactionInput(
      {
        ...validInput,
        quantity: 0,
        unit: "stone" as typeof validInput.unit
      },
      {
        availableQuantity: 10,
        item: activeItem,
        location: activeLocation
      }
    );

    assert.equal(result.ok, false);
    assert.deepEqual(result.ok ? [] : result.errors.map((error) => error.code), [
      "QUANTITY_NOT_POSITIVE",
      "UNIT_INVALID",
      "UNIT_NOT_CONSUMABLE"
    ]);
  });

  it("rejects inactive catalog references", () => {
    const result = validateConsumptionTransactionInput(validInput, {
      availableQuantity: 10,
      item: {
        ...activeItem,
        deletedAt: "2026-06-01T00:00:00.000Z"
      },
      location: {
        ...activeLocation,
        deletedAt: "2026-06-01T00:00:00.000Z"
      }
    });

    assert.equal(result.ok, false);
    assert.deepEqual(result.ok ? [] : result.errors.map((error) => error.code), [
      "ITEM_ARCHIVED",
      "LOCATION_ARCHIVED"
    ]);
  });

  it("throws a typed error when asserted input is invalid", () => {
    assert.throws(
      () =>
        assertValidConsumptionTransactionInput({
          ...validInput,
          actor: {
            type: "user",
            userId: ""
          }
        }),
      ConsumptionValidationError
    );
  });
});
