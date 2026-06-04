import type { EntityId, ItemUnit } from "@krishnas-kitchen/types";
import { isNonEmptyString } from "@krishnas-kitchen/utils";

export type InventoryBarcodeFormat = "ean_13" | "ean_8" | "qr" | "upc_a" | "upc_e";

export type InventoryBarcode = {
  format: InventoryBarcodeFormat;
  value: string;
};

export type InventoryBarcodeScanInput = {
  format?: InventoryBarcodeFormat;
  rawValue: string;
};

export type InventoryBarcodeItemReference = {
  barcodes: readonly InventoryBarcode[];
  defaultUnit: ItemUnit;
  deletedAt: string | null;
  id: EntityId;
  name: string;
  organizationId: EntityId;
};

export type InventoryBarcodeLookupQuery = {
  barcode: InventoryBarcode;
  organizationId: EntityId;
};

export type InventoryBarcodeLookupResult =
  | {
      barcode: InventoryBarcode;
      item: InventoryBarcodeItemReference;
      status: "found";
    }
  | {
      barcode: InventoryBarcode;
      items: readonly InventoryBarcodeItemReference[];
      status: "ambiguous";
    }
  | {
      barcode: InventoryBarcode;
      status: "unknown";
    }
  | {
      errors: readonly BarcodeValidationErrorDetail[];
      rawValue: string;
      status: "invalid";
    };

export type InventoryBarcodeScanEvent = {
  barcode: InventoryBarcode;
  scannedAt: string;
};

export type DuplicateBarcodeScanResult =
  | {
      duplicateOf: InventoryBarcodeScanEvent;
      ok: false;
      reason: "duplicate_scan";
    }
  | {
      ok: true;
    };

export type BarcodeValidationErrorCode =
  | "BARCODE_FORMAT_UNSUPPORTED"
  | "BARCODE_REQUIRED"
  | "BARCODE_TOO_LONG"
  | "CHECK_DIGIT_INVALID"
  | "FORMAT_REQUIRED";

export type BarcodeValidationErrorDetail = {
  code: BarcodeValidationErrorCode;
  field: "format" | "rawValue" | "value";
  message: string;
};

export type BarcodeValidationResult =
  | {
      barcode: InventoryBarcode;
      ok: true;
    }
  | {
      errors: BarcodeValidationErrorDetail[];
      ok: false;
    };

const NUMERIC_BARCODE_FORMATS = ["ean_13", "ean_8", "upc_a", "upc_e"] as const;
const MAX_QR_LENGTH = 2048;
const DUPLICATE_SCAN_WINDOW_MS = 1_500;

function createBarcodeError(
  code: BarcodeValidationErrorCode,
  field: BarcodeValidationErrorDetail["field"],
  message: string
): BarcodeValidationErrorDetail {
  return {
    code,
    field,
    message
  };
}

function normalizeNumericBarcode(value: string): string {
  return value.replace(/[\s-]/g, "");
}

function normalizeQrBarcode(value: string): string {
  return value.trim();
}

function isNumericBarcodeFormat(format: InventoryBarcodeFormat): boolean {
  return NUMERIC_BARCODE_FORMATS.includes(format as (typeof NUMERIC_BARCODE_FORMATS)[number]);
}

function getExpectedLength(format: InventoryBarcodeFormat): number | null {
  if (format === "ean_13") {
    return 13;
  }

  if (format === "ean_8" || format === "upc_e") {
    return 8;
  }

  if (format === "upc_a") {
    return 12;
  }

  return null;
}

function calculateGtinCheckDigit(digitsWithoutCheckDigit: string): number {
  const sum = [...digitsWithoutCheckDigit]
    .reverse()
    .reduce((total, digit, index) => total + Number(digit) * (index % 2 === 0 ? 3 : 1), 0);

  return (10 - (sum % 10)) % 10;
}

function hasValidGtinCheckDigit(value: string): boolean {
  return calculateGtinCheckDigit(value.slice(0, -1)) === Number(value.at(-1));
}

function expandUpcE(value: string): string {
  const numberSystem = value[0] ?? "";
  const manufacturer = value.slice(1, 6);
  const product = value[6] ?? "";

  if (product === "0" || product === "1" || product === "2") {
    return `${numberSystem}${manufacturer.slice(0, 2)}${product}0000${manufacturer.slice(2)}`;
  }

  if (product === "3") {
    return `${numberSystem}${manufacturer.slice(0, 3)}00000${manufacturer.slice(3)}`;
  }

  if (product === "4") {
    return `${numberSystem}${manufacturer.slice(0, 4)}00000${manufacturer.slice(4)}`;
  }

  return `${numberSystem}${manufacturer}0000${product}`;
}

