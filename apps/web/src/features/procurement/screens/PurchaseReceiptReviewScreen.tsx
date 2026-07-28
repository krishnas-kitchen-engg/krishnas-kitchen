import type { PurchaseReceiptReviewDecision } from "@/domains/procurement";

import { usePurchaseReceiptReview } from "../hooks/usePurchaseReceiptReview";

const reviewStatuses: { label: string; value: PurchaseReceiptReviewDecision }[] = [
  {
    label: "Matched",
    value: "matched"
  },
  {
    label: "Partially matched",
    value: "partially_matched"
  },
  {
    label: "Needs review",
    value: "needs_review"
  },
  {
    label: "Reconciled",
    value: "reconciled"
  },
  {
    label: "Rejected",
    value: "rejected"
  }
];

function formatMoney(value?: number | null) {
  if (value === null || value === undefined) {
    return "Cost not entered";
  }

  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    style: "currency"
  }).format(value);
}

function statusClass(status: string) {
  if (status === "reconciled" || status === "matched") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if (status === "partially_matched" || status === "needs_review") {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  if (status === "rejected") {
    return "border-red-200 bg-red-50 text-red-800";
  }

  return "border-stone-300 bg-stone-100 text-stone-700";
}

export function PurchaseReceiptReviewScreen() {
  const receiptReview = usePurchaseReceiptReview();

  if (!receiptReview.canReviewReceipts) {
    return (
      <section className="rounded-md border border-stone-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-stone-950">Receipt review unavailable</h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Your current session does not include permission to review purchase receipts.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div>
        <p className="text-sm font-semibold uppercase text-brand-800">Finance review</p>
        <h1 className="mt-1 text-2xl font-semibold text-stone-950">Receipt review</h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Match uploaded purchaser receipts against purchase activity and record finance notes.
        </p>
      </div>

      {receiptReview.error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800">
          {receiptReview.error}
        </div>
      ) : null}

      {receiptReview.isLoading ? (
        <p className="rounded-md border border-stone-200 bg-white p-4 text-sm text-stone-600">
          Loading receipt evidence...
        </p>
      ) : receiptReview.receipts.length > 0 ? (
        <section className="space-y-3">
          {receiptReview.receipts.map((receipt) => {
            const draft = receiptReview.drafts[receipt.id];
            const imageUrl = receiptReview.imageUrls[receipt.id];
            const isSubmitting = receiptReview.submittingReceiptId === receipt.id;

            return (
              <article
                className="space-y-4 rounded-md border border-stone-200 bg-white p-4"
                key={receipt.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-stone-950">
                      {formatMoney(receipt.totalCost)}
                    </h2>
                    <p className="mt-1 text-sm text-stone-600">
                      {receipt.purchaseDate ?? "Purchase date not entered"}
                    </p>
                  </div>
                  <span
                    className={`rounded-md border px-2 py-1 text-xs font-semibold ${statusClass(receipt.status)}`}
                  >
                    {receipt.status.replaceAll("_", " ")}
                  </span>
                </div>

                {imageUrl ? (
                  <a
                    className="block overflow-hidden rounded-md border border-stone-200 bg-stone-50"
                    href={imageUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <img
                      alt="Purchase receipt evidence"
                      className="max-h-72 w-full object-contain"
                      src={imageUrl}
                    />
                  </a>
                ) : (
                  <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                    Receipt image link is unavailable. Storage path: {receipt.receiptImagePath}
                  </p>
                )}

                <dl className="grid grid-cols-1 gap-2 text-sm text-stone-700">
                  <div className="rounded-md bg-stone-50 p-3">
                    <dt className="font-semibold text-stone-950">Purchaser</dt>
                    <dd className="mt-1 break-all">{receipt.purchaserUserId}</dd>
                  </div>
                  <div className="rounded-md bg-stone-50 p-3">
                    <dt className="font-semibold text-stone-950">Purchase list</dt>
                    <dd className="mt-1 break-all">{receipt.purchaseListId ?? "Not linked"}</dd>
                  </div>
                </dl>

                <label className="block text-sm font-medium text-stone-800">
                  Finance status
                  <select
                    className="mt-2 min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-base text-stone-950"
                    disabled={isSubmitting}
                    onChange={(event) =>
                      receiptReview.setDraftStatus(
                        receipt.id,
                        event.target.value as PurchaseReceiptReviewDecision
                      )
                    }
                    value={draft?.status ?? "matched"}
                  >
                    {reviewStatuses.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm font-medium text-stone-800">
                  Finance notes
                  <textarea
                    className="mt-2 min-h-20 w-full rounded-md border border-stone-300 px-3 py-2 text-base text-stone-950"
                    disabled={isSubmitting}
                    maxLength={500}
                    onChange={(event) =>
                      receiptReview.setDraftNotes(receipt.id, event.target.value)
                    }
                    placeholder="Card statement match, missing line item, duplicate receipt..."
                    value={draft?.notes ?? ""}
                  />
                </label>

                {receipt.reviewedAt ? (
                  <p className="text-sm text-stone-600">
                    Last reviewed {new Date(receipt.reviewedAt).toLocaleString()}
                  </p>
                ) : null}

                <button
                  className="min-h-11 w-full rounded-md bg-brand-900 px-3 text-sm font-semibold text-white disabled:bg-stone-300"
                  disabled={isSubmitting}
                  onClick={() => {
                    void receiptReview.reviewReceipt(receipt.id);
                  }}
                  type="button"
                >
                  {isSubmitting ? "Saving review..." : "Save review"}
                </button>
              </article>
            );
          })}
        </section>
      ) : (
        <p className="rounded-md border border-stone-200 bg-white p-4 text-sm text-stone-600">
          No purchase receipts have been uploaded yet.
        </p>
      )}
    </section>
  );
}
