import assert from "node:assert/strict";
import { describe, it } from "vitest";

import type { PurchaseReceiptRecord, PurchaseReceiptRepository } from "./procurementRepository";
import {
  createPurchaseReceiptReviewService,
  PurchaseReceiptReviewValidationError
} from "./purchaseReceiptReviewService";

const receiptRecord: PurchaseReceiptRecord = {
  createdAt: "2026-07-28T00:00:00Z",
  id: "receipt-1",
  notes: "Weekly receipt",
  organizationId: "org-1",
  purchaseDate: "2026-07-28",
  purchaseListId: "list-1",
  purchaseLocationId: "purchase-location-1",
  purchaserUserId: "purchaser-1",
  receiptImagePath: "org-1/temple-1/purchaser-1/item-1/receipt.jpg",
  status: "uploaded",
  templeId: "temple-1",
  totalCost: 42,
  updatedAt: "2026-07-28T00:00:00Z",
  uploadedBy: {
    type: "user",
    userId: "purchaser-1"
  }
};

function createRepository(): PurchaseReceiptRepository & {
  reviewedStatus: string | null;
  reviewedNotes: string | null;
} {
  return {
    createReceiptImageUrl(path) {
      return Promise.resolve(`https://receipts.test/${path}`);
    },
    listPurchaseReceipts() {
      return Promise.resolve([receiptRecord]);
    },
    recordPurchaseReceipt() {
      return Promise.resolve(receiptRecord);
    },
    removeReceiptImage() {
      return Promise.resolve();
    },
    reviewedNotes: null,
    reviewedStatus: null,
    reviewPurchaseReceipt(input) {
      this.reviewedNotes = input.notes ?? null;
      this.reviewedStatus = input.status;

      return Promise.resolve({
        ...receiptRecord,
        financeReviewNotes: input.notes ?? null,
        reviewedAt: "2026-07-28T01:00:00Z",
        reviewedBy: input.reviewedBy,
        status: input.status
      });
    },
    uploadReceiptImage(input) {
      return Promise.resolve(input.path);
    }
  };
}

describe("createPurchaseReceiptReviewService", () => {
  it("lists receipts for finance review", async () => {
    const service = createPurchaseReceiptReviewService(createRepository());

    const receipts = await service.listPurchaseReceipts({
      organizationId: "org-1",
      templeId: "temple-1"
    });

    assert.equal(receipts.length, 1);
    assert.equal(receipts[0]?.status, "uploaded");
  });

  it("creates signed receipt evidence URLs through the repository", async () => {
    const service = createPurchaseReceiptReviewService(createRepository());

    const url = await service.createReceiptImageUrl("receipt.jpg");

    assert.equal(url, "https://receipts.test/receipt.jpg");
  });

  it("records reviewed status and trimmed finance notes", async () => {
    const repository = createRepository();
    const service = createPurchaseReceiptReviewService(repository);

    const result = await service.reviewPurchaseReceipt({
      notes: "  totals match card statement  ",
      organizationId: "org-1",
      receiptId: "receipt-1",
      reviewedBy: {
        type: "user",
        userId: "reviewer-1"
      },
      status: "reconciled",
      templeId: "temple-1"
    });

    assert.equal(result.status, "reconciled");
    assert.equal(repository.reviewedStatus, "reconciled");
    assert.equal(repository.reviewedNotes, "totals match card statement");
  });

  it("rejects reviews without a signed-in reviewer", async () => {
    const service = createPurchaseReceiptReviewService(createRepository());

    await assert.rejects(
      () =>
        service.reviewPurchaseReceipt({
          organizationId: "org-1",
          receiptId: "receipt-1",
          reviewedBy: {
            type: "system"
          },
          status: "matched",
          templeId: "temple-1"
        }),
      /signed-in finance reviewer/
    );
  });

  it("rejects overlong finance notes", async () => {
    const service = createPurchaseReceiptReviewService(createRepository());

    await assert.rejects(
      () =>
        service.reviewPurchaseReceipt({
          notes: "x".repeat(501),
          organizationId: "org-1",
          receiptId: "receipt-1",
          reviewedBy: {
            type: "user",
            userId: "reviewer-1"
          },
          status: "needs_review",
          templeId: "temple-1"
        }),
      PurchaseReceiptReviewValidationError
    );
  });
});
