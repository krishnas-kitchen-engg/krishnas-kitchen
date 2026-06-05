import { useReducer } from "react";
import type { ItemUnit } from "@krishnas-kitchen/types";

import {
  useInventoryActor,
  useInventoryCatalogQueries,
  useInventoryPermissions,
  useInventoryVisibility,
  useTransferWorkflow,
  type InventoryCatalogItem,
  type InventoryTransaction,
  type TransferResolvedItem
} from "@/domains/inventory";
import { useAuth } from "@/features/auth";

import type {
  TransferWorkflowSubmitInput,
  TransferWorkflowUiState,
  TransferWorkflowValidationErrors
} from "../types/transferWorkflowUiTypes";

type TransferWorkflowAction =
  | {
      error: string;
      status: TransferWorkflowUiState["barcode"]["status"];
      type: "barcode_error";
    }
  | { type: "barcode_loading" }
  | { item: TransferResolvedItem; type: "resolve_item"; units: readonly ItemUnit[] }
  | { type: "reset" }
  | {
      error: string;
      type: "transfer_failed";
      validationErrors?: TransferWorkflowValidationErrors;
    }
  | {
      destinationBalances: TransferWorkflowUiState["destinationBalances"];
      recentDestinationLocationTransactions: readonly InventoryTransaction[];
      recentItemTransactions: readonly InventoryTransaction[];
      recentSourceLocationTransactions: readonly InventoryTransaction[];
      sourceBalances: TransferWorkflowUiState["sourceBalances"];
      transferTransaction: InventoryTransaction;
      type: "transfer_succeeded";
    }
  | { format: TransferWorkflowUiState["barcode"]["format"]; type: "set_barcode_format" }
  | { rawValue: string; type: "set_barcode_raw_value" }
  | { locationId: string; type: "set_destination_location" }
  | { searchText: string; type: "set_manual_search" }
  | { notes: string; type: "set_notes" }
  | { quantityText: string; type: "set_quantity" }
  | { locationId: string; type: "set_source_location" }
  | { step: TransferWorkflowUiState["step"]; type: "set_step" }
  | { type: "submit_started" }
  | { unit: TransferWorkflowUiState["unit"]; type: "set_unit" };

export const initialTransferWorkflowState: TransferWorkflowUiState = {
  availableUnits: [],
  barcode: {
    error: null,
    format: "upc_a",
    rawValue: "",
    status: "idle"
  },
  destinationBalances: [],
  destinationLocationId: "",
  error: null,
  isSubmitting: false,
  manualSearchText: "",
  notes: "",
  quantityText: "",
  recentDestinationLocationTransactions: [],
  recentItemTransactions: [],
  recentSourceLocationTransactions: [],
  resolvedItem: null,
  sourceBalances: [],
  sourceLocationId: "",
  step: "select_item",
  transferTransaction: null,
  unit: "",
  validationErrors: {}
};

function getTransferUnits(item: InventoryCatalogItem): readonly ItemUnit[] {
  return item.transferUnits?.length ? item.transferUnits : [item.defaultUnit];
}

function getDefaultUnit(units: readonly ItemUnit[]): ItemUnit | "" {
  return units[0] ?? "";
}

function omitValidationError(
  errors: TransferWorkflowValidationErrors,
  field: keyof TransferWorkflowValidationErrors
): TransferWorkflowValidationErrors {
  const nextErrors = { ...errors };
  delete nextErrors[field];

  return nextErrors;
}

function getSameLocationError(
  sourceLocationId: string,
  destinationLocationId: string
): string | null {
  return sourceLocationId && destinationLocationId && sourceLocationId === destinationLocationId
    ? "Source and destination must be different."
    : null;
}

