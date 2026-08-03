import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { ITEM_UNITS } from "./itemUnits";

describe("ITEM_UNITS", () => {
  it("includes metric, US customary, and common package units", () => {
    const units = new Set<string>(ITEM_UNITS);

    for (const expectedUnit of [
      "g",
      "kg",
      "lb",
      "oz",
      "ml",
      "l",
      "fl_oz",
      "cup",
      "pt",
      "qt",
      "gal",
      "tsp",
      "tbsp",
      "unit",
      "case",
      "box",
      "bag"
    ]) {
      assert.equal(units.has(expectedUnit), true);
    }
  });
});
