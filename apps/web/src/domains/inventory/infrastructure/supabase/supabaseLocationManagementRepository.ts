import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@krishnas-kitchen/types";

import type {
  CreateManagedLocationInput,
  LocationManagementRepository,
  ManagedInventoryLocation
} from "../../application/locationManagementService";

type LocationRow = Database["public"]["Tables"]["locations"]["Row"];

function mapLocationRow(row: LocationRow): ManagedInventoryLocation {
  return {
    deletedAt: row.deleted_at,
    description: row.description,
    id: row.id,
    name: row.name,
    organizationId: row.organization_id,
    templeId: row.temple_id
  };
}

export function createSupabaseLocationManagementRepository(
  client: SupabaseClient<Database>
): LocationManagementRepository {
  return {
    async createLocation(input: CreateManagedLocationInput) {
      const { data, error } = await client
        .from("locations")
        .insert({
          deleted_at: null,
          description: input.description ?? null,
          location_type: "other",
          name: input.name,
          organization_id: input.organizationId,
          parent_location_id: null,
          qr_code: null,
          temple_id: input.templeId
        })
        .select("*")
        .single();

      if (error || !data) {
        throw error ?? new Error("Location creation returned no row.");
      }

      return mapLocationRow(data);
    },

    async listLocations(scope) {
      const { data, error } = await client
        .from("locations")
        .select("*")
        .eq("organization_id", scope.organizationId)
        .eq("temple_id", scope.templeId)
        .order("deleted_at", { ascending: true, nullsFirst: true })
        .order("name", { ascending: true })
        .order("id", { ascending: true });

      if (error) {
        throw error;
      }

      return data.map(mapLocationRow);
    },

    async updateLocation(input) {
      const { data, error } = await client
        .from("locations")
        .update({
          description: input.description ?? null,
          name: input.name
        })
        .eq("id", input.id)
        .eq("organization_id", input.organizationId)
        .select("*")
        .single();

      if (error || !data) {
        throw error ?? new Error("Location update returned no row.");
      }

      return mapLocationRow(data);
    },

    async updateLocationArchivedState(input) {
      const { data, error } = await client
        .from("locations")
        .update({
          deleted_at: input.deletedAt
        })
        .eq("id", input.id)
        .eq("organization_id", input.organizationId)
        .select("*")
        .single();

      if (error || !data) {
        throw error ?? new Error("Location archive update returned no row.");
      }

      return mapLocationRow(data);
    }
  };
}
