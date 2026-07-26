import { useReducer, useRef } from "react";
import type { ItemUnit } from "@krishnas-kitchen/types";

import {
  useConsumptionWorkflow,
  useInventoryActor,
  useInventoryCatalogQueries,
  useInventoryPermissions,
  useInventoryVisibility,
  type ConsumptionResolvedItem,
  type InventoryBalance,
  type InventoryCatalogItem,
  type InventoryTransaction
} from "@/domains/inventory";
import { useAuth } from "@/features/auth";

import type {
  ConsumeWorkflowSubmitInput,
  ConsumeWorkflowUiState,
  ConsumeWorkflowValidationErrors
} from "../types/consumeWorkflowUiTypes";

type ConsumeWorkflowAction =
  | {
      error: string;
      status: ConsumeWorkflowUiState["barcode"]["status"];
      type: "barcode_error";
    }
  | { type: "barcode_loading" }
  | { balances: readonly InventoryBalance[]; type: "balances_loaded" }
  | { item: ConsumptionResolvedItem; type: "resolve_item"; units: readonly ItemUnit[] }
  | { type: "reset" }
  | {
      error: string;
      type: "consume_failed";
      validationErrors?: ConsumeWorkflowValidationErrors;
    }
  | {
      consumedTransaction: InventoryTransaction;
      locationBalances: readonly InventoryBalance[];
      recentItemTransactions: readonly InventoryTransaction[];
      recentLocationTransactions: readonly InventoryTransaction[];
      type: "consume_succeeded";
    }
  | { format: ConsumeWorkflowUiState["barcode"]["format"]; type: "set_barcode_format" }
  | { rawValue: string; type: "set_barcode_raw_value" }
  | { locationId: string; type: "set_location" }
  | { searchText: string; type: "set_manual_search" }
  | { notes: string; type: "set_notes" }
  | { quantityText: string; type: "set_quantity" }
  | { step: ConsumeWorkflowUiState["step"]; type: "set_step" }
  | { type: "submit_started" }
  | { unit: ConsumeWorkflowUiState["unit"]; type: "set_unit" };

export const initialConsumeWorkflowState: ConsumeWorkflowUiState = {
  availableUnits: [],
  barcode: {
    error: null,
    format: "upc_a",
    rawValue: "",
    status: "idle"
  },
  consumedTransaction: null,
  error: null,
  isSubmitting: false,
  locationBalances: [],
  locationId: "",
  manualSearchText: "",
  notes: "",
  quantityText: "",
  recentItemTransactions: [],
  recentLocationTransactions: [],
  resolvedItem: null,
  step: "select_item",
  unit: "",
  validationErrors: {}
};

function getConsumptionUnits(item: InventoryCatalogItem): readonly ItemUnit[] {
  return item.consumptionUnits?.length ? item.consumptionUnits : [item.defaultUnit];
}

function getDefaultUnit(units: readonly ItemUnit[]): ItemUnit | "" {
  return units[0] ?? "";
}

function omitValidationError(
  errors: ConsumeWorkflowValidationErrors,
  field: keyof ConsumeWorkflowValidationErrors
): ConsumeWorkflowValidationErrors {
  const nextErrors = { ...errors };
  delete nextErrors[field];

  return nextErrors;
}

function getAvailableQuantity(
  balances: readonly InventoryBalance[],
  unit: ItemUnit | ""
): number | null {
  if (!unit) {
    return null;
  }

  return balances.find((balance) => balance.unit === unit)?.quantity ?? 0;
}

