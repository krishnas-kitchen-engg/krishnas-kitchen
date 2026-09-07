import { describe, expect, it } from "vitest";

import { hasReceiptOcrPermission } from "./receipt-ocr.js";

describe("receipt OCR authorization", () => {
  it.each(["cook", "senior_cook", "inventory_manager", "temple_admin", "super_admin"])(
    "allows the %s role",
    (role) => {
      expect(hasReceiptOcrPermission([{ role }])).toBe(true);
    }
  );

  it("rejects volunteers, missing roles, and malformed role results", () => {
    expect(hasReceiptOcrPermission([{ role: "volunteer" }])).toBe(false);
    expect(hasReceiptOcrPermission([])).toBe(false);
    expect(hasReceiptOcrPermission("cook")).toBe(false);
    expect(hasReceiptOcrPermission(null)).toBe(false);
  });
});
