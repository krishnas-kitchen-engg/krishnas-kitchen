import assert from "node:assert/strict";
import { describe, it } from "vitest";

import type { InventoryItemBalance } from "@/domains/inventory";

import { RecipeDefinitionValidationError } from "./recipeDefinition";
import { evaluateRecipeAvailability, getRecipeAvailabilityStatus } from "./recipeAvailability";
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
    quantity: 3,
    templeId: "temple-1",
    unit: "kg"
  },
  {
    itemId: "item-rice",
    organizationId: "org-1",
    quantity: 4,
    templeId: "temple-1",
    unit: "kg"
  },
  {
    itemId: "item-water",
    organizationId: "org-1",
    quantity: 12,
    templeId: "temple-1",
    unit: "l"
  },
  {
    itemId: "item-spice",
    organizationId: "org-1",
    quantity: 100,
    templeId: "temple-1",
    unit: "g"
  }
];

describe("recipe availability", () => {
  it("classifies recipe ingredients as available, short, or missing", () => {
    const result = evaluateRecipeAvailability(recipe, balances);

    assert.equal(result.isAvailable, false);
    assert.deepEqual(
      result.ingredients.map((ingredient) => ingredient.status),
      ["available", "available", "short"]
    );
    assert.equal(result.ingredients[0]?.availableQuantity, 5);
    assert.equal(result.ingredients[0]?.shortageQuantity, 0);
    assert.equal(result.ingredients[2]?.availableQuantity, 100);
    assert.equal(result.ingredients[2]?.shortageQuantity, 150);
    assert.deepEqual(
      result.shortIngredients.map((ingredient) => ingredient.itemId),
      ["item-spice"]
    );
    assert.deepEqual(result.missingIngredients, []);
  });

  it("reports missing ingredients when no exact item and unit balance exists", () => {
    const result = evaluateRecipeAvailability(recipe, balances.slice(0, 2));

    assert.equal(result.isAvailable, false);
    assert.deepEqual(
      result.ingredients.map((ingredient) => ingredient.status),
      ["available", "missing", "missing"]
    );
    assert.equal(result.ingredients[1]?.availableQuantity, 0);
    assert.equal(result.ingredients[1]?.shortageQuantity, 12);
    assert.deepEqual(
      result.missingIngredients.map((ingredient) => ingredient.itemId),
      ["item-water", "item-spice"]
    );
  });

  it("uses exact units without converting between compatible item units", () => {
    const result = evaluateRecipeAvailability(
      {
        ingredients: [
          {
            itemId: "item-rice",
            quantity: 1,
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
          quantity: 1000,
          templeId: "temple-1",
          unit: "g"
        }
      ]
    );

    assert.equal(result.ingredients[0]?.status, "missing");
    assert.equal(result.ingredients[0]?.availableQuantity, 0);
  });

  it("treats negative balances as unavailable for recipe readiness", () => {
    const result = evaluateRecipeAvailability(
      {
        ingredients: [
          {
            itemId: "item-rice",
            quantity: 1,
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
          quantity: -3,
          templeId: "temple-1",
          unit: "kg"
        }
      ]
    );

    assert.equal(result.ingredients[0]?.status, "missing");
    assert.equal(result.ingredients[0]?.availableQuantity, 0);
  });

  it("does not reuse the same inventory quantity across duplicate recipe ingredients", () => {
    const result = evaluateRecipeAvailability(
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

    assert.deepEqual(
      result.ingredients.map((ingredient) => ingredient.status),
      ["available", "short"]
    );
    assert.equal(result.ingredients[0]?.availableQuantity, 4);
    assert.equal(result.ingredients[1]?.availableQuantity, 1);
    assert.equal(result.ingredients[1]?.shortageQuantity, 3);
  });

  it("throws recipe validation errors for invalid recipe inputs", () => {
    assert.throws(
      () =>
        evaluateRecipeAvailability(
          {
            ingredients: [],
            name: " ",
            servings: 0
          },
          balances
        ),
      RecipeDefinitionValidationError
    );
  });

  it("returns a readiness status from required and available quantities", () => {
    assert.equal(getRecipeAvailabilityStatus(3, 3), "available");
    assert.equal(getRecipeAvailabilityStatus(3, 2), "short");
    assert.equal(getRecipeAvailabilityStatus(3, 0), "missing");
  });
});
