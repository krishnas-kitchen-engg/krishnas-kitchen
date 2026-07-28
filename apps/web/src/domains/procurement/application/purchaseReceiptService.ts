import type { PurchaseReceiptUploadInput } from "../domain/types";
import type { PurchaseReceiptRecord, PurchaseReceiptRepository } from "./procurementRepository";

export class PurchaseReceiptValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PurchaseReceiptValidationError";
  }
}

export type PurchaseReceiptService = {
  uploadPurchaseReceipt: (input: PurchaseReceiptUploadInput) => Promise<PurchaseReceiptRecord>;
};

const allowedReceiptMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxReceiptFileSizeBytes = 10 * 1024 * 1024;

function sanitizeFileName(fileName: string): string {
  return fileName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function assertValidReceiptUpload(input: PurchaseReceiptUploadInput) {
  if (!input.itemId.trim()) {
    throw new PurchaseReceiptValidationError("Purchase list item is required.");
  }

  if (input.uploadedBy.type !== "user" || !input.uploadedBy.userId?.trim()) {
    throw new PurchaseReceiptValidationError("A signed-in purchaser is required.");
  }

  if (!input.file) {
    throw new PurchaseReceiptValidationError("Receipt photo is required.");
  }

  if (!allowedReceiptMimeTypes.has(input.file.type)) {
    throw new PurchaseReceiptValidationError("Receipt must be a JPEG, PNG, or WebP image.");
  }

  if (input.file.size <= 0) {
    throw new PurchaseReceiptValidationError("Receipt photo is empty.");
  }

  if (input.file.size > maxReceiptFileSizeBytes) {
    throw new PurchaseReceiptValidationError("Receipt photo must be 10 MB or smaller.");
  }

  if (input.totalCost !== undefined && input.totalCost !== null && input.totalCost < 0) {
    throw new PurchaseReceiptValidationError("Receipt total cannot be negative.");
  }

  if (input.notes && input.notes.trim().length > 500) {
    throw new PurchaseReceiptValidationError("Receipt notes must be 500 characters or fewer.");
  }
}

function buildReceiptPath(input: PurchaseReceiptUploadInput, uploadedAt: string) {
  const fileName = sanitizeFileName(input.file.name || "receipt.jpg") || "receipt.jpg";
  const timestamp = uploadedAt.replace(/[^0-9]/g, "");

  return `${input.organizationId}/${input.templeId}/${input.uploadedBy.userId}/${input.itemId}/${timestamp}-${fileName}`;
}

export function createPurchaseReceiptService(
  repository: PurchaseReceiptRepository
): PurchaseReceiptService {
  return {
    async uploadPurchaseReceipt(input) {
      assertValidReceiptUpload(input);

      const uploadedAt = new Date().toISOString();
      const receiptImagePath = buildReceiptPath(input, uploadedAt);
      const uploadedPath = await repository.uploadReceiptImage({
        file: input.file,
        organizationId: input.organizationId,
        path: receiptImagePath,
        templeId: input.templeId
      });

      try {
        return await repository.recordPurchaseReceipt({
          ...input,
          notes: input.notes?.trim() || null,
          receiptImagePath: uploadedPath,
          uploadedAt
        });
      } catch (error) {
        await repository.removeReceiptImage(uploadedPath).catch(() => undefined);
        throw error;
      }
    }
  };
}
