import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, EntityId } from "@krishnas-kitchen/types";

import type {
  InventoryBarcodeCatalogItemRepository,
  InventoryBarcodeCatalogRepository
} from "../../application/barcodeCatalogService";
import type { InventoryBarcodeLookupRepository } from "../../application/barcodeLookupService";
import type { InventoryCatalogQueryRepository } from "../../application/inventoryCatalogQueryService";
import type { UnknownBarcodeItemRepository } from "../../application/unknownBarcodeService";
import type { InventoryBarcode } from "../../domain/barcode";
import type { InventoryBarcodeMapping } from "../../domain/barcodeCatalog";
import type { InventoryCatalogItem } from "../../domain/catalog";
import {
  type InventoryBarcodeRow,
  type InventoryItemRow,
  mapInventoryBarcodeArchiveUpdate,
  mapInventoryBarcodeMappingRow,
  mapInventoryBarcodeMappingToInsert,
  mapInventoryCatalogBarcode,
  mapInventoryItemRow,
  mapInventoryLocationRow
} from "./inventoryCatalogMapper";

export type SupabaseInventoryCatalogRepositories = {
  barcodeCatalogItemRepository: InventoryBarcodeCatalogItemRepository;
  barcodeCatalogRepository: InventoryBarcodeCatalogRepository;
  barcodeLookupRepository: InventoryBarcodeLookupRepository;
  catalogQueryRepository: InventoryCatalogQueryRepository;
  unknownBarcodeItemRepository: UnknownBarcodeItemRepository;
};

function compareCatalogItems(left: InventoryCatalogItem, right: InventoryCatalogItem): number {
  return (
    left.name.localeCompare(right.name, "en", { sensitivity: "base" }) ||
    left.id.localeCompare(right.id)
  );
}

function compareBarcodeRows(left: InventoryBarcodeRow, right: InventoryBarcodeRow): number {
  return (
    left.item_id.localeCompare(right.item_id) ||
    left.barcode_format.localeCompare(right.barcode_format) ||
    left.barcode_value.localeCompare(right.barcode_value) ||
    left.id.localeCompare(right.id)
  );
}

function attachBarcodes(
  items: readonly InventoryCatalogItem[],
  barcodeRows: readonly InventoryBarcodeRow[]
): InventoryCatalogItem[] {
  const barcodesByItemId = new Map<EntityId, InventoryBarcode[]>();

  for (const row of barcodeRows) {
    const existingBarcodes = barcodesByItemId.get(row.item_id) ?? [];

    barcodesByItemId.set(row.item_id, [
      ...existingBarcodes,
      {
        format: row.barcode_format,
        value: row.barcode_value
      }
    ]);
  }

  return items.map((item) => ({
    ...item,
    barcodes: barcodesByItemId.get(item.id) ?? []
  }));
}

function uniqueValues(values: readonly EntityId[]): EntityId[] {
  return Array.from(new Set(values)).sort();
}

