import { ReceiveBarcodeEntry } from "../components/ReceiveBarcodeEntry";
import { ReceiveConfirmation } from "../components/ReceiveConfirmation";
import { ReceiveItemPicker } from "../components/ReceiveItemPicker";
import { ReceiveLocationPicker } from "../components/ReceiveLocationPicker";
import { ReceiveQuantityEntry } from "../components/ReceiveQuantityEntry";
import { ReceiveResolvedItemCard } from "../components/ReceiveResolvedItemCard";
import { ReceiveSuccessState } from "../components/ReceiveSuccessState";
import { ReceiveUnitPicker } from "../components/ReceiveUnitPicker";
import { useReceiveCatalogOptions } from "../hooks/useReceiveCatalogOptions";
import { useReceiveWorkflowForm } from "../hooks/useReceiveWorkflowForm";

export function ReceiveInventoryScreen() {
  const workflow = useReceiveWorkflowForm();
  const { state } = workflow;
  const options = useReceiveCatalogOptions(state.manualSearchText);
  const selectedLocation =
    options.locations.find((location) => location.id === state.locationId) ?? null;
  const canReviewReceiving = Boolean(
    state.resolvedItem && state.quantityText.trim() && state.unit && state.locationId
  );

  if (!workflow.canReceiveInventory) {
    return (
      <section className="rounded-md border border-stone-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-stone-950">Receiving unavailable</h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Your current session does not include inventory receiving permission.
        </p>
      </section>
    );
  }

  if (state.step === "success" && state.resolvedItem && state.receivedTransaction) {
    return (
      <ReceiveSuccessState
        balances={state.balances}
        item={state.resolvedItem}
        onReset={() => workflow.resetWorkflow()}
        receivedTransaction={state.receivedTransaction}
        recentTransactions={state.recentTransactions}
      />
    );
  }

  return (
    <section className="space-y-4">
      <div>
        <p className="text-sm font-semibold uppercase text-brand-800">Receive inventory</p>
        <h1 className="mt-1 text-2xl font-semibold text-stone-950">Add stock</h1>
      </div>

      {state.error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800">
          {state.error}
        </div>
      ) : null}

      {state.resolvedItem ? (
        <ReceiveResolvedItemCard
          item={state.resolvedItem}
          onChangeItem={() => workflow.setStep("select_item")}
        />
      ) : null}

      {state.step === "select_item" ? (
        <>
          <ReceiveBarcodeEntry
            error={state.barcode.error}
            format={state.barcode.format}
            isLoading={state.barcode.status === "loading"}
            onFormatChange={(format) => workflow.setBarcodeFormat(format)}
            onRawValueChange={(value) => workflow.setBarcodeRawValue(value)}
            onResolve={() => {
              void workflow.resolveBarcode();
            }}
            rawValue={state.barcode.rawValue}
          />
          <ReceiveItemPicker
            isLoading={options.isLoading}
            items={options.items}
            onSearchChange={(value) => workflow.setManualSearchText(value)}
            onSelect={(item) => {
              void workflow.selectManualItem(item);
            }}
            searchText={state.manualSearchText}
          />
          {options.error ? (
            <p className="text-sm font-medium text-red-700">{options.error}</p>
          ) : null}
        </>
      ) : null}

      {state.resolvedItem && state.step !== "select_item" && state.step !== "confirm" ? (
        <section className="space-y-4 rounded-md border border-stone-200 bg-white p-4">
          <ReceiveQuantityEntry
            error={state.validationErrors.quantity}
            onChange={(value) => workflow.setQuantityText(value)}
            value={state.quantityText}
          />
          <ReceiveUnitPicker
            error={state.validationErrors.unit}
            onChange={(unit) => workflow.setUnit(unit)}
            units={state.availableUnits}
            value={state.unit}
          />
          <ReceiveLocationPicker
            error={state.validationErrors.locationId}
            locations={options.locations}
            onChange={(locationId) => workflow.setLocationId(locationId)}
            value={state.locationId}
          />
          <button
            className="min-h-11 w-full rounded-md bg-brand-900 px-4 text-sm font-semibold text-white"
            disabled={!canReviewReceiving}
            onClick={() => workflow.setStep("confirm")}
            type="button"
          >
            Review receiving
          </button>
          {!canReviewReceiving ? (
            <p className="text-sm font-medium text-stone-600">
              Enter quantity, unit, and location before reviewing.
            </p>
          ) : null}
        </section>
      ) : null}

      {state.step === "confirm" && state.resolvedItem ? (
        <ReceiveConfirmation
          isSubmitting={state.isSubmitting}
          item={state.resolvedItem}
          location={selectedLocation}
          notes={state.notes}
          onBack={() => workflow.setStep("enter_quantity")}
          onNotesChange={(notes) => workflow.setNotes(notes)}
          onSubmit={() => {
            void workflow.submitReceive();
          }}
          quantity={state.quantityText}
          unit={state.unit}
        />
      ) : null}
    </section>
  );
}
