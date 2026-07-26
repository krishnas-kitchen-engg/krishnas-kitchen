import assert from "node:assert/strict";
import { describe, it } from "vitest";

import {
  evaluateRecipeAvailability,
  generateRecipeShoppingList,
  scaleRecipeDefinition
} from "@/domains/recipes";
import type { InventoryItemBalance } from "@/domains/inventory";

import type {
  RecipeRepository,
  RecipeRepositoryFindQuery,
  RecipeRepositoryListQuery,
  RecipeRepositoryRecord
} from "./recipeRepository";

const recipe: RecipeRepositoryRecord = {
  createdAt: "2026-07-17T00:00:00.000Z",
  description: "Daily prasadam",
  id: "recipe-khichdi",
  ingredients: [
    {
      itemId: "item-rice",
      quantity: 5,
      unit: "kg"
    },
    {
      itemId: "item-water",
      quantity: 12,
      unit: "l"
    }
  ],
  name: "Khichdi",
  organizationId: "org-1",
  isActive: true,
  servings: 25,
  templeId: "temple-1",
  updatedAt: "2026-07-17T00:00:00.000Z",
  version: 1
};

function createRecipeRepository(records: readonly RecipeRepositoryRecord[]): RecipeRepository {
  const mutableRecords = [...records];

  return {
    createRecipe(scope, input) {
      const record = {
        ...input,
        createdAt: "2026-07-18T00:00:00.000Z",
        id: "recipe-new",
        isActive: input.isActive ?? true,
        organizationId: scope.organizationId,
        ...(scope.templeId ? { templeId: scope.templeId } : {}),
        updatedAt: "2026-07-18T00:00:00.000Z",
        version: input.version ?? 1
      } satisfies RecipeRepositoryRecord;
      mutableRecords.unshift(record);

      return Promise.resolve(record);
    },
    deactivateRecipe(query, updatedAt) {
      const record = mutableRecords.find(
        (value) =>
          value.id === query.recipeId &&
          value.organizationId === query.organizationId &&
          value.templeId === query.templeId
      );

      if (!record) {
        return Promise.resolve(null);
      }

      record.isActive = false;
      record.updatedAt = updatedAt;

      return Promise.resolve(record);
    },
    findRecipeById(query: RecipeRepositoryFindQuery) {
      return Promise.resolve(
        mutableRecords.find(
          (record) =>
            record.id === query.recipeId &&
            record.organizationId === query.organizationId &&
            record.templeId === query.templeId
        ) ?? null
      );
    },
    listRecipes(query: RecipeRepositoryListQuery) {
      const search = query.search?.trim().toLocaleLowerCase();

      return Promise.resolve(
        mutableRecords.filter(
          (record) =>
            record.organizationId === query.organizationId &&
            record.templeId === query.templeId &&
            (!search || record.name.toLocaleLowerCase().includes(search))
        )
      );
    },
    updateRecipe(query, input, updatedAt) {
      const record = mutableRecords.find(
        (value) =>
          value.id === query.recipeId &&
          value.organizationId === query.organizationId &&
          value.templeId === query.templeId
      );

      if (!record) {
        return Promise.resolve(null);
      }

      Object.assign(record, input, {
        updatedAt,
        version: record.version
      });

      return Promise.resolve(record);
    }
  };
}

describe("recipe repository contract", () => {
  it("lists recipe records within organization and temple scope", async () => {
    const repository = createRecipeRepository([
      recipe,
      {
        ...recipe,
        id: "recipe-outside-temple",
        templeId: "temple-2"
      }
    ]);

    const recipes = await repository.listRecipes({
      organizationId: "org-1",
      search: "khich",
      templeId: "temple-1"
    });

    assert.deepEqual(
      recipes.map((record) => record.id),
      ["recipe-khichdi"]
    );
  });

  it("finds a recipe by id within organization and temple scope", async () => {
    const repository = createRecipeRepository([recipe]);

    const foundRecipe = await repository.findRecipeById({
      organizationId: "org-1",
      recipeId: "recipe-khichdi",
      templeId: "temple-1"
    });

    assert.equal(foundRecipe?.name, "Khichdi");
  });

  it("returns null when the recipe is outside the requested scope", async () => {
    const repository = createRecipeRepository([recipe]);

    const foundRecipe = await repository.findRecipeById({
      organizationId: "org-1",
      recipeId: "recipe-khichdi",
      templeId: "temple-2"
    });

    assert.equal(foundRecipe, null);
  });

  it("keeps repository records compatible with recipe domain calculations", async () => {
    const repository = createRecipeRepository([recipe]);
    const foundRecipe = await repository.findRecipeById({
      organizationId: "org-1",
      recipeId: "recipe-khichdi",
      templeId: "temple-1"
    });

    assert.ok(foundRecipe);

    const scaledRecipe = scaleRecipeDefinition(foundRecipe, 50);
    const balances: InventoryItemBalance[] = [
      {
        itemId: "item-rice",
        organizationId: "org-1",
        quantity: 8,
        templeId: "temple-1",
        unit: "kg"
      }
    ];
    const availability = evaluateRecipeAvailability(scaledRecipe, balances);
    const shoppingList = generateRecipeShoppingList(availability);

    assert.deepEqual(
      shoppingList.items.map((item) => `${item.itemId}:${item.shortageQuantity}:${item.unit}`),
      ["item-rice:2:kg", "item-water:24:l"]
    );
  });

  it("supports create, update, and deactivate recipe records in scope", async () => {
    const repository = createRecipeRepository([]);

    const created = await repository.createRecipe(
      {
        organizationId: "org-1",
        templeId: "temple-1"
      },
      {
        ingredients: recipe.ingredients,
        name: "Khichdi",
        servings: 25
      }
    );
    const updated = await repository.updateRecipe(
      {
        organizationId: "org-1",
        recipeId: created.id,
        templeId: "temple-1"
      },
      {
        ...created,
        name: "Temple Khichdi",
        servings: 30
      },
      "2026-07-18T01:00:00.000Z"
    );
    const deactivated = await repository.deactivateRecipe(
      {
        organizationId: "org-1",
        recipeId: created.id,
        templeId: "temple-1"
      },
      "2026-07-18T02:00:00.000Z"
    );

    assert.equal(updated?.name, "Temple Khichdi");
    assert.equal(updated?.version, 1);
    assert.equal(deactivated?.isActive, false);
  });
});
