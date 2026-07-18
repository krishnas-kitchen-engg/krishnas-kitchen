import assert from "node:assert/strict";
import { describe, it } from "vitest";

import {
  RecipeDefinitionValidationError,
  assertValidRecipeDefinitionInput,
  normalizeRecipeDefinitionInput,
  validateRecipeDefinitionInput,
  validateRecipeIngredient,
  validateRecipeServings
} from "./recipeDefinition";
import type { RecipeDefinitionInput, RecipeIngredientInput } from "./types";

const ingredient: RecipeIngredientInput = {
  itemId: "item-rice",
  quantity: 2.5,
  unit: "kg"
};

const recipe: RecipeDefinitionInput = {
  ingredients: [ingredient],
  name: "Khichdi",
  servings: 12
};

describe("recipe definition validation", () => {
  it("accepts named recipes with positive servings and ingredient quantities", () => {
    assert.deepEqual(validateRecipeDefinitionInput(recipe), {
      ok: true
    });

    assert.deepEqual(validateRecipeServings(0), {
      errors: [
        {
          code: "SERVINGS_NOT_POSITIVE",
          field: "servings",
          message: "Recipe servings must be greater than zero."
        }
      ],
      ok: false
    });
  });

  it("normalizes user-entered recipe text without changing quantities or item references", () => {
    assert.deepEqual(
      normalizeRecipeDefinitionInput({
        ingredients: [
          {
            itemId: "item-rice",
            note: "  rinsed  ",
            quantity: 2.5,
            unit: "kg"
          }
        ],
        name: "  Khichdi  ",
        servings: 12
      }),
      {
        ingredients: [
          {
            itemId: "item-rice",
            note: "rinsed",
            quantity: 2.5,
            unit: "kg"
          }
        ],
        name: "Khichdi",
        servings: 12
      }
    );
  });

  it("rejects missing recipe names and empty ingredient lists", () => {
    const result = validateRecipeDefinitionInput({
      ingredients: [],
      name: " ",
      servings: 12
    });

    assert.equal(result.ok, false);
    assert.deepEqual(
      result.errors.map((error) => error.code),
      ["NAME_REQUIRED", "INGREDIENTS_REQUIRED"]
    );
  });

  it("rejects invalid ingredient references, quantities, and units", () => {
    const result = validateRecipeIngredient(
      {
        itemId: "",
        quantity: Number.POSITIVE_INFINITY,
        unit: "cup" as RecipeIngredientInput["unit"]
      },
      0
    );

    assert.equal(result.ok, false);
    assert.deepEqual(
      result.errors.map((error) => error.code),
      ["ITEM_REQUIRED", "QUANTITY_NOT_FINITE", "UNIT_INVALID"]
    );
    assert.deepEqual(
      result.errors.map((error) => error.field),
      ["ingredients[0].itemId", "ingredients[0].quantity", "ingredients[0].unit"]
    );
  });

  it("throws a recipe-specific validation error for invalid recipes", () => {
    assert.throws(
      () =>
        assertValidRecipeDefinitionInput({
          ...recipe,
          servings: -1
        }),
      RecipeDefinitionValidationError
    );
  });
});
