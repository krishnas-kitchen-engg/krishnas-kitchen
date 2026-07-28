import type { PurchaseReceiptReviewInput } from "../domain/types";
import type {
  PurchaseReceiptRecord,
  PurchaseReceiptRepository,
  PurchaseReceiptReviewQuery
} from "./procurementRepository";

export class PurchaseReceiptReviewValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PurchaseReceiptReviewValidationError";
  }
}

export type PurchaseReceiptReviewService = {
  createReceiptImageUrl: (path: string) => Promise<string>;
  listPurchaseReceipts: (
    query: PurchaseReceiptReviewQuery
  ) => Promise<readonly PurchaseReceiptRecord[]>;
  reviewPurchaseReceipt: (input: PurchaseReceiptReviewInput) => Promise<PurchaseReceiptRecord>;
};

function assertValidReceiptReview(input: PurchaseReceiptReviewInput) {
  if (!input.receiptId.trim()) {
    throw new PurchaseReceiptReviewValidationError("Receipt is required.");
  }

  if (input.reviewedBy.type !== "user" || !input.reviewedBy.userId?.trim()) {
    throw new PurchaseReceiptReviewValidationError("A signed-in finance reviewer is required.");
  }

  if (
    input.status !== "matched" &&
    input.status !== "needs_review" &&
    input.status !== "partially_matched" &&
    input.status !== "reconciled" &&
    input.status !== "rejected"
  ) {
    throw new PurchaseReceiptReviewValidationError("Receipt review status is invalid.");
  }

  if (input.notes && input.notes.trim().length > 500) {
    throw new PurchaseReceiptReviewValidationError(
      "Finance review notes must be 500 characters or fewer."
    );
  }
}

export function createPurchaseReceiptReviewService(
  repository: PurchaseReceiptRepository
): PurchaseReceiptReviewService {
  return {
    createReceiptImageUrl(path) {
      return repository.createReceiptImageUrl(path);
    },

    listPurchaseReceipts(query) {
      return repository.listPurchaseReceipts(query);
    },

    async reviewPurchaseReceipt(input) {
      assertValidReceiptReview(input);

      return repository.reviewPurchaseReceipt({
        ...input,
        notes: input.notes?.trim() || null
      });
    }
  };
}
