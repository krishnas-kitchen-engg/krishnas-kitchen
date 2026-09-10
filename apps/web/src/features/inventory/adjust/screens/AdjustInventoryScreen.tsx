import type { ItemUnit } from "@krishnas-kitchen/types";

import { formatInventoryNumber, formatInventoryQuantity } from "@/domains/inventory";
import { InventoryBalanceList } from "../../components/InventoryBalanceList";
import { InventoryTransactionList } from "../../components/InventoryTransactionList";
import { useAdjustInventoryWorkflowForm } from "../hooks/useAdjustInventoryWorkflowForm";

function formatAdjustmentPreview(
  currentQuantity: number | null,
  physicalQuantityText: string,
  delta: number | null,
  unit: ItemUnit | ""
): string {
  if (currentQuantity === null || delta === null || !unit || !physicalQuantityText.trim()) {
    return "Select item, location, unit, and count to preview the correction.";
  }

  if (delta === 0) {
    return `No correction needed. Inventory already shows ${formatInventoryQuantity(currentQuantity, unit)}.`;
  }

  const direction = delta > 0 ? "increase" : "decrease";

  return `Inventory will change from ${formatInventoryQuantity(currentQuantity, unit)} to ${formatInventoryQuantity(Number(physicalQuantityText), unit)} (${direction} of ${formatInventoryQuantity(Math.abs(delta), unit)}).`;
}

