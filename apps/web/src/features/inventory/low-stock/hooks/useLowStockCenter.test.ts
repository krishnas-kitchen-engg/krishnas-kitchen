import assert from "node:assert/strict";
import { describe, it } from "vitest";

import type {
  InventoryCatalogItem,
  InventoryCatalogLocation,
  InventoryLowStockAlert
} from "@/domains/inventory";

import { buildLowStockCenterItems } from "./useLowStockCenter";

const items: InventoryCatalogItem[] = [
  {
    barcodes: [],
    defaultUnit: "kg",
    deletedAt: null,
    id: "rice",
    name: "Rice",
    organizationId: "org-1"
  },
  {
    barcodes: [],
    defaultUnit: "kg",
    deletedAt: null,
    id: "dal",
    name: "Dal",
    organizationId: "org-1"
  }
];

const locations: InventoryCatalogLocation[] = [
  {
    deletedAt: null,
    id: "pantry",
    name: "Pantry",
    organizationId: "org-1",
    templeId: "temple-1"
  }
];

const alerts: InventoryLowStockAlert[] = [
  {
    currentQuantity: 2,
    itemId: "rice",
    locationId: "pantry",
    minimumQuantity: 5,
    organizationId: "org-1",
    shortageQuantity: 3,
    templeId: "temple-1",
    unit: "kg"
  },
  {
    currentQuantity: 0,
    itemId: "dal",
    locationId: "pantry",
    minimumQuantity: 4,
    organizationId: "org-1",
    shortageQuantity: 4,
    templeId: "temple-1",
    unit: "kg"
  },
  {
    currentQuantity: 0,
    itemId: "archived-item",
    locationId: "pantry",
    minimumQuantity: 4,
    organizationId: "org-1",
    shortageQuantity: 4,
    templeId: "temple-1",
    unit: "kg"
  },
  {
    currentQuantity: 0,
    itemId: "rice",
    locationId: "archived-location",
    minimumQuantity: 4,
    organizationId: "org-1",
    shortageQuantity: 4,
    templeId: "temple-1",
    unit: "kg"
  }
];

describe("low stock center items", () => {
  it("maps low-stock alerts through active item and location catalogs", () => {
    const centerItems = buildLowStockCenterItems({
      alerts,
      filters: {
        locationId: "",
        searchText: "",
        status: "all"
      },
      items,
      locations
    });

    assert.deepEqual(
      centerItems.map((item) => `${item.itemName}:${item.status}:${item.locationName}`),
      ["Dal:out:Pantry", "Rice:low:Pantry"]
    );
  });

  it("supports search, location, and status filters", () => {
    const centerItems = buildLowStockCenterItems({
      alerts,
      filters: {
        locationId: "pantry",
        searchText: "rice",
        status: "low"
      },
      items,
      locations
    });

    assert.equal(centerItems.length, 1);
    assert.equal(centerItems[0]?.itemName, "Rice");
    assert.equal(centerItems[0]?.status, "low");
  });
});
