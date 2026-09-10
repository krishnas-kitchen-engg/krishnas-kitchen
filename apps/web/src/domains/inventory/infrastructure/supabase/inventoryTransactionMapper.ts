import type { Database, ItemUnit, Json } from "@krishnas-kitchen/types";

import type {
  InventoryActor,
  InventoryAuditMetadata,
  InventoryTransaction,
  InventoryTransactionDraft
} from "../../domain/types";

export type InventoryTransactionRow = Database["public"]["Tables"]["inventory_transactions"]["Row"];
export type InventoryTransactionInsert =
  Database["public"]["Tables"]["inventory_transactions"]["Insert"];

function readAuditMetadata(value: Json): InventoryAuditMetadata {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return {
    ...(typeof value.clientRequestId === "string"
      ? { clientRequestId: value.clientRequestId }
      : {}),
    ...(typeof value.conversionFactor === "number"
      ? { conversionFactor: value.conversionFactor }
      : {}),
    ...(typeof value.deviceId === "string" ? { deviceId: value.deviceId } : {}),
    ...(typeof value.handlingQuantity === "number"
      ? { handlingQuantity: value.handlingQuantity }
      : {}),
    ...(typeof value.handlingUnit === "string"
      ? { handlingUnit: value.handlingUnit as ItemUnit }
      : {}),
    ...(typeof value.reason === "string" ? { reason: value.reason } : {}),
    ...(typeof value.reversedTransactionId === "string"
      ? { reversedTransactionId: value.reversedTransactionId }
      : {}),
    ...(value.source === "online" || value.source === "offline_queue" || value.source === "system"
      ? { source: value.source }
      : {})
  };
}

function mapAuditMetadata(metadata: InventoryAuditMetadata): Json {
  return {
    ...(metadata.clientRequestId ? { clientRequestId: metadata.clientRequestId } : {}),
    ...(typeof metadata.conversionFactor === "number"
      ? { conversionFactor: metadata.conversionFactor }
      : {}),
    ...(metadata.deviceId ? { deviceId: metadata.deviceId } : {}),
    ...(typeof metadata.handlingQuantity === "number"
      ? { handlingQuantity: metadata.handlingQuantity }
      : {}),
    ...(metadata.handlingUnit ? { handlingUnit: metadata.handlingUnit } : {}),
    ...(metadata.reason ? { reason: metadata.reason } : {}),
    ...(metadata.reversedTransactionId
      ? { reversedTransactionId: metadata.reversedTransactionId }
      : {}),
    ...(metadata.source ? { source: metadata.source } : {})
  };
}

function mapActor(row: InventoryTransactionRow): InventoryActor {
  if (row.actor_type === "user") {
    if (!row.actor_user_id) {
      throw new Error("Inventory transaction user actor is missing actor_user_id.");
    }

    return {
      type: "user",
      userId: row.actor_user_id
    };
  }

  if (row.actor_type === "temporary_volunteer") {
    if (!row.actor_temp_session_id) {
      throw new Error("Temporary volunteer transaction is missing actor_temp_session_id.");
    }

    return {
      tempSessionId: row.actor_temp_session_id,
      type: "temporary_volunteer"
    };
  }

  return {
    type: "system"
  };
}

export function mapInventoryTransactionRow(row: InventoryTransactionRow): InventoryTransaction {
  return {
    actor: mapActor(row),
    auditMetadata: readAuditMetadata(row.audit_metadata),
    createdAt: row.created_at,
    destinationLocationId: row.destination_location_id,
    id: row.id,
    itemId: row.item_id,
    notes: row.notes,
    organizationId: row.organization_id,
    quantity: row.quantity,
    quantityEffect: row.quantity_effect,
    reversalOfTransactionId: row.reversal_of_transaction_id,
    sourceLocationId: row.source_location_id,
    templeId: row.temple_id,
    transactionType: row.transaction_type,
    unit: row.unit
  };
}

export function mapInventoryTransactionDraftToInsert(
  draft: InventoryTransactionDraft
): InventoryTransactionInsert {
  return {
    actor_temp_session_id:
      draft.actor.type === "temporary_volunteer" ? draft.actor.tempSessionId : null,
    actor_type: draft.actor.type,
    actor_user_id: draft.actor.type === "user" ? draft.actor.userId : null,
    audit_metadata: mapAuditMetadata(draft.auditMetadata),
    destination_location_id: draft.destinationLocationId,
    item_id: draft.itemId,
    notes: draft.notes,
    organization_id: draft.organizationId,
    quantity: draft.quantity,
    quantity_effect: draft.quantityEffect,
    reversal_of_transaction_id: draft.reversalOfTransactionId,
    source_location_id: draft.sourceLocationId,
    temple_id: draft.templeId,
    transaction_type: draft.transactionType,
    unit: draft.unit
  };
}
