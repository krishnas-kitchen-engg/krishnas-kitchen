import type { Database, EntityId } from "@krishnas-kitchen/types";

import type { InventoryActor } from "../../domain/types";
import type {
  UnknownBarcodeDraft,
  UnknownBarcodeRecord,
  UnknownBarcodeWorkflowContext
} from "../../domain/unknownBarcode";

export type UnknownBarcodeRow = Database["public"]["Tables"]["unknown_barcodes"]["Row"];
export type UnknownBarcodeInsert = Database["public"]["Tables"]["unknown_barcodes"]["Insert"];
export type UnknownBarcodeUpdate = Database["public"]["Tables"]["unknown_barcodes"]["Update"];

function mapActor(
  actorType: UnknownBarcodeRow["actor_type"] | null,
  userId: EntityId | null,
  tempSessionId: EntityId | null
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

function getActorUserId(actor: InventoryActor | null): EntityId | null {
  return actor?.type === "user" ? actor.userId : null;
}

function getActorTempSessionId(actor: InventoryActor | null): EntityId | null {
  return actor?.type === "temporary_volunteer" ? actor.tempSessionId : null;
}

function getActorType(actor: InventoryActor | null): UnknownBarcodeRow["actor_type"] | null {
  return actor?.type ?? null;
}

function mapRequiredActor(
  actorType: UnknownBarcodeRow["actor_type"],
  userId: EntityId | null,
  tempSessionId: EntityId | null,
  field: string
): InventoryActor {
  const actor = mapActor(actorType, userId, tempSessionId);

  if (!actor) {
    throw new Error(`Unknown barcode row is missing ${field} actor metadata.`);
  }

  return actor;
}

function mapWorkflowContext(value: string | null): UnknownBarcodeWorkflowContext | null {
  if (
    value === "lookup" ||
    value === "receiving" ||
    value === "return" ||
    value === "scan" ||
    value === "transfer"
  ) {
    return value;
  }

  return null;
}

export function mapUnknownBarcodeRow(row: UnknownBarcodeRow): UnknownBarcodeRecord {
  return {
    actor: mapRequiredActor(
      row.actor_type,
      row.actor_user_id,
      row.actor_temp_session_id,
      "initial"
    ),
    barcode: {
      format: row.barcode_format,
      value: row.barcode_value
    },
    createdAt: row.created_at,
    dismissedAt: row.dismissed_at,
    dismissedBy: mapActor(
      row.dismissed_by_actor_type,
      row.dismissed_by_actor_user_id,
      row.dismissed_by_actor_temp_session_id
    ),
    dismissalReason: row.dismissal_reason,
    firstSeenAt: row.first_seen_at,
    id: row.id,
    lastSeenAt: row.last_seen_at,
    lastSeenBy: mapRequiredActor(
      row.last_seen_by_actor_type,
      row.last_seen_by_actor_user_id,
      row.last_seen_by_actor_temp_session_id,
      "last seen"
    ),
    linkedAt: row.linked_at,
    linkedBarcodeMappingId: row.linked_barcode_mapping_id,
    linkedBy: mapActor(
      row.linked_by_actor_type,
      row.linked_by_actor_user_id,
      row.linked_by_actor_temp_session_id
    ),
    linkedItemId: row.linked_item_id,
    notes: row.notes,
    organizationId: row.organization_id,
    scanCount: row.scan_count,
    sourceWorkflow: mapWorkflowContext(row.source_workflow),
    status: row.status,
    templeId: row.temple_id,
    updatedAt: row.updated_at
  };
}

export function mapUnknownBarcodeDraftToInsert(draft: UnknownBarcodeDraft): UnknownBarcodeInsert {
  return {
    actor_temp_session_id: getActorTempSessionId(draft.actor),
    actor_type: draft.actor.type,
    actor_user_id: getActorUserId(draft.actor),
    barcode_format: draft.barcode.format,
    barcode_value: draft.barcode.value,
    dismissed_at: null,
    dismissed_by_actor_temp_session_id: null,
    dismissed_by_actor_type: null,
    dismissed_by_actor_user_id: null,
    dismissal_reason: null,
    first_seen_at: draft.firstSeenAt,
    id: draft.clientId,
    last_seen_at: draft.lastSeenAt,
    last_seen_by_actor_temp_session_id: getActorTempSessionId(draft.lastSeenBy),
    last_seen_by_actor_type: draft.lastSeenBy.type,
    last_seen_by_actor_user_id: getActorUserId(draft.lastSeenBy),
    linked_at: null,
    linked_barcode_mapping_id: null,
    linked_by_actor_temp_session_id: null,
    linked_by_actor_type: null,
    linked_by_actor_user_id: null,
    linked_item_id: null,
    notes: draft.notes,
    organization_id: draft.organizationId,
    scan_count: draft.scanCount,
    source_workflow: draft.sourceWorkflow,
    status: draft.status,
    temple_id: draft.templeId
  };
}

export function mapUnknownBarcodeRecordToUpdate(
  record: UnknownBarcodeRecord
): UnknownBarcodeUpdate {
  return {
    dismissal_reason: record.dismissalReason,
    dismissed_at: record.dismissedAt,
    dismissed_by_actor_temp_session_id: getActorTempSessionId(record.dismissedBy),
    dismissed_by_actor_type: getActorType(record.dismissedBy),
    dismissed_by_actor_user_id: getActorUserId(record.dismissedBy),
    last_seen_at: record.lastSeenAt,
    last_seen_by_actor_temp_session_id: getActorTempSessionId(record.lastSeenBy),
    last_seen_by_actor_type: record.lastSeenBy.type,
    last_seen_by_actor_user_id: getActorUserId(record.lastSeenBy),
    linked_at: record.linkedAt,
    linked_barcode_mapping_id: record.linkedBarcodeMappingId,
    linked_by_actor_temp_session_id: getActorTempSessionId(record.linkedBy),
    linked_by_actor_type: getActorType(record.linkedBy),
    linked_by_actor_user_id: getActorUserId(record.linkedBy),
    linked_item_id: record.linkedItemId,
    notes: record.notes,
    scan_count: record.scanCount,
    source_workflow: record.sourceWorkflow,
    status: record.status,
    temple_id: record.templeId,
    updated_at: record.updatedAt
  };
}
