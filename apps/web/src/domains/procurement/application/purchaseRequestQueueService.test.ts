import assert from "node:assert/strict";
import { describe, it } from "vitest";

import type { PurchaseRequestRecord } from "./procurementRepository";
import type { PurchaseRequestReviewService } from "./purchaseRequestReviewService";
import type { PurchaseRequestService } from "./purchaseRequestService";
import {
  createPurchaseRequestQueueService,
  PurchaseRequestQueueValidationError
} from "./purchaseRequestQueueService";

const createdRequest: PurchaseRequestRecord = {
  createdAt: "2026-07-28T00:00:00Z",
  id: "request-1",
  includedPurchaseListItemId: null,
  item: {
    itemId: "item-1",
    type: "existing_item"
  },
  neededBy: null,
  notes: "Manager added",
  organizationId: "org-1",
  quantity: 12,
  requestedBy: {
    type: "user",
    userId: "approver-1"
  },
  reviewedAt: null,
  reviewedBy: null,
  status: "submitted",
  templeId: "temple-1",
  unit: "kg",
  updatedAt: "2026-07-28T00:00:00Z"
};

function createServices(): {
  requestService: PurchaseRequestService & { createdByUserId: string | null };
  reviewService: PurchaseRequestReviewService & { reviewedRequestId: string | null };
} {
  return {
    requestService: {
      createdByUserId: null,
      createPurchaseRequest(input) {
        this.createdByUserId = input.requestedBy.userId ?? null;
        return Promise.resolve({
          ...createdRequest,
          item: input.item,
          notes: input.notes ?? null,
          quantity: input.quantity,
          requestedBy: input.requestedBy,
          unit: input.unit
        });
      },
      listMyPurchaseRequests() {
        return Promise.resolve([]);
      },
      searchCatalogItems() {
        return Promise.resolve([]);
      }
    },
    reviewService: {
      reviewedRequestId: null,
      listRequestsForReview() {
        return Promise.resolve([]);
      },
      removeApprovedPurchaseRequest() {
        throw new Error("Add-to-queue must not remove requests.");
      },
      reviewPurchaseRequest(input) {
        this.reviewedRequestId = input.requestId;
        return Promise.resolve({
          ...createdRequest,
          notes: input.notes ?? null,
          quantity: input.quantity ?? createdRequest.quantity,
          reviewedBy: input.reviewedBy,
          status: input.decision,
          unit: input.unit ?? createdRequest.unit
        });
      },
      updateApprovedPurchaseRequest() {
        throw new Error("Add-to-queue must not edit existing approved requests.");
      }
    }
  };
}

describe("createPurchaseRequestQueueService", () => {
  it("creates and immediately approves an approver-added request", async () => {
    const services = createServices();
    const queueService = createPurchaseRequestQueueService(services);

    const result = await queueService.addApprovedPurchaseRequest({
      approvedBy: {
        type: "user",
        userId: "approver-1"
      },
      item: {
        itemId: "item-1",
        type: "existing_item"
      },
      notes: "Manager added",
      organizationId: "org-1",
      quantity: 12,
      templeId: "temple-1",
      unit: "kg"
    });

    assert.equal(result.status, "approved");
    assert.equal(services.requestService.createdByUserId, "approver-1");
    assert.equal(services.reviewService.reviewedRequestId, "request-1");
  });

  it("rejects approver-added requests without a signed-in user", async () => {
    const queueService = createPurchaseRequestQueueService(createServices());

    await assert.rejects(
      () =>
        queueService.addApprovedPurchaseRequest({
          approvedBy: {
            type: "system"
          },
          item: {
            itemId: "item-1",
            type: "existing_item"
          },
          organizationId: "org-1",
          quantity: 12,
          templeId: "temple-1",
          unit: "kg"
        }),
      PurchaseRequestQueueValidationError
    );
  });
});
