import { useEffect, useMemo, useReducer, useRef } from "react";
import type { ItemUnit } from "@krishnas-kitchen/types";

import {
  convertInventoryBaseToEntry,
  convertInventoryEntryToBase,
  getInventoryEntryUnits,
  useInventoryActor,
  useInventoryCatalogQueries,
  useInventoryPermissions,
  useInventoryServices,
  useInventoryVisibility,
  type InventoryBalance,
  type InventoryCatalogItem,
  type InventoryCatalogLocation,
  type InventoryTransaction
} from "@/domains/inventory";
import { useAuth } from "@/features/auth";

import type {
  AdjustWorkflowUiState,
  AdjustWorkflowValidationErrors
} from "../types/adjustWorkflowUiTypes";

const adjustmentOptionLimit = 25;

type AdjustWorkflowAction =
  | { error: string; type: "load_failed" }
  | {
      items: readonly InventoryCatalogItem[];
      locations: readonly InventoryCatalogLocation[];
      type: "catalog_loaded";
    }
  | { balances: readonly InventoryBalance[]; currentQuantity: number; type: "balances_loaded" }
  | { itemSearchText: string; type: "set_item_search" }
  | { itemId: string; unit: ItemUnit | ""; type: "set_item" }
  | { locationId: string; type: "set_location" }
  | { physicalQuantityText: string; type: "set_physical_quantity" }
  | { reason: string; type: "set_reason" }
  | { step: AdjustWorkflowUiState["step"]; type: "set_step" }
  | { type: "submit_started" }
  | {
      error: string;
      type: "adjust_failed";
      validationErrors?: AdjustWorkflowValidationErrors;
    }
  | {
      adjustmentTransaction: InventoryTransaction | null;
      currentQuantity: number;
      recentItemTransactions: readonly InventoryTransaction[];
      recentLocationTransactions: readonly InventoryTransaction[];
      type: "adjust_succeeded";
      updatedBalances: readonly InventoryBalance[];
    }
  | { type: "reset" }
  | { unit: ItemUnit | ""; type: "set_unit" };

export const initialAdjustWorkflowState: AdjustWorkflowUiState = {
  adjustmentTransaction: null,
  currentQuantity: null,
  error: null,
  isSubmitting: false,
  itemSearchText: "",
  items: [],
  locationId: "",
  locations: [],
  noChangeRecorded: false,
  physicalQuantityText: "",
  reason: "",
  recentItemTransactions: [],
  recentLocationTransactions: [],
  selectedItemId: "",
  step: "select_details",
  unit: "",
  updatedBalances: [],
  validationErrors: {}
};

function omitValidationError(
  errors: AdjustWorkflowValidationErrors,
  field: keyof AdjustWorkflowValidationErrors
): AdjustWorkflowValidationErrors {
  const nextErrors = { ...errors };
  delete nextErrors[field];

  return nextErrors;
}

function getCurrentQuantity(
  balances: readonly InventoryBalance[],
  unit: ItemUnit | "",
  item: InventoryCatalogItem | null
): number {
  if (!unit || !item) {
    return 0;
  }

  for (const balance of balances) {
    const converted = convertInventoryBaseToEntry(balance.quantity, balance.unit, item, unit);
    if (converted !== null) {
      return converted;
    }
  }

  return 0;
}