function hasValidUpcECheckDigit(value: string): boolean {
  return calculateGtinCheckDigit(expandUpcE(value)) === Number(value.at(-1));
}

function hasValidUpcENumberSystem(value: string): boolean {
  return value.startsWith("0") || value.startsWith("1");
}

export function normalizeBarcode(input: InventoryBarcodeScanInput): InventoryBarcode | null {
  if (!input.format) {
    return null;
  }

  return {
    format: input.format,
    value: isNumericBarcodeFormat(input.format)
      ? normalizeNumericBarcode(input.rawValue)
      : normalizeQrBarcode(input.rawValue)
  };
}

export function inferBarcodeFormats(rawValue: string): InventoryBarcodeFormat[] {
  const normalizedValue = normalizeNumericBarcode(rawValue);

  if (!/^\d+$/.test(normalizedValue)) {
    return ["qr"];
  }

  if (normalizedValue.length === 12) {
    return ["upc_a"];
  }

  if (normalizedValue.length === 13) {
    return ["ean_13"];
  }

  if (normalizedValue.length === 8) {
    return ["ean_8", "upc_e"];
  }

  return ["qr"];
}

export function validateBarcode(input: InventoryBarcodeScanInput): BarcodeValidationResult {
  const errors: BarcodeValidationErrorDetail[] = [];
  const barcode = normalizeBarcode(input);

  if (!barcode) {
    errors.push(createBarcodeError("FORMAT_REQUIRED", "format", "Barcode format is required."));
    return { errors, ok: false };
  }

  if (!isNonEmptyString(barcode.value)) {
    errors.push(createBarcodeError("BARCODE_REQUIRED", "rawValue", "Barcode value is required."));
    return { errors, ok: false };
  }

  if (barcode.format === "qr") {
    if (barcode.value.length > MAX_QR_LENGTH) {
      errors.push(createBarcodeError("BARCODE_TOO_LONG", "rawValue", "QR barcode is too long."));
    }

    return errors.length > 0 ? { errors, ok: false } : { barcode, ok: true };
  }

  const expectedLength = getExpectedLength(barcode.format);
  if (!expectedLength || barcode.value.length !== expectedLength || !/^\d+$/.test(barcode.value)) {
    errors.push(
      createBarcodeError(
        "BARCODE_FORMAT_UNSUPPORTED",
        "value",
        "Numeric barcode value does not match the expected format."
      )
    );
  } else if (barcode.format === "upc_e" && !hasValidUpcENumberSystem(barcode.value)) {
    errors.push(
      createBarcodeError(
        "BARCODE_FORMAT_UNSUPPORTED",
        "value",
        "UPC-E number system must be 0 or 1."
      )
    );
  } else if (
    barcode.format === "upc_e"
      ? !hasValidUpcECheckDigit(barcode.value)
      : !hasValidGtinCheckDigit(barcode.value)
  ) {
    errors.push(
      createBarcodeError("CHECK_DIGIT_INVALID", "value", "Barcode check digit is invalid.")
    );
  }

  return errors.length > 0 ? { errors, ok: false } : { barcode, ok: true };
}

export function validateBarcodeCandidates(rawValue: string): BarcodeValidationResult[] {
  return inferBarcodeFormats(rawValue).map((format) => validateBarcode({ format, rawValue }));
}

export function shouldSuppressDuplicateBarcodeScan(
  scan: InventoryBarcodeScanEvent,
  recentScans: readonly InventoryBarcodeScanEvent[],
  windowMs = DUPLICATE_SCAN_WINDOW_MS
): DuplicateBarcodeScanResult {
  const scannedAtMs = Date.parse(scan.scannedAt);

  for (const recentScan of recentScans) {
    if (
      scan.barcode.format === recentScan.barcode.format &&
      scan.barcode.value === recentScan.barcode.value &&
      scannedAtMs - Date.parse(recentScan.scannedAt) >= 0 &&
      scannedAtMs - Date.parse(recentScan.scannedAt) <= windowMs
    ) {
      return {
        duplicateOf: recentScan,
        ok: false,
        reason: "duplicate_scan"
      };
    }
  }

  return { ok: true };
}
