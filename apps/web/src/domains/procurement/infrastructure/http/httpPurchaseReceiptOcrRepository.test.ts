import assert from "node:assert/strict";
import { afterEach, describe, it, vi } from "vitest";

import { createHttpPurchaseReceiptOcrRepository } from "./httpPurchaseReceiptOcrRepository";

const originalFetch = globalThis.fetch;
const imageFile = new File(["receipt"], "receipt.jpg", { type: "image/jpeg" });

describe("createHttpPurchaseReceiptOcrRepository", () => {
  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("sends receipt images with the signed-in user's bearer token", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          result: {
            confidence: "medium",
            lines: [],
            merchantName: "Costco",
            purchaseDate: "2026-08-02",
            rawText: null,
            totalCost: 10,
            warnings: []
          }
        }),
        { status: 200 }
      )
    );
    globalThis.fetch = fetchMock;

    const repository = createHttpPurchaseReceiptOcrRepository({
      accessToken: "session-token",
      endpoint: "/api/test-ocr"
    });

    const result = await repository.parseReceiptImage({ file: imageFile });
    const call = fetchMock.mock.calls[0] as [string, RequestInit] | undefined;
    const init = call?.[1];
    const headers = init?.headers as Headers;

    assert.equal(result.merchantName, "Costco");
    assert.equal(headers.get("Authorization"), "Bearer session-token");
    assert.equal(init?.method, "POST");
    assert.ok(init?.body instanceof FormData);
  });

  it("surfaces OCR endpoint errors", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ error: "Receipt OCR requires a signed-in purchaser session." }),
        {
          status: 401
        }
      )
    );

    const repository = createHttpPurchaseReceiptOcrRepository();

    await assert.rejects(
      () => repository.parseReceiptImage({ file: imageFile }),
      /signed-in purchaser session/
    );
  });
});
