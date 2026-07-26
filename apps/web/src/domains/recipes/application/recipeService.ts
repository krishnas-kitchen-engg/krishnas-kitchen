import type { EntityId } from "@krishnas-kitchen/types";

import type { InventoryCatalogItem } from "@/domains/inventory";

import {
  RecipeDefinitionValidationError,
  normalizeRecipeDefinitionInput,
  validateRecipeDefinitionInput
} from "../domain/recipeDefinition";
import type { RecipeDefinitionInput } from "../domain/types";
import type {
  RecipeRepository,
  RecipeRepositoryRecord,
  RecipeRepositoryScope
} from "./recipeRepository";

export type RecipeIngredientCatalog = {
  findIngredientItem: (
    itemId: EntityId,
    scope: Pick<RecipeRepositoryScope, "organizationId">
  ) => Promise<Pick<InventoryCatalogItem, "deletedAt" | "id" | "organizationId"> | null>;
};

export type RecipeService = {
  createRecipe: (
    scope: RecipeRepositoryScope,
    input: RecipeDefinitionInput
  ) => Promise<RecipeRepositoryRecord>;
  deactivateRecipe: (
    query: RecipeRepositoryScope & { recipeId: EntityId }
  ) => Promise<RecipeRepositoryRecord | null>;
  findRecipeById: (
    query: RecipeRepositoryScope & { recipeId: EntityId }
  ) => Promise<RecipeRepositoryRecord | null>;
  listRecipes: (
    query: RecipeRepositoryScope & { search?: string }
  ) => Promise<readonly RecipeRepositoryRecord[]>;
  updateRecipe: (
    query: RecipeRepositoryScope & { recipeId: EntityId },
    input: RecipeDefinitionInput
  ) => Promise<RecipeRepositoryRecord | null>;
};

async function validateIngredientReferences(
  catalog: RecipeIngredientCatalog | undefined,
  scope: RecipeRepositoryScope,
  input: RecipeDefinitionInput
): Promise<void> {
  if (!catalog) {
    return;
  }

  const errors: RecipeDefinitionValidationError["errors"][number][] = [];

  await Promise.all(
    input.ingredients.map(async (ingredient, index) => {
      const item = await catalog.findIngredientItem(ingredient.itemId, {
        organizationId: scope.organizationId
      });

      if (!item || item.organizationId !== scope.organizationId || item.deletedAt) {
        errors.push({
          code: "ITEM_REQUIRED",
          field: `ingredients[${index}].itemId`,
          message: "Recipe ingredient must reference an active inventory item."
        });
      }
    })
  );

  if (errors.length > 0) {
    throw new RecipeDefinitionValidationError(errors);
  }
}

function assertNoDuplicateRecipeIngredients(input: RecipeDefinitionInput): void {
  const ingredientIds = new Set<EntityId>();
  const errors: RecipeDefinitionValidationError["errors"][number][] = [];

  input.ingredients.forEach((ingredient, index) => {
    if (ingredientIds.has(ingredient.itemId)) {
      errors.push({
        code: "ITEM_REQUIRED",
        field: `ingredients[${index}].itemId`,
        message: "Recipe management requires each ingredient item to appear once."
      });
    }

    ingredientIds.add(ingredient.itemId);
  });

  if (errors.length > 0) {
    throw new RecipeDefinitionValidationError(errors);
  }
}

export function createRecipeService(
  repository: RecipeRepository,
  options: {
    catalog?: RecipeIngredientCatalog;
    now?: () => string;
  } = {}
): RecipeService {
  const now = options.now ?? (() => new Date().toISOString());

  async function validateRecipe(scope: RecipeRepositoryScope, input: RecipeDefinitionInput) {
    const normalizedInput = normalizeRecipeDefinitionInput(input);
    const validation = validateRecipeDefinitionInput(normalizedInput);

    if (!validation.ok) {
      throw new RecipeDefinitionValidationError(validation.errors);
    }

    assertNoDuplicateRecipeIngredients(normalizedInput);
    await validateIngredientReferences(options.catalog, scope, normalizedInput);

    return normalizedInput;
  }

  return {
    async createRecipe(scope, input) {
      return repository.createRecipe(scope, await validateRecipe(scope, input));
    },
    deactivateRecipe(query) {
      return repository.deactivateRecipe(query, now());
    },
    findRecipeById(query) {
      return repository.findRecipeById(query);
    },
    listRecipes(query) {
      return repository.listRecipes(query);
    },
    async updateRecipe(query, input) {
      const existingRecipe = await repository.findRecipeById(query);

      if (!existingRecipe) {
        return null;
      }

      return repository.updateRecipe(
        query,
        {
          ...(await validateRecipe(query, input)),
          version: existingRecipe.version
        },
        now()
      );
    }
  };
}
