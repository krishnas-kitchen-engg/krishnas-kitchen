import { useEffect, useMemo, useRef, useState } from "react";

import { useInventoryActor, useOptionalInventoryServices } from "@/domains/inventory";
import {
  createHttpPurchaseReceiptOcrRepository,
  createPurchaseInventoryReceivingService,
  createPurchaseReceiptOcrService,
  createPurchaseReceiptService,
  createPurchaserListService,
  createSupabasePurchaseReceiptRepository,
  createSupabasePurchaserListRepository,
  type ProcurementActor,
  type PurchaseListItemProgressStatus,
  type PurchaseListItemRecord,
  type PurchaseReceiptOcrResult
} from "@/domains/procurement";
import { hasPermission, useAuth } from "@/features/auth";

import type { InventoryCatalogLocation } from "@/domains/inventory";

type ProgressDraft = {
  receiveLocationId: string;
  receiptFile: File | null;
  notes: string;
  purchaseDate: string;
  purchasedQuantityText: string;
  totalCostText: string;
  unitCostText: string;
};

type ReceiptOcrState = {
  error: string | null;
  isParsing: boolean;
  result: PurchaseReceiptOcrResult | null;
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
    receiveLocationId: "",
    receiptFile: null,
    totalCostText: item.totalCost ? String(item.totalCost) : "",
    unitCostText: item.unitCost ? String(item.unitCost) : ""
  };
}

function optionalNumber(value: string): number | null {
  const trimmedValue = value.trim();

  return trimmedValue ? Number(trimmedValue) : null;
}

function createEmptyReceiptOcrState(): ReceiptOcrState {
  return {
    error: null,
    isParsing: false,
    result: null
  };
}

function buildOcrNotes(result: PurchaseReceiptOcrResult): string {
  const parts = [
    result.merchantName ? `Merchant: ${result.merchantName}` : null,
    result.lines.length > 0
      ? `OCR lines: ${result.lines
          .slice(0, 5)
          .map((line) => line.description)
          .join("; ")}`
      : null,
    result.warnings.length > 0 ? `OCR warnings: ${result.warnings.join("; ")}` : null
  ].filter(Boolean);

  return parts.join("\n");
}

