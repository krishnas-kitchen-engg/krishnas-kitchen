import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@krishnas-kitchen/types";

import type { InventoryActor } from "@/domains/inventory";

import type {
  CreateRecipeProductionRunRecordInput,
  RecipeProductionRunRecord,
  RecipeProductionRunRepository
} from "../../application/recipeProductionRepository";
import { RecipePersistenceError } from "./supabaseRecipeRepository";

type ProductionRunRow = Database["public"]["Tables"]["recipe_production_runs"]["Row"];
type ProductionRunInsert = Database["public"]["Tables"]["recipe_production_runs"]["Insert"];

function mapActor(row: ProductionRunRow): InventoryActor {
  if (row.actor_type === "user" && row.actor_user_id) {
    return {
      type: "user",
      userId: row.actor_user_id
    };
  }

  if (row.actor_type === "temporary_volunteer" && row.actor_temp_session_id) {
    return {
      tempSessionId: row.actor_temp_session_id,
      type: "temporary_volunteer"
    };
  }

  return {
    type: "system"
  };
}

function mapActorInsert(
  actor: InventoryActor
): Pick<ProductionRunInsert, "actor_temp_session_id" | "actor_type" | "actor_user_id"> {
  if (actor.type === "user") {
    return {
      actor_type: "user",
      actor_user_id: actor.userId
    };
  }

  if (actor.type === "temporary_volunteer") {
    return {
      actor_temp_session_id: actor.tempSessionId,
      actor_type: "temporary_volunteer"
    };
  }

  return {
    actor_type: "system"
  };
}

function mapProductionRunRow(row: ProductionRunRow): RecipeProductionRunRecord {
  return {
    actor: mapActor(row),
    batchCount: row.batch_count,
    consumptionTransactionIds: row.consumption_transaction_ids,
    createdAt: row.created_at,
    id: row.id,
    locationId: row.location_id,
    notes: row.notes,
    organizationId: row.organization_id,
    recipeId: row.recipe_id,
    recipeName: row.recipe_name,
    recipeVersion: row.recipe_version,
    servings: row.servings,
    templeId: row.temple_id
  };
}

function mapProductionRunInsert(input: CreateRecipeProductionRunRecordInput): ProductionRunInsert {
  return {
    ...mapActorInsert(input.actor),
    batch_count: input.batchCount,
    consumption_transaction_ids: [...input.consumptionTransactionIds],
    location_id: input.locationId,
    notes: input.notes,
    organization_id: input.organizationId,
    recipe_id: input.recipeId,
    recipe_name: input.recipeName,
    recipe_version: input.recipeVersion,
    servings: input.servings,
    temple_id: input.templeId
  };
}

export function createSupabaseRecipeProductionRunRepository(
  client: SupabaseClient<Database>
): RecipeProductionRunRepository {
  return {
    async createProductionRun(input) {
      const { data, error } = await client
        .from("recipe_production_runs")
        .insert(mapProductionRunInsert(input))
        .select("*")
        .single();

      if (error || !data) {
        throw new RecipePersistenceError(
          "create_recipe_production_run",
          "Recipe production run persistence failed.",
          error
        );
      }

      return mapProductionRunRow(data);
    },

    async listProductionRuns(query) {
      let request = client
        .from("recipe_production_runs")
        .select("*")
        .eq("organization_id", query.organizationId)
        .order("created_at", { ascending: false });

      if (query.templeId) {
        request = request.eq("temple_id", query.templeId);
      }

      if (query.since) {
        request = request.gte("created_at", query.since);
      }

      if (typeof query.limit === "number") {
        request = request.limit(Math.max(query.limit, 0));
      }

      const { data, error } = await request;

      if (error || !data) {
        throw new RecipePersistenceError(
          "list_recipe_production_runs",
          "Recipe production run history failed to load.",
          error
        );
      }

      return data.map(mapProductionRunRow);
    }
  };
}
