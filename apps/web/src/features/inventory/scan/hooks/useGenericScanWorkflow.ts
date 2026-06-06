import { useReducer } from "react";

import {
  useCameraScanning,
  useInventoryActor,
  useInventoryBarcodeLookup,
  useInventoryPermissions,
  useUnknownBarcodeManagement,
  type InventoryBarcode,
  type InventoryBarcodeFormat,
  type InventoryBarcodeItemReference,
  type InventoryBarcodeScanEvent,
  type InventoryCatalogItem,
  type UnknownBarcodeRecord
} from "@/domains/inventory";
import { useAuth } from "@/features/auth";

import type { GenericScanWorkflowState } from "../types/scanWorkflowUiTypes";

type GenericScanWorkflowAction =
  | { item: InventoryCatalogItem; type: "manual_select_item" }
  | { type: "reset" }
  | {
      barcode: InventoryBarcode;
      item: InventoryBarcodeItemReference;
      scannedAt: string;
      type: "scan_found";
    }
  | {
      barcode: InventoryBarcode;
      items: readonly InventoryBarcodeItemReference[];
      scannedAt: string;
      type: "scan_ambiguous";
    }
  | { barcode: InventoryBarcode; scannedAt: string; type: "scan_unknown" }
  | { duplicateOf: InventoryBarcodeScanEvent; type: "scan_duplicate" }
  | { error: string; type: "scan_invalid" }
  | { type: "scan_loading" }
  | { record: UnknownBarcodeRecord; type: "unknown_recorded" }
  | { error: string; type: "unknown_record_failed" }
  | { format: InventoryBarcodeFormat; type: "set_barcode_format" }
  | { rawValue: string; type: "set_barcode_raw_value" }
  | { searchText: string; type: "set_manual_search" }
  | { step: GenericScanWorkflowState["step"]; type: "set_step" };

export const initialGenericScanWorkflowState: GenericScanWorkflowState = {
  ambiguousItems: [],
  barcode: {
    error: null,
    format: "upc_a",
    rawValue: "",
    status: "idle"
  },
  duplicateOf: null,
  error: null,
  lastBarcode: null,
  manualSearchText: "",
  recentScans: [],
  resolvedItem: null,
  step: "scan_entry",
  unknownBarcode: null,
  unknownBarcodePersistenceError: null
};

function appendRecentScan(
  recentScans: readonly InventoryBarcodeScanEvent[],
  barcode: InventoryBarcode,
  scannedAt: string
): readonly InventoryBarcodeScanEvent[] {
  return [
    {
      barcode,
      scannedAt
    },
    ...recentScans
  ].slice(0, 5);
}

function clearResultState(state: GenericScanWorkflowState): GenericScanWorkflowState {
  return {
    ...state,
    ambiguousItems: [],
    duplicateOf: null,
    error: null,
    lastBarcode: null,
    resolvedItem: null,
    unknownBarcode: null,
    unknownBarcodePersistenceError: null
  };
}

export function genericScanWorkflowReducer(
  state: GenericScanWorkflowState,
  action: GenericScanWorkflowAction
): GenericScanWorkflowState {
  if (action.type === "reset") {
    return initialGenericScanWorkflowState;
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
      ...clearResultState(state),
      barcode: {
        ...state.barcode,
        error: null,
        rawValue: action.rawValue,
        status: "idle"
      },
      step: "scan_entry"
    };
  }

  if (action.type === "set_manual_search") {
    return {
      ...state,
      manualSearchText: action.searchText
    };
  }

  if (action.type === "set_step") {
    return {
      ...state,
      step: action.step
    };
  }

  if (action.type === "scan_loading") {
    return {
      ...clearResultState(state),
      barcode: {
        ...state.barcode,
        error: null,
        status: "loading"
      }
    };
  }

  if (action.type === "scan_found") {
    return {
      ...state,
      barcode: {
        ...state.barcode,
        error: null,
        status: "found"
      },
      lastBarcode: action.barcode,
      recentScans: appendRecentScan(state.recentScans, action.barcode, action.scannedAt),
      resolvedItem: action.item,
      step: "result"
    };
  }

  if (action.type === "scan_unknown") {
    return {
      ...state,
      barcode: {
        ...state.barcode,
        error: null,
        status: "unknown"
      },
      lastBarcode: action.barcode,
      recentScans: appendRecentScan(state.recentScans, action.barcode, action.scannedAt),
      step: "result"
    };
  }

  if (action.type === "scan_ambiguous") {
    return {
      ...state,
      ambiguousItems: action.items,
      barcode: {
        ...state.barcode,
        error: null,
        status: "ambiguous"
      },
      lastBarcode: action.barcode,
      recentScans: appendRecentScan(state.recentScans, action.barcode, action.scannedAt),
      step: "result"
    };
  }

  if (action.type === "scan_duplicate") {
    return {
      ...state,
      barcode: {
        ...state.barcode,
        error: null,
        status: "duplicate"
      },
      duplicateOf: action.duplicateOf,
      step: "result"
    };
  }

  if (action.type === "scan_invalid") {
    return {
      ...state,
      barcode: {
        ...state.barcode,
        error: action.error,
        status: "invalid"
      },
      step: "result"
    };
  }

  if (action.type === "unknown_recorded") {
    return {
      ...state,
      unknownBarcode: action.record,
      unknownBarcodePersistenceError: null
    };
  }

  if (action.type === "unknown_record_failed") {
    return {
      ...state,
      barcode: {
        ...state.barcode,
        status: "record_unknown_failed"
      },
      unknownBarcodePersistenceError: action.error
    };
  }

  return {
    ...state,
    barcode: {
      ...state.barcode,
      error: null,
      status: "manual_selected"
    },
    resolvedItem: action.item,
    step: "result"
  };
}

