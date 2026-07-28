import { describe, expect, it } from "vitest";

import {
  assertValidPurchaseRequestInput,
  normalizePurchaseRequestInput,
  ProcurementValidationError,
  validatePurchaseRequestInput
} from "./procurementValidation";
import type { CatalogItemSummary, PurchaseRequestInput } from "./types";

const activeRice: CatalogItemSummary = {
  defaultUnit: "kg",
  id: "item-rice",
  name: "Rice"
};

const archivedLentils: CatalogItemSummary = {
  defaultUnit: "kg",
  deletedAt: "2026-07-28T00:00:00.000Z",
  id: "item-lentils",
  name: "Lentils"
};

const validRequest: PurchaseRequestInput = {
  item: {
    itemId: activeRice.id,
    type: "existing_item"
  },
  neededBy: "2026-08-01",
  notes: "For festival lunch",
  organizationId: "org-1",
  quantity: 25,
  requestedBy: {
    type: "user",
    userId: "user-1"
  },
  templeId: "temple-1",
  unit: "kg"
};

describe("procurement purchase request validation", () => {
  it("accepts a valid existing item request with requester audit context", () => {
    const result = validatePurchaseRequestInput(validRequest, {
      item: activeRice
    });

    expect(result).toEqual({ ok: true });
  });

  it("rejects archived existing inventory items", () => {
    const result = validatePurchaseRequestInput(
      {
        ...validRequest,
        item: {
          itemId: archivedLentils.id,
          type: "existing_item"
        }
      },
      {
        item: archivedLentils
      }
    );

    expect(result.ok).toBe(false);
    expect(result.ok ? [] : result.errors).toContainEqual(
      expect.objectContaining({
        code: "EXISTING_ITEM_ARCHIVED",
        field: "item.itemId"
      })
    );
  });

  it("rejects new item suggestions when similar catalog candidates exist", () => {
    const result = validatePurchaseRequestInput(
      {
        ...validRequest,
        item: {
          suggestedName: "sona masoori rice",
          type: "new_item_suggestion"
        }
      },
      {
        duplicateCandidates: [activeRice]
      }
    );

    expect(result.ok).toBe(false);
    expect(result.ok ? [] : result.errors).toContainEqual(
      expect.objectContaining({
        code: "DUPLICATE_ITEM_CANDIDATE",
        field: "item.suggestedName"
      })
    );
  });

  it("normalizes request text and rounds quantities deterministically", () => {
    const normalized = normalizePurchaseRequestInput({
      ...validRequest,
      item: {
        category: " Dry   Goods ",
        suggestedName: "  Sona   Masoori   Rice ",
        type: "new_item_suggestion"
      },
      neededBy: " 2026-08-01 ",
      notes: "  For   Sunday   feast ",
      quantity: 1.123456789
    });

    expect(normalized).toMatchObject({
      item: {
        category: "Dry Goods",
        suggestedName: "Sona Masoori Rice",
        type: "new_item_suggestion"
      },
      neededBy: "2026-08-01",
      notes: "For Sunday feast",
      quantity: 1.123457
    });
  });

  it("throws a structured validation error for invalid request input", () => {
    expect(() =>
      assertValidPurchaseRequestInput({
        ...validRequest,
        quantity: 0
      })
    ).toThrow(ProcurementValidationError);
  });

  it("requires the actor details needed for auditability", () => {
    const result = validatePurchaseRequestInput({
      ...validRequest,
      requestedBy: {
        type: "user"
      }
    });

    expect(result.ok).toBe(false);
    expect(result.ok ? [] : result.errors).toContainEqual(
      expect.objectContaining({
        code: "ACTOR_REQUIRED",
        field: "requestedBy"
      })
    );
  });
});
