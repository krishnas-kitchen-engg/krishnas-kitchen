import assert from "node:assert/strict";
import { describe, it } from "vitest";

import type { PurchaseReceiptRecord, PurchaseReceiptRepository } from "./procurementRepository";
import {
  createPurchaseReceiptService,
  PurchaseReceiptValidationError
} from "./purchaseReceiptService";

const imageFile = new File(["receipt"], "costco-receipt.jpg", { type: "image/jpeg" });

const receiptRecord: PurchaseReceiptRecord = {
  createdAt: "2026-07-28T00:00:00Z",
  id: "receipt-1",
  notes: "Weekly purchase",
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
  removedPath: string | null;
  shouldFailRecord: boolean;
  uploadedPath: string | null;
} {
  return {
    createReceiptImageUrl(path) {
      return Promise.resolve(`https://receipts.test/${path}`);
    },
    listPurchaseReceipts() {
      return Promise.resolve([receiptRecord]);
    },
    recordPurchaseReceipt(input) {
      if (this.shouldFailRecord) {
        return Promise.reject(new Error("record failed"));
      }

      return Promise.resolve({
        ...receiptRecord,
        notes: input.notes ?? null,
        receiptImagePath: input.receiptImagePath,
        totalCost: input.totalCost ?? null
      });
    },
    removedPath: null,
    removeReceiptImage(path) {
      this.removedPath = path;
      return Promise.resolve();
    },
    shouldFailRecord: false,
    uploadedPath: null,
    reviewPurchaseReceipt() {
      return Promise.resolve(receiptRecord);
    },
    uploadReceiptImage(input) {
      this.uploadedPath = input.path;
      return Promise.resolve(input.path);
    }
  };
}

describe("createPurchaseReceiptService", () => {
  it("uploads receipt image and records receipt metadata", async () => {
    const repository = createRepository();
    const service = createPurchaseReceiptService(repository);

    const result = await service.uploadPurchaseReceipt({
      file: imageFile,
      itemId: "list-item-1",
      notes: "  Weekly purchase  ",
      organizationId: "org-1",
      purchaseDate: "2026-07-28",
      templeId: "temple-1",
      totalCost: 42,
      uploadedBy: {
        type: "user",
        userId: "purchaser-1"
      }
    });

    assert.equal(result.totalCost, 42);
    assert.equal(result.notes, "Weekly purchase");
    assert.match(repository.uploadedPath ?? "", /org-1\/temple-1\/purchaser-1\/list-item-1/);
  });

  it("rejects unsupported file types", async () => {
    const service = createPurchaseReceiptService(createRepository());

    await assert.rejects(
      () =>
        service.uploadPurchaseReceipt({
          file: new File(["receipt"], "receipt.pdf", { type: "application/pdf" }),
          itemId: "list-item-1",
          organizationId: "org-1",
          templeId: "temple-1",
          uploadedBy: {
            type: "user",
            userId: "purchaser-1"
          }
        }),
      PurchaseReceiptValidationError
    );
  });

  it("rejects non-user uploaders", async () => {
    const service = createPurchaseReceiptService(createRepository());

    await assert.rejects(
      () =>
        service.uploadPurchaseReceipt({
          file: imageFile,
          itemId: "list-item-1",
          organizationId: "org-1",
          templeId: "temple-1",
          uploadedBy: {
            type: "system"
          }
        }),
      /A signed-in purchaser is required/
    );
  });

  it("removes the uploaded image when receipt recording fails", async () => {
    const repository = createRepository();
    repository.shouldFailRecord = true;
    const service = createPurchaseReceiptService(repository);

    await assert.rejects(() =>
      service.uploadPurchaseReceipt({
        file: imageFile,
        itemId: "list-item-1",
        organizationId: "org-1",
        templeId: "temple-1",
        uploadedBy: {
          type: "user",
          userId: "purchaser-1"
        }
      })
    );

    assert.equal(repository.removedPath, repository.uploadedPath);
  });
});
