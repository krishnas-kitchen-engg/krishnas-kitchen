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
  servings: 25,
  templeId: "temple-1",
  updatedAt: "2026-07-17T00:00:00.000Z"
};

function createRecipeRepository(records: readonly RecipeRepositoryRecord[]): RecipeRepository {
  return {
    findRecipeById(query: RecipeRepositoryFindQuery) {
      return Promise.resolve(
        records.find(
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
        records.filter(
          (record) =>
            record.organizationId === query.organizationId &&
            record.templeId === query.templeId &&
            (!search || record.name.toLocaleLowerCase().includes(search))
        )
      );
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
});
