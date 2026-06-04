import assert from "node:assert/strict";
import { describe, it } from "vitest";

import {
  inferBarcodeFormats,
  normalizeBarcode,
  shouldSuppressDuplicateBarcodeScan,
  validateBarcode,
  validateBarcodeCandidates
} from "./barcode";

describe("barcode domain utilities", () => {
  it("normalizes numeric barcodes without changing their item identity", () => {
    assert.deepEqual(normalizeBarcode({ format: "upc_a", rawValue: " 036000-29145 2 " }), {
      format: "upc_a",
      value: "036000291452"
    });
    assert.deepEqual(normalizeBarcode({ format: "qr", rawValue: "  KK:ITEM:rice  " }), {
      format: "qr",
      value: "KK:ITEM:rice"
    });
  });

  it("validates supported UPC, EAN, and QR barcode formats", () => {
    assert.equal(validateBarcode({ format: "upc_a", rawValue: "036000291452" }).ok, true);
    assert.equal(validateBarcode({ format: "ean_13", rawValue: "4006381333931" }).ok, true);
    assert.equal(validateBarcode({ format: "ean_8", rawValue: "55123457" }).ok, true);
    assert.equal(validateBarcode({ format: "upc_e", rawValue: "04210007" }).ok, true);
    assert.equal(
      validateBarcode({ format: "qr", rawValue: "krishnas-kitchen:item:rice" }).ok,
      true
    );
  });

  it("rejects invalid numeric barcode check digits", () => {
    const result = validateBarcode({ format: "ean_13", rawValue: "4006381333932" });

    assert.equal(result.ok, false);
    assert.deepEqual(
      result.errors.map((error) => error.code),
      ["CHECK_DIGIT_INVALID"]
    );
  });

  it("rejects UPC-E values with unsupported number systems", () => {
    const result = validateBarcode({ format: "upc_e", rawValue: "55123457" });

    assert.equal(result.ok, false);
    assert.deepEqual(
      result.errors.map((error) => error.code),
      ["BARCODE_FORMAT_UNSUPPORTED"]
    );
  });

  it("rejects invalid UPC-E check digits", () => {
    const result = validateBarcode({ format: "upc_e", rawValue: "04210008" });

    assert.equal(result.ok, false);
    assert.deepEqual(
      result.errors.map((error) => error.code),
      ["CHECK_DIGIT_INVALID"]
    );
  });

  it("rejects empty and too-long QR barcode values", () => {
    const emptyResult = validateBarcode({ format: "qr", rawValue: "   " });
    const tooLongResult = validateBarcode({ format: "qr", rawValue: "x".repeat(2049) });

    assert.equal(emptyResult.ok, false);
    assert.deepEqual(
      emptyResult.errors.map((error) => error.code),
      ["BARCODE_REQUIRED"]
    );
    assert.equal(tooLongResult.ok, false);
    assert.deepEqual(
      tooLongResult.errors.map((error) => error.code),
      ["BARCODE_TOO_LONG"]
    );
  });

  it("infers deterministic candidate formats from raw scanner values", () => {
    assert.deepEqual(inferBarcodeFormats("036000291452"), ["upc_a"]);
    assert.deepEqual(inferBarcodeFormats("4006381333931"), ["ean_13"]);
    assert.deepEqual(inferBarcodeFormats("55123457"), ["ean_8", "upc_e"]);
    assert.deepEqual(inferBarcodeFormats("KK:ITEM:rice"), ["qr"]);
    assert.deepEqual(
      validateBarcodeCandidates("55123457").map((result) => result.ok),
      [true, false]
    );
  });

  it("suppresses duplicate scans within the configured window", () => {
    const recentScan = {
      barcode: {
        format: "upc_a" as const,
        value: "036000291452"
      },
      scannedAt: "2026-06-04T08:00:00.000Z"
    };

    assert.equal(
      shouldSuppressDuplicateBarcodeScan(
        {
          barcode: recentScan.barcode,
          scannedAt: "2026-06-04T08:00:01.000Z"
        },
        [recentScan]
      ).ok,
      false
    );
    assert.equal(
      shouldSuppressDuplicateBarcodeScan(
        {
          barcode: recentScan.barcode,
          scannedAt: "2026-06-04T08:00:03.000Z"
        },
        [recentScan]
      ).ok,
      true
    );
  });
});
