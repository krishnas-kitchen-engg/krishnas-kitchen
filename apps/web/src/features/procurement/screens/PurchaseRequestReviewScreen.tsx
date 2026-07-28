import type { ItemUnit } from "@krishnas-kitchen/types";

import { usePurchaseRequestReview } from "../hooks/usePurchaseRequestReview";

function formatRequestItem(request: {
  item:
    | { itemId: string; type: "existing_item" }
    | { suggestedName: string; type: "new_item_suggestion" };
}) {
  return request.item.type === "existing_item" ? request.item.itemId : request.item.suggestedName;
}

export function PurchaseRequestReviewScreen() {
  const review = usePurchaseRequestReview();

  if (!review.canReviewRequests) {
    return (
      <section className="rounded-md border border-stone-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-stone-950">Request review unavailable</h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Your current session does not include permission to review purchase requests.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div>
        <p className="text-sm font-semibold uppercase text-brand-800">Approver view</p>
        <h1 className="mt-1 text-2xl font-semibold text-stone-950">Review purchase requests</h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Confirm requested items before they become part of a purchaser list.
        </p>
      </div>

      {review.error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800">
          {review.error}
        </div>
      ) : null}

      <section className="space-y-4 rounded-md border border-stone-200 bg-white p-4">
        <div>
          <p className="text-xs font-semibold uppercase text-stone-500">Manual publish</p>
          <h2 className="mt-1 text-lg font-semibold text-stone-950">Approved requests</h2>
          <p className="mt-1 text-sm text-stone-600">
            {review.approvedRequests.length} request
            {review.approvedRequests.length === 1 ? "" : "s"} ready for the next purchaser list.
          </p>
        </div>
        {review.approvedRequests.length > 0 ? (
          <div className="space-y-3">
            {review.approvedRequests.map((request) => {
              const draft = review.drafts[request.id];
              const isUpdating = review.submittingRequestId === `approved:${request.id}`;
              const isRemoving = review.submittingRequestId === `remove:${request.id}`;

              return (
                <article
                  className="rounded-md border border-stone-200 bg-stone-50 p-3"
                  key={request.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-stone-950">
                        {formatRequestItem(request)}
                      </h3>
                      <p className="mt-1 text-xs text-stone-600">Approved for publish queue</p>
                    </div>
                    <span className="rounded-md border border-green-200 bg-green-50 px-2 py-1 text-xs font-semibold text-green-800">
                      approved
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <label className="block text-sm font-medium text-stone-800">
                      Quantity
                      <input
                        className="mt-2 min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-base text-stone-950"
                        inputMode="decimal"
                        onChange={(event) =>
                          review.setDraftQuantity(request.id, event.target.value)
                        }
                        type="number"
                        value={draft?.quantityText ?? ""}
                      />
                    </label>
                    <label className="block text-sm font-medium text-stone-800">
                      Unit
                      <select
                        className="mt-2 min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-base text-stone-950"
                        onChange={(event) =>
                          review.setDraftUnit(request.id, event.target.value as ItemUnit | "")
                        }
                        value={draft?.unit ?? ""}
                      >
                        <option value="">Unit</option>
                        {review.units.map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <label className="mt-3 block text-sm font-medium text-stone-800">
                    Notes
                    <textarea
                      className="mt-2 min-h-16 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base text-stone-950"
                      onChange={(event) => review.setDraftNotes(request.id, event.target.value)}
                      value={draft?.notes ?? ""}
                    />
                  </label>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      className="min-h-11 rounded-md bg-brand-900 px-3 text-sm font-semibold text-white disabled:bg-stone-300"
                      disabled={isUpdating || isRemoving || !draft?.quantityText || !draft?.unit}
                      onClick={() => {
                        void review.updateApprovedRequest(request.id);
                      }}
                      type="button"
                    >
                      {isUpdating ? "Saving..." : "Save changes"}
                    </button>
                    <button
                      className="min-h-11 rounded-md border border-red-200 bg-red-50 px-3 text-sm font-semibold text-red-800 disabled:text-red-300"
                      disabled={isUpdating || isRemoving}
                      onClick={() => {
                        void review.removeApprovedRequest(request.id);
                      }}
                      type="button"
                    >
                      {isRemoving ? "Removing..." : "Remove"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}
        <label className="block text-sm font-medium text-stone-800">
          Purchase list name
          <input
            className="mt-2 min-h-11 w-full rounded-md border border-stone-300 px-3 text-base text-stone-950"
            onChange={(event) => review.setListName(event.target.value)}
            value={review.listName}
          />
        </label>
        <button
          className="min-h-11 w-full rounded-md bg-brand-900 px-4 text-sm font-semibold text-white disabled:bg-stone-300"
          disabled={
            review.approvedRequests.length === 0 ||
            review.submittingRequestId === "publish" ||
            !review.listName.trim()
          }
          onClick={() => {
            void review.publishApprovedRequests();
          }}
          type="button"
        >
          {review.submittingRequestId === "publish" ? "Publishing..." : "Publish purchase list"}
        </button>
      </section>

      {review.isLoading ? (
        <p className="rounded-md border border-stone-200 bg-white p-4 text-sm text-stone-600">
          Loading requests for review...
        </p>
      ) : review.reviewableRequests.length > 0 ? (
        <section className="space-y-3">
          {review.reviewableRequests.map((request) => {
            const draft = review.drafts[request.id];
            const isSubmitting = review.submittingRequestId === request.id;

            return (
              <article
                className="space-y-4 rounded-md border border-stone-200 bg-white p-4"
                key={request.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-stone-950">
                      {formatRequestItem(request)}
                    </h2>
                    <p className="mt-1 text-sm text-stone-600">
                      Requested: {request.quantity} {request.unit}
                    </p>
                  </div>
                  <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800">
                    {request.status.replaceAll("_", " ")}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <label className="block text-sm font-medium text-stone-800">
                    Approved quantity
                    <input
                      className="mt-2 min-h-11 w-full rounded-md border border-stone-300 px-3 text-base text-stone-950"
                      inputMode="decimal"
                      onChange={(event) => review.setDraftQuantity(request.id, event.target.value)}
                      type="number"
                      value={draft?.quantityText ?? ""}
                    />
                  </label>
                  <label className="block text-sm font-medium text-stone-800">
                    Unit
                    <select
                      className="mt-2 min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-base text-stone-950"
                      onChange={(event) =>
                        review.setDraftUnit(request.id, event.target.value as ItemUnit | "")
                      }
                      value={draft?.unit ?? ""}
                    >
                      <option value="">Unit</option>
                      {review.units.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="block text-sm font-medium text-stone-800">
                  Review notes
                  <textarea
                    className="mt-2 min-h-20 w-full rounded-md border border-stone-300 px-3 py-2 text-base text-stone-950"
                    onChange={(event) => review.setDraftNotes(request.id, event.target.value)}
                    placeholder="Approval note, clarification needed, or rejection reason"
                    value={draft?.notes ?? ""}
                  />
                </label>

                <div className="grid gap-2 sm:grid-cols-3">
                  <button
                    className="min-h-11 rounded-md bg-brand-900 px-3 text-sm font-semibold text-white disabled:bg-stone-300"
                    disabled={isSubmitting}
                    onClick={() => {
                      void review.reviewRequest(request.id, "approved");
                    }}
                    type="button"
                  >
                    {isSubmitting ? "Saving..." : "Approve"}
                  </button>
                  <button
                    className="min-h-11 rounded-md border border-stone-300 px-3 text-sm font-semibold text-stone-800 disabled:text-stone-400"
                    disabled={isSubmitting}
                    onClick={() => {
                      void review.reviewRequest(request.id, "needs_clarification");
                    }}
                    type="button"
                  >
                    Clarify
                  </button>
                  <button
                    className="min-h-11 rounded-md border border-red-200 bg-red-50 px-3 text-sm font-semibold text-red-800 disabled:text-red-300"
                    disabled={isSubmitting}
                    onClick={() => {
                      void review.reviewRequest(request.id, "rejected");
                    }}
                    type="button"
                  >
                    Reject
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <p className="rounded-md border border-stone-200 bg-white p-4 text-sm text-stone-600">
          No purchase requests are waiting for review.
        </p>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-stone-950">Published lists</h2>
        {review.purchaseLists.length > 0 ? (
          review.purchaseLists.map((list) => (
            <article className="rounded-md border border-stone-200 bg-white p-4" key={list.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-stone-950">{list.name}</h3>
                  <p className="mt-1 text-sm text-stone-600">
                    {list.publishedAt
                      ? new Date(list.publishedAt).toLocaleString()
                      : "Not published"}
                  </p>
                </div>
                <span className="rounded-md border border-green-200 bg-green-50 px-2 py-1 text-xs font-semibold text-green-800">
                  {list.status.replaceAll("_", " ")}
                </span>
              </div>
            </article>
          ))
        ) : (
          <p className="rounded-md border border-stone-200 bg-white p-4 text-sm text-stone-600">
            No purchase lists have been published yet.
          </p>
        )}
      </section>
    </section>
  );
}
