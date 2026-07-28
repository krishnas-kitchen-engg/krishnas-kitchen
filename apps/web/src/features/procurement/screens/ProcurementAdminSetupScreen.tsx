import type { ItemUnit } from "@krishnas-kitchen/types";

import { useProcurementAdminSetup } from "../hooks/useProcurementAdminSetup";

function StatusBadge({ archivedAt }: { archivedAt?: string | null | undefined }) {
  const isArchived = Boolean(archivedAt);

  return (
    <span
      className={`rounded-md border px-2 py-1 text-xs font-semibold ${
        isArchived
          ? "border-stone-300 bg-stone-100 text-stone-700"
          : "border-green-200 bg-green-50 text-green-800"
      }`}
    >
      {isArchived ? "Archived" : "Active"}
    </span>
  );
}

export function ProcurementAdminSetupScreen() {
  const setup = useProcurementAdminSetup();
  const canCreateLocation = Boolean(setup.locationForm.name.trim()) && !setup.isSubmitting;
  const canCreatePreference =
    Boolean(setup.itemPreferenceForm.itemId) &&
    Boolean(setup.itemPreferenceForm.preferredPurchaseLocationId) &&
    !setup.isSubmitting;
  const itemsById = new Map(setup.items.map((item) => [item.id, item]));
  const locationsById = new Map(setup.purchaseLocations.map((location) => [location.id, location]));

  if (!setup.canManageProcurement) {
    return (
      <section className="rounded-md border border-stone-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-stone-950">Procurement setup unavailable</h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Your current session does not include procurement administration permission.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase text-brand-800">Procurement admin</p>
          <h1 className="mt-1 text-2xl font-semibold text-stone-950">Purchase setup</h1>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Configure where items are purchased before staff requests and purchaser lists go live.
          </p>
        </div>
        <button
          className="min-h-10 rounded-md border border-stone-300 px-3 text-sm font-semibold text-stone-800 disabled:text-stone-400"
          disabled={setup.isLoading}
          onClick={() => setup.refresh()}
          type="button"
        >
          {setup.isLoading ? "Refreshing" : "Refresh"}
        </button>
      </div>

      {setup.error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800">
          {setup.error}
        </div>
      ) : null}

      <section className="space-y-4 rounded-md border border-stone-200 bg-white p-4">
        <div>
          <p className="text-xs font-semibold uppercase text-stone-500">Purchase locations</p>
          <h2 className="mt-1 text-lg font-semibold text-stone-950">Add store or supplier</h2>
        </div>

        <label className="block text-sm font-medium text-stone-800">
          Name
          <input
            className="mt-2 min-h-11 w-full rounded-md border border-stone-300 px-3 text-base text-stone-950"
            onChange={(event) => setup.setLocationName(event.target.value)}
            placeholder="Costco, Restaurant Depot, Indian grocery..."
            value={setup.locationForm.name}
          />
        </label>

        <label className="block text-sm font-medium text-stone-800">
          Description
          <textarea
            className="mt-2 min-h-20 w-full rounded-md border border-stone-300 px-3 py-2 text-base text-stone-950"
            onChange={(event) => setup.setLocationDescription(event.target.value)}
            placeholder="Optional store notes"
            value={setup.locationForm.description}
          />
        </label>

        <label className="block text-sm font-medium text-stone-800">
          Default purchaser user ID
          <input
            className="mt-2 min-h-11 w-full rounded-md border border-stone-300 px-3 text-base text-stone-950"
            onChange={(event) => setup.setLocationDefaultPurchaserUserId(event.target.value)}
            placeholder="Optional until user management is connected"
            value={setup.locationForm.defaultPurchaserUserId}
          />
        </label>

        <button
          className="min-h-11 w-full rounded-md bg-brand-900 px-4 text-sm font-semibold text-white disabled:bg-stone-300"
          disabled={!canCreateLocation}
          onClick={() => {
            void setup.createPurchaseLocation();
          }}
          type="button"
        >
          {setup.isSubmitting ? "Saving..." : "Create purchase location"}
        </button>
      </section>

      <section className="space-y-4 rounded-md border border-stone-200 bg-white p-4">
        <div>
          <p className="text-xs font-semibold uppercase text-stone-500">Item preferences</p>
          <h2 className="mt-1 text-lg font-semibold text-stone-950">Tag item to purchase source</h2>
        </div>

        <label className="block text-sm font-medium text-stone-800">
          Inventory item
          <select
            className="mt-2 min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-base text-stone-950"
            onChange={(event) => setup.setItemPreferenceItemId(event.target.value)}
            value={setup.itemPreferenceForm.itemId}
          >
            <option value="">Choose active item</option>
            {setup.activeItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} ({item.defaultUnit})
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium text-stone-800">
          Preferred purchase location
          <select
            className="mt-2 min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-base text-stone-950"
            onChange={(event) => setup.setItemPreferenceLocationId(event.target.value)}
            value={setup.itemPreferenceForm.preferredPurchaseLocationId}
          >
            <option value="">Choose active purchase location</option>
            {setup.activePurchaseLocations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-2">
          <label className="block text-sm font-medium text-stone-800">
            Purchase unit
            <select
              className="mt-2 min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-base text-stone-950"
              onChange={(event) => setup.setItemPreferenceUnit(event.target.value as ItemUnit | "")}
              value={setup.itemPreferenceForm.preferredPurchaseUnit}
            >
              <option value="">Default</option>
              {setup.units.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-stone-800">
            Pack size
            <input
              className="mt-2 min-h-11 w-full rounded-md border border-stone-300 px-3 text-base text-stone-950"
              inputMode="decimal"
              onChange={(event) => setup.setItemPreferencePackSizeText(event.target.value)}
              placeholder="Optional"
              type="number"
              value={setup.itemPreferenceForm.packSizeText}
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <label className="block text-sm font-medium text-stone-800">
            Est. unit cost
            <input
              className="mt-2 min-h-11 w-full rounded-md border border-stone-300 px-3 text-base text-stone-950"
              inputMode="decimal"
              onChange={(event) => setup.setItemPreferenceEstimatedUnitCostText(event.target.value)}
              placeholder="Optional"
              type="number"
              value={setup.itemPreferenceForm.estimatedUnitCostText}
            />
          </label>
          <label className="block text-sm font-medium text-stone-800">
            Purchaser user ID
            <input
              className="mt-2 min-h-11 w-full rounded-md border border-stone-300 px-3 text-base text-stone-950"
              onChange={(event) => setup.setItemPreferencePurchaserUserId(event.target.value)}
              placeholder="Optional"
              value={setup.itemPreferenceForm.purchaserUserId}
            />
          </label>
        </div>

        <label className="block text-sm font-medium text-stone-800">
          Notes
          <textarea
            className="mt-2 min-h-20 w-full rounded-md border border-stone-300 px-3 py-2 text-base text-stone-950"
            onChange={(event) => setup.setItemPreferenceNotes(event.target.value)}
            placeholder="Bulk pack, brand preference, substitution notes..."
            value={setup.itemPreferenceForm.notes}
          />
        </label>

        <button
          className="min-h-11 w-full rounded-md bg-brand-900 px-4 text-sm font-semibold text-white disabled:bg-stone-300"
          disabled={!canCreatePreference}
          onClick={() => {
            void setup.createItemPurchasePreference();
          }}
          type="button"
        >
          {setup.isSubmitting ? "Saving..." : "Save item preference"}
        </button>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-stone-950">Purchase locations</h2>
        {setup.purchaseLocations.length > 0 ? (
          setup.purchaseLocations.map((location) => (
            <article
              className="space-y-3 rounded-md border border-stone-200 bg-white p-4"
              key={location.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-stone-950">{location.name}</h3>
                  <p className="mt-1 text-sm text-stone-600">
                    {location.description || "No description"}
                  </p>
                </div>
                <StatusBadge archivedAt={location.archivedAt} />
              </div>
              <button
                className="min-h-10 w-full rounded-md bg-stone-900 px-3 text-sm font-semibold text-white disabled:bg-stone-300"
                disabled={setup.isSubmitting}
                onClick={() => {
                  void setup.setPurchaseLocationArchived(location, !location.archivedAt);
                }}
                type="button"
              >
                {location.archivedAt ? "Restore" : "Archive"}
              </button>
            </article>
          ))
        ) : (
          <p className="rounded-md border border-stone-200 bg-white p-4 text-sm text-stone-600">
            No purchase locations are configured yet.
          </p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-stone-950">Item purchase preferences</h2>
        {setup.purchasePreferences.length > 0 ? (
          setup.purchasePreferences.map((preference) => {
            const item = itemsById.get(preference.itemId);
            const location = locationsById.get(preference.preferredPurchaseLocationId);

            return (
              <article
                className="space-y-2 rounded-md border border-stone-200 bg-white p-4"
                key={preference.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-stone-950">
                      {item?.name ?? preference.itemId}
                    </h3>
                    <p className="mt-1 text-sm text-stone-600">
                      Preferred source: {location?.name ?? preference.preferredPurchaseLocationId}
                    </p>
                  </div>
                  <StatusBadge archivedAt={preference.archivedAt} />
                </div>
                <p className="text-sm text-stone-600">
                  Pack: {preference.packSize ?? "Not set"}{" "}
                  {preference.preferredPurchaseUnit ?? item?.defaultUnit ?? ""}
                </p>
                <p className="text-sm text-stone-600">
                  Estimated unit cost:{" "}
                  {typeof preference.estimatedUnitCost === "number"
                    ? `$${preference.estimatedUnitCost.toFixed(2)}`
                    : "Not set"}
                </p>
              </article>
            );
          })
        ) : (
          <p className="rounded-md border border-stone-200 bg-white p-4 text-sm text-stone-600">
            No item purchase preferences are configured yet.
          </p>
        )}
      </section>
    </section>
  );
}
