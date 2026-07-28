import { useEffect, useMemo, useRef, useState } from "react";
import type { ItemUnit } from "@krishnas-kitchen/types";

import { useInventoryActor } from "@/domains/inventory";
import {
  createPurchaseListPublishService,
  createPurchaseRequestReviewService,
  createSupabasePurchaseListRepository,
  createSupabasePurchaseRequestRepository,
  PROCUREMENT_ITEM_UNITS,
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
  const submitLock = useRef(false);
  const requestReviewService = useMemo(() => {
    if (!auth.client) {
      return null;
    }

    return createPurchaseRequestReviewService(createSupabasePurchaseRequestRepository(auth.client));
  }, [auth.client]);
  const purchaseListService = useMemo(() => {
    if (!auth.client) {
      return null;
    }

    return createPurchaseListPublishService(createSupabasePurchaseListRepository(auth.client));
  }, [auth.client]);
  const [refreshIndex, setRefreshIndex] = useState(0);
  const [listName, setListName] = useState("Next Purchase List");
  const [purchaseLists, setPurchaseLists] = useState<readonly PurchaseListRecord[]>([]);
  const [requests, setRequests] = useState<readonly PurchaseRequestRecord[]>([]);
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
        const [nextRequests, nextPurchaseLists] = await Promise.all([
          currentRequestReviewService.listRequestsForReview(scope),
          currentPurchaseListService.listPurchaseLists(scope)
        ]);

        if (isActive) {
          setRequests(nextRequests);
          setPurchaseLists(nextPurchaseLists);
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

  return {
    approvedRequests,
    canReviewRequests,
    drafts,
    error,
    isLoading,
    listName,
    publishApprovedRequests,
    purchaseLists,
    removeApprovedRequest,
    reviewRequest,
    reviewableRequests,
    setListName,
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
