import assert from "node:assert/strict";
import { describe, it } from "vitest";

import {
  RecipeDefinitionValidationError,
  assertValidRecipeDefinitionInput,
  normalizeRecipeDefinitionInput,
  scaleRecipeDefinition,
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
        description: "  Daily prasadam  ",
        name: "  Khichdi  ",
        servings: 12
      }),
      {
        description: "Daily prasadam",
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

  it("preserves an explicit empty description as null so edits can clear it", () => {
    assert.equal(
      normalizeRecipeDefinitionInput({
        description: " ",
        ingredients: [ingredient],
        name: "Khichdi",
        servings: 12
      }).description,
      null
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

  it("allows duplicate ingredients for future grouped planning workflows", () => {
    const result = validateRecipeDefinitionInput({
      ingredients: [
        {
          itemId: "item-rice",
          quantity: 2,
          unit: "kg"
        },
        {
          itemId: "item-rice",
          quantity: 1,
          unit: "kg"
        }
      ],
      name: "Khichdi",
      servings: 12
    });

    assert.deepEqual(result, { ok: true });
  });

  it("rejects invalid ingredient references, quantities, and units", () => {
    const result = validateRecipeIngredient(
      {
        itemId: "",
        quantity: Number.POSITIVE_INFINITY,
        unit: "stone" as RecipeIngredientInput["unit"]
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

  it("scales ingredient quantities to a target serving count", () => {
    assert.deepEqual(
      scaleRecipeDefinition(
        {
          ingredients: [
            {
              itemId: "item-rice",
              note: "  rinsed  ",
              quantity: 2,
              unit: "kg"
            },
            {
              itemId: "item-water",
              quantity: 6,
              unit: "l"
            }
          ],
          name: "  Khichdi  ",
          servings: 10
        },
        25
      ),
      {
        ingredients: [
          {
            itemId: "item-rice",
            note: "rinsed",
            quantity: 5,
            unit: "kg"
          },
          {
            itemId: "item-water",
            quantity: 15,
            unit: "l"
          }
        ],
        name: "Khichdi",
        servings: 25
      }
    );
  });

  it("rounds scaled quantities to six decimal places", () => {
    assert.equal(
      scaleRecipeDefinition(
        {
          ingredients: [
            {
              itemId: "item-spice",
              quantity: 1,
              unit: "g"
            }
          ],
          name: "Chutney",
          servings: 3
        },
        1
      ).ingredients[0]?.quantity,
      0.333333
    );
  });

  it("rejects invalid base recipes and invalid target servings while scaling", () => {
    assert.throws(
      () =>
        scaleRecipeDefinition(
          {
            ingredients: [],
            name: "Khichdi",
            servings: 10
          },
          20
        ),
      RecipeDefinitionValidationError
    );

    assert.throws(() => scaleRecipeDefinition(recipe, 0), RecipeDefinitionValidationError);
  });
});
