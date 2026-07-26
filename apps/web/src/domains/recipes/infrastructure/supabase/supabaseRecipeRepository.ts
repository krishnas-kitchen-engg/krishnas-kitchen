import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@krishnas-kitchen/types";

import type { RecipeIngredientInput } from "../../domain/types";
import type {
  RecipeRepository,
  RecipeRepositoryFindQuery,
  RecipeRepositoryListQuery,
  RecipeRepositoryRecord,
  RecipeRepositoryScope
} from "../../application/recipeRepository";

type RecipeRow = Database["public"]["Tables"]["recipes"]["Row"];
type RecipeInsert = Database["public"]["Tables"]["recipes"]["Insert"];
type RecipeUpdate = Database["public"]["Tables"]["recipes"]["Update"];
type UnscopedRecipeInsert = Omit<RecipeInsert, "organization_id" | "temple_id">;

export class RecipePersistenceError extends Error {
  override readonly cause: unknown;
  readonly operation: string;

  constructor(operation: string, message: string, cause?: unknown) {
    super(message);
    this.name = "RecipePersistenceError";
    this.operation = operation;
    this.cause = cause;
  }
}

function isRecipeIngredient(value: unknown): value is RecipeIngredientInput {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<RecipeIngredientInput>;

  return (
    typeof candidate.itemId === "string" &&
    typeof candidate.quantity === "number" &&
    typeof candidate.unit === "string" &&
    (!("note" in candidate) || typeof candidate.note === "string")
  );
}

function mapIngredients(value: Json): RecipeIngredientInput[] {
  if (!Array.isArray(value) || !value.every(isRecipeIngredient)) {
    throw new RecipePersistenceError("map_recipe_row", "Recipe ingredients are invalid.");
  }

  return value.map((ingredient) => ({
    itemId: ingredient.itemId,
    ...(ingredient.note ? { note: ingredient.note } : {}),
    quantity: ingredient.quantity,
    unit: ingredient.unit
  }));
}

function mapRecipeRow(row: RecipeRow): RecipeRepositoryRecord {
  return {
    createdAt: row.created_at,
    ...(row.description !== null ? { description: row.description } : {}),
    id: row.id,
    ingredients: mapIngredients(row.ingredients),
    isActive: row.is_active,
    name: row.name,
    organizationId: row.organization_id,
    servings: row.servings,
    templeId: row.temple_id,
    updatedAt: row.updated_at,
    version: row.version
  };
}

function mapScope(scope: RecipeRepositoryScope) {
  if (!scope.templeId) {
    throw new RecipePersistenceError("scope", "Recipe persistence requires temple scope.");
  }

  return {
    organization_id: scope.organizationId,
    temple_id: scope.templeId
  };
}

function mapRecipeInsert(scope: RecipeRepositoryScope, input: UnscopedRecipeInsert): RecipeInsert {
  return {
    ...input,
    ...mapScope(scope)
  };
}

function mapRecipeInput(
  input: Parameters<RecipeRepository["createRecipe"]>[1]
): UnscopedRecipeInsert {
  return {
    ...(input.description !== undefined ? { description: input.description } : {}),
    ingredients: input.ingredients,
    is_active: input.isActive ?? true,
    name: input.name,
    servings: input.servings,
    version: input.version ?? 1
  };
}

function mapRecipeUpdate(input: Parameters<RecipeRepository["updateRecipe"]>[1]): RecipeUpdate {
  return {
    ...(input.description !== undefined ? { description: input.description } : {}),
    ingredients: input.ingredients,
    is_active: input.isActive ?? true,
    name: input.name,
    servings: input.servings,
    version: input.version ?? 1
  };
}

function applyFindScope<T extends { eq: (column: string, value: string) => T }>(
  query: T,
  scope: RecipeRepositoryFindQuery
): T {
  return query
    .eq("id", scope.recipeId)
    .eq("organization_id", scope.organizationId)
    .eq("temple_id", scope.templeId ?? "");
}

export function createSupabaseRecipeRepository(client: SupabaseClient<Database>): RecipeRepository {
  return {
    async createRecipe(scope, input) {
      const { data, error } = await client
        .from("recipes")
        .insert(mapRecipeInsert(scope, mapRecipeInput(input)))
        .select("*")
        .single();

      if (error || !data) {
        throw new RecipePersistenceError("create_recipe", "Recipe persistence failed.", error);
      }

      return mapRecipeRow(data);
    },

    async deactivateRecipe(query) {
      const { data, error } = await applyFindScope(
        client.from("recipes").update({ is_active: false }).select("*"),
        query
      ).maybeSingle();

      if (error) {
        throw new RecipePersistenceError("deactivate_recipe", "Recipe deactivation failed.", error);
      }

      return data ? mapRecipeRow(data) : null;
    },

    async findRecipeById(query) {
      const { data, error } = await applyFindScope(
        client.from("recipes").select("*"),
        query
      ).maybeSingle();

      if (error) {
        throw new RecipePersistenceError("find_recipe", "Recipe lookup failed.", error);
      }

      return data ? mapRecipeRow(data) : null;
    },

    async listRecipes(query: RecipeRepositoryListQuery) {
      let request = client
        .from("recipes")
        .select("*")
        .eq("organization_id", query.organizationId)
        .eq("temple_id", query.templeId ?? "")
        .order("updated_at", { ascending: false });

      const search = query.search?.trim();

      if (search) {
        request = request.ilike("name", `%${search}%`);
      }

      const { data, error } = await request;

      if (error) {
        throw new RecipePersistenceError("list_recipes", "Recipe list failed.", error);
      }

      return data.map(mapRecipeRow);
    },

    async updateRecipe(query, input) {
      const { data, error } = await applyFindScope(
        client.from("recipes").update(mapRecipeUpdate(input)).select("*"),
        query
      ).maybeSingle();

      if (error) {
        throw new RecipePersistenceError("update_recipe", "Recipe update failed.", error);
      }

      return data ? mapRecipeRow(data) : null;
    }
  };
}
