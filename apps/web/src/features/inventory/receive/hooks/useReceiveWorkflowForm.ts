import { useReducer, useRef } from "react";
import type { ItemUnit } from "@krishnas-kitchen/types";

import {
  convertInventoryEntryToBase,
  getInventoryEntryUnits,
  useInventoryActor,
  useInventoryCatalogQueries,
  useInventoryPermissions,
  useInventoryVisibility,
  useReceivingWorkflow,
  type InventoryCatalogItem,
  type InventoryTransaction,
  type ReceivingResolvedItem
} from "@/domains/inventory";
import { useAuth } from "@/features/auth";

import type {
  ReceiveWorkflowSubmitInput,
  ReceiveWorkflowUiState,
  ReceiveWorkflowValidationErrors
} from "../types/receiveWorkflowUiTypes";

type ReceiveWorkflowAction =
  | { type: "barcode_error"; error: string; status: ReceiveWorkflowUiState["barcode"]["status"] }
  | { type: "barcode_loading" }
  | { type: "reset" }
  | { type: "resolve_item"; item: ReceivingResolvedItem; units: readonly ItemUnit[] }
  | {
      type: "receive_failed";
      error: string;
      validationErrors?: ReceiveWorkflowValidationErrors;
    }
  | {
      balances: ReceiveWorkflowUiState["balances"];
      receivedTransaction: InventoryTransaction;
      recentTransactions: readonly InventoryTransaction[];
      type: "receive_succeeded";
    }
  | { type: "set_barcode_format"; format: ReceiveWorkflowUiState["barcode"]["format"] }
  | { type: "set_barcode_raw_value"; rawValue: string }
  | { type: "set_location"; locationId: string }
  | { type: "set_manual_search"; searchText: string }
  | { type: "set_notes"; notes: string }
  | { type: "set_quantity"; quantityText: string }
  | { type: "set_step"; step: ReceiveWorkflowUiState["step"] }
  | { type: "set_unit"; unit: ReceiveWorkflowUiState["unit"] }
  | { type: "submit_started" };

export const initialReceiveWorkflowState: ReceiveWorkflowUiState = {
  availableUnits: [],
  balances: [],
  barcode: {
    error: null,
    format: "upc_a",
    rawValue: "",
    status: "idle"
  },
  error: null,
  isSubmitting: false,
  locationId: "",
  manualSearchText: "",
  notes: "",
  quantityText: "",
  receivedTransaction: null,
  recentTransactions: [],
  resolvedItem: null,
  step: "select_item",
  unit: "",
  validationErrors: {}
};

function getReceivingUnits(item: InventoryCatalogItem): readonly ItemUnit[] {
  return getInventoryEntryUnits(
    item,
    item.receivingUnits?.length ? item.receivingUnits : [item.defaultUnit]
  );
}

function getDefaultUnit(units: readonly ItemUnit[]): ItemUnit | "" {
  return units[0] ?? "";
}

function omitValidationError(
  errors: ReceiveWorkflowValidationErrors,
  field: keyof ReceiveWorkflowValidationErrors
): ReceiveWorkflowValidationErrors {
  const nextErrors = { ...errors };
  delete nextErrors[field];

  return nextErrors;
}

