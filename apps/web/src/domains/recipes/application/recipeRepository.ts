import type { EntityId } from "@krishnas-kitchen/types";

import type { RecipeDefinitionInput } from "../domain/types";

export type RecipeRepositoryScope = {
  organizationId: EntityId;
  templeId?: EntityId;
};

export type RecipeRepositoryRecord = RecipeDefinitionInput & {
  createdAt: string;
  description?: string | null;
  id: EntityId;
  isActive: boolean;
  organizationId: EntityId;
  templeId?: EntityId;
  updatedAt: string;
  version: number;
};

export type RecipeRepositoryListQuery = RecipeRepositoryScope & {
  search?: string;
};

export type RecipeRepositoryFindQuery = RecipeRepositoryScope & {
  recipeId: EntityId;
};

export type RecipeRepository = {
  createRecipe: (
    scope: RecipeRepositoryScope,
    input: RecipeDefinitionInput
  ) => Promise<RecipeRepositoryRecord>;
  deactivateRecipe: (
    query: RecipeRepositoryFindQuery,
    updatedAt: string
  ) => Promise<RecipeRepositoryRecord | null>;
  findRecipeById: (query: RecipeRepositoryFindQuery) => Promise<RecipeRepositoryRecord | null>;
  listRecipes: (query: RecipeRepositoryListQuery) => Promise<readonly RecipeRepositoryRecord[]>;
  updateRecipe: (
    query: RecipeRepositoryFindQuery,
    input: RecipeDefinitionInput,
    updatedAt: string
  ) => Promise<RecipeRepositoryRecord | null>;
};
