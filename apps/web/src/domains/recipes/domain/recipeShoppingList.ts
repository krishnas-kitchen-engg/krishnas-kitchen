import type { RecipeAvailabilityResult, RecipeIngredientAvailability } from "./recipeAvailability";
import type { RecipeIngredientInput } from "./types";

export type RecipeShoppingListItem = Pick<RecipeIngredientInput, "itemId" | "note" | "unit"> & {
  availableQuantity: number;
  requiredQuantity: number;
  shortageQuantity: number;
};

export type RecipeShoppingListResult = {
  isEmpty: boolean;
  itemCount: number;
  items: RecipeShoppingListItem[];
  recipe: RecipeAvailabilityResult["recipe"];
};

function getShoppingListKey(item: RecipeIngredientAvailability): string {
  return `${item.itemId}:${item.unit}`;
}

function addShoppingListItem(
  itemsByKey: Map<string, RecipeShoppingListItem>,
  ingredient: RecipeIngredientAvailability
): void {
  const key = getShoppingListKey(ingredient);
  const existingItem = itemsByKey.get(key);

  if (!existingItem) {
    itemsByKey.set(key, {
      availableQuantity: ingredient.availableQuantity,
      itemId: ingredient.itemId,
      ...(ingredient.note ? { note: ingredient.note } : {}),
      requiredQuantity: ingredient.requiredQuantity,
      shortageQuantity: ingredient.shortageQuantity,
      unit: ingredient.unit
    });
    return;
  }

  itemsByKey.set(key, {
    ...existingItem,
    availableQuantity: existingItem.availableQuantity + ingredient.availableQuantity,
    ...(!existingItem.note && ingredient.note ? { note: ingredient.note } : {}),
    requiredQuantity: existingItem.requiredQuantity + ingredient.requiredQuantity,
    shortageQuantity: existingItem.shortageQuantity + ingredient.shortageQuantity
  });
}

export function generateRecipeShoppingList(
  availability: RecipeAvailabilityResult
): RecipeShoppingListResult {
  const itemsByKey = new Map<string, RecipeShoppingListItem>();

  for (const ingredient of availability.ingredients) {
    addShoppingListItem(itemsByKey, ingredient);
  }

  const items = [...itemsByKey.values()].filter((item) => item.shortageQuantity > 0);

  return {
    isEmpty: items.length === 0,
    itemCount: items.length,
    items,
    recipe: availability.recipe
  };
}
