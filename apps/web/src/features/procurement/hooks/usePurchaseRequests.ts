import { useEffect, useMemo, useRef, useState } from "react";
import type { ItemUnit } from "@krishnas-kitchen/types";

import { useInventoryActor } from "@/domains/inventory";
import {
  createPurchaseRequestService,
  createSupabasePurchaseRequestCatalogRepository,
  createSupabasePurchaseRequestRepository,
  PROCUREMENT_ITEM_UNITS,
  type CatalogItemSummary,
  type ProcurementActor,
  type PurchaseRequestRecord
} from "@/domains/procurement";
import { hasPermission, useAuth } from "@/features/auth";

type RequestMode = "existing_item" | "new_item_suggestion";

type PurchaseRequestForm = {
  category: string;
  itemId: string;
  mode: RequestMode;
  neededBy: string;
  notes: string;
  quantityText: string;
  searchText: string;
  suggestedName: string;
  unit: ItemUnit | "";
};

const initialForm: PurchaseRequestForm = {
  category: "",
  itemId: "",
  mode: "existing_item",
  neededBy: "",
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

export function usePurchaseRequests() {
  const auth = useAuth();
  const inventoryActor = useInventoryActor();
  const procurementActor = useMemo(() => toProcurementActor(inventoryActor), [inventoryActor]);
  const organizationId = auth.currentOrganization?.id;
  const templeId = auth.currentTemple?.id;
  const requesterUserId = auth.profile?.id;
  const canCreateRequests = hasPermission(auth.permissions, "procurement.requests.create");
  const submitLock = useRef(false);
  const service = useMemo(() => {
    if (!auth.client) {
      return null;
    }

    return createPurchaseRequestService({
      catalogRepository: createSupabasePurchaseRequestCatalogRepository(auth.client),
      requestRepository: createSupabasePurchaseRequestRepository(auth.client)
    });
  }, [auth.client]);
  const [refreshIndex, setRefreshIndex] = useState(0);
  const [form, setForm] = useState<PurchaseRequestForm>(initialForm);
  const [catalogItems, setCatalogItems] = useState<readonly CatalogItemSummary[]>([]);
  const [requests, setRequests] = useState<readonly PurchaseRequestRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedItem = useMemo(
    () => catalogItems.find((item) => item.id === form.itemId) ?? null,
    [catalogItems, form.itemId]
  );
  const canSubmit =
    !isSubmitting &&
    Boolean(form.quantityText.trim()) &&
    Boolean(form.unit) &&
    (form.mode === "existing_item" ? Boolean(form.itemId) : Boolean(form.suggestedName.trim()));

  useEffect(() => {
    if (!canCreateRequests || !organizationId || !templeId || !requesterUserId || !service) {
      setRequests([]);
      return;
    }

    let isActive = true;
    const currentOrganizationId = organizationId;
    const currentRequesterUserId = requesterUserId;
    const currentService = service;
    const currentTempleId = templeId;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const nextRequests = await currentService.listMyPurchaseRequests({
          organizationId: currentOrganizationId,
          requesterUserId: currentRequesterUserId,
          templeId: currentTempleId
        });

        if (isActive) {
          setRequests(nextRequests);
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
  }, [canCreateRequests, organizationId, refreshIndex, requesterUserId, service, templeId]);

  useEffect(() => {
    if (!organizationId || !service || !form.searchText.trim()) {
      setCatalogItems([]);
      return;
    }

    let isActive = true;

    service
      .searchCatalogItems(organizationId, form.searchText)
      .then((items) => {
        if (isActive) {
          setCatalogItems(items);
        }
      })
      .catch((searchError) => {
        if (isActive) {
          setError(searchError instanceof Error ? searchError.message : "Item search failed.");
          setCatalogItems([]);
        }
      });

    return () => {
      isActive = false;
    };
  }, [form.searchText, organizationId, service]);

  async function submitRequest() {
    if (
      submitLock.current ||
      isSubmitting ||
      !organizationId ||
      !templeId ||
      !procurementActor ||
      !service ||
      !form.unit ||
      !canCreateRequests
    ) {
      return;
    }

    submitLock.current = true;
    setError(null);
    setIsSubmitting(true);

    try {
      await service.createPurchaseRequest({
        item:
          form.mode === "existing_item"
            ? {
                itemId: form.itemId,
                type: "existing_item"
              }
            : {
                category: form.category,
                suggestedName: form.suggestedName,
                type: "new_item_suggestion"
              },
        neededBy: form.neededBy,
        notes: form.notes,
        organizationId,
        quantity: Number(form.quantityText),
        requestedBy: procurementActor,
        templeId,
        unit: form.unit
      });

      setForm(initialForm);
      setIsSubmitting(false);
      setRefreshIndex((currentIndex) => currentIndex + 1);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Purchase request failed.");
      setIsSubmitting(false);
    } finally {
      submitLock.current = false;
    }
  }

  return {
    canCreateRequests,
    canSubmit,
    catalogItems,
    error,
    form,
    isLoading,
    isSubmitting,
    requests,
    selectedItem,
    setCategory(category: string) {
      setForm((currentForm) => ({
        ...currentForm,
        category
      }));
    },
    setItemId(itemId: string) {
      const item = catalogItems.find((candidate) => candidate.id === itemId);
      setForm((currentForm) => ({
        ...currentForm,
        itemId,
        unit: item?.defaultUnit ?? currentForm.unit
      }));
    },
    setMode(mode: RequestMode) {
      setForm((currentForm) => ({
        ...currentForm,
        mode
      }));
    },
    setNeededBy(neededBy: string) {
      setForm((currentForm) => ({
        ...currentForm,
        neededBy
      }));
    },
    setNotes(notes: string) {
      setForm((currentForm) => ({
        ...currentForm,
        notes
      }));
    },
    setQuantityText(quantityText: string) {
      setForm((currentForm) => ({
        ...currentForm,
        quantityText
      }));
    },
    setSearchText(searchText: string) {
      setForm((currentForm) => ({
        ...currentForm,
        itemId: "",
        searchText
      }));
    },
    setSuggestedName(suggestedName: string) {
      setForm((currentForm) => ({
        ...currentForm,
        suggestedName
      }));
    },
    setUnit(unit: ItemUnit | "") {
      setForm((currentForm) => ({
        ...currentForm,
        unit
      }));
    },
    submitRequest,
    units: PROCUREMENT_ITEM_UNITS
  };
}
