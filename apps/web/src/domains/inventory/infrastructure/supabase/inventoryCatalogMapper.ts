import type { Database } from "@krishnas-kitchen/types";

import type { InventoryBarcode } from "../../domain/barcode";
import type {
  InventoryBarcodeMapping,
  InventoryBarcodeMappingDraft
} from "../../domain/barcodeCatalog";
import type {
  InventoryCatalogBarcode,
  InventoryCatalogItem,
  InventoryCatalogLocation
} from "../../domain/catalog";
import type { InventoryActor } from "../../domain/types";

export type InventoryItemRow = Database["public"]["Tables"]["items"]["Row"];
export type InventoryLocationRow = Database["public"]["Tables"]["locations"]["Row"];
export type InventoryBarcodeRow = Database["public"]["Tables"]["item_barcodes"]["Row"];
export type InventoryBarcodeInsert = Database["public"]["Tables"]["item_barcodes"]["Insert"];
export type InventoryBarcodeUpdate = Database["public"]["Tables"]["item_barcodes"]["Update"];

export function mapInventoryItemRow(row: InventoryItemRow): InventoryCatalogItem {
  return {
    barcodes: [],
    category: row.category,
    defaultUnit: row.default_unit,
    description: row.description,
    deletedAt: row.deleted_at,
    id: row.id,
    name: row.name,
    organizationId: row.organization_id,
    ...(row.receiving_units ? { receivingUnits: row.receiving_units } : {}),
    ...(row.return_units ? { returnUnits: row.return_units } : {}),
    ...(row.transfer_units ? { transferUnits: row.transfer_units } : {})
  };
}

export function mapInventoryLocationRow(row: InventoryLocationRow): InventoryCatalogLocation {
  return {
    ...(row.description ? { description: row.description } : {}),
    deletedAt: row.deleted_at,
    id: row.id,
    name: row.name,
    organizationId: row.organization_id,
    templeId: row.temple_id
  };
}

export function mapInventoryBarcodeRow(row: InventoryBarcodeRow): InventoryBarcode {
  return {
    format: row.barcode_format,
    value: row.barcode_value
  };
}

function mapActor(
  actorType: InventoryBarcodeRow["created_by_actor_type"] | null,
  userId: string | null,
  tempSessionId: string | null
): InventoryActor | null {
  if (actorType === "user") {
    return userId ? { type: "user", userId } : null;
  }

  if (actorType === "temporary_volunteer") {
    return tempSessionId ? { tempSessionId, type: "temporary_volunteer" } : null;
  }

  if (actorType === "system") {
    return { type: "system" };
  }

  return null;
}

function getActorUserId(actor: InventoryActor): string | null {
  return actor.type === "user" ? actor.userId : null;
}

function getActorTempSessionId(actor: InventoryActor): string | null {
  return actor.type === "temporary_volunteer" ? actor.tempSessionId : null;
}

function mapCreatedActorToColumns(
  actor: InventoryActor
): Pick<
  InventoryBarcodeInsert,
  "created_by_actor_temp_session_id" | "created_by_actor_type" | "created_by_actor_user_id"
> {
  return {
    created_by_actor_temp_session_id: getActorTempSessionId(actor),
    created_by_actor_type: actor.type,
    created_by_actor_user_id: getActorUserId(actor)
  };
}

function mapArchivedActorToColumns(
  actor: InventoryActor
): Pick<
  InventoryBarcodeUpdate,
  "archived_by_actor_temp_session_id" | "archived_by_actor_type" | "archived_by_actor_user_id"
> {
  return {
    archived_by_actor_temp_session_id: getActorTempSessionId(actor),
    archived_by_actor_type: actor.type,
    archived_by_actor_user_id: getActorUserId(actor)
  };
}

export function mapInventoryBarcodeMappingRow(row: InventoryBarcodeRow): InventoryBarcodeMapping {
  const createdBy = mapActor(
    row.created_by_actor_type,
    row.created_by_actor_user_id,
    row.created_by_actor_temp_session_id
  );
  const archivedBy = mapActor(
    row.archived_by_actor_type,
    row.archived_by_actor_user_id,
    row.archived_by_actor_temp_session_id
  );

  if (!createdBy) {
    throw new Error("Inventory barcode mapping is missing created_by actor metadata.");
  }

  return {
    archivedAt: row.archived_at,
    archivedBy,
    archiveReason: row.archive_reason,
    barcode: mapInventoryBarcodeRow(row),
    createdAt: row.created_at,
    createdBy,
    id: row.id,
    itemId: row.item_id,
    notes: row.notes,
    organizationId: row.organization_id,
    sourceUnknownBarcodeId: row.source_unknown_barcode_id,
    updatedAt: row.updated_at
  };
}

export function mapInventoryBarcodeMappingToInsert(
  mapping: InventoryBarcodeMappingDraft
): InventoryBarcodeInsert {
  return {
    archived_at: null,
    archived_by_actor_temp_session_id: null,
    archived_by_actor_type: null,
    archived_by_actor_user_id: null,
    archive_reason: null,
    ...mapCreatedActorToColumns(mapping.createdBy),
    barcode_format: mapping.barcode.format,
    barcode_value: mapping.barcode.value,
    id: mapping.clientId,
    item_id: mapping.itemId,
    notes: mapping.notes,
    organization_id: mapping.organizationId,
    source_unknown_barcode_id: mapping.sourceUnknownBarcodeId ?? null
  };
}

export function mapInventoryCatalogBarcode(
  row: InventoryBarcodeRow,
  item: InventoryCatalogItem
): InventoryCatalogBarcode {
  return {
    ...mapInventoryBarcodeRow(row),
    itemId: item.id,
    itemName: item.name,
    organizationId: row.organization_id
  };
}

export function mapInventoryBarcodeArchiveUpdate(
  mapping: InventoryBarcodeMapping
): InventoryBarcodeUpdate {
  return {
    archived_at: mapping.archivedAt,
    ...(mapping.archivedBy ? mapArchivedActorToColumns(mapping.archivedBy) : {}),
    archive_reason: mapping.archiveReason,
    updated_at: mapping.updatedAt
  };
}
