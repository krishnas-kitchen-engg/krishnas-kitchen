import assert from "node:assert/strict";
import { describe, it } from "vitest";

import type { PurchaseRequestRecord } from "./procurementRepository";
import {
  createPurchaseRequestReviewService,
  PurchaseRequestReviewValidationError,
  type PurchaseRequestReviewRepository
} from "./purchaseRequestReviewService";

const submittedRequest: PurchaseRequestRecord = {
  createdAt: "2026-07-28T00:00:00Z",
  id: "request-1",
  includedPurchaseListItemId: null,
  item: {
    itemId: "item-1",
    type: "existing_item"
  },
  neededBy: null,
  notes: "Need rice",
  organizationId: "org-1",
  quantity: 10,
  requestedBy: {
    type: "user",
    userId: "requester-1"
  },
  reviewedAt: null,
  reviewedBy: null,
  status: "submitted",
  templeId: "temple-1",
  unit: "kg",
  updatedAt: "2026-07-28T00:00:00Z"
};

function createRepository(
  request: PurchaseRequestRecord | null = submittedRequest
): PurchaseRequestReviewRepository & {
  reviewedInput: unknown;
} {
  return {
    findPurchaseRequestById() {
      return Promise.resolve(request);
    },
    listPurchaseRequests() {
      return Promise.resolve(request ? [request] : []);
    },
    reviewedInput: null,
    reviewPurchaseRequest(input) {
      this.reviewedInput = input;
      return Promise.resolve({
        ...(request ?? submittedRequest),
        notes: input.notes ?? request?.notes ?? null,
        quantity: input.quantity ?? request?.quantity ?? submittedRequest.quantity,
        reviewedAt: input.reviewedAt,
        reviewedBy: input.reviewedBy,
        status: input.decision,
        unit: input.unit ?? request?.unit ?? submittedRequest.unit
      });
    }
  };
}

describe("createPurchaseRequestReviewService", () => {
  it("approves a submitted request with reviewer audit", async () => {
    const repository = createRepository();
    const service = createPurchaseRequestReviewService(repository);

    const reviewedRequest = await service.reviewPurchaseRequest({
      decision: "approved",
      notes: "Approved for Sunday prep",
      organizationId: "org-1",
      quantity: 12,
      requestId: "request-1",
      reviewedBy: {
        type: "user",
        userId: "reviewer-1"
      },
      templeId: "temple-1",
      unit: "kg"
    });

    assert.equal(reviewedRequest.status, "approved");
    assert.equal(reviewedRequest.quantity, 12);
    assert.deepEqual(reviewedRequest.reviewedBy, {
      type: "user",
      userId: "reviewer-1"
    });
    assert.ok(repository.reviewedInput);
  });

  it("rejects missing requests", async () => {
    const service = createPurchaseRequestReviewService(createRepository(null));

    await assert.rejects(
      () =>
        service.reviewPurchaseRequest({
          decision: "rejected",
          organizationId: "org-1",
          requestId: "missing-request",
          reviewedBy: {
            type: "user",
            userId: "reviewer-1"
          },
          templeId: "temple-1"
        }),
      PurchaseRequestReviewValidationError
    );
  });

  it("rejects already reviewed requests", async () => {
    const service = createPurchaseRequestReviewService(
      createRepository({
        ...submittedRequest,
        status: "approved"
      })
    );

    await assert.rejects(
      () =>
        service.reviewPurchaseRequest({
          decision: "rejected",
          organizationId: "org-1",
          requestId: "request-1",
          reviewedBy: {
            type: "user",
            userId: "reviewer-1"
          },
          templeId: "temple-1"
        }),
      /Only submitted requests can be reviewed/
    );
  });

  it("rejects invalid reviewed quantities", async () => {
    const service = createPurchaseRequestReviewService(createRepository());

    await assert.rejects(
      () =>
        service.reviewPurchaseRequest({
          decision: "approved",
          organizationId: "org-1",
          quantity: 0,
          requestId: "request-1",
          reviewedBy: {
            type: "user",
            userId: "reviewer-1"
          },
          templeId: "temple-1"
        }),
      /Reviewed quantity must be greater than zero/
    );
  });
});
