import { useEffect, useMemo, useRef, useState } from "react";
import type { ItemUnit } from "@krishnas-kitchen/types";

import { useInventoryActor } from "@/domains/inventory";
import {
  createPurchaseListPublishService,
  createPurchaseRequestQueueService,
  createPurchaseRequestService,
  createPurchaseRequestReviewService,
  createSupabasePurchaseListRepository,
  createSupabasePurchaseRequestCatalogRepository,
  createSupabasePurchaseRequestRepository,
  PROCUREMENT_ITEM_UNITS,
  type CatalogItemSummary,
  type PurchaseListItemRecord,
  type PurchaseListGenerationGrouping,
  type ProcurementActor,
  type PurchaseListRecord,
  type PurchaseRequestRecord,
  type PurchaseRequestReviewDecision
} from "@/domains/procurement";
import { hasPermission, useAuth } from "@/features/auth";

type ReviewDraft = {
  notes: string;
  quantityText: string;
  requestId: string;
  unit: ItemUnit | "";
};

type QueueAddMode = "existing_item" | "new_item_suggestion";

type QueueAddForm = {
  category: string;
  itemId: string;
  mode: QueueAddMode;
  notes: string;
  quantityText: string;
  searchText: string;
  suggestedName: string;
  unit: ItemUnit | "";
};

const initialQueueAddForm: QueueAddForm = {
  category: "",
  itemId: "",
  mode: "existing_item",
  notes: "",
  quantityText: "",
  searchText: "",
  suggestedName: "",
  unit: "kg"
};

function toProcurementActor(actor: ReturnType<typeof useInventoryActor>): ProcurementActor | null {
  if (!actor) {
    return null;
  }

  if (actor.type === "temporary_volunteer") {
    return {
      tempSessionId: actor.tempSessionId,
      type: actor.type
    };
  }

  if (actor.type === "user") {
    return {
      type: actor.type,
      userId: actor.userId
    };
  }

  return {
    type: "system"
  };
}

function createDraft(request: PurchaseRequestRecord): ReviewDraft {
  return {
    notes: request.notes ?? "",
    quantityText: String(request.quantity),
    requestId: request.id,
    unit: request.unit
  };
}

