import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { RecipeDefinitionValidationError } from "../domain/recipeDefinition";
import type { RecipeRepository, RecipeRepositoryRecord } from "./recipeRepository";
import { createRecipeService } from "./recipeService";

function createMemoryRecipeRepository(): RecipeRepository & {
  records: RecipeRepositoryRecord[];
} {
  const records: RecipeRepositoryRecord[] = [];

  return {
    records,
    createRecipe(scope, input) {
      const record: RecipeRepositoryRecord = {
        ...input,
        createdAt: "2026-07-18T00:00:00.000Z",
        id: `recipe-${records.length + 1}`,
        isActive: input.isActive ?? true,
        organizationId: scope.organizationId,
        ...(scope.templeId ? { templeId: scope.templeId } : {}),
        updatedAt: "2026-07-18T00:00:00.000Z",
        version: input.version ?? 1
      };
      records.push(record);

      return Promise.resolve(record);
    },
    deactivateRecipe(query, updatedAt) {
      const record = records.find((value) => value.id === query.recipeId) ?? null;
      if (!record) {
        return Promise.resolve(null);
      }

      record.isActive = false;
      record.updatedAt = updatedAt;

      return Promise.resolve(record);
    },
    findRecipeById(query) {
      return Promise.resolve(records.find((record) => record.id === query.recipeId) ?? null);
    },
    listRecipes() {
      return Promise.resolve(records);
    },
    updateRecipe(query, input, updatedAt) {
      const index = records.findIndex((record) => record.id === query.recipeId);
      if (index < 0) {
        return Promise.resolve(null);
      }

      const record = {
        ...records[index],
        ...input,
        updatedAt,
        version: records[index]?.version ?? 1
      } as RecipeRepositoryRecord;
      records[index] = record;

      return Promise.resolve(record);
    }
  };
}

describe("recipe service", () => {
  it("creates normalized recipes that reference active inventory items", async () => {
    const repository = createMemoryRecipeRepository();
    const service = createRecipeService(repository, {
      catalog: {
        findIngredientItem(itemId) {
          return Promise.resolve({
            deletedAt: null,
            id: itemId,
            organizationId: "org-1"
          });
        }
      }
    });

    const recipe = await service.createRecipe(
      {
        organizationId: "org-1",
        templeId: "temple-1"
      },
      {
        description: "  Daily prasadam  ",
        ingredients: [
          {
            itemId: "rice",
            note: "  washed  ",
            quantity: 5,
            unit: "kg"
          }
        ],
        name: "  Khichdi  ",
        servings: 25
      }
    );

    assert.equal(recipe.name, "Khichdi");
    assert.equal(recipe.description, "Daily prasadam");
    assert.equal(recipe.ingredients[0]?.note, "washed");
    assert.equal(recipe.isActive, true);
  });

  it("rejects inactive ingredient catalog references before persistence", async () => {
    const repository = createMemoryRecipeRepository();
    const service = createRecipeService(repository, {
      catalog: {
        findIngredientItem() {
          return Promise.resolve({
            deletedAt: "2026-07-18T00:00:00.000Z",
            id: "rice",
            organizationId: "org-1"
          });
        }
      }
    });

    await assert.rejects(
      () =>
        service.createRecipe(
          {
            organizationId: "org-1",
            templeId: "temple-1"
          },
          {
            ingredients: [
              {
                itemId: "rice",
                quantity: 5,
                unit: "kg"
              }
            ],
            name: "Khichdi",
            servings: 25
          }
        ),
      RecipeDefinitionValidationError
    );
    assert.equal(repository.records.length, 0);
  });

  it("rejects duplicate ingredient items in the management workflow", async () => {
    const repository = createMemoryRecipeRepository();
    const service = createRecipeService(repository);

    await assert.rejects(
      () =>
        service.createRecipe(
          {
            organizationId: "org-1",
            templeId: "temple-1"
          },
          {
            ingredients: [
              {
                itemId: "rice",
                quantity: 5,
                unit: "kg"
              },
              {
                itemId: "rice",
                quantity: 500,
                unit: "g"
              }
            ],
            name: "Khichdi",
            servings: 25
          }
        ),
      RecipeDefinitionValidationError
    );
  });
});
