import { describe, expect, it } from "vitest";

import { ProcurementValidationError } from "../domain/procurementValidation";
import type { CatalogItemSummary, PurchaseRequestInput } from "../domain/types";
import { createPurchaseRequestService } from "./purchaseRequestService";
import type { PurchaseRequestRecord } from "./procurementRepository";

const rice: CatalogItemSummary = {
  defaultUnit: "kg",
  id: "item-rice",
  name: "Rice"
};

const baseInput: PurchaseRequestInput = {
  item: {
    itemId: rice.id,
    type: "existing_item"
  },
  neededBy: "2026-08-01",
  notes: "Sunday feast",
  organizationId: "org-1",
  quantity: 10,
  requestedBy: {
    type: "user",
    userId: "user-1"
  },
  templeId: "temple-1",
  unit: "kg"
};

function createService(
  options: {
    duplicateCandidates?: readonly CatalogItemSummary[];
    item?: CatalogItemSummary | null;
  } = {}
) {
  const records: PurchaseRequestRecord[] = [];

  return {
    records,
    service: createPurchaseRequestService({
      catalogRepository: {
        findItemById() {
          return Promise.resolve(options.item === undefined ? rice : options.item);
        },
        searchItems() {
          return Promise.resolve(options.duplicateCandidates ?? []);
        }
      },
      requestRepository: {
        createPurchaseRequest(input) {
          const record: PurchaseRequestRecord = {
            ...input,
            createdAt: "2026-07-28T00:00:00.000Z",
            id: `request-${records.length + 1}`,
            status: "submitted",
            updatedAt: "2026-07-28T00:00:00.000Z"
          };
          records.push(record);
          return Promise.resolve(record);
        },
        listPurchaseRequests() {
          return Promise.resolve(records);
        }
      }
    })
  };
}

describe("purchase request service", () => {
  it("creates a submitted request for an active existing item", async () => {
    const { service } = createService();

    await expect(service.createPurchaseRequest(baseInput)).resolves.toMatchObject({
      item: {
        itemId: rice.id,
        type: "existing_item"
      },
      quantity: 10,
      requestedBy: {
        type: "user",
        userId: "user-1"
      },
      status: "submitted"
    });
  });

  it("rejects new item suggestions when similar existing items are found", async () => {
    const { service } = createService({
      duplicateCandidates: [rice]
    });

    await expect(
      service.createPurchaseRequest({
        ...baseInput,
        item: {
          suggestedName: "Sona Masoori Rice",
          type: "new_item_suggestion"
        }
      })
    ).rejects.toThrow(ProcurementValidationError);
  });

  it("normalizes and accepts a true new item suggestion", async () => {
    const { service } = createService();

    await expect(
      service.createPurchaseRequest({
        ...baseInput,
        item: {
          category: " Spices ",
          suggestedName: " Hing ",
          type: "new_item_suggestion"
        },
        notes: " For   festival prep ",
        quantity: 1.123456789
      })
    ).resolves.toMatchObject({
      item: {
        category: "Spices",
        suggestedName: "Hing",
        type: "new_item_suggestion"
      },
      notes: "For festival prep",
      quantity: 1.123457
    });
  });
});
