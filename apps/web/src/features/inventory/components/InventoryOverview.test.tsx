import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it } from "vitest";

import { InventoryOverview } from "./InventoryOverview";

describe("InventoryOverview", () => {
  it("shows a product total, package count, and per-location equations", () => {
    const markup = renderToStaticMarkup(
      <InventoryOverview
        rows={[
          {
            packages: [
              {
                contentsQuantity: 25,
                contentsUnit: "lb",
                contentsLabel: null,
                handlingUnit: "bag",
                itemId: "black-eyed-peas-25",
                itemName: "Black-Eyed Peas — 25 lb Bag",
                locations: [
                  { locationId: "blue", locationName: "Blue Container", quantity: 50 },
                  { locationId: "white", locationName: "White Container", quantity: 75 }
                ],
                packageDescription: "25 lb per bag",
                quantity: 125,
                unit: "lb"
              }
            ],
            productName: "Black-Eyed Peas"
          }
        ]}
      />
    );

    assert.match(markup, /Black-Eyed Peas — 125 lb total/);
    assert.match(markup, /25 lb bag × 5/);
    assert.match(markup, /Blue Container/);
    assert.match(markup, /25 lb bag × 2 = 50 lb/);
    assert.match(markup, /White Container/);
    assert.match(markup, /25 lb bag × 3 = 75 lb/);
  });

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
    assert.match(markup, /Pinto Beans — 875 lb total/);
    assert.match(markup, /50 lb bag × 15 = 750 lb/);
    assert.match(markup, /25 lb bag × 5 = 125 lb/);
    assert.match(markup, /White Container/);
    assert.match(markup, /50 lb bag × 10 = 500 lb/);
  });
});
