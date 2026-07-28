import { useEffect, useMemo, useRef, useState } from "react";

import { useInventoryActor } from "@/domains/inventory";
import {
  createPurchaseReceiptReviewService,
  createSupabasePurchaseReceiptRepository,
  type ProcurementActor,
  type PurchaseReceiptRecord,
  type PurchaseReceiptReviewDecision
} from "@/domains/procurement";
import { hasPermission, useAuth } from "@/features/auth";

type ReceiptReviewDraft = {
  notes: string;
  status: PurchaseReceiptReviewDecision;
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

function initialDraft(receipt: PurchaseReceiptRecord): ReceiptReviewDraft {
  return {
    notes: receipt.financeReviewNotes ?? "",
    status: receipt.status === "uploaded" ? "matched" : receipt.status
  };
}

export function usePurchaseReceiptReview() {
  const auth = useAuth();
  const inventoryActor = useInventoryActor();
  const procurementActor = useMemo(() => toProcurementActor(inventoryActor), [inventoryActor]);
  const organizationId = auth.currentOrganization?.id;
  const templeId = auth.currentTemple?.id;
  const canReviewReceipts = hasPermission(auth.permissions, "procurement.receipts.review");
  const submitLock = useRef(false);
  const service = useMemo(() => {
    if (!auth.client) {
      return null;
    }

    return createPurchaseReceiptReviewService(createSupabasePurchaseReceiptRepository(auth.client));
  }, [auth.client]);
  const [drafts, setDrafts] = useState<Record<string, ReceiptReviewDraft>>({});
  const [error, setError] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [receipts, setReceipts] = useState<readonly PurchaseReceiptRecord[]>([]);
  const [refreshIndex, setRefreshIndex] = useState(0);
  const [submittingReceiptId, setSubmittingReceiptId] = useState<string | null>(null);

  useEffect(() => {
    if (!canReviewReceipts || !organizationId || !templeId || !service) {
      setDrafts({});
      setImageUrls({});
      setReceipts([]);
      return;
    }

    let isActive = true;
    const currentService = service;
    const scope = {
      organizationId,
      templeId
    };

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const nextReceipts = await currentService.listPurchaseReceipts(scope);
        const nextImageUrlEntries = await Promise.all(
          nextReceipts.map(async (receipt) => {
            try {
              return [
                receipt.id,
                await currentService.createReceiptImageUrl(receipt.receiptImagePath)
              ] as const;
            } catch {
              return [receipt.id, ""] as const;
            }
          })
        );
        const nextImageUrls = nextImageUrlEntries.reduce<Record<string, string>>(
          (urls, [receiptId, imageUrl]) => ({
            ...urls,
            [receiptId]: imageUrl
          }),
          {}
        );

        if (isActive) {
          setReceipts(nextReceipts);
          setDrafts(
            Object.fromEntries(nextReceipts.map((receipt) => [receipt.id, initialDraft(receipt)]))
          );
          setImageUrls(nextImageUrls);
          setIsLoading(false);
        }
      } catch (loadError) {
        if (isActive) {
          setError(
            loadError instanceof Error ? loadError.message : "Receipt review failed to load."
          );
          setImageUrls({});
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      isActive = false;
    };
  }, [canReviewReceipts, organizationId, refreshIndex, service, templeId]);

  function refresh() {
    setRefreshIndex((currentIndex) => currentIndex + 1);
  }

  function updateDraft(receiptId: string, patch: Partial<ReceiptReviewDraft>) {
    setDrafts((currentDrafts) => ({
      ...currentDrafts,
      [receiptId]: {
        ...(currentDrafts[receiptId] ?? {
          notes: "",
          status: "matched"
        }),
        ...patch
      }
    }));
  }

  async function reviewReceipt(receiptId: string) {
    const draft = drafts[receiptId];

    if (
      submitLock.current ||
      submittingReceiptId ||
      !canReviewReceipts ||
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
    setSubmittingReceiptId(receiptId);

    try {
      await service.reviewPurchaseReceipt({
        notes: draft.notes,
        organizationId,
        receiptId,
        reviewedBy: procurementActor,
        status: draft.status,
        templeId
      });

      setSubmittingReceiptId(null);
      refresh();
    } catch (reviewError) {
      setError(reviewError instanceof Error ? reviewError.message : "Receipt review failed.");
      setSubmittingReceiptId(null);
    } finally {
      submitLock.current = false;
    }
  }

  return {
    canReviewReceipts,
    drafts,
    error,
    imageUrls,
    isLoading,
    receipts,
    reviewReceipt,
    setDraftNotes(receiptId: string, notes: string) {
      updateDraft(receiptId, { notes });
    },
    setDraftStatus(receiptId: string, status: PurchaseReceiptReviewDecision) {
      updateDraft(receiptId, { status });
    },
    submittingReceiptId
  };
}
