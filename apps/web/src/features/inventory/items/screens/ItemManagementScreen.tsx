import type { ItemUnit } from "@krishnas-kitchen/types";

import { navigateToInventoryItem } from "@/app/routes/router";
import type { ManagedInventoryItem } from "@/domains/inventory";

import { useItemManagement } from "../hooks/useItemManagement";

function ItemStatusBadge({ item }: { item: ManagedInventoryItem }) {
  const isArchived = Boolean(item.deletedAt);

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

export function ItemManagementScreen() {
  const management = useItemManagement();
  const isEditing = Boolean(management.form.editingItemId);
  const canSubmit =
    Boolean(management.form.name.trim()) &&
    Boolean(management.form.defaultUnit) &&
    !management.isSubmitting &&
    (isEditing ? management.canEditItems : management.canCreateItems);

  if (!management.canManageItems) {
    return (
      <section className="rounded-md border border-stone-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-stone-950">Item management unavailable</h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Your current session does not include inventory item administration permission.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase text-brand-800">Inventory items</p>
          <h1 className="mt-1 text-2xl font-semibold text-stone-950">Manage item catalog</h1>
        </div>
        <button
          className="min-h-10 rounded-md border border-stone-300 px-3 text-sm font-semibold text-stone-800 disabled:text-stone-400"
          disabled={management.isLoading}
          onClick={() => management.refresh()}
          type="button"
        >
          {management.isLoading ? "Refreshing" : "Refresh"}
        </button>
      </div>

      {management.error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800">
          {management.error}
        </div>
      ) : null}

      <section className="space-y-4 rounded-md border border-stone-200 bg-white p-4">
        <div>
          <p className="text-xs font-semibold uppercase text-stone-500">
            {isEditing ? "Edit item" : "Create item"}
          </p>
          <h2 className="mt-1 text-lg font-semibold text-stone-950">
            {isEditing ? "Update master item" : "Add master item"}
          </h2>
        </div>

        <label className="block text-sm font-medium text-stone-800">
          Item name
          <input
            className="mt-2 min-h-11 w-full rounded-md border border-stone-300 px-3 text-base text-stone-950"
            onChange={(event) => management.setName(event.target.value)}
            placeholder="Basmati rice, Toor dal, Ghee..."
            value={management.form.name}
          />
        </label>

        <div className="grid grid-cols-2 gap-2">
          <label className="block text-sm font-medium text-stone-800">
            Category
            <input
              className="mt-2 min-h-11 w-full rounded-md border border-stone-300 px-3 text-base text-stone-950"
              onChange={(event) => management.setCategory(event.target.value)}
              placeholder="Grains"
              value={management.form.category}
            />
          </label>
          <label className="block text-sm font-medium text-stone-800">
            Unit
            <select
              className="mt-2 min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-base text-stone-950"
              onChange={(event) => management.setDefaultUnit(event.target.value as ItemUnit | "")}
              value={management.form.defaultUnit}
            >
              <option value="">Unit</option>
              {management.units.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block text-sm font-medium text-stone-800">
          Reorder point / low stock threshold
          <input
            className="mt-2 min-h-11 w-full rounded-md border border-stone-300 px-3 text-base text-stone-950"
            inputMode="decimal"
            onChange={(event) => management.setReorderThresholdText(event.target.value)}
            placeholder="Optional minimum on hand"
            type="number"
            value={management.form.reorderThresholdText}
          />
        </label>

        <label className="block text-sm font-medium text-stone-800">
          Description
          <textarea
            className="mt-2 min-h-24 w-full rounded-md border border-stone-300 px-3 py-2 text-base text-stone-950"
            onChange={(event) => management.setDescription(event.target.value)}
            placeholder="Optional notes about this ingredient"
            value={management.form.description}
          />
        </label>

        <div className="grid grid-cols-2 gap-2">
          <button
            className="min-h-11 rounded-md border border-stone-300 px-4 text-sm font-semibold text-stone-800"
            onClick={() => management.resetForm()}
            type="button"
          >
            Clear
          </button>
          <button
            className="min-h-11 rounded-md bg-brand-900 px-4 text-sm font-semibold text-white disabled:bg-stone-300"
            disabled={!canSubmit}
            onClick={() => {
              void management.submitItem();
            }}
            type="button"
          >
            {management.isSubmitting ? "Saving..." : isEditing ? "Save" : "Create"}
          </button>
        </div>
      </section>

      <section className="space-y-3">
        <label className="block text-sm font-medium text-stone-800">
          Search items
          <input
            className="mt-2 min-h-11 w-full rounded-md border border-stone-300 px-3 text-base text-stone-950"
            onChange={(event) => management.setSearchText(event.target.value)}
            placeholder="Rice, dairy, ghee..."
            value={management.searchText}
          />
        </label>

        {management.filteredItems.length > 0 ? (
          <div className="space-y-3">
            {management.filteredItems.map((item) => (
              <article
                className="space-y-3 rounded-md border border-stone-200 bg-white p-4"
                key={item.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-stone-950">{item.name}</h2>
                    <p className="mt-1 text-sm text-stone-600">
                      {item.category || "Uncategorized"} / {item.defaultUnit}
                    </p>
                  </div>
                  <ItemStatusBadge item={item} />
                </div>
                <p className="text-sm text-stone-600">{item.description || "No description"}</p>
                <p className="text-sm font-medium text-stone-700">
                  Reorder point:{" "}
                  {typeof item.reorderThreshold === "number"
                    ? `${item.reorderThreshold} ${item.defaultUnit}`
                    : "Not set"}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    className="min-h-10 rounded-md border border-stone-300 px-2 text-sm font-semibold text-stone-800"
                    disabled={!management.canEditItems}
                    onClick={() => management.setEditingItem(item)}
                    type="button"
                  >
                    Edit
                  </button>
                  <button
                    className="min-h-10 rounded-md border border-stone-300 px-2 text-sm font-semibold text-stone-800"
                    onClick={() => navigateToInventoryItem(item.id)}
                    type="button"
                  >
                    History
                  </button>
                  <button
                    className="min-h-10 rounded-md bg-stone-900 px-2 text-sm font-semibold text-white disabled:bg-stone-300"
                    disabled={management.isSubmitting || !management.canArchiveItems}
                    onClick={() => {
                      void management.setArchived(item, !item.deletedAt);
                    }}
                    type="button"
                  >
                    {item.deletedAt ? "Restore" : "Archive"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-md border border-stone-200 bg-white p-4 text-sm text-stone-600">
            No inventory items match this search.
          </p>
        )}
      </section>
    </section>
  );
}
