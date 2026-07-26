import type { EntityId } from "@krishnas-kitchen/types";

import type { InventoryActor } from "@/domains/inventory";

export type RecipeProductionRunRecord = {
  actor: InventoryActor;
  batchCount: number;
  consumptionTransactionIds: readonly EntityId[];
  createdAt: string;
  id: EntityId;
  locationId: EntityId;
  notes: string | null;
  organizationId: EntityId;
  recipeId: EntityId;
  recipeName: string;
  recipeVersion: number;
  servings: number;
  templeId: EntityId;
};

export type CreateRecipeProductionRunRecordInput = Omit<
  RecipeProductionRunRecord,
  "createdAt" | "id"
>;

export type RecipeProductionRunQuery = {
  limit?: number;
  organizationId: EntityId;
  since?: string;
  templeId?: EntityId;
};

export type RecipeProductionRunRepository = {
  createProductionRun: (
    input: CreateRecipeProductionRunRecordInput
  ) => Promise<RecipeProductionRunRecord>;
  listProductionRuns: (query: RecipeProductionRunQuery) => Promise<RecipeProductionRunRecord[]>;
};
