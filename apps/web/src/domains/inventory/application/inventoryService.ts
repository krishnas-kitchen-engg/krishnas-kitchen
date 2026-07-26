import type { EntityId } from "@krishnas-kitchen/types";

import { calculateInventoryBalances } from "../domain/aggregation";
import {
  createConsumedTransaction,
  createInventoryAdjustmentTransaction,
  createReversalTransaction,
  createReceivingTransaction,
  createReturnedTransaction,
  createTransferTransaction
} from "../domain/transactionHelpers";
import {
  AdjustmentValidationError,
  validateInventoryAdjustmentInput
} from "../domain/adjustmentValidation";
import {
  ConsumptionValidationError,
  validateConsumptionTransactionInput
} from "../domain/consumptionValidation";
import {
  ReceivingValidationError,
  validateReceivingTransactionInput
} from "../domain/receivingValidation";
import {
  ReversalValidationError,
  validateReversalTransactionInput
} from "../domain/reversalValidation";
import { ReturnValidationError, validateReturnTransactionInput } from "../domain/returnValidation";
import {
  TransferValidationError,
  validateTransferTransactionInput
} from "../domain/transferValidation";
import { assertValidInventoryTransactionDraft } from "../domain/validation";
import type {
  CreateInventoryTransactionInput,
  CreateConsumptionTransactionInput,
  CreateInventoryAdjustmentInput,
  CreateReceivingTransactionInput,
  CreateReversalTransactionInput,
  CreateReturnTransactionInput,
  CreateTransferTransactionInput,
  InventoryBalance,
  InventoryItemReference,
  InventoryLocationReference,
  InventoryTransaction,
  InventoryTransactionDraft,
  InventoryTransactionScope
} from "../domain/types";
import type { InventoryTransactionRepository } from "./inventoryRepository";

export type InventoryReceivingCatalog = {
  findReceivingItem: (
    itemId: EntityId,
    scope: Pick<CreateReceivingTransactionInput, "organizationId">
  ) => Promise<InventoryItemReference | null>;
  findReceivingLocation: (
    locationId: EntityId,
    scope: Pick<CreateReceivingTransactionInput, "organizationId" | "templeId">
  ) => Promise<InventoryLocationReference | null>;
};

export type InventoryConsumptionCatalog = {
  findConsumptionItem: (
    itemId: EntityId,
    scope: Pick<CreateConsumptionTransactionInput, "organizationId">
  ) => Promise<InventoryItemReference | null>;
  findConsumptionLocation: (
    locationId: EntityId,
    scope: Pick<CreateConsumptionTransactionInput, "organizationId" | "templeId">
  ) => Promise<InventoryLocationReference | null>;
};

export type InventoryAdjustmentCatalog = {
  findAdjustmentItem: (
    itemId: EntityId,
    scope: Pick<CreateInventoryAdjustmentInput, "organizationId">
  ) => Promise<InventoryItemReference | null>;
  findAdjustmentLocation: (
    locationId: EntityId,
    scope: Pick<CreateInventoryAdjustmentInput, "organizationId" | "templeId">
  ) => Promise<InventoryLocationReference | null>;
};

export type InventoryReturnCatalog = {
  findReturnDestinationLocation: (
    locationId: EntityId,
    scope: Pick<CreateReturnTransactionInput, "organizationId" | "templeId">
  ) => Promise<InventoryLocationReference | null>;
  findReturnItem: (
    itemId: EntityId,
    scope: Pick<CreateReturnTransactionInput, "organizationId">
  ) => Promise<InventoryItemReference | null>;
  findReturnSourceLocation: (
    locationId: EntityId,
    scope: Pick<CreateReturnTransactionInput, "organizationId" | "templeId">
  ) => Promise<InventoryLocationReference | null>;
};

export type InventoryTransferCatalog = {
  findTransferDestinationLocation: (
    locationId: EntityId,
    scope: Pick<CreateTransferTransactionInput, "organizationId" | "templeId">
  ) => Promise<InventoryLocationReference | null>;
  findTransferItem: (
    itemId: EntityId,
    scope: Pick<CreateTransferTransactionInput, "organizationId">
  ) => Promise<InventoryItemReference | null>;
  findTransferSourceLocation: (
    locationId: EntityId,
    scope: Pick<CreateTransferTransactionInput, "organizationId" | "templeId">
  ) => Promise<InventoryLocationReference | null>;
};

