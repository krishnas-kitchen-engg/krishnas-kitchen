import type {
  ActorType,
  EntityId,
  InventoryQuantityEffect,
  InventoryTransactionType,
  ItemUnit
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
  conversionFactor?: number;
  deviceId?: string;
  handlingQuantity?: number;
  handlingUnit?: ItemUnit;
  reason?: string;
  reversedTransactionId?: EntityId;
  source?: "online" | "offline_queue" | "system";
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

export type ReceivingInventoryTransactionDraft = InventoryTransactionDraft & {
  destinationLocationId: EntityId;
  quantityEffect: "increase";
  reversalOfTransactionId: null;
  sourceLocationId: null;
  transactionType: "received";
};

export type TransferInventoryTransactionDraft = InventoryTransactionDraft & {
  destinationLocationId: EntityId;
  quantityEffect: "transfer";
  reversalOfTransactionId: null;
  sourceLocationId: EntityId;
  transactionType: "transfer";
};

export type ReturnInventoryTransactionDraft = InventoryTransactionDraft & {
  destinationLocationId: EntityId;
  quantityEffect: "transfer";
  reversalOfTransactionId: null;
  sourceLocationId: EntityId;
  transactionType: "returned";
};

export type ReversalInventoryTransactionDraft = InventoryTransactionDraft & {
  reversalOfTransactionId: EntityId;
  transactionType: "reversal";
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

export type InventoryItemBalance = {
  itemId: EntityId;
  organizationId: EntityId;
  quantity: number;
  templeId?: EntityId;
  unit: ItemUnit;
};

export type InventoryLocationBalance = {
  itemBalances: InventoryBalance[];
  locationId: EntityId;
  organizationId: EntityId;
  templeId: EntityId;
};

export type InventorySummaryProjection = {
  balanceCount: number;
  itemCount: number;
  locationCount: number;
  organizationId: EntityId;
  templeId?: EntityId;
  transactionCount: number;
};

export type InventoryLowStockThreshold = {
  itemId: EntityId;
  locationId?: EntityId;
  minimumQuantity: number;
  organizationId: EntityId;
  targetQuantity?: number | null;
  templeId?: EntityId;
  unit: ItemUnit;
};

export type InventoryLowStockAlert = InventoryLowStockThreshold & {
  currentQuantity: number;
  shortageQuantity: number;
};

export type InventoryTransactionScope = {
  itemId?: EntityId;
  locationId?: EntityId;
  organizationId: EntityId;
  templeId?: EntityId;
};

export type InventoryTransactionHistoryQuery = InventoryTransactionScope & {
  limit?: number;
  transactionType?: InventoryTransactionType;
};

export type InventoryItemReference = {
  defaultUnit: ItemUnit;
  deletedAt: string | null;
  id: EntityId;
  organizationId: EntityId;
  adjustmentUnits?: readonly ItemUnit[];
  consumptionUnits?: readonly ItemUnit[];
  receivingUnits?: readonly ItemUnit[];
  returnUnits?: readonly ItemUnit[];
  transferUnits?: readonly ItemUnit[];
};

export type InventoryLocationReference = {
  deletedAt: string | null;
  id: EntityId;
  organizationId: EntityId;
  templeId: EntityId;
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

export type CreateReceivingTransactionInput = CreateInventoryTransactionInput & {
  locationId: EntityId;
};

export type CreateConsumptionTransactionInput = CreateInventoryTransactionInput & {
  locationId: EntityId;
};

export type CreateTransferTransactionInput = CreateInventoryTransactionInput & {
  destinationLocationId: EntityId;
  sourceLocationId: EntityId;
};

export type CreateReturnTransactionInput = CreateInventoryTransactionInput & {
  destinationLocationId: EntityId;
  sourceLocationId: EntityId;
};

export type CreateReversalTransactionInput = Pick<
  CreateInventoryTransactionInput,
  "actor" | "auditMetadata" | "notes"
>;

export type CreateAdjustmentTransactionInput = CreateLocationTransactionInput & {
  direction: Extract<InventoryQuantityEffect, "increase" | "decrease">;
};

export type CreateInventoryAdjustmentInput = Omit<CreateInventoryTransactionInput, "quantity"> & {
  locationId: EntityId;
  physicalQuantity: number;
  reason: string;
};
