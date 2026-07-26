import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { RecipeDefinitionValidationError } from "./recipeDefinition";
import { analyzeRecipeIngredientAvailability } from "./recipePlanning";
import type { RecipeDefinitionInput } from "./types";

const recipe: RecipeDefinitionInput & { isActive: boolean } = {
  ingredients: [
    {
      itemId: "rice",
      quantity: 5,
      unit: "kg"
    },
    {
      itemId: "dal",
      quantity: 2,
      unit: "kg"
    }
  ],
  isActive: true,
  name: "Khichdi",
  servings: 25
};

describe("recipe planning", () => {
  it("scales recipes by target servings and evaluates availability from balances", () => {
    const result = analyzeRecipeIngredientAvailability({
      balances: [
        {
          itemId: "rice",
          organizationId: "org-1",
          quantity: 8,
          templeId: "temple-1",
          unit: "kg"
        },
        {
          itemId: "dal",
          organizationId: "org-1",
          quantity: 10,
          templeId: "temple-1",
          unit: "kg"
        }
      ],
      recipe,
      targetServings: 50
    });

    assert.equal(result.targetServings, 50);
    assert.equal(result.batchCount, 2);
    assert.deepEqual(
      result.ingredients.map((ingredient) => ({
        availableQuantity: ingredient.availableQuantity,
        itemId: ingredient.itemId,
        requiredQuantity: ingredient.requiredQuantity,
        shortageQuantity: ingredient.shortageQuantity,
        status: ingredient.status
      })),
      [
        {
          availableQuantity: 8,
          itemId: "rice",
          requiredQuantity: 10,
          shortageQuantity: 2,
          status: "short"
        },
        {
          availableQuantity: 4,
          itemId: "dal",
          requiredQuantity: 4,
          shortageQuantity: 0,
          status: "available"
        }
      ]
    );
  });

  it("scales recipes by batch count", () => {
    const result = analyzeRecipeIngredientAvailability({
      balances: [],
      batchCount: 3,
      recipe
    });

    assert.equal(result.targetServings, 75);
    assert.equal(result.ingredients[0]?.requiredQuantity, 15);
  });

  it("rejects invalid target servings", () => {
    assert.throws(
      () =>
        analyzeRecipeIngredientAvailability({
          balances: [],
          recipe,
          targetServings: 0
        }),
      RecipeDefinitionValidationError
    );
  });

  it("rejects invalid batch counts", () => {
    assert.throws(
      () =>
        analyzeRecipeIngredientAvailability({
          balances: [],
          batchCount: 0,
          recipe
        }),
      RecipeDefinitionValidationError
    );
  });

  it("rejects inactive recipes", () => {
    assert.throws(
      () =>
        analyzeRecipeIngredientAvailability({
          balances: [],
          recipe: {
            ...recipe,
            isActive: false
          },
          targetServings: 50
        }),
      RecipeDefinitionValidationError
    );
  });
});
