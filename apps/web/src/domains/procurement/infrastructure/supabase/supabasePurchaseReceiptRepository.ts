import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@krishnas-kitchen/types";

import type {
  PurchaseReceiptRecord,
  PurchaseReceiptRepository
} from "../../application/procurementRepository";
import type { ProcurementActor } from "../../domain/types";

const purchaseReceiptBucket = "purchase-receipts";

type PurchaseReceiptRow = Database["public"]["Tables"]["purchase_receipts"]["Row"];

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

function mapPurchaseReceipt(row: PurchaseReceiptRow): PurchaseReceiptRecord {
  return {
    createdAt: row.created_at,
    id: row.id,
    notes: row.notes,
    organizationId: row.organization_id,
    purchaseDate: row.purchase_date,
    purchaseListId: row.purchase_list_id,
    purchaseLocationId: row.purchase_location_id,
    purchaserUserId: row.purchaser_user_id,
    receiptImagePath: row.receipt_image_path,
    financeReviewNotes: row.finance_review_notes,
    reviewedAt: row.reviewed_at,
    reviewedBy: mapActor({
      actor_temp_session_id: row.reviewed_by_actor_temp_session_id,
      actor_type: row.reviewed_by_actor_type,
      actor_user_id: row.reviewed_by_actor_user_id
    }),
    status: row.status,
    templeId: row.temple_id,
    totalCost: row.total_cost,
    updatedAt: row.updated_at,
    uploadedBy: mapActor({
      actor_temp_session_id: row.uploaded_by_actor_temp_session_id,
      actor_type: row.uploaded_by_actor_type,
      actor_user_id: row.uploaded_by_actor_user_id
    }) ?? { type: "system" }
  };
}

export function createSupabasePurchaseReceiptRepository(
  client: SupabaseClient<Database>
): PurchaseReceiptRepository {
  return {
    async createReceiptImageUrl(path) {
      const { data, error } = await client.storage
        .from(purchaseReceiptBucket)
        .createSignedUrl(path, 60 * 60);

      if (error || !data?.signedUrl) {
        throw error ?? new Error("Receipt image URL could not be created.");
      }

      return data.signedUrl;
    },

    async listPurchaseReceipts(query) {
      let request = client
        .from("purchase_receipts")
        .select("*")
        .eq("organization_id", query.organizationId)
        .eq("temple_id", query.templeId)
        .order("created_at", { ascending: false })
        .order("id", { ascending: true });

      if (query.status) {
        request = request.eq("status", query.status);
      }

      const { data, error } = await request;

      if (error) {
        throw error;
      }

      return data.map(mapPurchaseReceipt);
    },

    async removeReceiptImage(path) {
      const { error } = await client.storage.from(purchaseReceiptBucket).remove([path]);

      if (error) {
        throw error;
      }
    },

    async recordPurchaseReceipt(input) {
      const { data, error } = await client.rpc("record_purchase_receipt", {
        p_notes: input.notes ?? null,
        p_organization_id: input.organizationId,
        p_purchase_date: input.purchaseDate ?? null,
        p_purchase_list_item_id: input.itemId,
        p_receipt_image_path: input.receiptImagePath,
        p_temple_id: input.templeId,
        p_total_cost: input.totalCost ?? null,
        p_uploaded_by_user_id: input.uploadedBy.userId ?? ""
      });

      if (error || !data) {
        throw error ?? new Error("Purchase receipt recording returned no row.");
      }

      return mapPurchaseReceipt(data);
    },

    async uploadReceiptImage(input) {
      const { data, error } = await client.storage
        .from(purchaseReceiptBucket)
        .upload(input.path, input.file, {
          cacheControl: "3600",
          contentType: input.file.type,
          upsert: false
        });

      if (error || !data) {
        throw error ?? new Error("Receipt upload returned no storage path.");
      }

      return data.path;
    },

    async reviewPurchaseReceipt(input) {
      const { data, error } = await client.rpc("review_purchase_receipt", {
        p_finance_review_notes: input.notes ?? null,
        p_organization_id: input.organizationId,
        p_receipt_id: input.receiptId,
        p_review_status: input.status,
        p_reviewed_by_user_id: input.reviewedBy.userId ?? "",
        p_temple_id: input.templeId
      });

      if (error || !data) {
        throw error ?? new Error("Purchase receipt review returned no row.");
      }

      return mapPurchaseReceipt(data);
    }
  };
}
