import { useReducer, useRef } from "react";
import type { ItemUnit } from "@krishnas-kitchen/types";

import {
  convertInventoryEntryToBase,
  getInventoryEntryUnits,
  useInventoryActor,
  useInventoryCatalogQueries,
  useInventoryPermissions,
  useInventoryVisibility,
  useReturnWorkflow,
  type InventoryCatalogItem,
  type InventoryTransaction,
  type ReturnResolvedItem
} from "@/domains/inventory";
import { useAuth } from "@/features/auth";

import type {
  ReturnWorkflowSubmitInput,
  ReturnWorkflowUiState,
  ReturnWorkflowValidationErrors
} from "../types/returnWorkflowUiTypes";

type ReturnWorkflowAction =
  | {
      error: string;
      status: ReturnWorkflowUiState["barcode"]["status"];
      type: "barcode_error";
    }
  | { type: "barcode_loading" }
  | { item: ReturnResolvedItem; type: "resolve_item"; units: readonly ItemUnit[] }
  | { type: "reset" }
  | {
      error: string;
      type: "return_failed";
      validationErrors?: ReturnWorkflowValidationErrors;
    }
  | {
      destinationBalances: ReturnWorkflowUiState["destinationBalances"];
      recentDestinationLocationTransactions: readonly InventoryTransaction[];
      recentItemTransactions: readonly InventoryTransaction[];
      recentSourceLocationTransactions: readonly InventoryTransaction[];
      returnedTransaction: InventoryTransaction;
      sourceBalances: ReturnWorkflowUiState["sourceBalances"];
      type: "return_succeeded";
    }
  | { format: ReturnWorkflowUiState["barcode"]["format"]; type: "set_barcode_format" }
  | { rawValue: string; type: "set_barcode_raw_value" }
  | { locationId: string; type: "set_destination_location" }
  | { searchText: string; type: "set_manual_search" }
  | { notes: string; type: "set_notes" }
  | { quantityText: string; type: "set_quantity" }
  | { locationId: string; type: "set_source_location" }
  | { step: ReturnWorkflowUiState["step"]; type: "set_step" }
  | { type: "submit_started" }
  | { unit: ReturnWorkflowUiState["unit"]; type: "set_unit" };

export const initialReturnWorkflowState: ReturnWorkflowUiState = {
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
  returnedTransaction: null,
  sourceBalances: [],
  sourceLocationId: "",
  step: "select_item",
  unit: "",
  validationErrors: {}
};

function getReturnUnits(item: InventoryCatalogItem): readonly ItemUnit[] {
  return getInventoryEntryUnits(
    item,
    item.returnUnits?.length ? item.returnUnits : [item.defaultUnit]
  );
}

function getDefaultUnit(units: readonly ItemUnit[]): ItemUnit | "" {
  return units[0] ?? "";
}

function omitValidationError(
  errors: ReturnWorkflowValidationErrors,
  field: keyof ReturnWorkflowValidationErrors
): ReturnWorkflowValidationErrors {
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
  errors: ReturnWorkflowValidationErrors,
  sourceLocationId: string,
  destinationLocationId: string
): ReturnWorkflowValidationErrors {
  const sameLocationError = getSameLocationError(sourceLocationId, destinationLocationId);
  const nextErrors = omitValidationError(errors, "sameLocation");

  return sameLocationError ? { ...nextErrors, sameLocation: sameLocationError } : nextErrors;
}

function getLocationStep(
  currentStep: ReturnWorkflowUiState["step"],
  sourceLocationId: string,
  destinationLocationId: string,
  validationErrors: ReturnWorkflowValidationErrors
): ReturnWorkflowUiState["step"] {
  if (!sourceLocationId || !destinationLocationId || validationErrors.sameLocation) {
    return "select_locations";
  }

  return currentStep === "select_locations" ? "enter_quantity" : currentStep;
}