export function usePurchaserList() {
  const auth = useAuth();
  const inventoryActor = useInventoryActor();
  const inventoryServices = useOptionalInventoryServices();
  const catalogQueries = inventoryServices?.catalogQueries ?? null;
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
  const canUploadReceipts = hasPermission(auth.permissions, "procurement.receipts.upload");
  const canReceiveInventory = hasPermission(auth.permissions, "inventory.receive");
  const submitLock = useRef(false);
  const service = useMemo(() => {
    if (!auth.client) {
      return null;
    }

    return createPurchaserListService(createSupabasePurchaserListRepository(auth.client));
  }, [auth.client]);
  const receiptService = useMemo(() => {
    if (!auth.client) {
      return null;
    }

    return createPurchaseReceiptService(createSupabasePurchaseReceiptRepository(auth.client));
  }, [auth.client]);
  const receiptOcrService = useMemo(
    () =>
      createPurchaseReceiptOcrService(
        createHttpPurchaseReceiptOcrRepository({
          accessToken: auth.session?.access_token ?? null
        })
      ),
    [auth.session?.access_token]
  );
  const receivingService = useMemo(() => {
    if (!auth.client || !inventoryServices) {
      return null;
    }

    return createPurchaseInventoryReceivingService({
      inventoryService: inventoryServices.inventory,
      repository: createSupabasePurchaserListRepository(auth.client)
    });
  }, [auth.client, inventoryServices]);
  const [refreshIndex, setRefreshIndex] = useState(0);
  const [items, setItems] = useState<readonly PurchaseListItemRecord[]>([]);
  const [locations, setLocations] = useState<readonly InventoryCatalogLocation[]>([]);
  const [drafts, setDrafts] = useState<Record<string, ProgressDraft>>({});
  const [receiptOcr, setReceiptOcr] = useState<Record<string, ReceiptOcrState>>({});
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
          setReceiptOcr(
            Object.fromEntries(nextItems.map((item) => [item.id, createEmptyReceiptOcrState()]))
          );
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
          receiveLocationId: "",
          receiptFile: null,
          totalCostText: "",
          unitCostText: ""
        }),
        ...patch
      }
    }));
  }

  function updateReceiptOcr(itemId: string, patch: Partial<ReceiptOcrState>) {
    setReceiptOcr((currentState) => ({
      ...currentState,
      [itemId]: {
        ...(currentState[itemId] ?? createEmptyReceiptOcrState()),
        ...patch
      }
    }));
  }

  async function parseReceipt(itemId: string) {
    const draft = drafts[itemId];

    if (!draft?.receiptFile || receiptOcr[itemId]?.isParsing) {
      return;
    }

    updateReceiptOcr(itemId, {
      error: null,
      isParsing: true,
      result: null
    });

    try {
      const result = await receiptOcrService.parseReceiptImage({ file: draft.receiptFile });

      updateDraft(itemId, {
        notes: draft.notes.trim() ? draft.notes : buildOcrNotes(result),
        purchaseDate: draft.purchaseDate || result.purchaseDate || "",
        totalCostText:
          draft.totalCostText || result.totalCost === null || result.totalCost === undefined
            ? draft.totalCostText
            : String(result.totalCost)
      });
      updateReceiptOcr(itemId, {
        error: null,
        isParsing: false,
        result
      });
    } catch (parseError) {
      updateReceiptOcr(itemId, {
        error: parseError instanceof Error ? parseError.message : "Receipt OCR failed.",
        isParsing: false,
        result: null
      });
    }
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

  useEffect(() => {
    if (!organizationId || !templeId) {
      setLocations([]);
      return;
    }

    let isActive = true;
    const currentOrganizationId = organizationId;
    const currentTempleId = templeId;

    async function loadLocations() {
      try {
        if (!catalogQueries) {
          setLocations([]);
          return;
        }

        const nextLocations = await catalogQueries.listActiveLocations({
          limit: 50,
          organizationId: currentOrganizationId,
          templeId: currentTempleId
        });

        if (isActive) {
          setLocations(nextLocations);
        }
      } catch (loadError) {
        if (isActive) {
          setError(
            loadError instanceof Error ? loadError.message : "Inventory locations failed to load."
          );
          setLocations([]);
        }
      }
    }

    void loadLocations();

    return () => {
      isActive = false;
    };
  }, [catalogQueries, organizationId, templeId]);

  async function receiveIntoInventory(itemId: string) {
    const draft = drafts[itemId];

    if (
      submitLock.current ||
      submittingItemId ||
      !canReceiveInventory ||
      !organizationId ||
      !templeId ||
      !procurementActor ||
      procurementActor.type !== "user" ||
      !receivingService ||
      !draft?.receiveLocationId
    ) {
      return;
    }

    submitLock.current = true;
    setError(null);
    setSubmittingItemId(`receive:${itemId}`);

    try {
      await receivingService.receivePurchasedItem({
        itemId,
        locationId: draft.receiveLocationId,
        notes: draft.notes,
        organizationId,
        receivedBy: procurementActor,
        templeId
      });

      setSubmittingItemId(null);
      refresh();
    } catch (receiveError) {
      setError(receiveError instanceof Error ? receiveError.message : "Purchase receiving failed.");
      setSubmittingItemId(null);
    } finally {
      submitLock.current = false;
    }
  }

  async function uploadReceipt(itemId: string) {
    const draft = drafts[itemId];

    if (
      submitLock.current ||
      submittingItemId ||
      !canUploadReceipts ||
      !organizationId ||
      !templeId ||
      !procurementActor ||
      procurementActor.type !== "user" ||
      !receiptService ||
      !draft?.receiptFile
    ) {
      return;
    }

    submitLock.current = true;
    setError(null);
    setSubmittingItemId(`receipt:${itemId}`);

    try {
      await receiptService.uploadPurchaseReceipt({
        file: draft.receiptFile,
        itemId,
        notes: draft.notes,
        organizationId,
        purchaseDate: draft.purchaseDate,
        templeId,
        totalCost: optionalNumber(draft.totalCostText),
        uploadedBy: procurementActor
      });

      setSubmittingItemId(null);
      refresh();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Receipt upload failed.");
      setSubmittingItemId(null);
    } finally {
      submitLock.current = false;
    }
  }

  return {
    canUpdatePurchases,
    canUploadReceipts,
    canReceiveInventory,
    canUsePurchaserList,
    drafts,
    error,
    isLoading,
    items,
    locations,
    parseReceipt,
    receiveIntoInventory,
    receiptOcr,
    setDraftNotes(itemId: string, notes: string) {
      updateDraft(itemId, { notes });
    },
    setDraftPurchaseDate(itemId: string, purchaseDate: string) {
      updateDraft(itemId, { purchaseDate });
    },
    setDraftPurchasedQuantity(itemId: string, purchasedQuantityText: string) {
      updateDraft(itemId, { purchasedQuantityText });
    },
    setDraftReceiptFile(itemId: string, receiptFile: File | null) {
      updateDraft(itemId, { receiptFile });
    },
    setDraftReceiveLocation(itemId: string, receiveLocationId: string) {
      updateDraft(itemId, { receiveLocationId });
    },
    setDraftTotalCost(itemId: string, totalCostText: string) {
      updateDraft(itemId, { totalCostText });
    },
    setDraftUnitCost(itemId: string, unitCostText: string) {
      updateDraft(itemId, { unitCostText });
    },
    submittingItemId,
    uploadReceipt,
    updateProgress
  };
}
