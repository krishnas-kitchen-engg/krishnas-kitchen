import type { PurchaseReceiptOcrResult } from "../../domain/types";
import type { PurchaseReceiptOcrRepository } from "../../application/purchaseReceiptOcrService";

type HttpPurchaseReceiptOcrRepositoryOptions = {
  accessToken?: string | null;
  endpoint?: string;
};

export function createHttpPurchaseReceiptOcrRepository(
  options: HttpPurchaseReceiptOcrRepositoryOptions = {}
): PurchaseReceiptOcrRepository {
  const endpoint = options.endpoint ?? "/api/receipt-ocr";

  return {
    async parseReceiptImage(input) {
      const formData = new FormData();
      formData.append("receipt", input.file);

      const headers = new Headers();

      if (options.accessToken) {
        headers.set("Authorization", `Bearer ${options.accessToken}`);
      }

      const response = await fetch(endpoint, {
        body: formData,
        headers,
        method: "POST"
      });

      const payload = (await response.json().catch(() => null)) as {
        error?: string;
        result?: PurchaseReceiptOcrResult;
      } | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Receipt OCR failed.");
      }

      if (!payload?.result) {
        throw new Error("Receipt OCR returned no suggestions.");
      }

      return payload.result;
    }
  };
}