function updateSameLocationError(
  errors: TransferWorkflowValidationErrors,
  sourceLocationId: string,
  destinationLocationId: string
): TransferWorkflowValidationErrors {
  const sameLocationError = getSameLocationError(sourceLocationId, destinationLocationId);
  const nextErrors = omitValidationError(errors, "sameLocation");

  return sameLocationError ? { ...nextErrors, sameLocation: sameLocationError } : nextErrors;
}

function getLocationStep(
  currentStep: TransferWorkflowUiState["step"],
  sourceLocationId: string,
  destinationLocationId: string,
  validationErrors: TransferWorkflowValidationErrors
): TransferWorkflowUiState["step"] {
  if (!sourceLocationId || !destinationLocationId || validationErrors.sameLocation) {
    return "select_locations";
  }

  return currentStep === "select_locations" ? "enter_quantity" : currentStep;
}

export function transferWorkflowReducer(
  state: TransferWorkflowUiState,
  action: TransferWorkflowAction
): TransferWorkflowUiState {
  if (action.type === "reset") {
    return initialTransferWorkflowState;
  }

  if (action.type === "set_barcode_format") {
    return {
      ...state,
      barcode: {
        ...state.barcode,
        format: action.format
      }
    };
  }

  if (action.type === "set_barcode_raw_value") {
    return {
      ...state,
      barcode: {
        ...state.barcode,
        error: null,
        rawValue: action.rawValue,
        status: "idle"
      }
    };
  }

  if (action.type === "barcode_loading") {
    return {
      ...state,
      barcode: {
        ...state.barcode,
        error: null,
        status: "loading"
      }
    };
  }

  if (action.type === "barcode_error") {
    return {
      ...state,
      barcode: {
        ...state.barcode,
        error: action.error,
        status: action.status
      }
    };
  }

  if (action.type === "resolve_item") {
    return {
      ...state,
      availableUnits: action.units,
      barcode: {
        ...state.barcode,
        error: null,
        status: action.item.source === "scan" ? "found" : state.barcode.status
      },
      error: null,
      resolvedItem: action.item,
      step: "select_locations",
      unit: state.unit || getDefaultUnit(action.units),
      validationErrors: {}
    };
  }

  if (action.type === "set_manual_search") {
    return {
      ...state,
      manualSearchText: action.searchText
    };
  }

  if (action.type === "set_source_location") {
    const validationErrors = updateSameLocationError(
      omitValidationError(state.validationErrors, "sourceLocationId"),
      action.locationId,
      state.destinationLocationId
    );

    return {
      ...state,
      sourceLocationId: action.locationId,
      step: getLocationStep(
        state.step,
        action.locationId,
        state.destinationLocationId,
        validationErrors
      ),
      validationErrors
    };
  }

  if (action.type === "set_destination_location") {
    const validationErrors = updateSameLocationError(
      omitValidationError(state.validationErrors, "destinationLocationId"),
      state.sourceLocationId,
      action.locationId
    );

    return {
      ...state,
      destinationLocationId: action.locationId,
      step: getLocationStep(
        state.step,
        state.sourceLocationId,
        action.locationId,
        validationErrors
      ),
      validationErrors
    };
  }

  if (action.type === "set_quantity") {
    return {
      ...state,
      quantityText: action.quantityText,
      validationErrors: omitValidationError(state.validationErrors, "quantity")
    };
  }

  if (action.type === "set_unit") {
    return {
      ...state,
      unit: action.unit,
      validationErrors: omitValidationError(state.validationErrors, "unit")
    };
  }

  if (action.type === "set_notes") {
    return {
      ...state,
      notes: action.notes
    };
  }

  if (action.type === "set_step") {
    return {
      ...state,
      step: action.step
    };
  }

  if (action.type === "submit_started") {
    return {
      ...state,
      error: null,
      isSubmitting: true,
      validationErrors: {}
    };
  }

  if (action.type === "transfer_failed") {
    return {
      ...state,
      error: action.error,
      isSubmitting: false,
      validationErrors: action.validationErrors ?? state.validationErrors
    };
  }

  return {
    ...state,
    destinationBalances: action.destinationBalances,
    error: null,
    isSubmitting: false,
    recentDestinationLocationTransactions: action.recentDestinationLocationTransactions,
    recentItemTransactions: action.recentItemTransactions,
    recentSourceLocationTransactions: action.recentSourceLocationTransactions,
    sourceBalances: action.sourceBalances,
    step: "success",
    transferTransaction: action.transferTransaction,
    validationErrors: {}
  };
}

