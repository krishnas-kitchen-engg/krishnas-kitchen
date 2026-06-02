import type {
  ActorType,
  EntityId,
  InventoryQuantityEffect,
  InventoryTransactionType,
  ItemUnit,
  Json
} from "@krishnas-kitchen/types";

export type InventoryActor =
  | {
      type: Extract<ActorType, "user">;
      userId: EntityId;
    }
  | {
      tempSessionId: EntityId;
      type: Extract<ActorType, "temporary_volunteer">;
    }
  | {
      type: Extract<ActorType, "system">;
    };

export type InventoryAuditMetadata = {
  clientRequestId?: string;
  deviceId?: string;
  reason?: string;
  source?: "online" | "offline_queue" | "system";
  [key: string]: Json | undefined;
};

export type InventoryTransaction = {
  actor: InventoryActor;
  auditMetadata: InventoryAuditMetadata;
  createdAt: string;
  destinationLocationId: EntityId | null;
  id: EntityId;
  itemId: EntityId;
  notes: string | null;
  organizationId: EntityId;
  quantity: number;
  quantityEffect: InventoryQuantityEffect;
  reversalOfTransactionId: EntityId | null;
  sourceLocationId: EntityId | null;
  templeId: EntityId;
  transactionType: InventoryTransactionType;
  unit: ItemUnit;
};

export type InventoryTransactionDraft = Omit<InventoryTransaction, "createdAt" | "id"> & {
  clientId: EntityId;
};

export type InventoryBalanceKey = {
  itemId: EntityId;
  locationId: EntityId;
  organizationId: EntityId;
  templeId: EntityId;
  unit: ItemUnit;
};

export type InventoryBalance = InventoryBalanceKey & {
  quantity: number;
};

export type InventoryTransactionScope = {
  itemId?: EntityId;
  locationId?: EntityId;
  organizationId: EntityId;
  templeId?: EntityId;
};

export type CreateInventoryTransactionInput = {
  actor: InventoryActor;
  auditMetadata?: InventoryAuditMetadata | undefined;
  itemId: EntityId;
  notes?: string | undefined;
  organizationId: EntityId;
  quantity: number;
  templeId: EntityId;
  unit: ItemUnit;
};

export type CreateLocationTransactionInput = CreateInventoryTransactionInput & {
  locationId: EntityId;
};

export type CreateTransferTransactionInput = CreateInventoryTransactionInput & {
  destinationLocationId: EntityId;
  sourceLocationId: EntityId;
};

export type CreateAdjustmentTransactionInput = CreateLocationTransactionInput & {
  direction: Extract<InventoryQuantityEffect, "increase" | "decrease">;
};
