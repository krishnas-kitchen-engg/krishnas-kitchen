import type { EntityId } from "@krishnas-kitchen/types";

import type { PurchaseRequestReviewInput } from "../domain/types";
import type {
  PurchaseRequestListQuery,
  PurchaseRequestRecord,
  PurchaseRequestReviewUpdate
} from "./procurementRepository";

export type PurchaseRequestReviewRepository = {
  findPurchaseRequestById: (query: {
    organizationId: EntityId;
    requestId: EntityId;
    templeId: EntityId;
  }) => Promise<PurchaseRequestRecord | null>;
  listPurchaseRequests: (
    query: PurchaseRequestListQuery
  ) => Promise<readonly PurchaseRequestRecord[]>;
  reviewPurchaseRequest: (input: PurchaseRequestReviewUpdate) => Promise<PurchaseRequestRecord>;
};

export class PurchaseRequestReviewValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PurchaseRequestReviewValidationError";
  }
}

export type PurchaseRequestReviewService = {
  listRequestsForReview: (
    query: PurchaseRequestListQuery
  ) => Promise<readonly PurchaseRequestRecord[]>;
  reviewPurchaseRequest: (input: PurchaseRequestReviewInput) => Promise<PurchaseRequestRecord>;
};

const reviewableStatuses = new Set(["submitted", "needs_clarification"]);

function assertValidReview(input: PurchaseRequestReviewInput, request: PurchaseRequestRecord) {
  if (!input.requestId.trim()) {
    throw new PurchaseRequestReviewValidationError("Purchase request is required.");
  }

  if (input.reviewedBy.type !== "user" || !input.reviewedBy.userId?.trim()) {
    throw new PurchaseRequestReviewValidationError("A signed-in reviewer is required.");
  }

  if (!reviewableStatuses.has(request.status)) {
    throw new PurchaseRequestReviewValidationError(
      `Only submitted requests can be reviewed. Current status: ${request.status.replaceAll("_", " ")}.`
    );
  }

  if (input.quantity !== undefined && input.quantity !== null && input.quantity <= 0) {
    throw new PurchaseRequestReviewValidationError("Reviewed quantity must be greater than zero.");
  }

  if (input.notes && input.notes.trim().length > 500) {
    throw new PurchaseRequestReviewValidationError("Review notes must be 500 characters or fewer.");
  }
}

export function createPurchaseRequestReviewService(
  repository: PurchaseRequestReviewRepository
): PurchaseRequestReviewService {
  return {
    listRequestsForReview(query) {
      return repository.listPurchaseRequests(query);
    },

    async reviewPurchaseRequest(input) {
      const request = await repository.findPurchaseRequestById({
        organizationId: input.organizationId,
        requestId: input.requestId,
        templeId: input.templeId
      });

      if (!request) {
        throw new PurchaseRequestReviewValidationError("Purchase request was not found.");
      }

      assertValidReview(input, request);

      return repository.reviewPurchaseRequest({
        ...input,
        reviewedAt: new Date().toISOString()
      });
    }
  };
}