export type InventoryService = {
  adjustInventory: (input: CreateInventoryAdjustmentInput) => Promise<{
    currentQuantity: number;
    physicalQuantity: number;
    quantityDelta: number;
    transaction: InventoryTransaction | null;
  }>;
  createTransaction: (draft: InventoryTransactionDraft) => Promise<InventoryTransaction>;
  consumeInventory: (input: CreateConsumptionTransactionInput) => Promise<InventoryTransaction>;
  getBalances: (scope: InventoryTransactionScope) => Promise<InventoryBalance[]>;
  getTransactions: (scope: InventoryTransactionScope) => Promise<InventoryTransaction[]>;
  receiveInventory: (input: CreateReceivingTransactionInput) => Promise<InventoryTransaction>;
  returnInventory: (input: CreateReturnTransactionInput) => Promise<InventoryTransaction>;
  transferInventory: (input: CreateTransferTransactionInput) => Promise<InventoryTransaction>;
  undoTransaction: (
    transactionId: EntityId,
    input: CreateReversalTransactionInput
  ) => Promise<InventoryTransaction>;
};

async function getAvailableQuantity(
  repository: InventoryTransactionRepository,
  input: {
    itemId: EntityId;
    locationId: EntityId;
    organizationId: EntityId;
    templeId: EntityId;
    unit: string;
  }
): Promise<number> {
  return (
    calculateInventoryBalances(
      await repository.listTransactions({
        itemId: input.itemId,
        locationId: input.locationId,
        organizationId: input.organizationId,
        templeId: input.templeId
      })
    ).find(
      (balance) =>
        balance.itemId === input.itemId &&
        balance.locationId === input.locationId &&
        balance.unit === input.unit
    )?.quantity ?? 0
  );
}

