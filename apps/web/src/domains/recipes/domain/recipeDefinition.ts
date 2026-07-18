import type { ItemUnit } from "@krishnas-kitchen/types";
import { isNonEmptyString } from "@krishnas-kitchen/utils";

import type {
  RecipeDefinitionInput,
  RecipeDefinitionValidationField,
  RecipeIngredientInput
} from "./types";

export const RECIPE_INGREDIENT_UNITS = [
  "g",
  "kg",
  "ml",
  "l",
  "unit"
] as const satisfies readonly ItemUnit[];

export const RECIPE_QUANTITY_DECIMAL_PLACES = 6;

export type RecipeDefinitionValidationErrorCode =
  | "INGREDIENTS_REQUIRED"
  | "ITEM_REQUIRED"
  | "NAME_REQUIRED"
  | "QUANTITY_NOT_FINITE"
  | "QUANTITY_NOT_POSITIVE"
  | "SERVINGS_NOT_FINITE"
  | "SERVINGS_NOT_POSITIVE"
  | "UNIT_INVALID";

export type RecipeDefinitionValidationErrorDetail = {
  code: RecipeDefinitionValidationErrorCode;
  field: RecipeDefinitionValidationField;
  message: string;
};

export type RecipeDefinitionValidationResult =
  | {
      ok: true;
    }
  | {
      errors: RecipeDefinitionValidationErrorDetail[];
      ok: false;
    };

export class RecipeDefinitionValidationError extends Error {
  readonly errors: readonly RecipeDefinitionValidationErrorDetail[];

  constructor(errors: readonly RecipeDefinitionValidationErrorDetail[]) {
    super(errors.map((error) => error.message).join(" "));
    this.name = "RecipeDefinitionValidationError";
    this.errors = errors;
  }
}

function createRecipeDefinitionError(
  code: RecipeDefinitionValidationErrorCode,
  field: RecipeDefinitionValidationField,
  message: string
): RecipeDefinitionValidationErrorDetail {
  return {
    code,
    field,
    message
  };
}

function createRecipeDefinitionValidationResult(
  errors: RecipeDefinitionValidationErrorDetail[]
): RecipeDefinitionValidationResult {
  return errors.length > 0 ? { errors, ok: false } : { ok: true };
}

function isRecipeIngredientUnit(value: unknown): value is ItemUnit {
  return RECIPE_INGREDIENT_UNITS.includes(value as ItemUnit);
}

function roundRecipeQuantity(quantity: number): number {
  return Number(quantity.toFixed(RECIPE_QUANTITY_DECIMAL_PLACES));
}

export function normalizeRecipeDefinitionInput(
  input: RecipeDefinitionInput
): RecipeDefinitionInput {
  return {
    ingredients: input.ingredients.map((ingredient) => {
      const note = ingredient.note?.trim();

      return {
        ...ingredient,
        ...(note ? { note } : {})
      };
    }),
    name: input.name.trim(),
    servings: input.servings
  };
}

export function validateRecipeServings(servings: number): RecipeDefinitionValidationResult {
  const errors: RecipeDefinitionValidationErrorDetail[] = [];

  if (!Number.isFinite(servings)) {
    errors.push(
      createRecipeDefinitionError(
        "SERVINGS_NOT_FINITE",
        "servings",
        "Recipe servings must be finite."
      )
    );
  } else if (servings <= 0) {
    errors.push(
      createRecipeDefinitionError(
        "SERVINGS_NOT_POSITIVE",
        "servings",
        "Recipe servings must be greater than zero."
      )
    );
  }

  return createRecipeDefinitionValidationResult(errors);
}

export function validateRecipeIngredient(
  ingredient: RecipeIngredientInput,
  index: number
): RecipeDefinitionValidationResult {
  const errors: RecipeDefinitionValidationErrorDetail[] = [];

  if (!isNonEmptyString(ingredient.itemId)) {
    errors.push(
      createRecipeDefinitionError(
        "ITEM_REQUIRED",
        `ingredients[${index}].itemId`,
        "Recipe ingredient item is required."
      )
    );
  }

  if (!Number.isFinite(ingredient.quantity)) {
    errors.push(
      createRecipeDefinitionError(
        "QUANTITY_NOT_FINITE",
        `ingredients[${index}].quantity`,
        "Recipe ingredient quantity must be finite."
      )
    );
  } else if (ingredient.quantity <= 0) {
    errors.push(
      createRecipeDefinitionError(
        "QUANTITY_NOT_POSITIVE",
        `ingredients[${index}].quantity`,
        "Recipe ingredient quantity must be greater than zero."
      )
    );
  }

  if (!isRecipeIngredientUnit(ingredient.unit)) {
    errors.push(
      createRecipeDefinitionError(
        "UNIT_INVALID",
        `ingredients[${index}].unit`,
        "Recipe ingredient unit is invalid."
      )
    );
  }

  return createRecipeDefinitionValidationResult(errors);
}

export function validateRecipeDefinitionInput(
  input: RecipeDefinitionInput
): RecipeDefinitionValidationResult {
  const errors: RecipeDefinitionValidationErrorDetail[] = [];

  if (!isNonEmptyString(input.name)) {
    errors.push(createRecipeDefinitionError("NAME_REQUIRED", "name", "Recipe name is required."));
  }

  const servingsValidation = validateRecipeServings(input.servings);
  if (!servingsValidation.ok) {
    errors.push(...servingsValidation.errors);
  }

  if (input.ingredients.length === 0) {
    errors.push(
      createRecipeDefinitionError(
        "INGREDIENTS_REQUIRED",
        "ingredients",
        "Recipe requires at least one ingredient."
      )
    );
  }

  input.ingredients.forEach((ingredient, index) => {
    const ingredientValidation = validateRecipeIngredient(ingredient, index);
    if (!ingredientValidation.ok) {
      errors.push(...ingredientValidation.errors);
    }
  });

  return createRecipeDefinitionValidationResult(errors);
}

export function assertValidRecipeDefinitionInput(
  input: RecipeDefinitionInput
): RecipeDefinitionInput {
  const result = validateRecipeDefinitionInput(input);

  if (!result.ok) {
    throw new RecipeDefinitionValidationError(result.errors);
  }

  return input;
}

export function scaleRecipeDefinition(
  input: RecipeDefinitionInput,
  targetServings: number
): RecipeDefinitionInput {
  const recipe = normalizeRecipeDefinitionInput(assertValidRecipeDefinitionInput(input));
  const targetServingsValidation = validateRecipeServings(targetServings);

  if (!targetServingsValidation.ok) {
    throw new RecipeDefinitionValidationError(targetServingsValidation.errors);
  }

  const scaleFactor = targetServings / recipe.servings;

  return {
    ...recipe,
    ingredients: recipe.ingredients.map((ingredient) => ({
      ...ingredient,
      quantity: roundRecipeQuantity(ingredient.quantity * scaleFactor)
    })),
    servings: targetServings
  };
}