export function AdjustInventoryScreen() {
  const workflow = useAdjustInventoryWorkflowForm();
  const { state } = workflow;
  const canReview = Boolean(
    state.selectedItemId &&
    state.locationId &&
    state.unit &&
    state.currentQuantity !== null &&
    state.physicalQuantityText.trim() &&
    state.reason.trim()
  );

  if (!workflow.canAdjustInventory) {
    return (
      <section className="rounded-md border border-stone-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-stone-950">Adjustments unavailable</h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Your current session does not include manager inventory adjustment permission.
        </p>
      </section>
    );
  }

  if (state.step === "success") {
    return (
      <section className="space-y-4">
        <div className="rounded-md border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-semibold uppercase text-green-800">Adjustment complete</p>
          <h1 className="mt-1 text-2xl font-semibold text-green-950">Physical count recorded</h1>
          <p className="mt-2 text-sm text-green-800">
            {state.noChangeRecorded
              ? "No balance change was needed because projected inventory matched the count."
              : `Transaction ${state.adjustmentTransaction?.id} was added to immutable inventory history.`}
          </p>
        </div>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-stone-950">Updated balance</h2>
          <InventoryBalanceList
            balances={state.updatedBalances}
            items={workflow.selectedItem ? [workflow.selectedItem] : []}
          />
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-stone-950">Item history</h2>
          <InventoryTransactionList transactions={state.recentItemTransactions} />
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-stone-950">Location history</h2>
          <InventoryTransactionList transactions={state.recentLocationTransactions} />
        </section>

        <button
          className="min-h-11 w-full rounded-md bg-brand-900 px-4 text-sm font-semibold text-white"
          onClick={() => workflow.resetWorkflow()}
          type="button"
        >
          Adjust another item
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div>
        <p className="text-sm font-semibold uppercase text-brand-800">Inventory adjustment</p>
        <h1 className="mt-1 text-2xl font-semibold text-stone-950">Reconcile physical count</h1>
      </div>

      {state.error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800">
          {state.error}
        </div>
      ) : null}

      {state.step === "select_details" ? (
        <section className="space-y-4 rounded-md border border-stone-200 bg-white p-4">
          <label className="block text-sm font-medium text-stone-800">
            Search items
            <input
              className="mt-2 min-h-11 w-full rounded-md border border-stone-300 px-3 text-base text-stone-950"
              onChange={(event) => workflow.setItemSearchText(event.target.value)}
              placeholder="Rice, dal, milk..."
              value={state.itemSearchText}
            />
          </label>

          <label className="block text-sm font-medium text-stone-800">
            Item
            <select
              className="mt-2 min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-base text-stone-950"
              onChange={(event) => workflow.setItemId(event.target.value)}
              value={state.selectedItemId}
            >
              <option value="">Select an item</option>
              {state.items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.handlingUnit ?? item.defaultUnit})
                </option>
              ))}
            </select>
            {state.validationErrors.itemId ? (
              <span className="mt-1 block text-sm font-medium text-red-700">
                {state.validationErrors.itemId}
              </span>
            ) : null}
          </label>

          <label className="block text-sm font-medium text-stone-800">
            Location
            <select
              className="mt-2 min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-base text-stone-950"
              onChange={(event) => workflow.setLocationId(event.target.value)}
              value={state.locationId}
            >
              <option value="">Select a location</option>
              {state.locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
            {state.validationErrors.locationId ? (
              <span className="mt-1 block text-sm font-medium text-red-700">
                {state.validationErrors.locationId}
              </span>
            ) : null}
          </label>

          <div className="rounded-md border border-stone-200 bg-stone-50 p-3">
            <p className="text-xs font-semibold uppercase text-stone-500">Projected quantity</p>
            <p className="mt-1 text-lg font-semibold text-stone-950">
              {state.currentQuantity === null
                ? "Select item and location"
                : state.unit
                  ? formatInventoryQuantity(state.currentQuantity, state.unit)
                  : formatInventoryNumber(state.currentQuantity)}
            </p>
          </div>

          <div className="grid grid-cols-[1fr_6.5rem] gap-2">
            <label className="block text-sm font-medium text-stone-800">
              Quantity physically counted
              <input
                aria-describedby="physical-count-help"
                className="mt-2 min-h-11 w-full rounded-md border border-stone-300 px-3 text-base text-stone-950"
                inputMode="decimal"
                min="0"
                onChange={(event) => workflow.setPhysicalQuantityText(event.target.value)}
                placeholder="0"
                type="number"
                value={state.physicalQuantityText}
              />
              <span
                className="mt-1 block text-xs leading-5 text-stone-600"
                id="physical-count-help"
              >
                Enter the total quantity remaining. The app calculates the correction for you.
              </span>
            </label>
            <label className="block text-sm font-medium text-stone-800">
              Unit
              <select
                className="mt-2 min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-base text-stone-950"
                onChange={(event) => workflow.setUnit(event.target.value as ItemUnit | "")}
                value={state.unit}
              >
                <option value="">Unit</option>
                {workflow.itemUnits.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {state.validationErrors.physicalQuantity ? (
            <p className="text-sm font-medium text-red-700">
              {state.validationErrors.physicalQuantity}
            </p>
          ) : null}
          {state.validationErrors.unit ? (
            <p className="text-sm font-medium text-red-700">{state.validationErrors.unit}</p>
          ) : null}

          <label className="block text-sm font-medium text-stone-800">
            Reason for correction
            <input
              className="mt-2 min-h-11 w-full rounded-md border border-stone-300 px-3 text-base text-stone-950"
              list="adjustment-reasons"
              onChange={(event) => workflow.setReason(event.target.value)}
              placeholder="Initial stock count, routine physical count, unrecorded usage..."
              value={state.reason}
            />
            <datalist id="adjustment-reasons">
              <option value="Initial stock count" />
              <option value="Routine physical count" />
              <option value="Unrecorded kitchen usage" />
              <option value="Spoilage or damage" />
              <option value="Measurement correction" />
            </datalist>
            {state.validationErrors.reason ? (
              <span className="mt-1 block text-sm font-medium text-red-700">
                {state.validationErrors.reason}
              </span>
            ) : null}
          </label>

          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-900">
            {formatAdjustmentPreview(
              state.currentQuantity,
              state.physicalQuantityText,
              workflow.projectedDelta,
              state.unit
            )}
          </div>

          <button
            className="min-h-11 w-full rounded-md bg-brand-900 px-4 text-sm font-semibold text-white disabled:bg-stone-300"
            disabled={!canReview}
            onClick={() => workflow.setStep("review")}
            type="button"
          >
            Review adjustment
          </button>
        </section>
      ) : null}

      {state.step === "review" ? (
        <section className="space-y-4 rounded-md border border-stone-200 bg-white p-4">
          <div>
            <p className="text-xs font-semibold uppercase text-stone-500">Review adjustment</p>
            <h2 className="mt-1 text-lg font-semibold text-stone-950">
              {workflow.selectedItem?.name ?? state.selectedItemId}
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              {workflow.selectedLocation?.name ?? state.locationId}
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-md bg-stone-50 p-3">
              <dt className="font-medium text-stone-600">App balance</dt>
              <dd className="mt-1 text-base font-semibold text-stone-950">
                {state.unit ? formatInventoryQuantity(state.currentQuantity ?? 0, state.unit) : "—"}
              </dd>
            </div>
            <div className="rounded-md bg-stone-50 p-3">
              <dt className="font-medium text-stone-600">Your count</dt>
              <dd className="mt-1 text-base font-semibold text-stone-950">
                {state.unit
                  ? formatInventoryQuantity(Number(state.physicalQuantityText || "0"), state.unit)
                  : "—"}
              </dd>
            </div>
          </dl>
          <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-900">
            {formatAdjustmentPreview(
              state.currentQuantity,
              state.physicalQuantityText,
              workflow.projectedDelta,
              state.unit
            )}
          </p>
          <p className="text-sm leading-6 text-stone-700">Reason: {state.reason.trim()}</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              className="min-h-11 rounded-md border border-stone-300 px-4 text-sm font-semibold text-stone-800"
              onClick={() => workflow.setStep("select_details")}
              type="button"
            >
              Back
            </button>
            <button
              className="min-h-11 rounded-md bg-brand-900 px-4 text-sm font-semibold text-white disabled:bg-stone-300"
              disabled={state.isSubmitting}
              onClick={() => {
                void workflow.submitAdjustment();
              }}
              type="button"
            >
              {state.isSubmitting ? "Recording..." : "Confirm"}
            </button>
          </div>
        </section>
      ) : null}
    </section>
  );
}
