import type { PurchaseReceiptOcrInput, PurchaseReceiptOcrResult } from "../domain/types";

export class PurchaseReceiptOcrValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PurchaseReceiptOcrValidationError";
  }
}

export type PurchaseReceiptOcrRepository = {
  parseReceiptImage: (input: PurchaseReceiptOcrInput) => Promise<PurchaseReceiptOcrResult>;
};

export type PurchaseReceiptOcrService = {
  parseReceiptImage: (input: PurchaseReceiptOcrInput) => Promise<PurchaseReceiptOcrResult>;
};

const allowedReceiptMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxReceiptFileSizeBytes = 10 * 1024 * 1024;

function assertValidReceiptOcrInput(input: PurchaseReceiptOcrInput) {
  if (!input.file) {
    throw new PurchaseReceiptOcrValidationError("Receipt photo is required for OCR.");
  }

  if (!allowedReceiptMimeTypes.has(input.file.type)) {
    throw new PurchaseReceiptOcrValidationError("Receipt OCR supports JPEG, PNG, or WebP images.");
  }

  if (input.file.size <= 0) {
    throw new PurchaseReceiptOcrValidationError("Receipt photo is empty.");
  }

  if (input.file.size > maxReceiptFileSizeBytes) {
    throw new PurchaseReceiptOcrValidationError("Receipt photo must be 10 MB or smaller.");
  }
}

function normalizeOptionalNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;
}

function normalizeOptionalString(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  return trimmedValue ? trimmedValue.slice(0, maxLength) : null;
}

function normalizeConfidence(value: unknown): PurchaseReceiptOcrResult["confidence"] {
  return value === "high" || value === "medium" || value === "low" ? value : "low";
}

function normalizeReceiptOcrResult(result: PurchaseReceiptOcrResult): PurchaseReceiptOcrResult {
  return {
    confidence: normalizeConfidence(result.confidence),
    lines: Array.isArray(result.lines)
      ? result.lines
          .map((line) => ({
            description: normalizeOptionalString(line.description, 120) ?? "",
            lineTotal: normalizeOptionalNumber(line.lineTotal),
            quantity: normalizeOptionalNumber(line.quantity),
            unitPrice: normalizeOptionalNumber(line.unitPrice)
          }))
          .filter((line) => line.description.length > 0)
          .slice(0, 30)
      : [],
    merchantName: normalizeOptionalString(result.merchantName, 120),
    purchaseDate: normalizeOptionalString(result.purchaseDate, 10),
    rawText: normalizeOptionalString(result.rawText, 2000),
    totalCost: normalizeOptionalNumber(result.totalCost),
    warnings: Array.isArray(result.warnings)
      ? result.warnings
          .map((warning) => normalizeOptionalString(warning, 160))
          .filter((warning): warning is string => Boolean(warning))
          .slice(0, 5)
      : []
  };
}

export function createPurchaseReceiptOcrService(
  repository: PurchaseReceiptOcrRepository
): PurchaseReceiptOcrService {
  return {
    async parseReceiptImage(input) {
      assertValidReceiptOcrInput(input);

      return normalizeReceiptOcrResult(await repository.parseReceiptImage(input));
    }
  };
}
