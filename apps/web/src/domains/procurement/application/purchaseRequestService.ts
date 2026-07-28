import type { EntityId } from "@krishnas-kitchen/types";

import type { CatalogItemSummary, PurchaseRequestInput } from "../domain/types";
import {
  assertValidPurchaseRequestInput,
  normalizePurchaseRequestInput
} from "../domain/procurementValidation";
import type { PurchaseRequestRecord, PurchaseRequestListQuery } from "./procurementRepository";

export type PurchaseRequestCatalogRepository = {
  findItemById: (organizationId: EntityId, itemId: EntityId) => Promise<CatalogItemSummary | null>;
  searchItems: (
    organizationId: EntityId,
    searchText: string
  ) => Promise<readonly CatalogItemSummary[]>;
};

export type PurchaseRequestRepository = {
  createPurchaseRequest: (input: PurchaseRequestInput) => Promise<PurchaseRequestRecord>;
  listPurchaseRequests: (
    query: PurchaseRequestListQuery
  ) => Promise<readonly PurchaseRequestRecord[]>;
};

export type PurchaseRequestService = {
  createPurchaseRequest: (input: PurchaseRequestInput) => Promise<PurchaseRequestRecord>;
  listMyPurchaseRequests: (
    query: PurchaseRequestListQuery & { requesterUserId: EntityId }
  ) => Promise<readonly PurchaseRequestRecord[]>;
  searchCatalogItems: (
    organizationId: EntityId,
    searchText: string
  ) => Promise<readonly CatalogItemSummary[]>;
};

export function createPurchaseRequestService(input: {
  catalogRepository: PurchaseRequestCatalogRepository;
  requestRepository: PurchaseRequestRepository;
}): PurchaseRequestService {
  const { catalogRepository, requestRepository } = input;

  return {
    async createPurchaseRequest(requestInput) {
      const normalizedInput = normalizePurchaseRequestInput(requestInput);
      const references =
        normalizedInput.item.type === "existing_item"
          ? {
              item: await catalogRepository.findItemById(
                normalizedInput.organizationId,
                normalizedInput.item.itemId
              )
            }
          : {
              duplicateCandidates: await catalogRepository.searchItems(
                normalizedInput.organizationId,
                normalizedInput.item.suggestedName
              )
            };

      assertValidPurchaseRequestInput(normalizedInput, references);

      return requestRepository.createPurchaseRequest(normalizedInput);
    },

    listMyPurchaseRequests(query) {
      return requestRepository.listPurchaseRequests(query);
    },

    searchCatalogItems(organizationId, searchText) {
      return catalogRepository.searchItems(organizationId, searchText);
    }
  };
}