export function createSupabaseInventoryCatalogRepositories(
  client: SupabaseClient<Database>
): SupabaseInventoryCatalogRepositories {
  async function listActiveBarcodeRows(organizationId: EntityId): Promise<InventoryBarcodeRow[]> {
    const { data, error } = await client
      .from("item_barcodes")
      .select("*")
      .eq("organization_id", organizationId)
      .is("archived_at", null)
      .order("item_id", { ascending: true })
      .order("barcode_format", { ascending: true })
      .order("barcode_value", { ascending: true })
      .order("id", { ascending: true });

    if (error) {
      throw error;
    }

    return data;
  }

  async function listActiveItems(organizationId: EntityId): Promise<InventoryCatalogItem[]> {
    const { data, error } = await client
      .from("items")
      .select("*")
      .eq("organization_id", organizationId)
      .is("deleted_at", null)
      .order("name", { ascending: true })
      .order("id", { ascending: true });

    if (error) {
      throw error;
    }

    return attachBarcodes(
      data.map(mapInventoryItemRow),
      await listActiveBarcodeRows(organizationId)
    );
  }

  async function findItemRowsByIds(
    organizationId: EntityId,
    itemIds: readonly EntityId[]
  ): Promise<InventoryItemRow[]> {
    const ids = uniqueValues(itemIds);

    if (ids.length === 0) {
      return [];
    }

    const { data, error } = await client
      .from("items")
      .select("*")
      .eq("organization_id", organizationId)
      .is("deleted_at", null)
      .in("id", ids)
      .order("name", { ascending: true })
      .order("id", { ascending: true });

    if (error) {
      throw error;
    }

    return data;
  }

  async function findItemForValidation(itemId: EntityId, organizationId: EntityId) {
    const { data, error } = await client
      .from("items")
      .select("*")
      .eq("id", itemId)
      .eq("organization_id", organizationId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data
      ? {
          deletedAt: data.deleted_at,
          id: data.id,
          organizationId: data.organization_id
        }
      : null;
  }

  const catalogQueryRepository: InventoryCatalogQueryRepository = {
    async listBarcodes(organizationId) {
      const [barcodeRows, items] = await Promise.all([
        listActiveBarcodeRows(organizationId),
        listActiveItems(organizationId)
      ]);
      const activeItemsById = new Map(items.map((item) => [item.id, item]));

      return barcodeRows
        .flatMap((row) => {
          const item = activeItemsById.get(row.item_id);

          return item ? [mapInventoryCatalogBarcode(row, item)] : [];
        })
        .sort(
          (left, right) =>
            left.itemName.localeCompare(right.itemName, "en", { sensitivity: "base" }) ||
            left.format.localeCompare(right.format) ||
            left.value.localeCompare(right.value) ||
            left.itemId.localeCompare(right.itemId)
        );
    },

    listItems(organizationId) {
      return listActiveItems(organizationId);
    },

    async listLocations(organizationId) {
      const { data, error } = await client
        .from("locations")
        .select("*")
        .eq("organization_id", organizationId)
        .is("deleted_at", null)
        .order("name", { ascending: true })
        .order("id", { ascending: true });

      if (error) {
        throw error;
      }

      return data.map(mapInventoryLocationRow);
    }
  };

  const barcodeLookupRepository: InventoryBarcodeLookupRepository = {
    async findItemsByBarcode(organizationId, barcode) {
      const { data, error } = await client
        .from("item_barcodes")
        .select("*")
        .eq("organization_id", organizationId)
        .eq("barcode_format", barcode.format)
        .eq("barcode_value", barcode.value)
        .is("archived_at", null)
        .order("item_id", { ascending: true })
        .order("id", { ascending: true });

      if (error) {
        throw error;
      }

      const itemRows = await findItemRowsByIds(
        organizationId,
        data.map((row) => row.item_id)
      );
      const barcodeRows = await listActiveBarcodeRows(organizationId);

      return attachBarcodes(itemRows.map(mapInventoryItemRow), barcodeRows).sort(
        compareCatalogItems
      );
    }
  };

  const barcodeCatalogRepository: InventoryBarcodeCatalogRepository = {
    async archiveBarcodeMapping(mapping: InventoryBarcodeMapping) {
      const { data, error } = await client
        .from("item_barcodes")
        .update(mapInventoryBarcodeArchiveUpdate(mapping))
        .eq("id", mapping.id)
        .eq("organization_id", mapping.organizationId)
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      return mapInventoryBarcodeMappingRow(data);
    },

    async createBarcodeMapping(draft) {
      const { data, error } = await client
        .from("item_barcodes")
        .insert(mapInventoryBarcodeMappingToInsert(draft))
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      return mapInventoryBarcodeMappingRow(data);
    },

    async findActiveBarcodeMappingByBarcode(organizationId, barcode) {
      const { data, error } = await client
        .from("item_barcodes")
        .select("*")
        .eq("organization_id", organizationId)
        .eq("barcode_format", barcode.format)
        .eq("barcode_value", barcode.value)
        .is("archived_at", null)
        .order("id", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data ? mapInventoryBarcodeMappingRow(data) : null;
    },

    async findBarcodeMappingById(id) {
      const { data, error } = await client
        .from("item_barcodes")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data ? mapInventoryBarcodeMappingRow(data) : null;
    },

    async listBarcodeMappings(organizationId) {
      const { data, error } = await client
        .from("item_barcodes")
        .select("*")
        .eq("organization_id", organizationId)
        .order("item_id", { ascending: true })
        .order("barcode_format", { ascending: true })
        .order("barcode_value", { ascending: true })
        .order("id", { ascending: true });

      if (error) {
        throw error;
      }

      return [...data].sort(compareBarcodeRows).map(mapInventoryBarcodeMappingRow);
    }
  };

  const barcodeCatalogItemRepository: InventoryBarcodeCatalogItemRepository = {
    findBarcodeCatalogItem(itemId, organizationId) {
      return findItemForValidation(itemId, organizationId);
    }
  };

  const unknownBarcodeItemRepository: UnknownBarcodeItemRepository = {
    findItemForBarcodeLinking(itemId, organizationId) {
      return findItemForValidation(itemId, organizationId);
    }
  };

  return {
    barcodeCatalogItemRepository,
    barcodeCatalogRepository,
    barcodeLookupRepository,
    catalogQueryRepository,
    unknownBarcodeItemRepository
  };
}