export function adjustWorkflowReducer(
  state: AdjustWorkflowUiState,
  action: AdjustWorkflowAction
): AdjustWorkflowUiState {
  if (action.type === "reset") {
    return initialAdjustWorkflowState;
  }

  if (action.type === "catalog_loaded") {
    return {
      ...state,
      error: null,
      items: action.items,
      locations: action.locations
    };
  }

  if (action.type === "load_failed") {
    return {
      ...state,
      error: action.error
    };
  }

  if (action.type === "set_item_search") {
    return {
      ...state,
      itemSearchText: action.itemSearchText
    };
  }

  if (action.type === "set_item") {
    return {
      ...state,
      currentQuantity: null,
      selectedItemId: action.itemId,
      unit: action.unit,
      updatedBalances: [],
      validationErrors: omitValidationError(state.validationErrors, "itemId")
    };
  }

  if (action.type === "set_location") {
    return {
      ...state,
      currentQuantity: null,
      locationId: action.locationId,
      updatedBalances: [],
      validationErrors: omitValidationError(state.validationErrors, "locationId")
    };
  }

  if (action.type === "set_physical_quantity") {
    return {
      ...state,
      physicalQuantityText: action.physicalQuantityText,
      validationErrors: omitValidationError(state.validationErrors, "physicalQuantity")
    };
  }

  if (action.type === "set_reason") {
    return {
      ...state,
      reason: action.reason,
      validationErrors: omitValidationError(state.validationErrors, "reason")
    };
  }

  if (action.type === "set_unit") {
    return {
      ...state,
      currentQuantity: null,
      unit: action.unit,
      updatedBalances: [],
      validationErrors: omitValidationError(state.validationErrors, "unit")
    };
  }

  if (action.type === "balances_loaded") {
    return {
      ...state,
      currentQuantity: action.currentQuantity,
      updatedBalances: action.balances
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

  if (action.type === "adjust_failed") {
    return {
      ...state,
      error: action.error,
      isSubmitting: false,
      validationErrors: action.validationErrors ?? state.validationErrors
    };
  }

  return {
    ...state,
    adjustmentTransaction: action.adjustmentTransaction,
    currentQuantity: action.currentQuantity,
    error: null,
    isSubmitting: false,
    noChangeRecorded: !action.adjustmentTransaction,
    recentItemTransactions: action.recentItemTransactions,
    recentLocationTransactions: action.recentLocationTransactions,
    step: "success",
    updatedBalances: action.updatedBalances,
    validationErrors: {}
  };
}

function validateSubmit(state: AdjustWorkflowUiState, hasActor: boolean, canAdjust: boolean) {
  const errors: AdjustWorkflowValidationErrors = {};
  const physicalQuantity = Number(state.physicalQuantityText);

  if (!canAdjust) {
    errors.permission = "You do not have permission to adjust inventory.";
  }

  if (!hasActor) {
    errors.actor = "Inventory actor is required.";
  }

  if (!state.selectedItemId) {
    errors.itemId = "Select an item.";
  }

  if (!state.locationId) {
    errors.locationId = "Select a location.";
  }

  if (!state.unit) {
    errors.unit = "Select a unit.";
  }

  if (!Number.isFinite(physicalQuantity) || physicalQuantity < 0) {
    errors.physicalQuantity = "Enter a physical count of zero or more.";
  }

  if (!state.reason.trim()) {
    errors.reason = "Enter an adjustment reason.";
  }

  return {
    errors,
    ok: Object.keys(errors).length === 0,
    physicalQuantity
  };
}

export function useAdjustInventoryWorkflowForm() {
  const [state, dispatch] = useReducer(adjustWorkflowReducer, initialAdjustWorkflowState);
  const submitLock = useRef(false);
  const auth = useAuth();
  const actor = useInventoryActor();
  const permissions = useInventoryPermissions();
  const catalogQueries = useInventoryCatalogQueries();
  const services = useInventoryServices();
  const visibility = useInventoryVisibility();
  const organizationId = auth.currentOrganization?.id;
  const templeId = auth.currentTemple?.id;
  const selectedItem = useMemo(
    () => state.items.find((item) => item.id === state.selectedItemId) ?? null,
    [state.items, state.selectedItemId]
  );
  const selectedLocation = useMemo(
    () => state.locations.find((location) => location.id === state.locationId) ?? null,
    [state.locationId, state.locations]
  );
  const projectedDelta =
    state.currentQuantity === null || !state.physicalQuantityText.trim()
      ? null
      : Number(state.physicalQuantityText) - state.currentQuantity;

  useEffect(() => {
    if (!organizationId || !templeId) {
      dispatch({ error: "Organization and temple context are required.", type: "load_failed" });
      return;
    }

    let isActive = true;
    const currentOrganizationId = organizationId;
    const currentTempleId = templeId;

    async function loadCatalog() {
      try {
        const trimmedSearch = state.itemSearchText.trim();
        const [items, locations] = await Promise.all([
          catalogQueries.searchItems({
            limit: adjustmentOptionLimit,
            organizationId: currentOrganizationId,
            ...(trimmedSearch ? { searchText: trimmedSearch } : {})
          }),
          catalogQueries.listActiveLocations({
            limit: adjustmentOptionLimit,
            organizationId: currentOrganizationId,
            templeId: currentTempleId
          })
        ]);

        if (isActive) {
          dispatch({ items, locations, type: "catalog_loaded" });
        }
      } catch (error) {
        if (isActive) {
          dispatch({
            error: error instanceof Error ? error.message : "Adjustment catalog failed to load.",
            type: "load_failed"
          });
        }
      }
    }

    void loadCatalog();

    return () => {
      isActive = false;
    };
  }, [catalogQueries, organizationId, state.itemSearchText, templeId]);

  async function loadCurrentQuantity(
    itemId = state.selectedItemId,
    locationId = state.locationId,
    unit = state.unit,
    itemOverride?: InventoryCatalogItem | null
  ) {
    if (!organizationId || !templeId || !itemId || !locationId || !unit) {
      return;
    }

    const balances = await visibility.getVisibleBalances({
      itemId,
      locationId,
      organizationId,
      templeId
    });

    dispatch({
      balances,
      currentQuantity: getCurrentQuantity(
        balances,
        unit,
        itemOverride ?? state.items.find((item) => item.id === itemId) ?? null
      ),
      type: "balances_loaded"
    });
  }

  async function submitAdjustment() {
    if (submitLock.current || state.isSubmitting) {
      return;
    }

    const validation = validateSubmit(state, Boolean(actor), permissions.canAdjustInventory);

    if (!validation.ok || !actor || !organizationId || !templeId || !state.unit || !selectedItem) {
      dispatch({
        error: "Adjustment form is incomplete.",
        type: "adjust_failed",
        validationErrors: validation.errors
      });
      return;
    }

    dispatch({ type: "submit_started" });
    submitLock.current = true;

    try {
      const converted = convertInventoryEntryToBase(
        validation.physicalQuantity,
        state.unit,
        selectedItem
      );
      const result = await services.inventory.adjustInventory({
        actor,
        auditMetadata: {
          reason: state.reason.trim(),
          source: "online",
          ...(converted.conversionFactor
            ? {
                conversionFactor: converted.conversionFactor,
                handlingQuantity: Math.abs(
                  validation.physicalQuantity - (state.currentQuantity ?? 0)
                ),
                handlingUnit: state.unit
              }
            : {})
        },
        itemId: state.selectedItemId,
        locationId: state.locationId,
        organizationId,
        physicalQuantity: converted.quantity,
        reason: state.reason,
        templeId,
        unit: converted.unit
      });
      const [updatedBalances, recentItemTransactions, recentLocationTransactions] =
        await Promise.all([
          visibility.getVisibleBalances({
            itemId: state.selectedItemId,
            locationId: state.locationId,
            organizationId,
            templeId
          }),
          visibility.getTransactionHistory({
            itemId: state.selectedItemId,
            limit: 25,
            organizationId,
            templeId
          }),
          visibility.getTransactionHistory({
            limit: 25,
            locationId: state.locationId,
            organizationId,
            templeId
          })
        ]);

      dispatch({
        adjustmentTransaction: result.transaction,
        currentQuantity: validation.physicalQuantity,
        recentItemTransactions,
        recentLocationTransactions,
        type: "adjust_succeeded",
        updatedBalances
      });
    } catch (error) {
      dispatch({
        error: error instanceof Error ? error.message : "Inventory adjustment failed.",
        type: "adjust_failed"
      });
    } finally {
      submitLock.current = false;
    }
  }

  return {
    canAdjustInventory: permissions.canAdjustInventory,
    dispatch,
    itemUnits: selectedItem ? getInventoryEntryUnits(selectedItem) : [],
    loadCurrentQuantity,
    projectedDelta,
    resetWorkflow() {
      dispatch({ type: "reset" });
    },
    selectedItem,
    selectedLocation,
    setItemId(itemId: string) {
      const item = state.items.find((candidate) => candidate.id === itemId) ?? null;

      const unit = item?.handlingUnit ?? item?.defaultUnit ?? "";
      dispatch({ itemId, type: "set_item", unit });
      void loadCurrentQuantity(itemId, state.locationId, unit, item);
    },
    setItemSearchText(itemSearchText: string) {
      dispatch({ itemSearchText, type: "set_item_search" });
    },
    setLocationId(locationId: string) {
      dispatch({ locationId, type: "set_location" });
      void loadCurrentQuantity(state.selectedItemId, locationId, state.unit);
    },
    setPhysicalQuantityText(physicalQuantityText: string) {
      dispatch({ physicalQuantityText, type: "set_physical_quantity" });
    },
    setReason(reason: string) {
      dispatch({ reason, type: "set_reason" });
    },
    setStep(step: AdjustWorkflowUiState["step"]) {
      dispatch({ step, type: "set_step" });
    },
    setUnit(unit: ItemUnit | "") {
      dispatch({ unit, type: "set_unit" });
      void loadCurrentQuantity(state.selectedItemId, state.locationId, unit);
    },
    state,
    submitAdjustment
  };
}
