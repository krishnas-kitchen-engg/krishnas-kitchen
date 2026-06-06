import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, EntityId } from "@krishnas-kitchen/types";

import type { UnknownBarcodeRepository } from "../../application/unknownBarcodeService";
import type { InventoryBarcode } from "../../domain/barcode";
import type { UnknownBarcodeQuery } from "../../domain/unknownBarcode";
import {
  mapUnknownBarcodeDraftToInsert,
  mapUnknownBarcodeRecordToUpdate,
  mapUnknownBarcodeRow
} from "./unknownBarcodeMapper";

export function createSupabaseUnknownBarcodeRepository(
  client: SupabaseClient<Database>
): UnknownBarcodeRepository {
  return {
    async createUnknownBarcode(draft) {
      const { data, error } = await client
        .from("unknown_barcodes")
        .insert(mapUnknownBarcodeDraftToInsert(draft))
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      return mapUnknownBarcodeRow(data);
    },

    async findPendingUnknownBarcodeByBarcode(
      organizationId: EntityId,
      barcode: InventoryBarcode,
      templeId?: EntityId | null
    ) {
      let query = client
        .from("unknown_barcodes")
        .select("*")
        .eq("organization_id", organizationId)
        .eq("barcode_format", barcode.format)
        .eq("barcode_value", barcode.value)
        .eq("status", "pending");

      query = templeId ? query.eq("temple_id", templeId) : query.is("temple_id", null);

      const { data, error } = await query
        .order("last_seen_at", { ascending: false })
        .order("id", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data ? mapUnknownBarcodeRow(data) : null;
    },

    async findUnknownBarcodeById(id: EntityId) {
      const { data, error } = await client
        .from("unknown_barcodes")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data ? mapUnknownBarcodeRow(data) : null;
    },

    async listUnknownBarcodes(query: UnknownBarcodeQuery) {
      let request = client
        .from("unknown_barcodes")
        .select("*")
        .eq("organization_id", query.organizationId)
        .order("last_seen_at", { ascending: false })
        .order("id", { ascending: false });

      if (query.templeId) {
        request = request.eq("temple_id", query.templeId);
      }

      if (query.status) {
        request = request.eq("status", query.status);
      }

      if (typeof query.limit === "number") {
        request = request.limit(query.limit);
      }

      const { data, error } = await request;

      if (error) {
        throw error;
      }

      return data.map(mapUnknownBarcodeRow);
    },

    async updateUnknownBarcode(record) {
      const { data, error } = await client
        .from("unknown_barcodes")
        .update(mapUnknownBarcodeRecordToUpdate(record))
        .eq("id", record.id)
        .eq("organization_id", record.organizationId)
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      return mapUnknownBarcodeRow(data);
    }
  };
}
