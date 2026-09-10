import type {
  InventoryCatalogItem,
  InventoryCatalogLocation,
  InventoryTransaction
} from "@/domains/inventory";
import { formatInventoryTransactionQuantity, formatPackageDefinition } from "@/domains/inventory";
import type { ItemUnit } from "@krishnas-kitchen/types";

import { InventoryBalanceList } from "../../components/InventoryBalanceList";
import { InventoryItemPackageSummary } from "../../components/InventoryItemPackageSummary";
import { InventoryTransactionList } from "../../components/InventoryTransactionList";
import { useConsumeCatalogOptions } from "../hooks/useConsumeCatalogOptions";
import { useConsumeWorkflowForm } from "../hooks/useConsumeWorkflowForm";

type LocationSelectProps = {
  error?: string | undefined;
  locations: readonly InventoryCatalogLocation[];
  onChange: (locationId: string) => void;
  value: string;
};

function LocationSelect({ error, locations, onChange, value }: LocationSelectProps) {
  return (
    <label className="block text-sm font-medium text-stone-800">
      Source location
      <select
        className="mt-2 min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-base text-stone-950"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        <option value="">Select a location</option>
        {locations.map((location) => (
          <option key={location.id} value={location.id}>
            {location.name}
          </option>
        ))}
      </select>
      {error ? <span className="mt-1 block text-sm font-medium text-red-700">{error}</span> : null}
    </label>
  );
}

type UnitSelectProps = {
  error?: string | undefined;
  onChange: (unit: ConsumeUnitValue) => void;
  units: readonly ConsumeUnitValue[];
  value: ConsumeUnitValue;
};

type ConsumeUnitValue = "" | ItemUnit;

function UnitSelect({ error, onChange, units, value }: UnitSelectProps) {
  return (
    <label className="block text-sm font-medium text-stone-800">
      Unit
      <select
        className="mt-2 min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-base text-stone-950"
        onChange={(event) => onChange(event.target.value as ConsumeUnitValue)}
        value={value}
      >
        <option value="">Select unit</option>
        {units.map((unit) => (
          <option key={unit} value={unit}>
            {unit}
          </option>
        ))}
      </select>
      {error ? <span className="mt-1 block text-sm font-medium text-red-700">{error}</span> : null}
    </label>
  );
}

function getItemLabel(item: InventoryCatalogItem): string {
  const packageDefinition = formatPackageDefinition(item);
  return `${item.name} (${item.defaultUnit}${packageDefinition ? ` · ${packageDefinition}` : ""})`;
}

function SuccessSummary({
  consumedTransaction,
  onReset,
  recentItemTransactions,
  recentLocationTransactions,
  workflow
}: {
  consumedTransaction: InventoryTransaction;
  onReset: () => void;
  recentItemTransactions: readonly InventoryTransaction[];
  recentLocationTransactions: readonly InventoryTransaction[];
  workflow: ReturnType<typeof useConsumeWorkflowForm>;
}) {
  return (
    <section className="space-y-4">
      <div className="rounded-md border border-green-200 bg-green-50 p-4">
        <p className="text-sm font-semibold uppercase text-green-800">Consumption recorded</p>
        <h1 className="mt-1 text-2xl font-semibold text-green-950">
          {formatInventoryTransactionQuantity(consumedTransaction)} consumed
        </h1>
        <p className="mt-2 text-sm text-green-800">
          Transaction {consumedTransaction.id} was added to immutable inventory history.
        </p>
      </div>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-stone-950">Updated balance</h2>
        <InventoryBalanceList
          balances={workflow.state.locationBalances}
          items={workflow.state.resolvedItem ? [workflow.state.resolvedItem.item] : []}
        />
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-stone-950">Item history</h2>
        <InventoryTransactionList transactions={recentItemTransactions} />
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-stone-950">Location history</h2>
        <InventoryTransactionList transactions={recentLocationTransactions} />
      </section>

      <button
        className="min-h-11 w-full rounded-md bg-brand-900 px-4 text-sm font-semibold text-white"
        onClick={onReset}
        type="button"
      >
        Consume another item
      </button>
    </section>
  );
}

