import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@krishnas-kitchen/types";

import type {
  PurchaseListPublishRepository,
  PurchaseListRecord
} from "../../application/procurementRepository";
import type { ProcurementActor } from "../../domain/types";
import { mapPurchaseListItem } from "./supabasePurchaserListRepository";

type PurchaseListRow = Database["public"]["Tables"]["purchase_lists"]["Row"];

function mapActor(row: {
  actor_temp_session_id: string | null;
  actor_type: ProcurementActor["type"] | null;
  actor_user_id: string | null;
}): ProcurementActor | null {
  if (!row.actor_type) {
    return null;
  }

  if (row.actor_type === "temporary_volunteer") {
    return {
      tempSessionId: row.actor_temp_session_id,
      type: row.actor_type
    };
  }

  if (row.actor_type === "user") {
    return {
      type: row.actor_type,
      userId: row.actor_user_id
    };
  }

  return {
    type: "system"
  };
}

function mapPurchaseList(row: PurchaseListRow): PurchaseListRecord {
  return {
    createdAt: row.created_at,
    createdBy: mapActor({
      actor_temp_session_id: row.created_by_actor_temp_session_id,
      actor_type: row.created_by_actor_type,
      actor_user_id: row.created_by_actor_user_id
    }) ?? { type: "system" },
    id: row.id,
    generationGrouping: row.generation_grouping,
    name: row.name,
    organizationId: row.organization_id,
    publishMode: row.publish_mode,
    publishedAt: row.published_at,
    publishedBy: mapActor({
      actor_temp_session_id: row.published_by_actor_temp_session_id,
      actor_type: row.published_by_actor_type,
      actor_user_id: row.published_by_actor_user_id
    }),
    scheduledPublishAt: row.scheduled_publish_at,
    status: row.status,
    templeId: row.temple_id,
    updatedAt: row.updated_at
  };
}

export function createSupabasePurchaseListRepository(
  client: SupabaseClient<Database>
): PurchaseListPublishRepository {
  return {
    async listPurchaseListItems(scope) {
      const { data, error } = await client
        .from("purchase_list_items")
        .select("*")
        .eq("organization_id", scope.organizationId)
        .eq("temple_id", scope.templeId)
        .order("created_at", { ascending: false })
        .order("id", { ascending: true });

      if (error) {
        throw error;
      }

      return data.map(mapPurchaseListItem);
    },

    async listPurchaseLists(scope) {
      const { data, error } = await client
        .from("purchase_lists")
        .select("*")
        .eq("organization_id", scope.organizationId)
        .eq("temple_id", scope.templeId)
        .order("published_at", { ascending: false })
        .order("created_at", { ascending: false })
        .order("id", { ascending: true });

      if (error) {
        throw error;
      }

      return data.map(mapPurchaseList);
    },

    async publishApprovedPurchaseRequests(input) {
      const { data, error } = await client.rpc("publish_approved_purchase_requests", {
        p_name: input.name,
        p_generation_grouping: input.generationGrouping,
        p_organization_id: input.organizationId,
        p_published_by_user_id: input.publishedBy.userId ?? "",
        p_temple_id: input.templeId
      });

      if (error || !data) {
        throw error ?? new Error("Purchase list publishing returned no row.");
      }

      return mapPurchaseList(data);
    },

    async publishScheduledPurchaseList(input) {
      const { data, error } = await client.rpc("publish_scheduled_purchase_list", {
        p_organization_id: input.organizationId,
        p_published_by_user_id: input.publishedBy.userId ?? "",
        p_purchase_list_id: input.listId,
        p_temple_id: input.templeId
      });

      if (error || !data) {
        throw error ?? new Error("Scheduled purchase list publishing returned no row.");
      }

      return mapPurchaseList(data);
    },

    async scheduleApprovedPurchaseRequests(input) {
      const { data, error } = await client.rpc("schedule_approved_purchase_requests", {
        p_name: input.name,
        p_generation_grouping: input.generationGrouping,
        p_organization_id: input.organizationId,
        p_scheduled_by_user_id: input.scheduledBy.userId ?? "",
        p_scheduled_publish_at: input.scheduledPublishAt,
        p_temple_id: input.templeId
      });

      if (error || !data) {
        throw error ?? new Error("Purchase list scheduling returned no row.");
      }

      return mapPurchaseList(data);
    }
  };
}
