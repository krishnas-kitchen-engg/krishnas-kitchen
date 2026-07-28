import assert from "node:assert/strict";
import { describe, it } from "vitest";

import type { PurchaseReceiptRecord } from "./procurementRepository";
import {
  createPurchaseReceiptCsv,
  createPurchaseReceiptExportFilename
} from "./purchaseReceiptExport";

const receipt: PurchaseReceiptRecord = {
  createdAt: "2026-07-28T00:00:00Z",
  financeReviewNotes: "Matched against card statement",
  id: "receipt-1",
  notes: "Costco run, produce aisle",
  organizationId: "org-1",
  purchaseDate: "2026-07-28",
  purchaseListId: "list-1",
  purchaseLocationId: "purchase-location-1",
  purchaserUserId: "purchaser-1",
  receiptImagePath: "org-1/temple-1/receipt.jpg",
  reviewedAt: "2026-07-28T01:00:00Z",
  reviewedBy: {
    type: "user",
    userId: "reviewer-1"
  },
  status: "reconciled",
  templeId: "temple-1",
  totalCost: 42.5,
  updatedAt: "2026-07-28T01:00:00Z",
  uploadedBy: {
    type: "user",
    userId: "purchaser-1"
  }
};

describe("createPurchaseReceiptCsv", () => {
  it("exports receipt audit records with deterministic columns", () => {
    const csv = createPurchaseReceiptCsv([receipt]);

    assert.match(csv, /^receipt_id,status,purchase_date,total_cost/);
    assert.match(csv, /receipt-1,reconciled,2026-07-28,42.5,purchaser-1/);
    assert.match(csv, /reviewer-1,2026-07-28T00:00:00Z$/);
  });

  it("escapes commas, quotes, and empty optional values", () => {
    const csv = createPurchaseReceiptCsv([
      {
        ...receipt,
        financeReviewNotes: null,
        notes: 'Missing "bulk rice", needs review',
        purchaseDate: null,
        totalCost: null
      }
    ]);

    assert.match(csv, /receipt-1,reconciled,,/);
    assert.match(csv, /"Missing ""bulk rice"", needs review"/);
  });
});

describe("createPurchaseReceiptExportFilename", () => {
  it("uses the export date in the filename", () => {
    assert.equal(
      createPurchaseReceiptExportFilename(new Date("2026-07-28T12:00:00Z")),
      "purchase-receipt-review-2026-07-28.csv"
    );
  });
});
