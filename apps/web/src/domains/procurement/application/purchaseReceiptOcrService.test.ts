import assert from "node:assert/strict";
import { describe, it } from "vitest";

import {
  createPurchaseReceiptOcrService,
  PurchaseReceiptOcrValidationError,
  type PurchaseReceiptOcrRepository
} from "./purchaseReceiptOcrService";

const imageFile = new File(["receipt"], "receipt.jpg", { type: "image/jpeg" });

function createRepository(): PurchaseReceiptOcrRepository & { receivedFile: File | null } {
  return {
    receivedFile: null,
    parseReceiptImage(input) {
      this.receivedFile = input.file;
      return Promise.resolve({
        confidence: "high",
        lines: [
          {
            description: "Basmati rice",
            lineTotal: 24.99,
            quantity: 1,
            unitPrice: 24.99
          },
          {
            description: "",
            lineTotal: -1
          }
        ],
        merchantName: "Costco",
        purchaseDate: "2026-08-02",
        rawText: "Costco\nBasmati rice 24.99\nTotal 24.99",
        totalCost: 24.99,
        warnings: ["Review OCR suggestions before upload."]
      });
    }
  };
}

describe("createPurchaseReceiptOcrService", () => {
  it("validates receipt images and returns normalized OCR suggestions", async () => {
    const repository = createRepository();
    const service = createPurchaseReceiptOcrService(repository);

    const result = await service.parseReceiptImage({ file: imageFile });

    assert.equal(repository.receivedFile, imageFile);
    assert.equal(result.merchantName, "Costco");
    assert.equal(result.purchaseDate, "2026-08-02");
    assert.equal(result.totalCost, 24.99);
    assert.equal(result.lines.length, 1);
    assert.equal(result.lines[0]?.description, "Basmati rice");
  });

  it("rejects unsupported receipt files", async () => {
    const service = createPurchaseReceiptOcrService(createRepository());

    await assert.rejects(
      () =>
        service.parseReceiptImage({
          file: new File(["receipt"], "receipt.pdf", { type: "application/pdf" })
        }),
      PurchaseReceiptOcrValidationError
    );
  });
});
