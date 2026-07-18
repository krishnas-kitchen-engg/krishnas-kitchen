import type { EntityId } from "@krishnas-kitchen/types";

import type { RecipeDefinitionInput } from "../domain/types";

export type RecipeRepositoryScope = {
  organizationId: EntityId;
  templeId?: EntityId;
};

export type RecipeRepositoryRecord = RecipeDefinitionInput & {
  createdAt: string;
  id: EntityId;
  organizationId: EntityId;
  templeId?: EntityId;
  updatedAt: string;
};

export type RecipeRepositoryListQuery = RecipeRepositoryScope & {
  search?: string;
};

export type RecipeRepositoryFindQuery = RecipeRepositoryScope & {
  recipeId: EntityId;
};

export type RecipeRepository = {
  findRecipeById: (query: RecipeRepositoryFindQuery) => Promise<RecipeRepositoryRecord | null>;
  listRecipes: (query: RecipeRepositoryListQuery) => Promise<readonly RecipeRepositoryRecord[]>;
};
