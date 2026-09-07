import type { EntityId } from "@krishnas-kitchen/types";

import type {
  InventoryActor,
  InventoryCatalogItem,
  InventoryCatalogLocation,
  InventoryService,
  InventoryTransaction,
  InventoryVisibilityService
} from "@/domains/inventory";

import {
  analyzeRecipeIngredientAvailability,
  type RecipePlanningResult
} from "../domain/recipePlanning";
import type { RecipeRepositoryRecord } from "./recipeRepository";
import type {
  RecipeProductionRunRecord,
  RecipeProductionRunRepository
} from "./recipeProductionRepository";

export class RecipeProductionValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RecipeProductionValidationError";
  }
}

export class RecipeProductionRollbackError extends Error {
  readonly failedTransactionIds: readonly EntityId[];

  constructor(failedTransactionIds: readonly EntityId[], cause: unknown) {
    super(
      `Production failed and inventory rollback was incomplete for ${failedTransactionIds.length} transaction(s).`,
      { cause }
    );
    this.failedTransactionIds = failedTransactionIds;
    this.name = "RecipeProductionRollbackError";
  }
}

export type RecipeProductionCatalog = {
  findProductionItem: (
    organizationId: EntityId,
    itemId: EntityId
  ) => Promise<InventoryCatalogItem | null>;
  findProductionLocation: (
    organizationId: EntityId,
    templeId: EntityId,
    locationId: EntityId
  ) => Promise<InventoryCatalogLocation | null>;
};

export type RecipeProductionInput = {
  actor: InventoryActor | null;
  batchCount?: number;
  locationId: EntityId;
  notes?: string;
  organizationId: EntityId;
  permission: "denied" | "granted";
  recipe: RecipeRepositoryRecord;
  targetServings?: number;
  templeId: EntityId;
};

export type RecipeProductionResult = {
  planningResult: RecipePlanningResult;
  productionRun: RecipeProductionRunRecord;
  transactions: readonly InventoryTransaction[];
};

export type RecipeProductionService = {
  executeProductionRun: (input: RecipeProductionInput) => Promise<RecipeProductionResult>;
};

function getTargetServings(
  input: Pick<RecipeProductionInput, "batchCount" | "recipe" | "targetServings">
) {
  if (typeof input.targetServings === "number") {
    return input.targetServings;
  }

  return input.recipe.servings * (input.batchCount ?? 1);
}

function getConsumptionUnits(item: InventoryCatalogItem): readonly string[] {
  return item.consumptionUnits?.length ? item.consumptionUnits : [item.defaultUnit];
}

function assertProductionInput(
  input: RecipeProductionInput
): asserts input is RecipeProductionInput & {
  actor: InventoryActor;
} {
  if (!input.actor) {
    throw new RecipeProductionValidationError("Inventory actor is required.");
  }

  if (input.permission !== "granted") {
    throw new RecipeProductionValidationError(
      "You do not have permission to execute production runs."
    );
  }

  if (!input.locationId.trim()) {
    throw new RecipeProductionValidationError("Production location is required.");
  }

  if (!input.recipe.isActive) {
    throw new RecipeProductionValidationError("Inactive recipes cannot be produced.");
  }
}

export function createRecipeProductionService(options: {
  catalog: RecipeProductionCatalog;
  inventoryService: InventoryService;
  productionRunRepository: RecipeProductionRunRepository;
  visibilityService: InventoryVisibilityService;
}): RecipeProductionService {
  return {
    async executeProductionRun(input) {
      assertProductionInput(input);

      const [location, locationBalances, ingredientItems] = await Promise.all([
        options.catalog.findProductionLocation(
          input.organizationId,
          input.templeId,
          input.locationId
        ),
        options.visibilityService.getVisibleBalances({
          locationId: input.locationId,
          organizationId: input.organizationId,
          templeId: input.templeId
        }),
        Promise.all(
          input.recipe.ingredients.map((ingredient) =>
            options.catalog.findProductionItem(input.organizationId, ingredient.itemId)
          )
        )
      ]);

      if (!location) {
        throw new RecipeProductionValidationError("Production location was not found.");
      }

      const ingredientItemsById = new Map(
        ingredientItems
          .filter((item): item is InventoryCatalogItem => item !== null)
          .map((item) => [item.id, item])
      );

      for (const ingredient of input.recipe.ingredients) {
        const item = ingredientItemsById.get(ingredient.itemId);

        if (!item) {
          throw new RecipeProductionValidationError(
            "Production ingredients must reference active inventory items."
          );
        }

        if (!getConsumptionUnits(item).includes(ingredient.unit)) {
          throw new RecipeProductionValidationError(
            "Production ingredient unit is not allowed for consumption."
          );
        }
      }

      const targetServings = getTargetServings(input);
      const planningResult = analyzeRecipeIngredientAvailability({
        balances: locationBalances,
        recipe: input.recipe,
        targetServings
      });

      if (!planningResult.isAvailable) {
        throw new RecipeProductionValidationError(
          "Production cannot be completed because one or more ingredients are short."
        );
      }

      const notes = input.notes?.trim();
      const transactions: InventoryTransaction[] = [];

      try {
        for (const ingredient of planningResult.ingredients) {
          transactions.push(
            await options.inventoryService.consumeInventory({
              actor: input.actor,
              auditMetadata: {
                reason: "recipe_production_run",
                source: "online"
              },
              itemId: ingredient.itemId,
              locationId: input.locationId,
              notes: notes || `Production run: ${input.recipe.name}`,
              organizationId: input.organizationId,
              quantity: ingredient.requiredQuantity,
              templeId: input.templeId,
              unit: ingredient.unit
            })
          );
        }

        const productionRun = await options.productionRunRepository.createProductionRun({
          actor: input.actor,
          batchCount: planningResult.batchCount,
          consumptionTransactionIds: transactions.map((transaction) => transaction.id),
          locationId: input.locationId,
          notes: notes || null,
          organizationId: input.organizationId,
          recipeId: input.recipe.id,
          recipeName: input.recipe.name,
          recipeVersion: input.recipe.version,
          servings: planningResult.targetServings,
          templeId: input.templeId
        });

        return {
          planningResult,
          productionRun,
          transactions
        };
      } catch (error) {
        const failedRollbackTransactionIds: EntityId[] = [];

        for (const transaction of [...transactions].reverse()) {
          try {
            await options.inventoryService.undoTransaction(transaction.id, {
              actor: input.actor,
              auditMetadata: {
                reason: "recipe_production_run_rollback",
                source: "online"
              },
              notes: `Rollback production run: ${input.recipe.name}`
            });
          } catch {
            failedRollbackTransactionIds.push(transaction.id);
          }
        }

        if (failedRollbackTransactionIds.length > 0) {
          throw new RecipeProductionRollbackError(failedRollbackTransactionIds, error);
        }

        throw error;
      }
    }
  };
}
