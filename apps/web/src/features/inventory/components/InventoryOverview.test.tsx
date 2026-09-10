import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it } from "vitest";

import { InventoryOverview } from "./InventoryOverview";

describe("InventoryOverview", () => {
  it("shows handling-unit balances, package details, equivalents, and locations", () => {
    const markup = renderToStaticMarkup(
      <InventoryOverview
        rows={[
          {
            packages: [
              {
                contentsQuantity: 50,
                contentsUnit: "lb",
                contentsLabel: null,
                handlingUnit: "bag",
                itemId: "pinto-50",
                itemName: "Pinto Beans — 50 lb Bag",
                locations: [
                  { locationId: "white", locationName: "White Container", quantity: 500 },
                  { locationId: "blue", locationName: "Blue Container", quantity: 250 }
                ],
                packageDescription: "50 lb per bag",
                quantity: 750,
                unit: "lb"
              },
              {
                contentsQuantity: 25,
                contentsUnit: "lb",
                contentsLabel: null,
                handlingUnit: "bag",
                itemId: "pinto-25",
                itemName: "Pinto Beans — 25 lb Bag",
                locations: [{ locationId: "blue", locationName: "Blue Container", quantity: 125 }],
                packageDescription: "25 lb per bag",
                quantity: 125,
                unit: "lb"
              }
            ],
            productName: "Pinto Beans"
          }
        ]}
      />
    );

    assert.match(markup, /Pinto Beans/);
    assert.doesNotMatch(markup, /875 lb equivalent/);
    assert.match(markup, /15 bags/);
    assert.match(markup, /750 lb equivalent/);
    assert.match(markup, /5 bags/);
    assert.match(markup, /125 lb equivalent/);
    assert.match(markup, /Each: 50 lb per bag/);
    assert.match(markup, /White Container/);
    assert.match(markup, /10 bags/);
  });
});
