import { TransferBarcodeEntry } from "../components/TransferBarcodeEntry";
import { TransferConfirmation } from "../components/TransferConfirmation";
import { TransferItemPicker } from "../components/TransferItemPicker";
import { TransferLocationPicker } from "../components/TransferLocationPicker";
import { TransferQuantityEntry } from "../components/TransferQuantityEntry";
import { TransferResolvedItemCard } from "../components/TransferResolvedItemCard";
import { TransferSuccessState } from "../components/TransferSuccessState";
import { TransferUnitPicker } from "../components/TransferUnitPicker";
import { useTransferCatalogOptions } from "../hooks/useTransferCatalogOptions";
import { useTransferWorkflowForm } from "../hooks/useTransferWorkflowForm";

export function TransferInventoryScreen() {
  const workflow = useTransferWorkflowForm();
  const { state } = workflow;
  const options = useTransferCatalogOptions(state.manualSearchText);
  const sourceLocation =
    options.locations.find((location) => location.id === state.sourceLocationId) ?? null;
  const destinationLocation =
    options.locations.find((location) => location.id === state.destinationLocationId) ?? null;

  if (!workflow.canTransferInventory) {
    return (
      <section className="rounded-md border border-stone-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-stone-950">Transfer unavailable</h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Your current session does not include inventory transfer permission.
        </p>
      </section>
    );
  }

  if (state.step === "success" && state.resolvedItem && state.transferTransaction) {
    return (
      <TransferSuccessState
        destinationBalances={state.destinationBalances}
        item={state.resolvedItem}
        onReset={() => workflow.resetWorkflow()}
        recentDestinationLocationTransactions={state.recentDestinationLocationTransactions}
        recentItemTransactions={state.recentItemTransactions}
        recentSourceLocationTransactions={state.recentSourceLocationTransactions}
        sourceBalances={state.sourceBalances}
        transferTransaction={state.transferTransaction}
      />
    );
  }

  return (
    <section className="space-y-4">
      <div>
        <p className="text-sm font-semibold uppercase text-brand-800">Transfer inventory</p>
        <h1 className="mt-1 text-2xl font-semibold text-stone-950">Move stock</h1>
      </div>

      {state.error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800">
          {state.error}
        </div>
      ) : null}

      {state.resolvedItem ? (
        <TransferResolvedItemCard
          item={state.resolvedItem}
          onChangeItem={() => workflow.setStep("select_item")}
        />
      ) : null}

      {state.step === "select_item" ? (
        <>
          <TransferBarcodeEntry
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
          <TransferItemPicker
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
          <TransferLocationPicker
            error={state.validationErrors.sourceLocationId}
            label="Source location"
            locations={options.locations}
            onChange={(locationId) => workflow.setSourceLocationId(locationId)}
            value={state.sourceLocationId}
          />
          <TransferLocationPicker
            error={
              state.validationErrors.destinationLocationId ?? state.validationErrors.sameLocation
            }
            label="Destination location"
            locations={options.locations}
            onChange={(locationId) => workflow.setDestinationLocationId(locationId)}
            value={state.destinationLocationId}
          />
        </section>
      ) : null}

      {state.resolvedItem && state.step === "enter_quantity" ? (
        <section className="space-y-4 rounded-md border border-stone-200 bg-white p-4">
          <TransferQuantityEntry
            error={state.validationErrors.quantity}
            onChange={(value) => workflow.setQuantityText(value)}
            value={state.quantityText}
          />
          <TransferUnitPicker
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
            Review transfer
          </button>
        </section>
      ) : null}

      {state.step === "confirm" && state.resolvedItem ? (
        <TransferConfirmation
          destinationLocation={destinationLocation}
          isSubmitting={state.isSubmitting}
          item={state.resolvedItem}
          notes={state.notes}
          onBack={() => workflow.setStep("enter_quantity")}
          onNotesChange={(notes) => workflow.setNotes(notes)}
          onSubmit={() => {
            void workflow.submitTransfer();
          }}
          quantity={state.quantityText}
          sourceLocation={sourceLocation}
          unit={state.unit}
        />
      ) : null}
    </section>
  );
}
