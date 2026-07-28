import assert from "node:assert/strict";
import { describe, it } from "vitest";

import type { PurchaseListPublishRepository, PurchaseListRecord } from "./procurementRepository";
import {
  createPurchaseListPublishService,
  PurchaseListPublishValidationError
} from "./purchaseListPublishService";

const publishedList: PurchaseListRecord = {
  createdAt: "2026-07-28T00:00:00Z",
  createdBy: {
    type: "user",
    userId: "publisher-1"
  },
  id: "list-1",
  name: "Sunday Purchases",
  organizationId: "org-1",
  publishMode: "manual",
  publishedAt: "2026-07-28T00:00:00Z",
  publishedBy: {
    type: "user",
    userId: "publisher-1"
  },
  scheduledPublishAt: null,
  status: "published",
  templeId: "temple-1",
  updatedAt: "2026-07-28T00:00:00Z"
};

function createRepository(): PurchaseListPublishRepository & {
  publishedName: string | null;
} {
  return {
    listPurchaseLists() {
      return Promise.resolve([publishedList]);
    },
    publishedName: null,
    publishApprovedPurchaseRequests(input) {
      this.publishedName = input.name;
      return Promise.resolve({
        ...publishedList,
        name: input.name
      });
    }
  };
}

describe("createPurchaseListPublishService", () => {
  it("publishes approved requests with a trimmed list name", async () => {
    const repository = createRepository();
    const service = createPurchaseListPublishService(repository);

    const result = await service.publishApprovedPurchaseRequests({
      name: "  Sunday Purchases  ",
      organizationId: "org-1",
      publishedBy: {
        type: "user",
        userId: "publisher-1"
      },
      templeId: "temple-1"
    });

    assert.equal(result.name, "Sunday Purchases");
    assert.equal(repository.publishedName, "Sunday Purchases");
  });

  it("rejects blank names", () => {
    const service = createPurchaseListPublishService(createRepository());

    assert.throws(
      () =>
        service.publishApprovedPurchaseRequests({
          name: " ",
          organizationId: "org-1",
          publishedBy: {
            type: "user",
            userId: "publisher-1"
          },
          templeId: "temple-1"
        }),
      PurchaseListPublishValidationError
    );
  });

  it("rejects non-user publishers", () => {
    const service = createPurchaseListPublishService(createRepository());

    assert.throws(
      () =>
        service.publishApprovedPurchaseRequests({
          name: "Sunday Purchases",
          organizationId: "org-1",
          publishedBy: {
            type: "system"
          },
          templeId: "temple-1"
        }),
      /A signed-in publisher is required/
    );
  });
});
