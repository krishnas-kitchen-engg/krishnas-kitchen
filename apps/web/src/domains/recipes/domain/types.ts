import type { EntityId, ItemUnit } from "@krishnas-kitchen/types";

export type RecipeIngredientInput = {
  itemId: EntityId;
  note?: string | null;
  quantity: number;
  unit: ItemUnit;
};

export type RecipeDefinitionInput = {
  ingredients: RecipeIngredientInput[];
  name: string;
  servings: number;
};

export type RecipeDefinitionValidationField =
  | "ingredients"
  | `ingredients[${number}].itemId`
  | `ingredients[${number}].quantity`
  | `ingredients[${number}].unit`
  | "name"
  | "servings";