export function consumeWorkflowReducer(
  state: ConsumeWorkflowUiState,
  action: ConsumeWorkflowAction
): ConsumeWorkflowUiState {
  if (action.type === "reset") {
    return initialConsumeWorkflowState;
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
      step: "select_location",
      unit: state.unit || getDefaultUnit(action.units),
      validationErrors: {}
    };
  }

  if (action.type === "balances_loaded") {
    return {
      ...state,
      locationBalances: action.balances
    };
  }

  if (action.type === "set_manual_search") {
    return {
      ...state,
      manualSearchText: action.searchText
    };
  }

  if (action.type === "set_location") {
    return {
      ...state,
      locationId: action.locationId,
      locationBalances: [],
      step: action.locationId ? "enter_quantity" : "select_location",
      validationErrors: omitValidationError(state.validationErrors, "locationId")
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

  if (action.type === "consume_failed") {
    return {
      ...state,
      error: action.error,
      isSubmitting: false,
      validationErrors: action.validationErrors ?? state.validationErrors
    };
  }

  return {
    ...state,
    consumedTransaction: action.consumedTransaction,
    error: null,
    isSubmitting: false,
    locationBalances: action.locationBalances,
    recentItemTransactions: action.recentItemTransactions,
    recentLocationTransactions: action.recentLocationTransactions,
    step: "success",
    validationErrors: {}
  };
}

function validateSubmit(state: ConsumeWorkflowUiState, hasActor: boolean, canConsume: boolean) {
  const errors: ConsumeWorkflowValidationErrors = {};
  const quantity = Number(state.quantityText);
  const availableQuantity = getAvailableQuantity(state.locationBalances, state.unit);

  if (!canConsume) {
    errors.permission = "You do not have permission to consume inventory.";
  }

  if (!hasActor) {
    errors.actor = "Inventory actor is required.";
  }

  if (!state.resolvedItem) {
    errors.item = "Select an item before consuming.";
  }

  if (!state.locationId) {
    errors.locationId = "Select a location.";
  }

  if (!Number.isFinite(quantity) || quantity <= 0) {
    errors.quantity = "Enter a quantity greater than zero.";
  } else if (availableQuantity !== null && quantity > availableQuantity) {
    errors.quantity = `Only ${availableQuantity} ${state.unit} is available.`;
  }

  if (!state.unit) {
    errors.unit = "Select a consumption unit.";
  }

  return {
    errors,
    ok: Object.keys(errors).length === 0,
    quantity
  };
}

export function useConsumeWorkflowForm() {
  const [state, dispatch] = useReducer(consumeWorkflowReducer, initialConsumeWorkflowState);
  const submitLock = useRef(false);
  const auth = useAuth();
  const actor = useInventoryActor();
  const permissions = useInventoryPermissions();
  const catalogQueries = useInventoryCatalogQueries();
  const consumptionWorkflow = useConsumptionWorkflow();
  const visibility = useInventoryVisibility();
  const organizationId = auth.currentOrganization?.id;
  const templeId = auth.currentTemple?.id;

  async function loadLocationBalances(locationId = state.locationId) {
    if (!state.resolvedItem || !organizationId || !templeId || !locationId) {
      return;
    }

    const balances = await visibility.getVisibleBalances({
      itemId: state.resolvedItem.item.id,
      locationId,
      organizationId,
      templeId
    });

    dispatch({ balances, type: "balances_loaded" });
  }

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
      const result = await consumptionWorkflow.resolveScan({
        format: state.barcode.format,
        organizationId,
        permission: permissions.canConsumeInventory ? "granted" : "denied",
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
        units: catalogItem
          ? getConsumptionUnits(catalogItem)
          : [result.resolvedItem.item.defaultUnit]
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
        type: "consume_failed"
      });
      return;
    }

    const result = await consumptionWorkflow.resolveManualItem({
      item,
      organizationId,
      reason: "manual_consumption_item_selection"
    });

    if (result.status !== "resolved") {
      dispatch({
        error: "Selected item is unavailable for consumption.",
        validationErrors: {
          item: "Selected item is unavailable for consumption."
        },
        type: "consume_failed"
      });
      return;
    }

    dispatch({
      item: result.resolvedItem,
      type: "resolve_item",
      units: getConsumptionUnits(item)
    });
  }

  async function submitConsumption(input: ConsumeWorkflowSubmitInput = {}) {
    if (submitLock.current || state.isSubmitting) {
      return;
    }

    const validation = validateSubmit(state, Boolean(actor), permissions.canConsumeInventory);

    if (!validation.ok || !actor || !state.resolvedItem || !state.unit || !templeId) {
      dispatch({
        error: "Consumption form is incomplete.",
        validationErrors: validation.errors,
        type: "consume_failed"
      });
      return;
    }

    dispatch({ type: "submit_started" });
    submitLock.current = true;

    try {
      const notes = state.notes.trim();
      const result = await consumptionWorkflow.consumeResolvedItem({
        actor,
        auditMetadata: {
          ...(input.clientRequestId ? { clientRequestId: input.clientRequestId } : {}),
          source: "online"
        },
        locationId: state.locationId,
        quantity: validation.quantity,
        resolvedItem: state.resolvedItem,
        templeId,
        unit: state.unit,
        ...(notes ? { notes } : {})
      });
      const [recentItemTransactions, recentLocationTransactions] = await Promise.all([
        visibility.getTransactionHistory({
          itemId: state.resolvedItem.item.id,
          limit: 25,
          organizationId: state.resolvedItem.organizationId,
          templeId
        }),
        visibility.getTransactionHistory({
          limit: 25,
          locationId: state.locationId,
          organizationId: state.resolvedItem.organizationId,
          templeId
        })
      ]);

      dispatch({
        consumedTransaction: result.consumedTransaction,
        locationBalances: result.locationBalances,
        recentItemTransactions,
        recentLocationTransactions,
        type: "consume_succeeded"
      });
    } catch (error) {
      dispatch({
        error: error instanceof Error ? error.message : "Consumption failed.",
        type: "consume_failed"
      });
    } finally {
      submitLock.current = false;
    }
  }

  return {
    canConsumeInventory: permissions.canConsumeInventory,
    dispatch,
    loadLocationBalances,
    resetWorkflow() {
      dispatch({ type: "reset" });
    },
    resolveBarcode,
    selectManualItem,
    setBarcodeFormat(format: ConsumeWorkflowUiState["barcode"]["format"]) {
      dispatch({ format, type: "set_barcode_format" });
    },
    setBarcodeRawValue(rawValue: string) {
      dispatch({ rawValue, type: "set_barcode_raw_value" });
    },
    setLocationId(locationId: string) {
      dispatch({ locationId, type: "set_location" });
      void loadLocationBalances(locationId);
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
    setStep(step: ConsumeWorkflowUiState["step"]) {
      dispatch({ step, type: "set_step" });
    },
    setUnit(unit: ConsumeWorkflowUiState["unit"]) {
      dispatch({ unit, type: "set_unit" });
    },
    state,
    submitConsumption
  };
}
