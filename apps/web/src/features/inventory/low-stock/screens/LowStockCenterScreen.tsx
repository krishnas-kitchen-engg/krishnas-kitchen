import {
  navigateTo,
  navigateToInventoryItem,
  navigateToInventoryLocation
} from "@/app/routes/router";

import { useLowStockCenter } from "../hooks/useLowStockCenter";
import type { LowStockCenterItem } from "../types/lowStockCenterTypes";

function statusLabel(status: LowStockCenterItem["status"]): string {
  return status === "out" ? "Out of Stock" : "Low";
}

function statusClassName(status: LowStockCenterItem["status"]): string {
  return status === "out"
    ? "bg-red-100 text-red-800 border-red-200"
    : "bg-amber-100 text-amber-800 border-amber-200";
}

function LowStockCard({ item }: { item: LowStockCenterItem }) {
  return (
    <article className="space-y-3 rounded-md border border-stone-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-stone-950">{item.itemName}</h2>
          <p className="mt-1 text-sm text-stone-600">{item.locationName}</p>
        </div>
        <span
          className={`rounded-md border px-2 py-1 text-xs font-semibold ${statusClassName(
            item.status
          )}`}
        >
          {statusLabel(item.status)}
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-md bg-stone-50 p-2">
          <dt className="text-stone-500">Current</dt>
          <dd className="mt-1 font-semibold text-stone-950">
            {item.currentQuantity} {item.unit}
          </dd>
        </div>
        <div className="rounded-md bg-stone-50 p-2">
          <dt className="text-stone-500">Reorder at</dt>
          <dd className="mt-1 font-semibold text-stone-950">
            {item.minimumQuantity} {item.unit}
          </dd>
        </div>
        <div className="rounded-md bg-stone-50 p-2">
          <dt className="text-stone-500">Target</dt>
          <dd className="mt-1 font-semibold text-stone-950">
            {typeof item.targetQuantity === "number"
              ? `${item.targetQuantity} ${item.unit}`
              : "Not set"}
          </dd>
        </div>
        <div className="rounded-md bg-stone-50 p-2">
          <dt className="text-stone-500">To reach target</dt>
          <dd className="mt-1 font-semibold text-stone-950">
            {typeof item.targetQuantity === "number"
              ? `${Math.max(item.targetQuantity - item.currentQuantity, 0)} ${item.unit}`
              : "Set target"}
          </dd>
        </div>
      </dl>

      <div className="grid grid-cols-3 gap-2">
        <button
          className="min-h-10 rounded-md border border-stone-300 px-2 text-sm font-semibold text-stone-800"
          onClick={() => navigateToInventoryItem(item.itemId)}
          type="button"
        >
          Details
        </button>
        <button
          className="min-h-10 rounded-md bg-brand-900 px-2 text-sm font-semibold text-white"
          onClick={() => navigateTo("/receive")}
          type="button"
        >
          Receive
        </button>
        <button
          className="min-h-10 rounded-md border border-stone-300 px-2 text-sm font-semibold text-stone-800"
          onClick={() =>
            item.locationId
              ? navigateToInventoryLocation(item.locationId)
              : navigateToInventoryItem(item.itemId)
          }
          type="button"
        >
          History
        </button>
      </div>
    </article>
  );
}

export function LowStockCenterScreen() {
  const center = useLowStockCenter();

  if (!center.canViewLowStockCenter) {
    return (
      <section className="rounded-md border border-stone-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-stone-950">Low Stock Center unavailable</h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Your current session does not include manager low-stock access.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase text-brand-800">Low Stock Center</p>
          <h1 className="mt-1 text-2xl font-semibold text-stone-950">Replenishment priorities</h1>
        </div>
        <button
          className="min-h-10 rounded-md border border-stone-300 px-3 text-sm font-semibold text-stone-800 disabled:text-stone-400"
          disabled={center.isLoading}
          onClick={() => center.refresh()}
          type="button"
        >
          {center.isLoading ? "Refreshing" : "Refresh"}
        </button>
      </div>

      {center.error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800">
          {center.error}
        </div>
      ) : null}

      <section className="grid grid-cols-2 gap-3">
        <article className="rounded-md border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-semibold uppercase text-amber-700">Low stock</p>
          <p className="mt-2 text-3xl font-semibold text-amber-950">
            {center.items.length - center.outOfStockCount}
          </p>
        </article>
        <article className="rounded-md border border-red-200 bg-red-50 p-4">
          <p className="text-xs font-semibold uppercase text-red-700">Out of stock</p>
          <p className="mt-2 text-3xl font-semibold text-red-950">{center.outOfStockCount}</p>
        </article>
      </section>

      <section className="space-y-3 rounded-md border border-stone-200 bg-white p-4">
        <label className="block text-sm font-medium text-stone-800">
          Search item
          <input
            className="mt-2 min-h-11 w-full rounded-md border border-stone-300 px-3 text-base text-stone-950"
            onChange={(event) => center.setSearchText(event.target.value)}
            placeholder="Rice, dal, milk..."
            value={center.filters.searchText}
          />
        </label>

        <div className="grid grid-cols-2 gap-2">
          <label className="block text-sm font-medium text-stone-800">
            Location
            <select
              className="mt-2 min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-base text-stone-950"
              onChange={(event) => center.setLocationId(event.target.value)}
              value={center.filters.locationId}
            >
              <option value="">All</option>
              {center.locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-stone-800">
            Status
            <select
              className="mt-2 min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-base text-stone-950"
              onChange={(event) =>
                center.setStatus(event.target.value as typeof center.filters.status)
              }
              value={center.filters.status}
            >
              <option value="all">All</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </select>
          </label>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-stone-950">Needs replenishment</h2>
          <span className="text-sm font-medium text-stone-500">{center.items.length}</span>
        </div>
        <p className="text-sm leading-6 text-stone-600">
          Amounts here show the gap to each target. Purchase Review subtracts quantities already
          planned and applies order rules before recommending what to buy.
        </p>
        {center.items.length > 0 ? (
          <div className="space-y-3">
            {center.items.map((item) => (
              <LowStockCard
                item={item}
                key={`${item.itemId}:${item.locationId ?? "all"}:${item.unit}`}
              />
            ))}
          </div>
        ) : (
          <p className="rounded-md border border-stone-200 bg-white p-4 text-sm text-stone-600">
            No inventory currently requires replenishment.
          </p>
        )}
      </section>
    </section>
  );
}
