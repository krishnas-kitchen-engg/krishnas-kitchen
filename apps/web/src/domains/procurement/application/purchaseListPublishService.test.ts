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
  scheduledAt: string | null;
} {
  return {
    listPurchaseLists() {
      return Promise.resolve([publishedList]);
    },
    publishScheduledPurchaseList(input) {
      return Promise.resolve({
        ...publishedList,
        id: "published-scheduled-list",
        name: "Scheduled Purchases",
        publishedBy: input.publishedBy
      });
    },
    publishedName: null,
    publishApprovedPurchaseRequests(input) {
      this.publishedName = input.name;
      return Promise.resolve({
        ...publishedList,
        name: input.name
      });
    },
    scheduledAt: null,
    scheduleApprovedPurchaseRequests(input) {
      this.scheduledAt = input.scheduledPublishAt;
      return Promise.resolve({
        ...publishedList,
        name: input.name,
        publishMode: "scheduled",
        publishedAt: null,
        publishedBy: null,
        scheduledPublishAt: input.scheduledPublishAt,
        status: "ready_to_publish"
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

  it("schedules approved requests with a future publish time", async () => {
    const repository = createRepository();
    const service = createPurchaseListPublishService(repository);
    const scheduledPublishAt = new Date(Date.now() + 60_000).toISOString();

    const result = await service.scheduleApprovedPurchaseRequests({
      name: "  Festival Purchases  ",
      organizationId: "org-1",
      scheduledBy: {
        type: "user",
        userId: "publisher-1"
      },
      scheduledPublishAt,
      templeId: "temple-1"
    });

    assert.equal(result.name, "Festival Purchases");
    assert.equal(result.publishMode, "scheduled");
    assert.equal(result.status, "ready_to_publish");
    assert.equal(repository.scheduledAt, scheduledPublishAt);
  });

  it("rejects scheduled publish times that are not in the future", () => {
    const service = createPurchaseListPublishService(createRepository());

    assert.throws(
      () =>
        service.scheduleApprovedPurchaseRequests({
          name: "Festival Purchases",
          organizationId: "org-1",
          scheduledBy: {
            type: "user",
            userId: "publisher-1"
          },
          scheduledPublishAt: new Date(Date.now() - 60_000).toISOString(),
          templeId: "temple-1"
        }),
      /Scheduled publish time must be in the future/
    );
  });

  it("publishes a due scheduled list through the repository", async () => {
    const service = createPurchaseListPublishService(createRepository());

    const result = await service.publishScheduledPurchaseList({
      listId: "scheduled-list-1",
      organizationId: "org-1",
      publishedBy: {
        type: "user",
        userId: "publisher-1"
      },
      templeId: "temple-1"
    });

    assert.equal(result.id, "published-scheduled-list");
    assert.deepEqual(result.publishedBy, {
      type: "user",
      userId: "publisher-1"
    });
  });
});
