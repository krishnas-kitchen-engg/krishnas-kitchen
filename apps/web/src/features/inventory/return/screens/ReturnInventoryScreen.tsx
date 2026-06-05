import { ReturnBarcodeEntry } from "../components/ReturnBarcodeEntry";
import { ReturnConfirmation } from "../components/ReturnConfirmation";
import { ReturnItemPicker } from "../components/ReturnItemPicker";
import { ReturnLocationPicker } from "../components/ReturnLocationPicker";
import { ReturnQuantityEntry } from "../components/ReturnQuantityEntry";
import { ReturnResolvedItemCard } from "../components/ReturnResolvedItemCard";
import { ReturnSuccessState } from "../components/ReturnSuccessState";
import { ReturnUnitPicker } from "../components/ReturnUnitPicker";
import { useReturnCatalogOptions } from "../hooks/useReturnCatalogOptions";
import { useReturnWorkflowForm } from "../hooks/useReturnWorkflowForm";

export function ReturnInventoryScreen() {
  const workflow = useReturnWorkflowForm();
  const { state } = workflow;
  const options = useReturnCatalogOptions(state.manualSearchText);
  const sourceLocation =
    options.locations.find((location) => location.id === state.sourceLocationId) ?? null;
  const destinationLocation =
    options.locations.find((location) => location.id === state.destinationLocationId) ?? null;

  if (!workflow.canReturnInventory) {
    return (
      <section className="rounded-md border border-stone-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-stone-950">Return unavailable</h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Your current session does not include inventory return permission.
        </p>
      </section>
    );
  }

  if (state.step === "success" && state.resolvedItem && state.returnedTransaction) {
    return (
      <ReturnSuccessState
        destinationBalances={state.destinationBalances}
        item={state.resolvedItem}
        onReset={() => workflow.resetWorkflow()}
        recentDestinationLocationTransactions={state.recentDestinationLocationTransactions}
        recentItemTransactions={state.recentItemTransactions}
        recentSourceLocationTransactions={state.recentSourceLocationTransactions}
        returnedTransaction={state.returnedTransaction}
        sourceBalances={state.sourceBalances}
      />
    );
  }

  return (
    <section className="space-y-4">
      <div>
        <p className="text-sm font-semibold uppercase text-brand-800">Return inventory</p>
        <h1 className="mt-1 text-2xl font-semibold text-stone-950">Return stock</h1>
      </div>

      {state.error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800">
          {state.error}
        </div>
      ) : null}

      {state.resolvedItem ? (
        <ReturnResolvedItemCard
          item={state.resolvedItem}
          onChangeItem={() => workflow.setStep("select_item")}
        />
      ) : null}

      {state.step === "select_item" ? (
        <>
          <ReturnBarcodeEntry
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
          <ReturnItemPicker
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

      {state.resolvedItem && state.step === "select_locations" ? (
        <section className="space-y-4 rounded-md border border-stone-200 bg-white p-4">
          <ReturnLocationPicker
            error={state.validationErrors.sourceLocationId}
            label="Source location"
            locations={options.locations}
            onChange={(locationId) => workflow.setSourceLocationId(locationId)}
            value={state.sourceLocationId}
          />
          <ReturnLocationPicker
            error={
              state.validationErrors.destinationLocationId ?? state.validationErrors.sameLocation
            }
            label="Return destination"
            locations={options.locations}
            onChange={(locationId) => workflow.setDestinationLocationId(locationId)}
            value={state.destinationLocationId}
          />
        </section>
      ) : null}

      {state.resolvedItem && state.step === "enter_quantity" ? (
        <section className="space-y-4 rounded-md border border-stone-200 bg-white p-4">
          <ReturnQuantityEntry
            error={state.validationErrors.quantity}
            onChange={(value) => workflow.setQuantityText(value)}
            value={state.quantityText}
          />
          <ReturnUnitPicker
            error={state.validationErrors.unit}
            onChange={(unit) => workflow.setUnit(unit)}
            units={state.availableUnits}
            value={state.unit}
          />
          <button
            className="min-h-11 w-full rounded-md bg-brand-900 px-4 text-sm font-semibold text-white"
            onClick={() => workflow.setStep("confirm")}
            type="button"
          >
            Review return
          </button>
        </section>
      ) : null}

      {state.step === "confirm" && state.resolvedItem ? (
        <ReturnConfirmation
          destinationLocation={destinationLocation}
          isSubmitting={state.isSubmitting}
          item={state.resolvedItem}
          notes={state.notes}
          onBack={() => workflow.setStep("enter_quantity")}
          onNotesChange={(notes) => workflow.setNotes(notes)}
          onSubmit={() => {
            void workflow.submitReturn();
          }}
          quantity={state.quantityText}
          sourceLocation={sourceLocation}
          unit={state.unit}
        />
      ) : null}
    </section>
  );
}