export function createInventoryService(
  repository: InventoryTransactionRepository,
  options: {
    adjustmentCatalog?: InventoryAdjustmentCatalog;
    consumptionCatalog?: InventoryConsumptionCatalog;
    receivingCatalog?: InventoryReceivingCatalog;
    returnCatalog?: InventoryReturnCatalog;
    transferCatalog?: InventoryTransferCatalog;
  } = {}
): InventoryService {
  return {
    async adjustInventory(input) {
      const item = await options.adjustmentCatalog?.findAdjustmentItem(input.itemId, {
        organizationId: input.organizationId
      });
      const location = await options.adjustmentCatalog?.findAdjustmentLocation(input.locationId, {
        organizationId: input.organizationId,
        templeId: input.templeId
      });
      const validation = validateInventoryAdjustmentInput(
        input,
        options.adjustmentCatalog ? { item: item ?? null, location: location ?? null } : undefined
      );

      if (!validation.ok) {
        throw new AdjustmentValidationError(validation.errors);
      }

      const currentQuantity =
        calculateInventoryBalances(
          await repository.listTransactions({
            itemId: input.itemId,
            locationId: input.locationId,
            organizationId: input.organizationId,
            templeId: input.templeId
          })
        ).find(
          (balance) =>
            balance.itemId === input.itemId &&
            balance.locationId === input.locationId &&
            balance.unit === input.unit
        )?.quantity ?? 0;
      const quantityDelta = input.physicalQuantity - currentQuantity;
      const draft = createInventoryAdjustmentTransaction(input, currentQuantity);

      return {
        currentQuantity,
        physicalQuantity: input.physicalQuantity,
        quantityDelta,
        transaction: draft ? await repository.createTransaction(draft) : null
      };
    },

    async createTransaction(draft) {
      return repository.createTransaction(assertValidInventoryTransactionDraft(draft));
    },

    async consumeInventory(input) {
      const item = await options.consumptionCatalog?.findConsumptionItem(input.itemId, {
        organizationId: input.organizationId
      });
      const location = await options.consumptionCatalog?.findConsumptionLocation(input.locationId, {
        organizationId: input.organizationId,
        templeId: input.templeId
      });
      const availableQuantity = await getAvailableQuantity(repository, input);
      const validation = validateConsumptionTransactionInput(input, {
        availableQuantity,
        ...(options.consumptionCatalog ? { item: item ?? null, location: location ?? null } : {})
      });

      if (!validation.ok) {
        throw new ConsumptionValidationError(validation.errors);
      }

      return repository.createTransaction(createConsumedTransaction(input));
    },

    async getBalances(scope) {
      return calculateInventoryBalances(await repository.listTransactions(scope));
    },

    async getTransactions(scope) {
      return repository.listTransactions(scope);
    },

    async receiveInventory(input) {
      const item = await options.receivingCatalog?.findReceivingItem(input.itemId, {
        organizationId: input.organizationId
      });
      const location = await options.receivingCatalog?.findReceivingLocation(input.locationId, {
        organizationId: input.organizationId,
        templeId: input.templeId
      });
      const validation = validateReceivingTransactionInput(
        input,
        options.receivingCatalog ? { item: item ?? null, location: location ?? null } : undefined
      );

      if (!validation.ok) {
        throw new ReceivingValidationError(validation.errors);
      }

      return repository.createReceivingTransaction(createReceivingTransaction(input));
    },

    async returnInventory(input) {
      const item = await options.returnCatalog?.findReturnItem(input.itemId, {
        organizationId: input.organizationId
      });
      const sourceLocation = await options.returnCatalog?.findReturnSourceLocation(
        input.sourceLocationId,
        {
          organizationId: input.organizationId,
          templeId: input.templeId
        }
      );
      const destinationLocation = await options.returnCatalog?.findReturnDestinationLocation(
        input.destinationLocationId,
        {
          organizationId: input.organizationId,
          templeId: input.templeId
        }
      );
      const availableQuantity = await getAvailableQuantity(repository, {
        itemId: input.itemId,
        locationId: input.sourceLocationId,
        organizationId: input.organizationId,
        templeId: input.templeId,
        unit: input.unit
      });
      const validation = validateReturnTransactionInput(input, {
        availableQuantity,
        ...(options.returnCatalog
          ? {
              destinationLocation: destinationLocation ?? null,
              item: item ?? null,
              sourceLocation: sourceLocation ?? null
            }
          : {})
      });

      if (!validation.ok) {
        throw new ReturnValidationError(validation.errors);
      }

      return repository.createTransaction(createReturnedTransaction(input));
    },

    async transferInventory(input) {
      const item = await options.transferCatalog?.findTransferItem(input.itemId, {
        organizationId: input.organizationId
      });
      const sourceLocation = await options.transferCatalog?.findTransferSourceLocation(
        input.sourceLocationId,
        {
          organizationId: input.organizationId,
          templeId: input.templeId
        }
      );
      const destinationLocation = await options.transferCatalog?.findTransferDestinationLocation(
        input.destinationLocationId,
        {
          organizationId: input.organizationId,
          templeId: input.templeId
        }
      );
      const availableQuantity = await getAvailableQuantity(repository, {
        itemId: input.itemId,
        locationId: input.sourceLocationId,
        organizationId: input.organizationId,
        templeId: input.templeId,
        unit: input.unit
      });
      const validation = validateTransferTransactionInput(input, {
        availableQuantity,
        ...(options.transferCatalog
          ? {
              destinationLocation: destinationLocation ?? null,
              item: item ?? null,
              sourceLocation: sourceLocation ?? null
            }
          : {})
      });

      if (!validation.ok) {
        throw new TransferValidationError(validation.errors);
      }

      return repository.createTransaction(createTransferTransaction(input));
    },

    async undoTransaction(transactionId, input) {
      const originalTransaction = await repository.findTransactionById(transactionId);

      if (!originalTransaction) {
        const validation = validateReversalTransactionInput(null, input);

        throw new ReversalValidationError(validation.errors);
      }

      const transactionChain = await repository.listTransactions({
        itemId: originalTransaction.itemId,
        organizationId: originalTransaction.organizationId,
        templeId: originalTransaction.templeId
      });
      const existingReversal =
        transactionChain.find(
          (transaction) => transaction.reversalOfTransactionId === originalTransaction.id
        ) ?? null;
      const validation = validateReversalTransactionInput(
        originalTransaction,
        input,
        existingReversal
      );

      if (!validation.ok) {
        throw new ReversalValidationError(validation.errors);
      }

      return repository.createTransaction(createReversalTransaction(originalTransaction, input));
    }
  };
}

export type InventoryTransactionFactory<TInput extends CreateInventoryTransactionInput> = (
  input: TInput
) => InventoryTransactionDraft;
