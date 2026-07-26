import type { EntityId, ItemUnit } from "@krishnas-kitchen/types";

export type RecipeIngredientInput = {
  itemId: EntityId;
  note?: string | null;
  quantity: number;
  unit: ItemUnit;
};

export type RecipeDefinitionInput = {
  description?: string | null;
  ingredients: RecipeIngredientInput[];
  isActive?: boolean;
  name: string;
  servings: number;
  version?: number;
};

export type RecipeDefinitionValidationField =
  | "ingredients"
  | `ingredients[${number}].itemId`
  | `ingredients[${number}].quantity`
  | `ingredients[${number}].unit`
  | "description"
  | "name"
  | "servings";
