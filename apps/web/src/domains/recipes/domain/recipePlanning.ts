import type { InventoryItemBalance } from "@/domains/inventory";

import { evaluateRecipeAvailability, type RecipeAvailabilityResult } from "./recipeAvailability";
import { RecipeDefinitionValidationError } from "./recipeDefinition";
import { scaleRecipeDefinition } from "./recipeDefinition";
import type { RecipeDefinitionInput } from "./types";

export type RecipePlanningInput = {
  balances: readonly InventoryItemBalance[];
  batchCount?: number;
  recipe: RecipeDefinitionInput & {
    isActive?: boolean;
  };
  targetServings?: number;
};

export type RecipePlanningResult = RecipeAvailabilityResult & {
  batchCount: number;
  targetServings: number;
};

function getTargetServings(input: RecipePlanningInput): number {
  if (typeof input.targetServings === "number") {
    return input.targetServings;
  }

  return input.recipe.servings * (input.batchCount ?? 1);
}

export function analyzeRecipeIngredientAvailability(
  input: RecipePlanningInput
): RecipePlanningResult {
  if (input.recipe.isActive === false) {
    throw new RecipeDefinitionValidationError([
      {
        code: "NAME_REQUIRED",
        field: "name",
        message: "Inactive recipes cannot be used for availability planning."
      }
    ]);
  }

  const targetServings = getTargetServings(input);
  const scaledRecipe = scaleRecipeDefinition(input.recipe, targetServings);
  const availability = evaluateRecipeAvailability(scaledRecipe, input.balances);

  return {
    ...availability,
    batchCount: targetServings / input.recipe.servings,
    targetServings
  };
}
