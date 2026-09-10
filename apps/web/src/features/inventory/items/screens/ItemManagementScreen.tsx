import { useState } from "react";
import type { ItemUnit } from "@krishnas-kitchen/types";

import { navigateToInventoryItem } from "@/app/routes/router";
import type { ManagedInventoryItem } from "@/domains/inventory";

import { useItemManagement } from "../hooks/useItemManagement";

type ItemManagementController = ReturnType<typeof useItemManagement>;

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

function canSubmitItem(management: ItemManagementController, isEditing: boolean): boolean {
  return (
    Boolean(management.form.name.trim()) &&
    Boolean(management.form.defaultUnit) &&
    Boolean(management.form.contentsQuantityText.trim()) ===
      Boolean(management.form.contentsUnit) &&
    (!management.form.contentsLabel.trim() ||
      Boolean(management.form.contentsQuantityText.trim())) &&
    (!management.form.contentsQuantityText.trim() || Boolean(management.form.handlingUnit)) &&
    (!management.form.contentsUnit ||
      management.form.defaultUnit === management.form.contentsUnit) &&
    !management.isSubmitting &&
    (isEditing ? management.canEditItems : management.canCreateItems)
  );
}

export function ItemForm({
  fieldIdPrefix,
  management,
  mode,
  onCancel
}: {
  fieldIdPrefix: string;
  management: ItemManagementController;
  mode: "create" | "edit";
  onCancel: () => void;
}) {
  const isEditing = mode === "edit";
  const hasPackageDetails = Boolean(
    management.form.handlingUnit ||
    management.form.packageDescription.trim() ||
    management.form.contentsQuantityText.trim() ||
    management.form.contentsUnit ||
    management.form.contentsLabel.trim()
  );

  return (
    <div className="space-y-4">
      {management.error ? (
        <div
          className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800"
          role="alert"
        >
          {management.error}
        </div>
      ) : null}

      <label className="block text-sm font-medium text-stone-800">
        Item name
        <input
          className="mt-2 min-h-11 w-full rounded-md border border-stone-300 px-3 text-base text-stone-950"
          onChange={(event) => management.setName(event.target.value)}
          placeholder="Basmati rice, Toor dal, Ghee..."
          value={management.form.name}
        />
      </label>

      <label className="block text-sm font-medium text-stone-800">
        Product name
        <input
          className="mt-2 min-h-11 w-full rounded-md border border-stone-300 px-3 text-base text-stone-950"
          onChange={(event) => management.setProductName(event.target.value)}
          placeholder="Pinto Beans"
          value={management.form.productName}
        />
        <span className="mt-2 block text-xs font-normal leading-5 text-stone-600">
          Groups package-size SKUs under one product. Leave blank when the item has only one form.
        </span>
      </label>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
          Inventory/base unit
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

      <details
        className="rounded-md border border-stone-200 bg-stone-50 p-3"
        open={hasPackageDetails}
      >
        <summary className="cursor-pointer text-sm font-semibold text-stone-900">
          Package details <span className="font-normal text-stone-600">(optional)</span>
        </summary>
        <div className="mt-3 space-y-3">
          <p className="text-xs leading-5 text-stone-600">
            Track the box, bag, bottle, or other unit people physically move. The app converts
            entries into the base unit so recipes and stock totals remain accurate.
          </p>
          <label className="block text-sm font-medium text-stone-800">
            Handling unit
            <select
              className="mt-2 min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-base text-stone-950"
              onChange={(event) => management.setHandlingUnit(event.target.value as ItemUnit | "")}
              value={management.form.handlingUnit}
            >
              <option value="">Same as inventory unit</option>
              {management.units.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-stone-800">
            Package description
            <input
              className="mt-2 min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-base text-stone-950"
              onChange={(event) => management.setPackageDescription(event.target.value)}
              placeholder="20 sleeves × 400 cups per box"
              value={management.form.packageDescription}
            />
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block text-sm font-medium text-stone-800">
              Contents per handling unit
              <input
                className="mt-2 min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-base text-stone-950"
                inputMode="decimal"
                min="0"
                onChange={(event) => management.setContentsQuantityText(event.target.value)}
                placeholder="8000"
                step="any"
                type="number"
                value={management.form.contentsQuantityText}
              />
            </label>
            <label className="block text-sm font-medium text-stone-800">
              Contents unit
              <select
                className="mt-2 min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-base text-stone-950"
                onChange={(event) =>
                  management.setContentsUnit(event.target.value as ItemUnit | "")
                }
                value={management.form.contentsUnit}
              >
                <option value="">Select</option>
                {management.units.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="block text-sm font-medium text-stone-800">
            Contents label
            <input
              className="mt-2 min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-base text-stone-950"
              onChange={(event) => management.setContentsLabel(event.target.value)}
              placeholder="cups, lids, spoons..."
              value={management.form.contentsLabel}
            />
          </label>
          <p className="text-xs leading-5 text-stone-600">
            Contents quantity and unit must be entered together. When provided, the contents unit
            must match the inventory/base unit above.
          </p>
        </div>
      </details>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block text-sm font-medium text-stone-800">
          Minimum stock level
          <input
            aria-describedby={`${fieldIdPrefix}-minimum-help`}
            className="mt-2 min-h-11 w-full rounded-md border border-stone-300 px-3 text-base text-stone-950"
            inputMode="decimal"
            max="1000000"
            min="0"
            onChange={(event) => management.setReorderThresholdText(event.target.value)}
            placeholder="Optional"
            step="any"
            type="number"
            value={management.form.reorderThresholdText}
          />
          <span
            className="mt-2 block text-xs leading-5 text-stone-600"
            id={`${fieldIdPrefix}-minimum-help`}
          >
            Appears in Low Stock when inventory reaches this level.
          </span>
        </label>
        <label className="block text-sm font-medium text-stone-800">
          Target stock level
          <input
            aria-describedby={`${fieldIdPrefix}-target-help`}
            className="mt-2 min-h-11 w-full rounded-md border border-stone-300 px-3 text-base text-stone-950"
            inputMode="decimal"
            max="1000000"
            min="0"
            onChange={(event) => management.setTargetStockLevelText(event.target.value)}
            placeholder="Optional"
            step="any"
            type="number"
            value={management.form.targetStockLevelText}
          />
          <span
            className="mt-2 block text-xs leading-5 text-stone-600"
            id={`${fieldIdPrefix}-target-help`}
          >
            Purchasing is recommended up to this level.
          </span>
        </label>
      </div>

      <label className="block text-sm font-medium text-stone-800">
        Description
        <textarea
          className="mt-2 min-h-24 w-full rounded-md border border-stone-300 px-3 py-2 text-base text-stone-950"
          onChange={(event) => management.setDescription(event.target.value)}
          placeholder="Optional notes about this item"
          value={management.form.description}
        />
      </label>

      <div className="sticky bottom-2 grid grid-cols-2 gap-2 rounded-md border border-stone-200 bg-white/95 p-2 shadow-sm backdrop-blur">
        <button
          className="min-h-11 rounded-md border border-stone-300 px-4 text-sm font-semibold text-stone-800"
          disabled={management.isSubmitting}
          onClick={onCancel}
          type="button"
        >
          {isEditing ? "Cancel" : "Close"}
        </button>
        <button
          className="min-h-11 rounded-md bg-brand-900 px-4 text-sm font-semibold text-white disabled:bg-stone-300"
          disabled={!canSubmitItem(management, isEditing)}
          onClick={() => void management.submitItem()}
          type="button"
        >
          {management.isSubmitting ? "Saving..." : isEditing ? "Save changes" : "Create item"}
        </button>
      </div>
    </div>
  );
}

export function ItemManagementScreen() {
  const management = useItemManagement();
  const [isCreateExpanded, setIsCreateExpanded] = useState(false);
  const editingItemId = management.form.editingItemId;

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
          disabled={management.isLoading || Boolean(editingItemId)}
          onClick={() => management.refresh()}
          type="button"
        >
          {management.isLoading ? "Refreshing" : "Refresh"}
        </button>
      </div>

      {management.error && !editingItemId && !isCreateExpanded ? (
        <div
          className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800"
          role="alert"
        >
          {management.error}
        </div>
      ) : null}

      <label className="block text-sm font-medium text-stone-800">
        Search items
        <input
          className="mt-2 min-h-11 w-full rounded-md border border-stone-300 px-3 text-base text-stone-950"
          disabled={Boolean(editingItemId)}
          onChange={(event) => management.setSearchText(event.target.value)}
          placeholder="Rice, dairy, ghee..."
          value={management.searchText}
        />
      </label>

      {!editingItemId ? (
        <section className="rounded-md border border-stone-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase text-stone-500">Catalog</p>
              <h2 className="mt-1 text-lg font-semibold text-stone-950">Add new inventory item</h2>
            </div>
            <button
              aria-controls="create-item-form"
              aria-expanded={isCreateExpanded}
              className="min-h-10 rounded-md border border-brand-800 px-3 text-sm font-semibold text-brand-900 disabled:border-stone-300 disabled:text-stone-400"
              disabled={!management.canCreateItems}
              onClick={() => {
                if (isCreateExpanded) management.resetForm();
                setIsCreateExpanded((expanded) => !expanded);
              }}
              type="button"
            >
              {isCreateExpanded ? "Collapse" : "Add item"}
            </button>
          </div>
          {isCreateExpanded ? (
            <div className="mt-4 border-t border-stone-100 pt-4" id="create-item-form">
              <ItemForm
                fieldIdPrefix="create-item"
                management={management}
                mode="create"
                onCancel={() => {
                  management.resetForm();
                  setIsCreateExpanded(false);
                }}
              />
            </div>
          ) : (
            <p className="mt-2 text-sm text-stone-600">
              Expand only when you need to add a product or package SKU.
            </p>
          )}
        </section>
      ) : null}

      <section className="space-y-3" aria-label="Inventory item list">
        {management.filteredItems.length > 0 ? (
          management.filteredItems.map((item) => {
            const isEditingThisItem = editingItemId === item.id;

            return (
              <article
                className={`space-y-3 rounded-md border bg-white p-4 ${
                  isEditingThisItem ? "border-brand-700 shadow-sm" : "border-stone-200"
                }`}
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

                {isEditingThisItem ? (
                  <section
                    aria-label={`Edit ${item.name}`}
                    className="space-y-3 border-t border-brand-100 pt-4"
                    id={`edit-item-${item.id}`}
                  >
                    <div>
                      <p className="text-xs font-semibold uppercase text-brand-800">Editing here</p>
                      <h3 className="mt-1 text-base font-semibold text-stone-950">
                        Update item details
                      </h3>
                    </div>
                    <ItemForm
                      fieldIdPrefix={`edit-${item.id}`}
                      management={management}
                      mode="edit"
                      onCancel={() => management.resetForm()}
                    />
                  </section>
                ) : (
                  <>
                    <p className="text-sm text-stone-600">{item.description || "No description"}</p>
                    {item.productName ? (
                      <p className="text-sm text-stone-600">Product: {item.productName}</p>
                    ) : null}
                    {item.packageDescription ? (
                      <p className="text-sm text-stone-600">Each: {item.packageDescription}</p>
                    ) : null}
                    {item.contentsQuantity && item.contentsUnit ? (
                      <p className="text-sm text-stone-600">
                        Contents: {item.contentsQuantity} {item.contentsUnit} per{" "}
                        {item.handlingUnit}
                      </p>
                    ) : null}
                    <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                      <p className="rounded-md bg-stone-50 p-2 text-stone-700 sm:col-span-2">
                        Minimum: {item.reorderThreshold ?? "Not set"}{" "}
                        {item.reorderThreshold !== null ? item.defaultUnit : ""}
                      </p>
                      <p className="rounded-md bg-stone-50 p-2 text-stone-700 sm:col-span-2">
                        Target: {item.targetStockLevel ?? "Not set"}{" "}
                        {item.targetStockLevel !== null ? item.defaultUnit : ""}
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        aria-controls={`edit-item-${item.id}`}
                        aria-expanded={false}
                        className="min-h-10 rounded-md border border-brand-800 px-2 text-sm font-semibold text-brand-900 disabled:border-stone-300 disabled:text-stone-400"
                        disabled={!management.canEditItems || Boolean(editingItemId)}
                        onClick={() => {
                          setIsCreateExpanded(false);
                          management.setEditingItem(item);
                        }}
                        type="button"
                      >
                        Edit here
                      </button>
                      <button
                        className="min-h-10 rounded-md border border-stone-300 px-2 text-sm font-semibold text-stone-800 disabled:text-stone-400"
                        disabled={Boolean(editingItemId)}
                        onClick={() => navigateToInventoryItem(item.id)}
                        type="button"
                      >
                        History
                      </button>
                      <button
                        className="min-h-10 rounded-md bg-stone-900 px-2 text-sm font-semibold text-white disabled:bg-stone-300"
                        disabled={
                          management.isSubmitting ||
                          !management.canArchiveItems ||
                          Boolean(editingItemId)
                        }
                        onClick={() => void management.setArchived(item, !item.deletedAt)}
                        type="button"
                      >
                        {item.deletedAt ? "Restore" : "Archive"}
                      </button>
                    </div>
                  </>
                )}
              </article>
            );
          })
        ) : (
          <p className="rounded-md border border-stone-200 bg-white p-4 text-sm text-stone-600">
            No inventory items match this search.
          </p>
        )}
      </section>
    </section>
  );
}
