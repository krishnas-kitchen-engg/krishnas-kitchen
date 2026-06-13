import assert from "node:assert/strict";
import { afterEach, describe, it } from "vitest";

import { createUuid } from "./uuid";

const originalCrypto = globalThis.crypto;

function setCrypto(crypto: Partial<Crypto> | undefined): void {
  Object.defineProperty(globalThis, "crypto", {
    configurable: true,
    value: crypto
  });
}

describe("createUuid", () => {
  afterEach(() => {
    setCrypto(originalCrypto);
  });

  it("uses crypto.randomUUID when available", () => {
    setCrypto({
      randomUUID: () => "11111111-1111-4111-8111-111111111111"
    });

    assert.equal(createUuid(), "11111111-1111-4111-8111-111111111111");
  });

  it("falls back to crypto.getRandomValues with RFC4122 v4 formatting", () => {
    setCrypto({
      getRandomValues(array) {
        const bytes = array as unknown as Uint8Array;

        for (let index = 0; index < bytes.length; index += 1) {
          bytes[index] = index;
        }

        return array;
      }
    });

    assert.equal(createUuid(), "00010203-0405-4607-8809-0a0b0c0d0e0f");
  });

  it("throws a clear error when secure crypto APIs are unavailable", () => {
    setCrypto(undefined);

    assert.throws(() => createUuid(), /Secure UUID generation is unavailable in this browser\./);
  });
});
