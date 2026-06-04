import type { EntityId } from "@krishnas-kitchen/types";

import { calculateInventoryBalances } from "../domain/aggregation";
import {
  createReversalTransaction,
  createReceivingTransaction,
  createReturnedTransaction,
  createTransferTransaction
} from "../domain/transactionHelpers";
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
  createTransaction: (draft: InventoryTransactionDraft) => Promise<InventoryTransaction>;
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

export function createInventoryService(
  repository: InventoryTransactionRepository,
  options: {
    receivingCatalog?: InventoryReceivingCatalog;
    returnCatalog?: InventoryReturnCatalog;
    transferCatalog?: InventoryTransferCatalog;
  } = {}
): InventoryService {
  return {
    async createTransaction(draft) {
      return repository.createTransaction(assertValidInventoryTransactionDraft(draft));
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
      const validation = validateReturnTransactionInput(
        input,
        options.returnCatalog
          ? {
              destinationLocation: destinationLocation ?? null,
              item: item ?? null,
              sourceLocation: sourceLocation ?? null
            }
          : undefined
      );

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
      const validation = validateTransferTransactionInput(
        input,
        options.transferCatalog
          ? {
              destinationLocation: destinationLocation ?? null,
              item: item ?? null,
              sourceLocation: sourceLocation ?? null
            }
          : undefined
      );

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
