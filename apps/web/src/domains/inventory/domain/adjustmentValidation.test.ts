import assert from "node:assert/strict";
import { describe, it } from "vitest";

import {
  validateInventoryAdjustmentInput,
  type AdjustmentValidationErrorDetail
} from "./adjustmentValidation";
import type { CreateInventoryAdjustmentInput } from "./types";

const input: CreateInventoryAdjustmentInput = {
  actor: {
    type: "user",
    userId: "manager-1"
  },
  itemId: "rice",
  locationId: "pantry",
  organizationId: "org-1",
  physicalQuantity: 12,
  reason: "monthly count",
  templeId: "temple-1",
  unit: "kg"
};

const item = {
  defaultUnit: "kg" as const,
  deletedAt: null,
  id: "rice",
  organizationId: "org-1"
};

const location = {
  deletedAt: null,
  id: "pantry",
  organizationId: "org-1",
  templeId: "temple-1"
};

function getCodes(errors: readonly AdjustmentValidationErrorDetail[]) {
  return errors.map((error) => error.code);
}

describe("inventory adjustment validation", () => {
  it("accepts physical counts of zero with an audit reason", () => {
    const result = validateInventoryAdjustmentInput(
      {
        ...input,
        physicalQuantity: 0
      },
      { item, location }
    );

    assert.deepEqual(result, { ok: true });
  });

  it("requires an adjustment reason", () => {
    const result = validateInventoryAdjustmentInput(
      {
        ...input,
        reason: " "
      },
      { item, location }
    );

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.deepEqual(getCodes(result.errors), ["REASON_REQUIRED"]);
    }
  });

  it("rejects inactive items and locations", () => {
    const result = validateInventoryAdjustmentInput(input, {
      item: {
        ...item,
        deletedAt: "2026-06-01T00:00:00.000Z"
      },
      location: {
        ...location,
        deletedAt: "2026-06-01T00:00:00.000Z"
      }
    });

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.deepEqual(getCodes(result.errors), ["ITEM_ARCHIVED", "LOCATION_ARCHIVED"]);
    }
  });

  it("rejects negative physical counts", () => {
    const result = validateInventoryAdjustmentInput(
      {
        ...input,
        physicalQuantity: -1
      },
      { item, location }
    );

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.deepEqual(getCodes(result.errors), ["PHYSICAL_QUANTITY_NEGATIVE"]);
    }
  });
});
