import type { EntityId } from "@krishnas-kitchen/types";

import type {
  ApprovedPurchaseRequestUpdateInput,
  PurchaseRequestReviewInput
} from "../domain/types";
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
  removeApprovedPurchaseRequest: (
    input: Omit<ApprovedPurchaseRequestUpdateInput, "quantity" | "unit">
  ) => Promise<PurchaseRequestRecord>;
  reviewPurchaseRequest: (input: PurchaseRequestReviewInput) => Promise<PurchaseRequestRecord>;
  updateApprovedPurchaseRequest: (
    input: ApprovedPurchaseRequestUpdateInput
  ) => Promise<PurchaseRequestRecord>;
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

  if (
    input.quantity !== undefined &&
    input.quantity !== null &&
    (!Number.isFinite(input.quantity) || input.quantity <= 0)
  ) {
    throw new PurchaseRequestReviewValidationError(
      "Reviewed quantity must be a finite number greater than zero."
    );
  }

  if (input.notes && input.notes.trim().length > 500) {
    throw new PurchaseRequestReviewValidationError("Review notes must be 500 characters or fewer.");
  }
}

function assertEditableApprovedRequest(request: PurchaseRequestRecord) {
  if (request.status !== "approved") {
    throw new PurchaseRequestReviewValidationError(
      `Only approved requests can be edited before publishing. Current status: ${request.status.replaceAll("_", " ")}.`
    );
  }

  if (request.includedPurchaseListItemId) {
    throw new PurchaseRequestReviewValidationError(
      "Published purchase requests cannot be edited from the review queue."
    );
  }
}

function assertValidApprovedUpdate(
  input: ApprovedPurchaseRequestUpdateInput,
  request: PurchaseRequestRecord
) {
  assertEditableApprovedRequest(request);

  if (!input.requestId.trim()) {
    throw new PurchaseRequestReviewValidationError("Purchase request is required.");
  }

  if (input.reviewedBy.type !== "user" || !input.reviewedBy.userId?.trim()) {
    throw new PurchaseRequestReviewValidationError("A signed-in reviewer is required.");
  }

  if (!Number.isFinite(input.quantity) || input.quantity <= 0) {
    throw new PurchaseRequestReviewValidationError(
      "Approved quantity must be a finite number greater than zero."
    );
  }

  if (!input.unit) {
    throw new PurchaseRequestReviewValidationError("Approved unit is required.");
  }

  if (input.notes && input.notes.trim().length > 500) {
    throw new PurchaseRequestReviewValidationError("Review notes must be 500 characters or fewer.");
  }
}

async function findRequestForCommand(
  repository: PurchaseRequestReviewRepository,
  input: Pick<PurchaseRequestReviewInput, "organizationId" | "requestId" | "templeId">
): Promise<PurchaseRequestRecord> {
  const request = await repository.findPurchaseRequestById({
    organizationId: input.organizationId,
    requestId: input.requestId,
    templeId: input.templeId
  });

  if (!request) {
    throw new PurchaseRequestReviewValidationError("Purchase request was not found.");
  }

  return request;
}

export function createPurchaseRequestReviewService(
  repository: PurchaseRequestReviewRepository
): PurchaseRequestReviewService {
  return {
    listRequestsForReview(query) {
      return repository.listPurchaseRequests(query);
    },

    async removeApprovedPurchaseRequest(input) {
      const request = await findRequestForCommand(repository, input);

      assertEditableApprovedRequest(request);

      if (input.reviewedBy.type !== "user" || !input.reviewedBy.userId?.trim()) {
        throw new PurchaseRequestReviewValidationError("A signed-in reviewer is required.");
      }

      if (input.notes && input.notes.trim().length > 500) {
        throw new PurchaseRequestReviewValidationError(
          "Review notes must be 500 characters or fewer."
        );
      }

      return repository.reviewPurchaseRequest({
        decision: "rejected",
        notes: input.notes?.trim() || "Removed from purchase list before publishing.",
        organizationId: input.organizationId,
        requestId: input.requestId,
        reviewedAt: new Date().toISOString(),
        reviewedBy: input.reviewedBy,
        templeId: input.templeId
      });
    },

    async reviewPurchaseRequest(input) {
      const request = await findRequestForCommand(repository, input);

      assertValidReview(input, request);

      return repository.reviewPurchaseRequest({
        ...input,
        reviewedAt: new Date().toISOString()
      });
    },

    async updateApprovedPurchaseRequest(input) {
      const request = await findRequestForCommand(repository, input);

      assertValidApprovedUpdate(input, request);

      return repository.reviewPurchaseRequest({
        decision: "approved",
        notes: input.notes?.trim() || null,
        organizationId: input.organizationId,
        quantity: input.quantity,
        requestId: input.requestId,
        reviewedAt: new Date().toISOString(),
        reviewedBy: input.reviewedBy,
        templeId: input.templeId,
        unit: input.unit
      });
    }
  };
}
