import type { ItemUnit } from "@krishnas-kitchen/types";

import { usePurchaseRequests } from "../hooks/usePurchaseRequests";

function formatRequestItem(request: {
  item:
    | { itemId: string; type: "existing_item" }
    | { suggestedName: string; type: "new_item_suggestion" };
}) {
  return request.item.type === "existing_item" ? request.item.itemId : request.item.suggestedName;
}

export function PurchaseRequestsScreen() {
  const requests = usePurchaseRequests();

  if (!requests.canCreateRequests) {
    return (
      <section className="rounded-md border border-stone-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-stone-950">Purchase requests unavailable</h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Your current session does not include permission to request items for purchase.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div>
        <p className="text-sm font-semibold uppercase text-brand-800">Purchase requests</p>
        <h1 className="mt-1 text-2xl font-semibold text-stone-950">Request items to buy</h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Search the catalog first. Suggest a new item only when the item is truly missing.
        </p>
      </div>

      {requests.error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800">
          {requests.error}
        </div>
      ) : null}

      <section className="space-y-4 rounded-md border border-stone-200 bg-white p-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            className={`min-h-11 rounded-md border px-3 text-sm font-semibold ${
              requests.form.mode === "existing_item"
                ? "border-brand-900 bg-brand-900 text-white"
                : "border-stone-300 text-stone-800"
            }`}
            onClick={() => requests.setMode("existing_item")}
            type="button"
          >
            Existing item
          </button>
          <button
            className={`min-h-11 rounded-md border px-3 text-sm font-semibold ${
              requests.form.mode === "new_item_suggestion"
                ? "border-brand-900 bg-brand-900 text-white"
                : "border-stone-300 text-stone-800"
            }`}
            onClick={() => requests.setMode("new_item_suggestion")}
            type="button"
          >
            Suggest new
          </button>
        </div>

        {requests.form.mode === "existing_item" ? (
          <>
            <label className="block text-sm font-medium text-stone-800">
              Search item
              <input
                className="mt-2 min-h-11 w-full rounded-md border border-stone-300 px-3 text-base text-stone-950"
                onChange={(event) => requests.setSearchText(event.target.value)}
                placeholder="Rice, milk, vegetables..."
                value={requests.form.searchText}
              />
            </label>
            <label className="block text-sm font-medium text-stone-800">
              Select item
              <select
                className="mt-2 min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-base text-stone-950"
                onChange={(event) => requests.setItemId(event.target.value)}
                value={requests.form.itemId}
              >
                <option value="">Choose item from search results</option>
                {requests.catalogItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.defaultUnit})
                  </option>
                ))}
              </select>
            </label>
          </>
        ) : (
          <>
            <label className="block text-sm font-medium text-stone-800">
              New item name
              <input
                className="mt-2 min-h-11 w-full rounded-md border border-stone-300 px-3 text-base text-stone-950"
                onChange={(event) => requests.setSuggestedName(event.target.value)}
                placeholder="Hing, curry leaves, jaggery..."
                value={requests.form.suggestedName}
              />
            </label>
            <label className="block text-sm font-medium text-stone-800">
              Category
              <input
                className="mt-2 min-h-11 w-full rounded-md border border-stone-300 px-3 text-base text-stone-950"
                onChange={(event) => requests.setCategory(event.target.value)}
                placeholder="Spices, produce, dairy..."
                value={requests.form.category}
              />
            </label>
          </>
        )}

        <div className="grid grid-cols-2 gap-2">
          <label className="block text-sm font-medium text-stone-800">
            Quantity
            <input
              className="mt-2 min-h-11 w-full rounded-md border border-stone-300 px-3 text-base text-stone-950"
              inputMode="decimal"
              onChange={(event) => requests.setQuantityText(event.target.value)}
              type="number"
              value={requests.form.quantityText}
            />
          </label>
          <label className="block text-sm font-medium text-stone-800">
            Unit
            <select
              className="mt-2 min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-base text-stone-950"
              onChange={(event) => requests.setUnit(event.target.value as ItemUnit | "")}
              value={requests.form.unit}
            >
              <option value="">Unit</option>
              {requests.units.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block text-sm font-medium text-stone-800">
          Needed by
          <input
            className="mt-2 min-h-11 w-full rounded-md border border-stone-300 px-3 text-base text-stone-950"
            onChange={(event) => requests.setNeededBy(event.target.value)}
            type="date"
            value={requests.form.neededBy}
          />
        </label>

        <label className="block text-sm font-medium text-stone-800">
          Notes
          <textarea
            className="mt-2 min-h-20 w-full rounded-md border border-stone-300 px-3 py-2 text-base text-stone-950"
            onChange={(event) => requests.setNotes(event.target.value)}
            placeholder="Why it is needed, preferred brand, urgency..."
            value={requests.form.notes}
          />
        </label>

        <button
          className="min-h-11 w-full rounded-md bg-brand-900 px-4 text-sm font-semibold text-white disabled:bg-stone-300"
          disabled={!requests.canSubmit}
          onClick={() => {
            void requests.submitRequest();
          }}
          type="button"
        >
          {requests.isSubmitting ? "Submitting..." : "Submit request"}
        </button>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-stone-950">My requests</h2>
        {requests.isLoading ? (
          <p className="rounded-md border border-stone-200 bg-white p-4 text-sm text-stone-600">
            Loading purchase requests...
          </p>
        ) : requests.requests.length > 0 ? (
          requests.requests.map((request) => (
            <article
              className="space-y-2 rounded-md border border-stone-200 bg-white p-4"
              key={request.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-stone-950">
                    {formatRequestItem(request)}
                  </h3>
                  <p className="mt-1 text-sm text-stone-600">
                    {request.quantity} {request.unit}
                  </p>
                </div>
                <span className="rounded-md border border-stone-300 bg-stone-100 px-2 py-1 text-xs font-semibold text-stone-700">
                  {request.status.replaceAll("_", " ")}
                </span>
              </div>
              <p className="text-sm text-stone-600">{request.notes || "No notes"}</p>
            </article>
          ))
        ) : (
          <p className="rounded-md border border-stone-200 bg-white p-4 text-sm text-stone-600">
            No purchase requests submitted yet.
          </p>
        )}
      </section>
    </section>
  );
}
