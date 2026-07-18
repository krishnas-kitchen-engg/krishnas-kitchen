import type { InventoryItemBalance } from "@/domains/inventory";

import {
  assertValidRecipeDefinitionInput,
  normalizeRecipeDefinitionInput
} from "./recipeDefinition";
import type { RecipeDefinitionInput, RecipeIngredientInput } from "./types";

export type RecipeAvailabilityStatus = "available" | "missing" | "short";

export type RecipeIngredientAvailability = RecipeIngredientInput & {
  availableQuantity: number;
  requiredQuantity: number;
  shortageQuantity: number;
  status: RecipeAvailabilityStatus;
};

export type RecipeAvailabilityResult = {
  availableIngredients: RecipeIngredientAvailability[];
  ingredients: RecipeIngredientAvailability[];
  isAvailable: boolean;
  missingIngredients: RecipeIngredientAvailability[];
  recipe: RecipeDefinitionInput;
  shortIngredients: RecipeIngredientAvailability[];
};

type RecipeAvailabilityBalance = InventoryItemBalance;

function getAvailabilityKey(itemId: string, unit: string): string {
  return `${itemId}:${unit}`;
}

function aggregateAvailableQuantities(
  balances: readonly RecipeAvailabilityBalance[]
): Map<string, number> {
  const availableQuantities = new Map<string, number>();

  for (const balance of balances) {
    const key = getAvailabilityKey(balance.itemId, balance.unit);
    const currentQuantity = availableQuantities.get(key) ?? 0;

    availableQuantities.set(key, currentQuantity + balance.quantity);
  }

  return availableQuantities;
}

function useAvailableQuantity(
  availableQuantities: Map<string, number>,
  ingredient: RecipeIngredientInput
): number {
  const key = getAvailabilityKey(ingredient.itemId, ingredient.unit);
  const availableQuantity = Math.max(availableQuantities.get(key) ?? 0, 0);
  const usedQuantity = Math.min(ingredient.quantity, availableQuantity);

  availableQuantities.set(key, availableQuantity - ingredient.quantity);

  return usedQuantity;
}

export function getRecipeAvailabilityStatus(
  requiredQuantity: number,
  availableQuantity: number
): RecipeAvailabilityStatus {
  if (availableQuantity >= requiredQuantity) {
    return "available";
  }

  return availableQuantity > 0 ? "short" : "missing";
}

export function evaluateRecipeAvailability(
  input: RecipeDefinitionInput,
  balances: readonly RecipeAvailabilityBalance[]
): RecipeAvailabilityResult {
  const recipe = normalizeRecipeDefinitionInput(assertValidRecipeDefinitionInput(input));
  const availableQuantities = aggregateAvailableQuantities(balances);
  const ingredients = recipe.ingredients.map((ingredient): RecipeIngredientAvailability => {
    const requiredQuantity = ingredient.quantity;
    const availableQuantity = useAvailableQuantity(availableQuantities, ingredient);
    const shortageQuantity = Math.max(requiredQuantity - availableQuantity, 0);
    const status = getRecipeAvailabilityStatus(requiredQuantity, availableQuantity);

    return {
      ...ingredient,
      availableQuantity,
      requiredQuantity,
      shortageQuantity,
      status
    };
  });

  return {
    availableIngredients: ingredients.filter((ingredient) => ingredient.status === "available"),
    ingredients,
    isAvailable: ingredients.every((ingredient) => ingredient.status === "available"),
    missingIngredients: ingredients.filter((ingredient) => ingredient.status === "missing"),
    recipe,
    shortIngredients: ingredients.filter((ingredient) => ingredient.status === "short")
  };
}