export function returnWorkflowReducer(
  state: ReturnWorkflowUiState,
  action: ReturnWorkflowAction
): ReturnWorkflowUiState {
  if (action.type === "reset") {
    return initialReturnWorkflowState;
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

  if (action.type === "return_failed") {
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
    returnedTransaction: action.returnedTransaction,
    sourceBalances: action.sourceBalances,
    step: "success",
    validationErrors: {}
  };
}

function validateSubmit(state: ReturnWorkflowUiState, hasActor: boolean, canReturn: boolean) {
  const errors: ReturnWorkflowValidationErrors = {};
  const enteredQuantity = Number(state.quantityText);
  const converted =
    state.resolvedItem && state.unit
      ? convertInventoryEntryToBase(enteredQuantity, state.unit, state.resolvedItem.item)
      : { conversionFactor: null, quantity: enteredQuantity, unit: state.unit };
  const sameLocationError = getSameLocationError(
    state.sourceLocationId,
    state.destinationLocationId
  );

  if (!canReturn) {
    errors.permission = "You do not have permission to return inventory.";
  }

  if (!hasActor) {
    errors.actor = "Inventory actor is required.";
  }

  if (!state.resolvedItem) {
    errors.item = "Select an item before returning.";
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

  if (!Number.isFinite(enteredQuantity) || enteredQuantity <= 0) {
    errors.quantity = "Enter a quantity greater than zero.";
  }

  if (!state.unit) {
    errors.unit = "Select a return unit.";
  }

  return {
    errors,
    conversionFactor: converted.conversionFactor,
    enteredQuantity,
    ok: Object.keys(errors).length === 0,
    quantity: converted.quantity,
    unit: converted.unit
  };
}

export function useReturnWorkflowForm() {
  const [state, dispatch] = useReducer(returnWorkflowReducer, initialReturnWorkflowState);
  const submitLock = useRef(false);
  const auth = useAuth();
  const actor = useInventoryActor();
  const permissions = useInventoryPermissions();
  const catalogQueries = useInventoryCatalogQueries();
  const returnWorkflow = useReturnWorkflow();
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
      const result = await returnWorkflow.resolveScan({
        format: state.barcode.format,
        organizationId,
        permission: permissions.canReturnInventory ? "granted" : "denied",
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
        units: catalogItem ? getReturnUnits(catalogItem) : [result.resolvedItem.item.defaultUnit]
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
        type: "return_failed"
      });
      return;
    }

    const result = await returnWorkflow.resolveManualItem({
      item,
      organizationId,
      reason: "manual_return_item_selection"
    });

    if (result.status !== "resolved") {
      dispatch({
        error: "Selected item is unavailable for return.",
        validationErrors: {
          item: "Selected item is unavailable for return."
        },
        type: "return_failed"
      });
      return;
    }

    dispatch({
      item: result.resolvedItem,
      type: "resolve_item",
      units: getReturnUnits(item)
    });
  }

  async function submitReturn(input: ReturnWorkflowSubmitInput = {}) {
    if (submitLock.current || state.isSubmitting) {
      return;
    }

    const validation = validateSubmit(state, Boolean(actor), permissions.canReturnInventory);

    if (!validation.ok || !actor || !state.resolvedItem || !state.unit || !templeId) {
      dispatch({
        error: "Return form is incomplete.",
        validationErrors: validation.errors,
        type: "return_failed"
      });
      return;
    }

    dispatch({ type: "submit_started" });
    submitLock.current = true;

    try {
      const notes = state.notes.trim();
      const result = await returnWorkflow.returnResolvedItem({
        actor,
        auditMetadata: {
          ...(input.clientRequestId ? { clientRequestId: input.clientRequestId } : {}),
          ...(validation.conversionFactor
            ? {
                conversionFactor: validation.conversionFactor,
                handlingQuantity: validation.enteredQuantity,
                handlingUnit: state.unit
              }
            : {}),
          source: "online"
        },
        destinationLocationId: state.destinationLocationId,
        quantity: validation.quantity,
        resolvedItem: state.resolvedItem,
        sourceLocationId: state.sourceLocationId,
        templeId,
        unit: validation.unit as ItemUnit,
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
        returnedTransaction: result.returnedTransaction,
        sourceBalances: result.sourceBalances,
        type: "return_succeeded"
      });
    } catch (error) {
      dispatch({
        error: error instanceof Error ? error.message : "Return failed.",
        type: "return_failed"
      });
    } finally {
      submitLock.current = false;
    }
  }

  return {
    canReturnInventory: permissions.canReturnInventory,
    dispatch,
    resetWorkflow() {
      dispatch({ type: "reset" });
    },
    resolveBarcode,
    selectManualItem,
    setBarcodeFormat(format: ReturnWorkflowUiState["barcode"]["format"]) {
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
    setStep(step: ReturnWorkflowUiState["step"]) {
      dispatch({ step, type: "set_step" });
    },
    setUnit(unit: ReturnWorkflowUiState["unit"]) {
      dispatch({ unit, type: "set_unit" });
    },
    state,
    submitReturn
  };
}