export function ConsumeInventoryScreen() {
  const workflow = useConsumeWorkflowForm();
  const { state } = workflow;
  const options = useConsumeCatalogOptions(state.manualSearchText);
  const selectedLocation =
    options.locations.find((location) => location.id === state.locationId) ?? null;
  const canReviewConsumption = Boolean(
    state.resolvedItem && state.quantityText.trim() && state.unit && state.locationId
  );

  if (!workflow.canConsumeInventory) {
    return (
      <section className="rounded-md border border-stone-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-stone-950">Consumption unavailable</h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Your current session does not include inventory consumption permission.
        </p>
      </section>
    );
  }

  if (state.step === "success" && state.consumedTransaction) {
    return (
      <SuccessSummary
        consumedTransaction={state.consumedTransaction}
        onReset={() => workflow.resetWorkflow()}
        recentItemTransactions={state.recentItemTransactions}
        recentLocationTransactions={state.recentLocationTransactions}
        workflow={workflow}
      />
    );
  }

  return (
    <section className="space-y-4">
      <div>
        <p className="text-sm font-semibold uppercase text-brand-800">Consume inventory</p>
        <h1 className="mt-1 text-2xl font-semibold text-stone-950">Record ingredient use</h1>
      </div>

      {state.error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800">
          {state.error}
        </div>
      ) : null}

      {state.resolvedItem ? (
        <section className="rounded-md border border-stone-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase text-stone-500">Selected item</p>
          <h2 className="mt-1 text-lg font-semibold text-stone-950">
            {state.resolvedItem.item.name}
          </h2>
          <InventoryItemPackageSummary item={state.resolvedItem.item} showProductName />
          <button
            className="mt-3 min-h-11 rounded-md border border-stone-300 px-4 text-sm font-semibold text-stone-800"
            onClick={() => workflow.setStep("select_item")}
            type="button"
          >
            Change item
          </button>
        </section>
      ) : null}

      {state.step === "select_item" ? (
        <>
          <section className="space-y-3 rounded-md border border-stone-200 bg-white p-4">
            <label className="block text-sm font-medium text-stone-800">
              Barcode
              <input
                className="mt-2 min-h-11 w-full rounded-md border border-stone-300 px-3 text-base text-stone-950"
                onChange={(event) => workflow.setBarcodeRawValue(event.target.value)}
                placeholder="Scan or enter barcode"
                value={state.barcode.rawValue}
              />
            </label>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <select
                className="min-h-11 rounded-md border border-stone-300 bg-white px-3 text-base text-stone-950"
                onChange={(event) =>
                  workflow.setBarcodeFormat(event.target.value as typeof state.barcode.format)
                }
                value={state.barcode.format}
              >
                <option value="upc_a">UPC-A</option>
                <option value="ean_13">EAN-13</option>
                <option value="ean_8">EAN-8</option>
                <option value="upc_e">UPC-E</option>
                <option value="qr">QR</option>
              </select>
              <button
                className="min-h-11 rounded-md bg-brand-900 px-4 text-sm font-semibold text-white disabled:bg-stone-300"
                disabled={state.barcode.status === "loading" || !state.barcode.rawValue.trim()}
                onClick={() => {
                  void workflow.resolveBarcode();
                }}
                type="button"
              >
                Resolve
              </button>
            </div>
            {state.barcode.error ? (
              <p className="text-sm font-medium text-red-700">{state.barcode.error}</p>
            ) : null}
          </section>

          <section className="space-y-3 rounded-md border border-stone-200 bg-white p-4">
            <label className="block text-sm font-medium text-stone-800">
              Search items
              <input
                className="mt-2 min-h-11 w-full rounded-md border border-stone-300 px-3 text-base text-stone-950"
                onChange={(event) => workflow.setManualSearchText(event.target.value)}
                placeholder="Rice, dal, milk..."
                value={state.manualSearchText}
              />
            </label>
            <div className="space-y-2">
              {options.items.map((item) => (
                <button
                  className="min-h-11 w-full rounded-md border border-stone-200 bg-stone-50 px-3 text-left text-sm font-medium text-stone-950"
                  key={item.id}
                  onClick={() => {
                    void workflow.selectManualItem(item);
                  }}
                  type="button"
                >
                  {getItemLabel(item)}
                </button>
              ))}
            </div>
            {options.error ? (
              <p className="text-sm font-medium text-red-700">{options.error}</p>
            ) : null}
          </section>
        </>
      ) : null}

      {state.resolvedItem && state.step === "select_location" ? (
        <section className="space-y-4 rounded-md border border-stone-200 bg-white p-4">
          <LocationSelect
            error={state.validationErrors.locationId}
            locations={options.locations}
            onChange={(locationId) => workflow.setLocationId(locationId)}
            value={state.locationId}
          />
        </section>
      ) : null}

      {state.resolvedItem && state.step === "enter_quantity" ? (
        <section className="space-y-4 rounded-md border border-stone-200 bg-white p-4">
          <div>
            <p className="text-sm font-semibold text-stone-950">
              {selectedLocation ? selectedLocation.name : "Selected location"}
            </p>
            <InventoryBalanceList
              balances={state.locationBalances}
              items={state.resolvedItem ? [state.resolvedItem.item] : []}
            />
          </div>
          <label className="block text-sm font-medium text-stone-800">
            Consumed quantity
            <input
              className="mt-2 min-h-11 w-full rounded-md border border-stone-300 px-3 text-base text-stone-950"
              inputMode="decimal"
              onChange={(event) => workflow.setQuantityText(event.target.value)}
              placeholder="0"
              type="number"
              value={state.quantityText}
            />
            {state.validationErrors.quantity ? (
              <span className="mt-1 block text-sm font-medium text-red-700">
                {state.validationErrors.quantity}
              </span>
            ) : null}
          </label>
          <UnitSelect
            error={state.validationErrors.unit}
            onChange={(unit) => workflow.setUnit(unit)}
            units={state.availableUnits}
            value={state.unit}
          />
          <button
            className="min-h-11 w-full rounded-md bg-brand-900 px-4 text-sm font-semibold text-white"
            disabled={!canReviewConsumption}
            onClick={() => workflow.setStep("confirm")}
            type="button"
          >
            Review consumption
          </button>
          {!canReviewConsumption ? (
            <p className="text-sm font-medium text-stone-600">
              Enter quantity, unit, and source location before reviewing.
            </p>
          ) : null}
        </section>
      ) : null}

      {state.step === "confirm" && state.resolvedItem ? (
        <section className="space-y-4 rounded-md border border-stone-200 bg-white p-4">
          <div>
            <p className="text-xs font-semibold uppercase text-stone-500">Review consumption</p>
            <h2 className="mt-1 text-lg font-semibold text-stone-950">
              {state.quantityText || "0"} {state.unit} of {state.resolvedItem.item.name}
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              From {selectedLocation ? selectedLocation.name : state.locationId}
            </p>
          </div>
          <label className="block text-sm font-medium text-stone-800">
            Notes or reason
            <textarea
              className="mt-2 min-h-24 w-full rounded-md border border-stone-300 px-3 py-2 text-base text-stone-950"
              onChange={(event) => workflow.setNotes(event.target.value)}
              placeholder="Prep, cooking, service, spoilage..."
              value={state.notes}
            />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              className="min-h-11 rounded-md border border-stone-300 px-4 text-sm font-semibold text-stone-800"
              onClick={() => workflow.setStep("enter_quantity")}
              type="button"
            >
              Back
            </button>
            <button
              className="min-h-11 rounded-md bg-brand-900 px-4 text-sm font-semibold text-white disabled:bg-stone-300"
              disabled={state.isSubmitting}
              onClick={() => {
                void workflow.submitConsumption();
              }}
              type="button"
            >
              {state.isSubmitting ? "Recording..." : "Record use"}
            </button>
          </div>
        </section>
      ) : null}
    </section>
  );
}