function validateSubmit(state: TransferWorkflowUiState, hasActor: boolean, canTransfer: boolean) {
  const errors: TransferWorkflowValidationErrors = {};
  const quantity = Number(state.quantityText);
  const sameLocationError = getSameLocationError(
    state.sourceLocationId,
    state.destinationLocationId
  );

  if (!canTransfer) {
    errors.permission = "You do not have permission to transfer inventory.";
  }

  if (!hasActor) {
    errors.actor = "Inventory actor is required.";
  }

  if (!state.resolvedItem) {
    errors.item = "Select an item before transferring.";
  }

  if (!state.sourceLocationId) {
    errors.sourceLocationId = "Select a source location.";
  }

  if (!state.destinationLocationId) {
    errors.destinationLocationId = "Select a destination location.";
  }

  if (sameLocationError) {
    errors.sameLocation = sameLocationError;
  }

  if (!Number.isFinite(quantity) || quantity <= 0) {
    errors.quantity = "Enter a quantity greater than zero.";
  }

  if (!state.unit) {
    errors.unit = "Select a transfer unit.";
  }

  return {
    errors,
    ok: Object.keys(errors).length === 0,
    quantity
  };
}

export function useTransferWorkflowForm() {
  const [state, dispatch] = useReducer(transferWorkflowReducer, initialTransferWorkflowState);
  const auth = useAuth();
  const actor = useInventoryActor();
  const permissions = useInventoryPermissions();
  const catalogQueries = useInventoryCatalogQueries();
  const transferWorkflow = useTransferWorkflow();
  const visibility = useInventoryVisibility();
  const organizationId = auth.currentOrganization?.id;
  const templeId = auth.currentTemple?.id;

  async function resolveBarcode() {
    if (!organizationId || !state.barcode.format) {
      dispatch({
        error: "Organization and barcode format are required.",
        status: "invalid",
        type: "barcode_error"
      });
      return;
    }

    dispatch({ type: "barcode_loading" });

    try {
      const result = await transferWorkflow.resolveScan({
        format: state.barcode.format,
        organizationId,
        permission: permissions.canTransferInventory ? "granted" : "denied",
        rawValue: state.barcode.rawValue,
        scannedAt: new Date().toISOString()
      });

      if (result.status !== "resolved") {
        dispatch({
          error: `Barcode ${result.status.replace("_", " ")}.`,
          status:
            result.status === "permission_denied" || result.status === "duplicate"
              ? "invalid"
              : result.status,
          type: "barcode_error"
        });
        return;
      }

      const catalogItem = await catalogQueries.findItemById(
        result.resolvedItem.organizationId,
        result.resolvedItem.item.id
      );

      dispatch({
        item: catalogItem
          ? {
              ...result.resolvedItem,
              item: catalogItem
            }
          : result.resolvedItem,
        type: "resolve_item",
        units: catalogItem ? getTransferUnits(catalogItem) : [result.resolvedItem.item.defaultUnit]
      });
    } catch (error) {
      dispatch({
        error: error instanceof Error ? error.message : "Barcode lookup failed.",
        status: "invalid",
        type: "barcode_error"
      });
    }
  }

  async function selectManualItem(item: InventoryCatalogItem) {
    if (!organizationId) {
      dispatch({
        error: "Organization context is required.",
        validationErrors: {
          item: "Organization context is required."
        },
        type: "transfer_failed"
      });
      return;
    }

    const result = await transferWorkflow.resolveManualItem({
      item,
      organizationId,
      reason: "manual_transfer_item_selection"
    });

    if (result.status !== "resolved") {
      dispatch({
        error: "Selected item is unavailable for transfer.",
        validationErrors: {
          item: "Selected item is unavailable for transfer."
        },
        type: "transfer_failed"
      });
      return;
    }

    dispatch({
      item: result.resolvedItem,
      type: "resolve_item",
      units: getTransferUnits(item)
    });
  }

  async function submitTransfer(input: TransferWorkflowSubmitInput = {}) {
    const validation = validateSubmit(state, Boolean(actor), permissions.canTransferInventory);

    if (!validation.ok || !actor || !state.resolvedItem || !state.unit || !templeId) {
      dispatch({
        error: "Transfer form is incomplete.",
        validationErrors: validation.errors,
        type: "transfer_failed"
      });
      return;
    }

    dispatch({ type: "submit_started" });

    try {
      const notes = state.notes.trim();
      const result = await transferWorkflow.transferResolvedItem({
        actor,
        auditMetadata: {
          ...(input.clientRequestId ? { clientRequestId: input.clientRequestId } : {}),
          source: "online"
        },
        destinationLocationId: state.destinationLocationId,
        quantity: validation.quantity,
        resolvedItem: state.resolvedItem,
        sourceLocationId: state.sourceLocationId,
        templeId,
        unit: state.unit,
        ...(notes ? { notes } : {})
      });
      const [
        recentItemTransactions,
        recentSourceLocationTransactions,
        recentDestinationLocationTransactions
      ] = await Promise.all([
        visibility.getTransactionHistory({
          itemId: state.resolvedItem.item.id,
          limit: 25,
          organizationId: state.resolvedItem.organizationId,
          templeId
        }),
        visibility.getTransactionHistory({
          limit: 25,
          locationId: state.sourceLocationId,
          organizationId: state.resolvedItem.organizationId,
          templeId
        }),
        visibility.getTransactionHistory({
          limit: 25,
          locationId: state.destinationLocationId,
          organizationId: state.resolvedItem.organizationId,
          templeId
        })
      ]);

      dispatch({
        destinationBalances: result.destinationBalances,
        recentDestinationLocationTransactions,
        recentItemTransactions,
        recentSourceLocationTransactions,
        sourceBalances: result.sourceBalances,
        transferTransaction: result.transferTransaction,
        type: "transfer_succeeded"
      });
    } catch (error) {
      dispatch({
        error: error instanceof Error ? error.message : "Transfer failed.",
        type: "transfer_failed"
      });
    }
  }

  return {
    canTransferInventory: permissions.canTransferInventory,
    dispatch,
    resetWorkflow() {
      dispatch({ type: "reset" });
    },
    resolveBarcode,
    selectManualItem,
    setBarcodeFormat(format: TransferWorkflowUiState["barcode"]["format"]) {
      dispatch({ format, type: "set_barcode_format" });
    },
    setBarcodeRawValue(rawValue: string) {
      dispatch({ rawValue, type: "set_barcode_raw_value" });
    },
    setDestinationLocationId(locationId: string) {
      dispatch({ locationId, type: "set_destination_location" });
    },
    setManualSearchText(searchText: string) {
      dispatch({ searchText, type: "set_manual_search" });
    },
    setNotes(notes: string) {
      dispatch({ notes, type: "set_notes" });
    },
    setQuantityText(quantityText: string) {
      dispatch({ quantityText, type: "set_quantity" });
    },
    setSourceLocationId(locationId: string) {
      dispatch({ locationId, type: "set_source_location" });
    },
    setStep(step: TransferWorkflowUiState["step"]) {
      dispatch({ step, type: "set_step" });
    },
    setUnit(unit: TransferWorkflowUiState["unit"]) {
      dispatch({ unit, type: "set_unit" });
    },
    state,
    submitTransfer
  };
}
