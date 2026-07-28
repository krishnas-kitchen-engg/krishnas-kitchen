import type { PurchaseReceiptRecord } from "./procurementRepository";

const receiptCsvColumns = [
  "receipt_id",
  "status",
  "purchase_date",
  "total_cost",
  "purchaser_user_id",
  "purchase_list_id",
  "purchase_location_id",
  "receipt_image_path",
  "purchaser_notes",
  "finance_review_notes",
  "reviewed_at",
  "reviewed_by_user_id",
  "uploaded_at"
] as const;

function csvValue(value: number | string | null | undefined): string {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);

  if (/[",\r\n]/.test(stringValue)) {
    return `"${stringValue.replaceAll('"', '""')}"`;
  }

  return stringValue;
}

export function createPurchaseReceiptCsv(receipts: readonly PurchaseReceiptRecord[]): string {
  const rows = receipts.map((receipt) =>
    [
      receipt.id,
      receipt.status,
      receipt.purchaseDate,
      receipt.totalCost,
      receipt.purchaserUserId,
      receipt.purchaseListId,
      receipt.purchaseLocationId,
      receipt.receiptImagePath,
      receipt.notes,
      receipt.financeReviewNotes,
      receipt.reviewedAt,
      receipt.reviewedBy?.type === "user" ? receipt.reviewedBy.userId : null,
      receipt.createdAt
    ]
      .map(csvValue)
      .join(",")
  );

  return [receiptCsvColumns.join(","), ...rows].join("\n");
}

export function createPurchaseReceiptExportFilename(date = new Date()): string {
  return `purchase-receipt-review-${date.toISOString().slice(0, 10)}.csv`;
}