export function receiveWorkflowReducer(
  state: ReceiveWorkflowUiState,
  action: ReceiveWorkflowAction
): ReceiveWorkflowUiState {
  if (action.type === "reset") {
    return initialReceiveWorkflowState;
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
      step: "enter_quantity",
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

  if (action.type === "set_location") {
    return {
      ...state,
      locationId: action.locationId,
      step: state.resolvedItem && state.quantityText && state.unit ? "confirm" : state.step,
      validationErrors: omitValidationError(state.validationErrors, "locationId")
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

  if (action.type === "receive_failed") {
    return {
      ...state,
      error: action.error,
      isSubmitting: false,
      validationErrors: action.validationErrors ?? state.validationErrors
    };
  }

  return {
    ...state,
    balances: action.balances,
    error: null,
    isSubmitting: false,
    receivedTransaction: action.receivedTransaction,
    recentTransactions: action.recentTransactions,
    step: "success",
    validationErrors: {}
  };
}

function validateSubmit(state: ReceiveWorkflowUiState, hasActor: boolean, canReceive: boolean) {
  const errors: ReceiveWorkflowValidationErrors = {};
  const enteredQuantity = Number(state.quantityText);
  const converted =
    state.resolvedItem && state.unit
      ? convertInventoryEntryToBase(enteredQuantity, state.unit, state.resolvedItem.item)
      : { conversionFactor: null, quantity: enteredQuantity, unit: state.unit };

  if (!canReceive) {
    errors.permission = "You do not have permission to receive inventory.";
  }

  if (!hasActor) {
    errors.actor = "Inventory actor is required.";
  }

  if (!state.resolvedItem) {
    errors.item = "Select an item before receiving.";
  }

  if (!Number.isFinite(enteredQuantity) || enteredQuantity <= 0) {
    errors.quantity = "Enter a quantity greater than zero.";
  }

  if (!state.unit) {
    errors.unit = "Select a receiving unit.";
  }

  if (!state.locationId) {
    errors.locationId = "Select a receiving location.";
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

function getBarcodeResolutionMessage(status: string): string {
  if (status === "unknown") {
    return "Barcode not found. Search for the item manually below and continue receiving.";
  }

  if (status === "ambiguous") {
    return "Barcode matches more than one item. Search manually below and select the correct item.";
  }

  if (status === "invalid") {
    return "Barcode is invalid. Check the barcode format and value, or search manually below.";
  }

  if (status === "duplicate") {
    return "Barcode was scanned moments ago. Wait briefly or search manually below.";
  }

  if (status === "permission_denied") {
    return "Barcode lookup is unavailable. Search for the item manually below.";
  }

  return "Barcode lookup did not find a receivable item. Search manually below.";
}

export function useReceiveWorkflowForm() {
  const [state, dispatch] = useReducer(receiveWorkflowReducer, initialReceiveWorkflowState);
  const submitLock = useRef(false);
  const auth = useAuth();
  const actor = useInventoryActor();
  const permissions = useInventoryPermissions();
  const catalogQueries = useInventoryCatalogQueries();
  const receivingWorkflow = useReceivingWorkflow();
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
      const result = await receivingWorkflow.resolveScan({
        format: state.barcode.format,
        organizationId,
        permission: permissions.canReceiveInventory ? "granted" : "denied",
        rawValue: state.barcode.rawValue,
        scannedAt: new Date().toISOString()
      });

      if (result.status !== "resolved") {
        dispatch({
          error: getBarcodeResolutionMessage(result.status),
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
        units: catalogItem ? getReceivingUnits(catalogItem) : [result.resolvedItem.item.defaultUnit]
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
        type: "receive_failed"
      });
      return;
    }

    const result = await receivingWorkflow.resolveManualItem({
      item,
      organizationId,
      reason: "manual_receive_item_selection"
    });

    if (result.status !== "resolved") {
      dispatch({
        error: "Selected item is unavailable for receiving.",
        validationErrors: {
          item: "Selected item is unavailable for receiving."
        },
        type: "receive_failed"
      });
      return;
    }

    dispatch({
      item: result.resolvedItem,
      type: "resolve_item",
      units: getReceivingUnits(item)
    });
  }

  async function submitReceive(input: ReceiveWorkflowSubmitInput = {}) {
    if (submitLock.current || state.isSubmitting) {
      return;
    }

    const validation = validateSubmit(state, Boolean(actor), permissions.canReceiveInventory);

    if (!validation.ok || !actor || !state.resolvedItem || !state.unit || !templeId) {
      dispatch({
        error: "Receiving form is incomplete.",
        validationErrors: validation.errors,
        type: "receive_failed"
      });
      return;
    }

    dispatch({ type: "submit_started" });
    submitLock.current = true;

    try {
      const notes = state.notes.trim();
      const result = await receivingWorkflow.receiveResolvedItem({
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
        locationId: state.locationId,
        quantity: validation.quantity,
        resolvedItem: state.resolvedItem,
        templeId,
        unit: validation.unit as ItemUnit,
        ...(notes ? { notes } : {})
      });
      const recentTransactions = await visibility.getTransactionHistory({
        itemId: state.resolvedItem.item.id,
        limit: 25,
        organizationId: state.resolvedItem.organizationId,
        templeId
      });

      dispatch({
        balances: result.balances,
        receivedTransaction: result.receivedTransaction,
        recentTransactions,
        type: "receive_succeeded"
      });
    } catch (error) {
      dispatch({
        error: error instanceof Error ? error.message : "Receiving failed.",
        type: "receive_failed"
      });
    } finally {
      submitLock.current = false;
    }
  }

  return {
    canReceiveInventory: permissions.canReceiveInventory,
    dispatch,
    resetWorkflow() {
      dispatch({ type: "reset" });
    },
    resolveBarcode,
    selectManualItem,
    setBarcodeFormat(format: ReceiveWorkflowUiState["barcode"]["format"]) {
      dispatch({ format, type: "set_barcode_format" });
    },
    setBarcodeRawValue(rawValue: string) {
      dispatch({ rawValue, type: "set_barcode_raw_value" });
    },
    setLocationId(locationId: string) {
      dispatch({ locationId, type: "set_location" });
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
    setStep(step: ReceiveWorkflowUiState["step"]) {
      dispatch({ step, type: "set_step" });
    },
    setUnit(unit: ReceiveWorkflowUiState["unit"]) {
      dispatch({ unit, type: "set_unit" });
    },
    state,
    submitReceive
  };
}
