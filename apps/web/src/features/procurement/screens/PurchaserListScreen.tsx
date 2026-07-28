import { usePurchaserList } from "../hooks/usePurchaserList";

function formatItem(item: {
  item:
    | { itemId: string; type: "existing_item" }
    | { suggestedName: string; type: "new_item_suggestion" };
}) {
  return item.item.type === "existing_item" ? item.item.itemId : item.item.suggestedName;
}

function statusClass(status: string) {
  if (status === "received_into_inventory") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if (status === "bought") {
    return "border-green-200 bg-green-50 text-green-800";
  }

  if (status === "partially_bought") {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  if (status === "unavailable" || status === "substituted") {
    return "border-red-200 bg-red-50 text-red-800";
  }

  return "border-stone-300 bg-stone-100 text-stone-700";
}

export function PurchaserListScreen() {
  const purchaserList = usePurchaserList();

  if (!purchaserList.canUsePurchaserList) {
    return (
      <section className="rounded-md border border-stone-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-stone-950">Purchaser list unavailable</h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Your current session does not include permission to view assigned purchases.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div>
        <p className="text-sm font-semibold uppercase text-brand-800">Purchaser view</p>
        <h1 className="mt-1 text-2xl font-semibold text-stone-950">My purchase list</h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Check off assigned items as they are bought. Inventory is updated later through receiving.
        </p>
      </div>

      {purchaserList.error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800">
          {purchaserList.error}
        </div>
      ) : null}

      {purchaserList.isLoading ? (
        <p className="rounded-md border border-stone-200 bg-white p-4 text-sm text-stone-600">
          Loading assigned purchases...
        </p>
      ) : purchaserList.items.length > 0 ? (
        <section className="space-y-3">
          {purchaserList.items.map((item) => {
            const draft = purchaserList.drafts[item.id];
            const isSubmitting = purchaserList.submittingItemId === item.id;
            const isReceiveSubmitting = purchaserList.submittingItemId === `receive:${item.id}`;
            const isReceived =
              item.status === "received_into_inventory" || Boolean(item.inventoryTransactionId);
            const canReceiveItem =
              purchaserList.canReceiveInventory &&
              item.item.type === "existing_item" &&
              !isReceived &&
              (item.status === "bought" ||
                item.status === "partially_bought" ||
                item.status === "receipt_uploaded") &&
              Boolean(item.purchasedQuantity && item.purchasedQuantity > 0);

            return (
              <article
                className="space-y-4 rounded-md border border-stone-200 bg-white p-4"
                key={item.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-stone-950">{formatItem(item)}</h2>
                    <p className="mt-1 text-sm text-stone-600">
                      Need {item.approvedQuantity} {item.unit}
                    </p>
                  </div>
                  <span
                    className={`rounded-md border px-2 py-1 text-xs font-semibold ${statusClass(item.status)}`}
                  >
                    {item.status.replaceAll("_", " ")}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <label className="block text-sm font-medium text-stone-800">
                    Bought qty
                    <input
                      className="mt-2 min-h-11 w-full rounded-md border border-stone-300 px-3 text-base text-stone-950"
                      inputMode="decimal"
                      onChange={(event) =>
                        purchaserList.setDraftPurchasedQuantity(item.id, event.target.value)
                      }
                      type="number"
                      value={draft?.purchasedQuantityText ?? ""}
                    />
                  </label>
                  <label className="block text-sm font-medium text-stone-800">
                    Purchase date
                    <input
                      className="mt-2 min-h-11 w-full rounded-md border border-stone-300 px-3 text-base text-stone-950"
                      onChange={(event) =>
                        purchaserList.setDraftPurchaseDate(item.id, event.target.value)
                      }
                      type="date"
                      value={draft?.purchaseDate ?? ""}
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <label className="block text-sm font-medium text-stone-800">
                    Unit cost
                    <input
                      className="mt-2 min-h-11 w-full rounded-md border border-stone-300 px-3 text-base text-stone-950"
                      inputMode="decimal"
                      onChange={(event) =>
                        purchaserList.setDraftUnitCost(item.id, event.target.value)
                      }
                      type="number"
                      value={draft?.unitCostText ?? ""}
                    />
                  </label>
                  <label className="block text-sm font-medium text-stone-800">
                    Total cost
                    <input
                      className="mt-2 min-h-11 w-full rounded-md border border-stone-300 px-3 text-base text-stone-950"
                      inputMode="decimal"
                      onChange={(event) =>
                        purchaserList.setDraftTotalCost(item.id, event.target.value)
                      }
                      type="number"
                      value={draft?.totalCostText ?? ""}
                    />
                  </label>
                </div>

                <label className="block text-sm font-medium text-stone-800">
                  Purchaser notes
                  <textarea
                    className="mt-2 min-h-20 w-full rounded-md border border-stone-300 px-3 py-2 text-base text-stone-950"
                    onChange={(event) => purchaserList.setDraftNotes(item.id, event.target.value)}
                    placeholder="Brand, substitution, quantity notes, store issue..."
                    value={draft?.notes ?? ""}
                  />
                </label>

                <section className="space-y-3 rounded-md border border-stone-200 bg-stone-50 p-3">
                  <div>
                    <p className="text-xs font-semibold uppercase text-stone-500">Receipt</p>
                    <p className="mt-1 text-sm text-stone-600">
                      Upload a receipt photo for audit. This does not receive inventory.
                    </p>
                  </div>
                  <input
                    accept="image/jpeg,image/png,image/webp"
                    className="block w-full text-sm text-stone-700 file:mr-3 file:min-h-10 file:rounded-md file:border-0 file:bg-stone-900 file:px-3 file:text-sm file:font-semibold file:text-white"
                    onChange={(event) =>
                      purchaserList.setDraftReceiptFile(
                        item.id,
                        event.target.files?.item(0) ?? null
                      )
                    }
                    type="file"
                  />
                  <button
                    className="min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-sm font-semibold text-stone-800 disabled:text-stone-400"
                    disabled={
                      purchaserList.submittingItemId === `receipt:${item.id}` ||
                      !purchaserList.canUploadReceipts ||
                      !draft?.receiptFile
                    }
                    onClick={() => {
                      void purchaserList.uploadReceipt(item.id);
                    }}
                    type="button"
                  >
                    {purchaserList.submittingItemId === `receipt:${item.id}`
                      ? "Uploading..."
                      : "Upload receipt"}
                  </button>
                </section>

                <section className="space-y-3 rounded-md border border-brand-100 bg-brand-50 p-3">
                  <div>
                    <p className="text-xs font-semibold uppercase text-brand-800">
                      Inventory receiving
                    </p>
                    <p className="mt-1 text-sm text-stone-700">
                      Receive the purchased quantity into an active inventory location.
                    </p>
                  </div>
                  <label className="block text-sm font-medium text-stone-800">
                    Receive location
                    <select
                      className="mt-2 min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-base text-stone-950"
                      disabled={!canReceiveItem || isReceiveSubmitting}
                      onChange={(event) =>
                        purchaserList.setDraftReceiveLocation(item.id, event.target.value)
                      }
                      value={draft?.receiveLocationId ?? ""}
                    >
                      <option value="">Select location</option>
                      {purchaserList.locations.map((location) => (
                        <option key={location.id} value={location.id}>
                          {location.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  {item.item.type === "new_item_suggestion" ? (
                    <p className="text-sm text-amber-800">
                      Add this suggested item to the inventory catalog before receiving.
                    </p>
                  ) : isReceived ? (
                    <p className="text-sm text-emerald-800">
                      Received in transaction {item.inventoryTransactionId}.
                    </p>
                  ) : null}
                  <button
                    className="min-h-11 w-full rounded-md bg-brand-900 px-3 text-sm font-semibold text-white disabled:bg-stone-300"
                    disabled={!canReceiveItem || isReceiveSubmitting || !draft?.receiveLocationId}
                    onClick={() => {
                      void purchaserList.receiveIntoInventory(item.id);
                    }}
                    type="button"
                  >
                    {isReceiveSubmitting ? "Receiving..." : "Receive into inventory"}
                  </button>
                </section>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    className="min-h-11 rounded-md bg-brand-900 px-3 text-sm font-semibold text-white disabled:bg-stone-300"
                    disabled={isSubmitting || isReceived || !purchaserList.canUpdatePurchases}
                    onClick={() => {
                      void purchaserList.updateProgress(item.id, "bought");
                    }}
                    type="button"
                  >
                    Bought
                  </button>
                  <button
                    className="min-h-11 rounded-md border border-amber-300 px-3 text-sm font-semibold text-amber-800 disabled:text-stone-400"
                    disabled={isSubmitting || isReceived || !purchaserList.canUpdatePurchases}
                    onClick={() => {
                      void purchaserList.updateProgress(item.id, "partially_bought");
                    }}
                    type="button"
                  >
                    Partial
                  </button>
                  <button
                    className="min-h-11 rounded-md border border-stone-300 px-3 text-sm font-semibold text-stone-800 disabled:text-stone-400"
                    disabled={isSubmitting || isReceived || !purchaserList.canUpdatePurchases}
                    onClick={() => {
                      void purchaserList.updateProgress(item.id, "substituted");
                    }}
                    type="button"
                  >
                    Substituted
                  </button>
                  <button
                    className="min-h-11 rounded-md border border-red-200 bg-red-50 px-3 text-sm font-semibold text-red-800 disabled:text-red-300"
                    disabled={isSubmitting || isReceived || !purchaserList.canUpdatePurchases}
                    onClick={() => {
                      void purchaserList.updateProgress(item.id, "unavailable");
                    }}
                    type="button"
                  >
                    Unavailable
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <p className="rounded-md border border-stone-200 bg-white p-4 text-sm text-stone-600">
          No purchases are assigned to you yet.
        </p>
      )}
    </section>
  );
}