export function usePurchaseRequestReview() {
  const auth = useAuth();
  const inventoryActor = useInventoryActor();
  const procurementActor = useMemo(() => toProcurementActor(inventoryActor), [inventoryActor]);
  const organizationId = auth.currentOrganization?.id;
  const templeId = auth.currentTemple?.id;
  const canReviewRequests = hasPermission(auth.permissions, "procurement.requests.review");
  const canCreateRequests = hasPermission(auth.permissions, "procurement.requests.create");
  const submitLock = useRef(false);
  const requestCreateService = useMemo(() => {
    if (!auth.client) {
      return null;
    }

    return createPurchaseRequestService({
      catalogRepository: createSupabasePurchaseRequestCatalogRepository(auth.client),
      requestRepository: createSupabasePurchaseRequestRepository(auth.client)
    });
  }, [auth.client]);
  const requestReviewService = useMemo(() => {
    if (!auth.client) {
      return null;
    }

    return createPurchaseRequestReviewService(createSupabasePurchaseRequestRepository(auth.client));
  }, [auth.client]);
  const requestQueueService = useMemo(() => {
    if (!requestCreateService || !requestReviewService) {
      return null;
    }

    return createPurchaseRequestQueueService({
      requestService: requestCreateService,
      reviewService: requestReviewService
    });
  }, [requestCreateService, requestReviewService]);
  const purchaseListService = useMemo(() => {
    if (!auth.client) {
      return null;
    }

    return createPurchaseListPublishService(createSupabasePurchaseListRepository(auth.client));
  }, [auth.client]);
  const [refreshIndex, setRefreshIndex] = useState(0);
  const [addCatalogItems, setAddCatalogItems] = useState<readonly CatalogItemSummary[]>([]);
  const [addForm, setAddForm] = useState<QueueAddForm>(initialQueueAddForm);
  const [listName, setListName] = useState("Next Purchase List");
  const [generationGrouping, setGenerationGrouping] =
    useState<PurchaseListGenerationGrouping>("purchase_location");
  const [publishMode, setPublishMode] = useState<"manual" | "scheduled">("manual");
  const [purchaseLists, setPurchaseLists] = useState<readonly PurchaseListRecord[]>([]);
  const [purchaseListItems, setPurchaseListItems] = useState<readonly PurchaseListItemRecord[]>([]);
  const [requests, setRequests] = useState<readonly PurchaseRequestRecord[]>([]);
  const [scheduledPublishAt, setScheduledPublishAt] = useState("");
  const [drafts, setDrafts] = useState<Record<string, ReviewDraft>>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submittingRequestId, setSubmittingRequestId] = useState<string | null>(null);
  const reviewableRequests = useMemo(
    () =>
      requests.filter(
        (request) => request.status === "submitted" || request.status === "needs_clarification"
      ),
    [requests]
  );
  const approvedRequests = useMemo(
    () => requests.filter((request) => request.status === "approved"),
    [requests]
  );
  const canAddApprovedRequest =
    canReviewRequests &&
    canCreateRequests &&
    !submittingRequestId &&
    Boolean(addForm.quantityText.trim()) &&
    Boolean(addForm.unit) &&
    (addForm.mode === "existing_item"
      ? Boolean(addForm.itemId)
      : Boolean(addForm.suggestedName.trim()));
  const scheduledLists = useMemo(
    () =>
      purchaseLists.filter(
        (list) => list.publishMode === "scheduled" && list.status === "ready_to_publish"
      ),
    [purchaseLists]
  );

  useEffect(() => {
    if (
      !canReviewRequests ||
      !organizationId ||
      !templeId ||
      !requestReviewService ||
      !purchaseListService
    ) {
      setRequests([]);
      setDrafts({});
      setPurchaseLists([]);
      setPurchaseListItems([]);
      return;
    }

    let isActive = true;
    const currentPurchaseListService = purchaseListService;
    const currentRequestReviewService = requestReviewService;
    const scope = {
      organizationId,
      templeId
    };

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const [nextRequests, nextPurchaseLists, nextPurchaseListItems] = await Promise.all([
          currentRequestReviewService.listRequestsForReview(scope),
          currentPurchaseListService.listPurchaseLists(scope),
          currentPurchaseListService.listPurchaseListItems(scope)
        ]);

        if (isActive) {
          setRequests(nextRequests);
          setPurchaseLists(nextPurchaseLists);
          setPurchaseListItems(nextPurchaseListItems);
          setDrafts(
            Object.fromEntries(nextRequests.map((request) => [request.id, createDraft(request)]))
          );
          setIsLoading(false);
        }
      } catch (loadError) {
        if (isActive) {
          setError(
            loadError instanceof Error ? loadError.message : "Purchase requests failed to load."
          );
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      isActive = false;
    };
  }, [
    canReviewRequests,
    organizationId,
    purchaseListService,
    refreshIndex,
    requestReviewService,
    templeId
  ]);

  useEffect(() => {
    if (!organizationId || !requestCreateService || !addForm.searchText.trim()) {
      setAddCatalogItems([]);
      return;
    }

    let isActive = true;

    requestCreateService
      .searchCatalogItems(organizationId, addForm.searchText)
      .then((items) => {
        if (isActive) {
          setAddCatalogItems(items);
        }
      })
      .catch((searchError) => {
        if (isActive) {
          setError(searchError instanceof Error ? searchError.message : "Item search failed.");
          setAddCatalogItems([]);
        }
      });

    return () => {
      isActive = false;
    };
  }, [addForm.searchText, organizationId, requestCreateService]);

  function refresh() {
    setRefreshIndex((currentIndex) => currentIndex + 1);
  }

  function updateDraft(requestId: string, patch: Partial<Omit<ReviewDraft, "requestId">>) {
    setDrafts((currentDrafts) => ({
      ...currentDrafts,
      [requestId]: {
        ...(currentDrafts[requestId] ?? {
          notes: "",
          quantityText: "",
          requestId,
          unit: ""
        }),
        ...patch
      }
    }));
  }

  async function reviewRequest(requestId: string, decision: PurchaseRequestReviewDecision) {
    const draft = drafts[requestId];

    if (
      submitLock.current ||
      submittingRequestId ||
      !canReviewRequests ||
      !organizationId ||
      !templeId ||
      !procurementActor ||
      !requestReviewService ||
      !draft ||
      !draft.unit
    ) {
      return;
    }

    submitLock.current = true;
    setError(null);
    setSubmittingRequestId(requestId);

    try {
      await requestReviewService.reviewPurchaseRequest({
        decision,
        notes: draft.notes,
        organizationId,
        quantity: Number(draft.quantityText),
        requestId,
        reviewedBy: procurementActor,
        templeId,
        unit: draft.unit
      });

      setSubmittingRequestId(null);
      refresh();
    } catch (reviewError) {
      setError(
        reviewError instanceof Error ? reviewError.message : "Purchase request review failed."
      );
      setSubmittingRequestId(null);
    } finally {
      submitLock.current = false;
    }
  }

  async function updateApprovedRequest(requestId: string) {
    const draft = drafts[requestId];

    if (
      submitLock.current ||
      submittingRequestId ||
      !canReviewRequests ||
      !organizationId ||
      !templeId ||
      !procurementActor ||
      procurementActor.type !== "user" ||
      !requestReviewService ||
      !draft ||
      !draft.unit
    ) {
      return;
    }

    submitLock.current = true;
    setError(null);
    setSubmittingRequestId(`approved:${requestId}`);

    try {
      await requestReviewService.updateApprovedPurchaseRequest({
        notes: draft.notes,
        organizationId,
        quantity: Number(draft.quantityText),
        requestId,
        reviewedBy: procurementActor,
        templeId,
        unit: draft.unit
      });

      setSubmittingRequestId(null);
      refresh();
    } catch (updateError) {
      setError(
        updateError instanceof Error ? updateError.message : "Approved request update failed."
      );
      setSubmittingRequestId(null);
    } finally {
      submitLock.current = false;
    }
  }

  async function removeApprovedRequest(requestId: string) {
    const draft = drafts[requestId];

    if (
      submitLock.current ||
      submittingRequestId ||
      !canReviewRequests ||
      !organizationId ||
      !templeId ||
      !procurementActor ||
      procurementActor.type !== "user" ||
      !requestReviewService
    ) {
      return;
    }

    submitLock.current = true;
    setError(null);
    setSubmittingRequestId(`remove:${requestId}`);

    try {
      await requestReviewService.removeApprovedPurchaseRequest({
        notes: draft?.notes ?? null,
        organizationId,
        requestId,
        reviewedBy: procurementActor,
        templeId
      });

      setSubmittingRequestId(null);
      refresh();
    } catch (removeError) {
      setError(
        removeError instanceof Error ? removeError.message : "Approved request removal failed."
      );
      setSubmittingRequestId(null);
    } finally {
      submitLock.current = false;
    }
  }

  async function addApprovedRequest() {
    if (
      submitLock.current ||
      submittingRequestId ||
      !canAddApprovedRequest ||
      !organizationId ||
      !templeId ||
      !procurementActor ||
      procurementActor.type !== "user" ||
      !requestQueueService ||
      !addForm.unit
    ) {
      return;
    }

    submitLock.current = true;
    setError(null);
    setSubmittingRequestId("add-approved");

    try {
      await requestQueueService.addApprovedPurchaseRequest({
        approvedBy: procurementActor,
        item:
          addForm.mode === "existing_item"
            ? {
                itemId: addForm.itemId,
                type: "existing_item"
              }
            : {
                category: addForm.category,
                suggestedName: addForm.suggestedName,
                type: "new_item_suggestion"
              },
        notes: addForm.notes,
        organizationId,
        quantity: Number(addForm.quantityText),
        templeId,
        unit: addForm.unit
      });

      setAddForm(initialQueueAddForm);
      setSubmittingRequestId(null);
      refresh();
    } catch (addError) {
      setError(addError instanceof Error ? addError.message : "Approved request creation failed.");
      setSubmittingRequestId(null);
    } finally {
      submitLock.current = false;
    }
  }

  async function publishApprovedRequests() {
    if (
      submitLock.current ||
      submittingRequestId ||
      !canReviewRequests ||
      !organizationId ||
      !templeId ||
      !procurementActor ||
      procurementActor.type !== "user" ||
      !purchaseListService
    ) {
      return;
    }

    submitLock.current = true;
    setError(null);
    setSubmittingRequestId("publish");

    try {
      await purchaseListService.publishApprovedPurchaseRequests({
        generationGrouping,
        name: listName,
        organizationId,
        publishedBy: procurementActor,
        templeId
      });

      setSubmittingRequestId(null);
      refresh();
    } catch (publishError) {
      setError(
        publishError instanceof Error ? publishError.message : "Purchase list publishing failed."
      );
      setSubmittingRequestId(null);
    } finally {
      submitLock.current = false;
    }
  }

  async function scheduleApprovedRequests() {
    if (
      submitLock.current ||
      submittingRequestId ||
      !canReviewRequests ||
      !organizationId ||
      !templeId ||
      !procurementActor ||
      procurementActor.type !== "user" ||
      !purchaseListService ||
      !scheduledPublishAt
    ) {
      return;
    }

    submitLock.current = true;
    setError(null);
    setSubmittingRequestId("schedule");

    try {
      await purchaseListService.scheduleApprovedPurchaseRequests({
        generationGrouping,
        name: listName,
        organizationId,
        scheduledBy: procurementActor,
        scheduledPublishAt: new Date(scheduledPublishAt).toISOString(),
        templeId
      });

      setSubmittingRequestId(null);
      refresh();
    } catch (scheduleError) {
      setError(
        scheduleError instanceof Error ? scheduleError.message : "Purchase list scheduling failed."
      );
      setSubmittingRequestId(null);
    } finally {
      submitLock.current = false;
    }
  }

  async function publishScheduledList(listId: string) {
    if (
      submitLock.current ||
      submittingRequestId ||
      !canReviewRequests ||
      !organizationId ||
      !templeId ||
      !procurementActor ||
      procurementActor.type !== "user" ||
      !purchaseListService
    ) {
      return;
    }

    submitLock.current = true;
    setError(null);
    setSubmittingRequestId(`scheduled:${listId}`);

    try {
      await purchaseListService.publishScheduledPurchaseList({
        listId,
        organizationId,
        publishedBy: procurementActor,
        templeId
      });

      setSubmittingRequestId(null);
      refresh();
    } catch (publishError) {
      setError(
        publishError instanceof Error
          ? publishError.message
          : "Scheduled purchase list publishing failed."
      );
      setSubmittingRequestId(null);
    } finally {
      submitLock.current = false;
    }
  }

  return {
    addApprovedRequest,
    addCatalogItems,
    addForm,
    approvedRequests,
    canAddApprovedRequest,
    canReviewRequests,
    drafts,
    error,
    generationGrouping,
    isLoading,
    listName,
    publishApprovedRequests,
    publishMode,
    publishScheduledList,
    purchaseListItems,
    purchaseLists,
    removeApprovedRequest,
    reviewRequest,
    reviewableRequests,
    scheduleApprovedRequests,
    scheduledLists,
    scheduledPublishAt,
    setGenerationGrouping,
    setAddCategory(category: string) {
      setAddForm((currentForm) => ({
        ...currentForm,
        category
      }));
    },
    setAddItemId(itemId: string) {
      const item = addCatalogItems.find((candidate) => candidate.id === itemId);
      setAddForm((currentForm) => ({
        ...currentForm,
        itemId,
        unit: item?.defaultUnit ?? currentForm.unit
      }));
    },
    setAddMode(mode: QueueAddMode) {
      setAddForm((currentForm) => ({
        ...currentForm,
        mode
      }));
    },
    setAddNotes(notes: string) {
      setAddForm((currentForm) => ({
        ...currentForm,
        notes
      }));
    },
    setAddQuantityText(quantityText: string) {
      setAddForm((currentForm) => ({
        ...currentForm,
        quantityText
      }));
    },
    setAddSearchText(searchText: string) {
      setAddForm((currentForm) => ({
        ...currentForm,
        itemId: "",
        searchText
      }));
    },
    setAddSuggestedName(suggestedName: string) {
      setAddForm((currentForm) => ({
        ...currentForm,
        suggestedName
      }));
    },
    setAddUnit(unit: ItemUnit | "") {
      setAddForm((currentForm) => ({
        ...currentForm,
        unit
      }));
    },
    setListName,
    setPublishMode,
    setScheduledPublishAt,
    setDraftNotes(requestId: string, notes: string) {
      updateDraft(requestId, { notes });
    },
    setDraftQuantity(requestId: string, quantityText: string) {
      updateDraft(requestId, { quantityText });
    },
    setDraftUnit(requestId: string, unit: ItemUnit | "") {
      updateDraft(requestId, { unit });
    },
    submittingRequestId,
    updateApprovedRequest,
    units: PROCUREMENT_ITEM_UNITS
  };
}