function formatValidationError(error: unknown): string {
  return error instanceof Error ? error.message : "Scan failed.";
}

function formatInvalidBarcodeError(errors: readonly { message: string }[]): string {
  return errors.map((error) => error.message).join(" ") || "Barcode is invalid.";
}

export function useGenericScanWorkflow() {
  const [state, dispatch] = useReducer(genericScanWorkflowReducer, initialGenericScanWorkflowState);
  const auth = useAuth();
  const actor = useInventoryActor();
  const permissions = useInventoryPermissions();
  const barcodeLookup = useInventoryBarcodeLookup();
  const unknownBarcodes = useUnknownBarcodeManagement();
  const cameraScanning = useCameraScanning();
  const organizationId = auth.currentOrganization?.id;
  const templeId = auth.currentTemple?.id;

  async function resolveBarcode() {
    if (!permissions.canReadInventory) {
      dispatch({ error: "You do not have permission to scan inventory.", type: "scan_invalid" });
      return;
    }

    if (!organizationId || !state.barcode.format) {
      dispatch({ error: "Organization and barcode format are required.", type: "scan_invalid" });
      return;
    }

    const scannedAt = new Date().toISOString();
    dispatch({ type: "scan_loading" });

    try {
      const result = await barcodeLookup.lookupScan(organizationId, {
        format: state.barcode.format,
        rawValue: state.barcode.rawValue,
        recentScans: state.recentScans,
        scannedAt
      });

      if (result.status === "duplicate") {
        dispatch({ duplicateOf: result.duplicateOf, type: "scan_duplicate" });
        return;
      }

      if (result.status === "invalid") {
        dispatch({ error: formatInvalidBarcodeError(result.errors), type: "scan_invalid" });
        return;
      }

      if (result.status === "found") {
        dispatch({ barcode: result.barcode, item: result.item, scannedAt, type: "scan_found" });
        return;
      }

      if (result.status === "ambiguous") {
        dispatch({
          barcode: result.barcode,
          items: result.items,
          scannedAt,
          type: "scan_ambiguous"
        });
        return;
      }

      dispatch({ barcode: result.barcode, scannedAt, type: "scan_unknown" });

      if (!actor) {
        dispatch({
          error: "Inventory actor is required to save unknown barcodes.",
          type: "unknown_record_failed"
        });
        return;
      }

      try {
        const record = await unknownBarcodes.recordUnknownBarcode({
          actor,
          clientId: `unknown-${result.barcode.format}-${result.barcode.value}-${scannedAt}`,
          format: result.barcode.format,
          organizationId,
          rawValue: result.barcode.value,
          scannedAt,
          sourceWorkflow: "scan",
          ...(templeId ? { templeId } : {})
        });

        dispatch({ record, type: "unknown_recorded" });
      } catch (error) {
        dispatch({ error: formatValidationError(error), type: "unknown_record_failed" });
      }
    } catch (error) {
      dispatch({ error: formatValidationError(error), type: "scan_invalid" });
    }
  }

  return {
    cameraAvailable: Boolean(cameraScanning),
    canScanInventory: permissions.canReadInventory,
    dispatch,
    resolveBarcode,
    resetWorkflow() {
      dispatch({ type: "reset" });
    },
    selectManualItem(item: InventoryCatalogItem) {
      dispatch({ item, type: "manual_select_item" });
    },
    setBarcodeFormat(format: InventoryBarcodeFormat) {
      dispatch({ format, type: "set_barcode_format" });
    },
    setBarcodeRawValue(rawValue: string) {
      dispatch({ rawValue, type: "set_barcode_raw_value" });
    },
    setManualSearchText(searchText: string) {
      dispatch({ searchText, type: "set_manual_search" });
    },
    setStep(step: GenericScanWorkflowState["step"]) {
      dispatch({ step, type: "set_step" });
    },
    state
  };
}
