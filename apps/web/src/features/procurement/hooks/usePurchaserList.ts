import { useEffect, useMemo, useRef, useState } from "react";

import { useInventoryActor } from "@/domains/inventory";
import {
  createPurchaserListService,
  createSupabasePurchaserListRepository,
  type ProcurementActor,
  type PurchaseListItemProgressStatus,
  type PurchaseListItemRecord
} from "@/domains/procurement";
import { hasPermission, useAuth } from "@/features/auth";

type ProgressDraft = {
  notes: string;
  purchaseDate: string;
  purchasedQuantityText: string;
  totalCostText: string;
  unitCostText: string;
};

function toProcurementActor(actor: ReturnType<typeof useInventoryActor>): ProcurementActor | null {
  if (!actor) {
    return null;
  }

  if (actor.type === "user") {
    return {
      type: actor.type,
      userId: actor.userId
    };
  }

  if (actor.type === "temporary_volunteer") {
    return {
      tempSessionId: actor.tempSessionId,
      type: actor.type
    };
  }

  return {
    type: "system"
  };
}

function createDraft(item: PurchaseListItemRecord): ProgressDraft {
  return {
    notes: item.notes ?? "",
    purchaseDate: "",
    purchasedQuantityText: item.purchasedQuantity ? String(item.purchasedQuantity) : "",
    totalCostText: item.totalCost ? String(item.totalCost) : "",
    unitCostText: item.unitCost ? String(item.unitCost) : ""
  };
}

function optionalNumber(value: string): number | null {
  const trimmedValue = value.trim();

  return trimmedValue ? Number(trimmedValue) : null;
}

export function usePurchaserList() {
  const auth = useAuth();
  const inventoryActor = useInventoryActor();
  const procurementActor = useMemo(() => toProcurementActor(inventoryActor), [inventoryActor]);
  const organizationId = auth.currentOrganization?.id;
  const templeId = auth.currentTemple?.id;
  const purchaserUserId = auth.profile?.id;
  const canUsePurchaserList = hasPermission(
    auth.permissions,
    "procurement.purchases.read_assigned"
  );
  const canUpdatePurchases = hasPermission(
    auth.permissions,
    "procurement.purchases.update_assigned"
  );
  const submitLock = useRef(false);
  const service = useMemo(() => {
    if (!auth.client) {
      return null;
    }

    return createPurchaserListService(createSupabasePurchaserListRepository(auth.client));
  }, [auth.client]);
  const [refreshIndex, setRefreshIndex] = useState(0);
  const [items, setItems] = useState<readonly PurchaseListItemRecord[]>([]);
  const [drafts, setDrafts] = useState<Record<string, ProgressDraft>>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submittingItemId, setSubmittingItemId] = useState<string | null>(null);

  useEffect(() => {
    if (!canUsePurchaserList || !organizationId || !templeId || !purchaserUserId || !service) {
      setItems([]);
      setDrafts({});
      return;
    }

    let isActive = true;
    const currentOrganizationId = organizationId;
    const currentPurchaserUserId = purchaserUserId;
    const currentService = service;
    const currentTempleId = templeId;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const nextItems = await currentService.listAssignedPurchaseListItems({
          organizationId: currentOrganizationId,
          purchaserUserId: currentPurchaserUserId,
          templeId: currentTempleId
        });

        if (isActive) {
          setItems(nextItems);
          setDrafts(Object.fromEntries(nextItems.map((item) => [item.id, createDraft(item)])));
          setIsLoading(false);
        }
      } catch (loadError) {
        if (isActive) {
          setError(
            loadError instanceof Error ? loadError.message : "Purchaser list failed to load."
          );
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      isActive = false;
    };
  }, [canUsePurchaserList, organizationId, purchaserUserId, refreshIndex, service, templeId]);

  function refresh() {
    setRefreshIndex((currentIndex) => currentIndex + 1);
  }

  function updateDraft(itemId: string, patch: Partial<ProgressDraft>) {
    setDrafts((currentDrafts) => ({
      ...currentDrafts,
      [itemId]: {
        ...(currentDrafts[itemId] ?? {
          notes: "",
          purchaseDate: "",
          purchasedQuantityText: "",
          totalCostText: "",
          unitCostText: ""
        }),
        ...patch
      }
    }));
  }

  async function updateProgress(itemId: string, status: PurchaseListItemProgressStatus) {
    const draft = drafts[itemId];

    if (
      submitLock.current ||
      submittingItemId ||
      !canUpdatePurchases ||
      !organizationId ||
      !templeId ||
      !procurementActor ||
      procurementActor.type !== "user" ||
      !service ||
      !draft
    ) {
      return;
    }

    submitLock.current = true;
    setError(null);
    setSubmittingItemId(itemId);

    try {
      await service.updatePurchaseListItemProgress({
        itemId,
        notes: draft.notes,
        organizationId,
        purchaseDate: draft.purchaseDate,
        purchasedBy: procurementActor,
        purchasedQuantity: optionalNumber(draft.purchasedQuantityText),
        status,
        templeId,
        totalCost: optionalNumber(draft.totalCostText),
        unitCost: optionalNumber(draft.unitCostText)
      });

      setSubmittingItemId(null);
      refresh();
    } catch (updateError) {
      setError(
        updateError instanceof Error ? updateError.message : "Purchase progress update failed."
      );
      setSubmittingItemId(null);
    } finally {
      submitLock.current = false;
    }
  }

  return {
    canUpdatePurchases,
    canUsePurchaserList,
    drafts,
    error,
    isLoading,
    items,
    setDraftNotes(itemId: string, notes: string) {
      updateDraft(itemId, { notes });
    },
    setDraftPurchaseDate(itemId: string, purchaseDate: string) {
      updateDraft(itemId, { purchaseDate });
    },
    setDraftPurchasedQuantity(itemId: string, purchasedQuantityText: string) {
      updateDraft(itemId, { purchasedQuantityText });
    },
    setDraftTotalCost(itemId: string, totalCostText: string) {
      updateDraft(itemId, { totalCostText });
    },
    setDraftUnitCost(itemId: string, unitCostText: string) {
      updateDraft(itemId, { unitCostText });
    },
    submittingItemId,
    updateProgress
  };
}
