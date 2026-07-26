import assert from "node:assert/strict";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@krishnas-kitchen/types";
import { describe, it } from "vitest";

import { createSupabaseRecipeRepository } from "./supabaseRecipeRepository";

type RecipeRow = Database["public"]["Tables"]["recipes"]["Row"];
type SupabaseResult<T> = {
  data: T;
  error: null | { message: string };
};

const recipeRow: RecipeRow = {
  created_at: "2026-07-21T00:00:00.000Z",
  description: "Daily prasadam",
  id: "recipe-1",
  ingredients: [
    {
      itemId: "rice",
      quantity: 5,
      unit: "kg"
    }
  ],
  is_active: true,
  name: "Khichdi",
  organization_id: "org-1",
  servings: 25,
  temple_id: "temple-1",
  updated_at: "2026-07-21T00:00:00.000Z",
  version: 1
};

class RecipeQuery implements PromiseLike<SupabaseResult<RecipeRow[]>> {
  constructor(private readonly rows: RecipeRow[]) {}

  eq() {
    return this;
  }

  ilike() {
    return this;
  }

  maybeSingle(): Promise<SupabaseResult<RecipeRow | null>> {
    return Promise.resolve({
      data: this.rows[0] ?? null,
      error: null
    });
  }

  order() {
    return this;
  }

  select() {
    return this;
  }

  single(): Promise<SupabaseResult<RecipeRow>> {
    return Promise.resolve({
      data: this.rows[0] ?? recipeRow,
      error: null
    });
  }

  then<TResult1 = SupabaseResult<RecipeRow[]>, TResult2 = never>(
    onfulfilled?: ((value: SupabaseResult<RecipeRow[]>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return Promise.resolve({ data: this.rows, error: null }).then(onfulfilled, onrejected);
  }
}

class RecipeTable {
  inserted: Database["public"]["Tables"]["recipes"]["Insert"] | null = null;
  updated: Database["public"]["Tables"]["recipes"]["Update"] | null = null;

  constructor(private readonly rows: RecipeRow[]) {}

  insert(payload: Database["public"]["Tables"]["recipes"]["Insert"]) {
    this.inserted = payload;

    return new RecipeQuery(this.rows);
  }

  select() {
    return new RecipeQuery(this.rows);
  }

  update(payload: Database["public"]["Tables"]["recipes"]["Update"]) {
    this.updated = payload;

    return new RecipeQuery(this.rows);
  }
}

class SupabaseClientStub {
  readonly recipes = new RecipeTable([recipeRow]);

  from(table: string) {
    assert.equal(table, "recipes");

    return this.recipes;
  }
}

describe("Supabase recipe repository", () => {
  it("persists recipes through the recipes table", async () => {
    const stub = new SupabaseClientStub();
    const repository = createSupabaseRecipeRepository(stub as unknown as SupabaseClient<Database>);

    const recipe = await repository.createRecipe(
      {
        organizationId: "org-1",
        templeId: "temple-1"
      },
      {
        description: "Daily prasadam",
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
    );

    assert.equal(recipe.id, "recipe-1");
    assert.equal(stub.recipes.inserted?.organization_id, "org-1");
    assert.equal(stub.recipes.inserted?.temple_id, "temple-1");
    assert.equal(stub.recipes.inserted?.name, "Khichdi");
  });

  it("lists mapped recipe rows in repository shape", async () => {
    const repository = createSupabaseRecipeRepository(
      new SupabaseClientStub() as unknown as SupabaseClient<Database>
    );

    const recipes = await repository.listRecipes({
      organizationId: "org-1",
      templeId: "temple-1"
    });

    assert.equal(recipes[0]?.name, "Khichdi");
    assert.equal(recipes[0]?.ingredients[0]?.itemId, "rice");
  });
});
