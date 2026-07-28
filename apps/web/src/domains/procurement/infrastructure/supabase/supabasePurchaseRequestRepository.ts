import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, EntityId } from "@krishnas-kitchen/types";

import type {
  PurchaseRequestCatalogRepository,
  PurchaseRequestRepository
} from "../../application/purchaseRequestService";
import type { PurchaseRequestReviewRepository } from "../../application/purchaseRequestReviewService";
import type {
  PurchaseRequestRecord,
  PurchaseRequestReviewUpdate
} from "../../application/procurementRepository";
import type {
  CatalogItemSummary,
  ProcurementActor,
  PurchaseRequestInput
} from "../../domain/types";

type PurchaseRequestRow = Database["public"]["Tables"]["purchase_requests"]["Row"];
type PurchaseRequestInsert = Database["public"]["Tables"]["purchase_requests"]["Insert"];
type PurchaseRequestUpdate = Database["public"]["Tables"]["purchase_requests"]["Update"];

function requesterColumns(
  actor: ProcurementActor
): Pick<
  PurchaseRequestInsert,
  "requested_by_actor_temp_session_id" | "requested_by_actor_type" | "requested_by_actor_user_id"
> {
  return {
    requested_by_actor_temp_session_id:
      actor.type === "temporary_volunteer" ? (actor.tempSessionId ?? null) : null,
    requested_by_actor_type: actor.type,
    requested_by_actor_user_id: actor.type === "user" ? (actor.userId ?? null) : null
  };
}

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

function mapPurchaseRequest(row: PurchaseRequestRow): PurchaseRequestRecord {
  const item =
    row.item_reference_type === "existing_item"
      ? {
          itemId: row.item_id ?? "",
          type: "existing_item" as const
        }
      : {
          category: row.suggested_item_category,
          suggestedName: row.suggested_item_name ?? "",
          type: "new_item_suggestion" as const
        };

  return {
    createdAt: row.created_at,
    id: row.id,
    includedPurchaseListItemId: row.included_purchase_list_item_id,
    item,
    neededBy: row.needed_by,
    notes: row.notes,
    organizationId: row.organization_id,
    quantity: row.quantity,
    requestedBy: mapActor({
      actor_temp_session_id: row.requested_by_actor_temp_session_id,
      actor_type: row.requested_by_actor_type,
      actor_user_id: row.requested_by_actor_user_id
    }) ?? { type: "system" },
    reviewedAt: row.reviewed_at,
    reviewedBy: mapActor({
      actor_temp_session_id: row.reviewed_by_actor_temp_session_id,
      actor_type: row.reviewed_by_actor_type,
      actor_user_id: row.reviewed_by_actor_user_id
    }),
    status: row.status,
    templeId: row.temple_id,
    unit: row.unit,
    updatedAt: row.updated_at
  };
}

function toPurchaseRequestInsert(input: PurchaseRequestInput): PurchaseRequestInsert {
  return {
    ...requesterColumns(input.requestedBy),
    item_id: input.item.type === "existing_item" ? input.item.itemId : null,
    item_reference_type: input.item.type,
    needed_by: input.neededBy ?? null,
    notes: input.notes ?? null,
    organization_id: input.organizationId,
    quantity: input.quantity,
    status: "submitted",
    suggested_item_category:
      input.item.type === "new_item_suggestion" ? (input.item.category ?? null) : null,
    suggested_item_name:
      input.item.type === "new_item_suggestion" ? input.item.suggestedName : null,
    temple_id: input.templeId,
    unit: input.unit
  };
}

function reviewColumns(
  input: PurchaseRequestReviewUpdate,
  currentRequest: PurchaseRequestRecord
): PurchaseRequestUpdate {
  return {
    notes: input.notes ?? currentRequest.notes ?? null,
    quantity: input.quantity ?? currentRequest.quantity,
    reviewed_at: input.reviewedAt,
    reviewed_by_actor_temp_session_id:
      input.reviewedBy.type === "temporary_volunteer"
        ? (input.reviewedBy.tempSessionId ?? null)
        : null,
    reviewed_by_actor_type: input.reviewedBy.type,
    reviewed_by_actor_user_id:
      input.reviewedBy.type === "user" ? (input.reviewedBy.userId ?? null) : null,
    status: input.decision,
    unit: input.unit ?? currentRequest.unit
  };
}

export function createSupabasePurchaseRequestRepository(
  client: SupabaseClient<Database>
): PurchaseRequestRepository & PurchaseRequestReviewRepository {
  async function findPurchaseRequestById(query: {
    organizationId: EntityId;
    requestId: EntityId;
    templeId: EntityId;
  }) {
    const { data, error } = await client
      .from("purchase_requests")
      .select("*")
      .eq("organization_id", query.organizationId)
      .eq("temple_id", query.templeId)
      .eq("id", query.requestId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ? mapPurchaseRequest(data) : null;
  }

  return {
    async createPurchaseRequest(input) {
      const { data, error } = await client
        .from("purchase_requests")
        .insert(toPurchaseRequestInsert(input))
        .select("*")
        .single();

      if (error || !data) {
        throw error ?? new Error("Purchase request creation returned no row.");
      }

      return mapPurchaseRequest(data);
    },

    findPurchaseRequestById,

    async listPurchaseRequests(query) {
      let request = client
        .from("purchase_requests")
        .select("*")
        .eq("organization_id", query.organizationId)
        .eq("temple_id", query.templeId)
        .order("created_at", { ascending: false })
        .order("id", { ascending: true });

      if (query.requesterUserId) {
        request = request.eq("requested_by_actor_user_id", query.requesterUserId);
      }

      if (query.status) {
        request = request.eq("status", query.status);
      }

      const { data, error } = await request;

      if (error) {
        throw error;
      }

      return data.map(mapPurchaseRequest);
    },

    async reviewPurchaseRequest(input) {
      const currentRequest = await findPurchaseRequestById(input);

      if (!currentRequest) {
        throw new Error("Purchase request was not found.");
      }

      const { data, error } = await client
        .from("purchase_requests")
        .update(reviewColumns(input, currentRequest))
        .eq("organization_id", input.organizationId)
        .eq("temple_id", input.templeId)
        .eq("id", input.requestId)
        .select("*")
        .single();

      if (error || !data) {
        throw error ?? new Error("Purchase request review returned no row.");
      }

      return mapPurchaseRequest(data);
    }
  };
}

export function createSupabasePurchaseRequestCatalogRepository(
  client: SupabaseClient<Database>
): PurchaseRequestCatalogRepository {
  function mapItem(row: Database["public"]["Tables"]["items"]["Row"]): CatalogItemSummary {
    return {
      category: row.category,
      defaultUnit: row.default_unit,
      deletedAt: row.deleted_at,
      id: row.id,
      name: row.name
    };
  }

  return {
    async findItemById(organizationId: EntityId, itemId: EntityId) {
      const { data, error } = await client
        .from("items")
        .select("*")
        .eq("organization_id", organizationId)
        .eq("id", itemId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data ? mapItem(data) : null;
    },

    async searchItems(organizationId, searchText) {
      const trimmedSearch = searchText.trim();

      if (!trimmedSearch) {
        return [];
      }

      const { data, error } = await client
        .from("items")
        .select("*")
        .eq("organization_id", organizationId)
        .is("deleted_at", null)
        .ilike("name", `%${trimmedSearch}%`)
        .order("name", { ascending: true })
        .order("id", { ascending: true })
        .limit(10);

      if (error) {
        throw error;
      }

      return data.map(mapItem);
    }
  };
}
