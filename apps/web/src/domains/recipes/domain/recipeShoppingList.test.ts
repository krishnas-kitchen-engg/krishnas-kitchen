import assert from "node:assert/strict";
import { describe, it } from "vitest";

import type { InventoryItemBalance } from "@/domains/inventory";

import { evaluateRecipeAvailability } from "./recipeAvailability";
import { generateRecipeShoppingList } from "./recipeShoppingList";
import type { RecipeDefinitionInput } from "./types";

const recipe: RecipeDefinitionInput = {
  ingredients: [
    {
      itemId: "item-rice",
      quantity: 5,
      unit: "kg"
    },
    {
      itemId: "item-water",
      quantity: 12,
      unit: "l"
    },
    {
      itemId: "item-spice",
      note: "freshly ground",
      quantity: 250,
      unit: "g"
    }
  ],
  name: "Khichdi",
  servings: 25
};

const balances: InventoryItemBalance[] = [
  {
    itemId: "item-rice",
    organizationId: "org-1",
    quantity: 5,
    templeId: "temple-1",
    unit: "kg"
  },
  {
    itemId: "item-water",
    organizationId: "org-1",
    quantity: 4,
    templeId: "temple-1",
    unit: "l"
  }
];

describe("recipe shopping list", () => {
  it("creates shopping-list items from short and missing recipe ingredients", () => {
    const availability = evaluateRecipeAvailability(recipe, balances);
    const shoppingList = generateRecipeShoppingList(availability);

    assert.equal(shoppingList.isEmpty, false);
    assert.equal(shoppingList.itemCount, 2);
    assert.deepEqual(
      shoppingList.items.map((item) => item.itemId),
      ["item-water", "item-spice"]
    );
    assert.deepEqual(shoppingList.items[0], {
      availableQuantity: 4,
      itemId: "item-water",
      requiredQuantity: 12,
      shortageQuantity: 8,
      unit: "l"
    });
    assert.deepEqual(shoppingList.items[1], {
      availableQuantity: 0,
      itemId: "item-spice",
      note: "freshly ground",
      requiredQuantity: 250,
      shortageQuantity: 250,
      unit: "g"
    });
  });

  it("returns an empty shopping list when every ingredient is available", () => {
    const availability = evaluateRecipeAvailability(recipe, [
      ...balances,
      {
        itemId: "item-water",
        organizationId: "org-1",
        quantity: 8,
        templeId: "temple-1",
        unit: "l"
      },
      {
        itemId: "item-spice",
        organizationId: "org-1",
        quantity: 250,
        templeId: "temple-1",
        unit: "g"
      }
    ]);

    const shoppingList = generateRecipeShoppingList(availability);

    assert.equal(shoppingList.isEmpty, true);
    assert.equal(shoppingList.itemCount, 0);
    assert.deepEqual(shoppingList.items, []);
  });

  it("aggregates shortage quantities by exact item and unit", () => {
    const availability = evaluateRecipeAvailability(
      {
        ingredients: [
          {
            itemId: "item-rice",
            quantity: 4,
            unit: "kg"
          },
          {
            itemId: "item-rice",
            quantity: 3,
            unit: "kg"
          }
        ],
        name: "Rice",
        servings: 4
      },
      [
        {
          itemId: "item-rice",
          organizationId: "org-1",
          quantity: 2,
          templeId: "temple-1",
          unit: "kg"
        }
      ]
    );

    const shoppingList = generateRecipeShoppingList(availability);

    assert.deepEqual(shoppingList.items, [
      {
        availableQuantity: 2,
        itemId: "item-rice",
        requiredQuantity: 7,
        shortageQuantity: 5,
        unit: "kg"
      }
    ]);
  });

  it("includes fully available duplicate lines in grouped shopping-list totals", () => {
    const availability = evaluateRecipeAvailability(
      {
        ingredients: [
          {
            itemId: "item-rice",
            quantity: 4,
            unit: "kg"
          },
          {
            itemId: "item-rice",
            quantity: 4,
            unit: "kg"
          }
        ],
        name: "Rice",
        servings: 4
      },
      [
        {
          itemId: "item-rice",
          organizationId: "org-1",
          quantity: 5,
          templeId: "temple-1",
          unit: "kg"
        }
      ]
    );

    const shoppingList = generateRecipeShoppingList(availability);

    assert.deepEqual(shoppingList.items, [
      {
        availableQuantity: 5,
        itemId: "item-rice",
        requiredQuantity: 8,
        shortageQuantity: 3,
        unit: "kg"
      }
    ]);
  });

  it("preserves note metadata when a later grouped shortage has a note", () => {
    const availability = evaluateRecipeAvailability(
      {
        ingredients: [
          {
            itemId: "item-rice",
            quantity: 4,
            unit: "kg"
          },
          {
            itemId: "item-rice",
            note: "sona masoori",
            quantity: 3,
            unit: "kg"
          }
        ],
        name: "Rice",
        servings: 4
      },
      []
    );

    const shoppingList = generateRecipeShoppingList(availability);

    assert.equal(shoppingList.items[0]?.note, "sona masoori");
  });

  it("keeps compatible units separate instead of converting them", () => {
    const availability = evaluateRecipeAvailability(
      {
        ingredients: [
          {
            itemId: "item-rice",
            quantity: 1,
            unit: "kg"
          },
          {
            itemId: "item-rice",
            quantity: 500,
            unit: "g"
          }
        ],
        name: "Rice",
        servings: 4
      },
      []
    );

    const shoppingList = generateRecipeShoppingList(availability);

    assert.deepEqual(
      shoppingList.items.map((item) => `${item.itemId}:${item.unit}:${item.shortageQuantity}`),
      ["item-rice:kg:1", "item-rice:g:500"]
    );
  });
});
