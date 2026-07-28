import { useEffect, useMemo, useRef, useState } from "react";
import type { ItemUnit } from "@krishnas-kitchen/types";

import {
  createItemManagementService,
  createSupabaseItemManagementRepository,
  ITEM_MANAGEMENT_UNITS,
  useInventoryActor,
  type ManagedInventoryItem
} from "@/domains/inventory";
import {
  createProcurementAdminService,
  createSupabaseProcurementAdminRepository,
  type ItemPurchasePreferenceRecord,
  type ProcurementActor,
  type PurchaseLocationRecord
} from "@/domains/procurement";
import { hasPermission, useAuth } from "@/features/auth";

type PurchaseLocationForm = {
  defaultPurchaserUserId: string;
  description: string;
  name: string;
  notes: string;
};

type ItemPreferenceForm = {
  estimatedUnitCostText: string;
  itemId: string;
  notes: string;
  packSizeText: string;
  preferredPurchaseLocationId: string;
  preferredPurchaseUnit: ItemUnit | "";
  purchaserUserId: string;
};

export type ProcurementAdminSetupState = {
  error: string | null;
  isLoading: boolean;
  isSubmitting: boolean;
  itemPreferenceForm: ItemPreferenceForm;
  items: readonly ManagedInventoryItem[];
  locationForm: PurchaseLocationForm;
  purchaseLocations: readonly PurchaseLocationRecord[];
  purchasePreferences: readonly ItemPurchasePreferenceRecord[];
};

const initialLocationForm: PurchaseLocationForm = {
  defaultPurchaserUserId: "",
  description: "",
  name: "",
  notes: ""
};

const initialItemPreferenceForm: ItemPreferenceForm = {
  estimatedUnitCostText: "",
  itemId: "",
  notes: "",
  packSizeText: "",
  preferredPurchaseLocationId: "",
  preferredPurchaseUnit: "",
  purchaserUserId: ""
};

function optionalId(value: string): string | null {
  const trimmedValue = value.trim();

  return trimmedValue ? trimmedValue : null;
}

function optionalNumber(value: string): number | null {
  const trimmedValue = value.trim();

  return trimmedValue ? Number(trimmedValue) : null;
}

function toProcurementActor(actor: ReturnType<typeof useInventoryActor>): ProcurementActor | null {
  if (!actor) {
    return null;
  }

  if (actor.type === "temporary_volunteer") {
    return {
      tempSessionId: actor.tempSessionId,
      type: actor.type
    };
  }

  if (actor.type === "user") {
    return {
      type: actor.type,
      userId: actor.userId
    };
  }

  return {
    type: "system"
  };
}

export function useProcurementAdminSetup() {
  const auth = useAuth();
  const inventoryActor = useInventoryActor();
  const procurementActor = useMemo(() => toProcurementActor(inventoryActor), [inventoryActor]);
  const organizationId = auth.currentOrganization?.id;
  const templeId = auth.currentTemple?.id;
  const canManageProcurement = hasPermission(auth.permissions, "procurement.admin");
  const submitLock = useRef(false);
  const procurementService = useMemo(() => {
    if (!auth.client) {
      return null;
    }

    return createProcurementAdminService(createSupabaseProcurementAdminRepository(auth.client));
  }, [auth.client]);
  const itemService = useMemo(() => {
    if (!auth.client) {
      return null;
    }

    return createItemManagementService(createSupabaseItemManagementRepository(auth.client));
  }, [auth.client]);
  const [refreshIndex, setRefreshIndex] = useState(0);
  const [state, setState] = useState<ProcurementAdminSetupState>({
    error: null,
    isLoading: false,
    isSubmitting: false,
    itemPreferenceForm: initialItemPreferenceForm,
    items: [],
    locationForm: initialLocationForm,
    purchaseLocations: [],
    purchasePreferences: []
  });

  const activeItems = useMemo(() => state.items.filter((item) => !item.deletedAt), [state.items]);
  const activePurchaseLocations = useMemo(
    () => state.purchaseLocations.filter((location) => !location.archivedAt),
    [state.purchaseLocations]
  );

  useEffect(() => {
    if (
      !canManageProcurement ||
      !organizationId ||
      !templeId ||
      !procurementService ||
      !itemService
    ) {
      setState((currentState) => ({
        ...currentState,
        error: null,
        isLoading: false,
        items: [],
        purchaseLocations: [],
        purchasePreferences: []
      }));
      return;
    }

    let isActive = true;
    const currentItemService = itemService;
    const currentProcurementService = procurementService;
    const scope = {
      organizationId,
      templeId
    };

    async function load() {
      setState((currentState) => ({
        ...currentState,
        error: null,
        isLoading: true
      }));

      try {
        const [purchaseLocations, purchasePreferences, items] = await Promise.all([
          currentProcurementService.listPurchaseLocations(scope),
          currentProcurementService.listItemPurchasePreferences(scope),
          currentItemService.listItems(scope)
        ]);

        if (isActive) {
          setState((currentState) => ({
            ...currentState,
            error: null,
            isLoading: false,
            items,
            purchaseLocations,
            purchasePreferences
          }));
        }
      } catch (error) {
        if (isActive) {
          setState((currentState) => ({
            ...currentState,
            error: error instanceof Error ? error.message : "Procurement setup failed to load.",
            isLoading: false
          }));
        }
      }
    }

    void load();

    return () => {
      isActive = false;
    };
  }, [
    canManageProcurement,
    itemService,
    organizationId,
    procurementService,
    refreshIndex,
    templeId
  ]);

  function refresh() {
    setRefreshIndex((currentIndex) => currentIndex + 1);
  }

  async function createPurchaseLocation() {
    if (
      submitLock.current ||
      state.isSubmitting ||
      !organizationId ||
      !templeId ||
      !procurementActor ||
      !procurementService ||
      !canManageProcurement
    ) {
      return;
    }

    submitLock.current = true;
    setState((currentState) => ({
      ...currentState,
      error: null,
      isSubmitting: true
    }));

    try {
      await procurementService.createPurchaseLocation({
        createdBy: procurementActor,
        defaultPurchaserUserId: optionalId(state.locationForm.defaultPurchaserUserId),
        description: state.locationForm.description,
        name: state.locationForm.name,
        notes: state.locationForm.notes,
        organizationId,
        templeId
      });

      setState((currentState) => ({
        ...currentState,
        isSubmitting: false,
        locationForm: initialLocationForm
      }));
      refresh();
    } catch (error) {
      setState((currentState) => ({
        ...currentState,
        error: error instanceof Error ? error.message : "Purchase location save failed.",
        isSubmitting: false
      }));
    } finally {
      submitLock.current = false;
    }
  }

  async function setPurchaseLocationArchived(location: PurchaseLocationRecord, archived: boolean) {
    if (
      submitLock.current ||
      state.isSubmitting ||
      !organizationId ||
      !templeId ||
      !procurementActor ||
      !procurementService ||
      !canManageProcurement
    ) {
      return;
    }

    submitLock.current = true;
    setState((currentState) => ({
      ...currentState,
      error: null,
      isSubmitting: true
    }));

    try {
      if (archived) {
        await procurementService.archivePurchaseLocation({
          archivedBy: procurementActor,
          id: location.id,
          organizationId,
          templeId
        });
      } else {
        await procurementService.restorePurchaseLocation({
          archivedBy: procurementActor,
          id: location.id,
          organizationId,
          templeId
        });
      }

      setState((currentState) => ({
        ...currentState,
        isSubmitting: false
      }));
      refresh();
    } catch (error) {
      setState((currentState) => ({
        ...currentState,
        error: error instanceof Error ? error.message : "Purchase location status update failed.",
        isSubmitting: false
      }));
    } finally {
      submitLock.current = false;
    }
  }

  async function createItemPurchasePreference() {
    if (
      submitLock.current ||
      state.isSubmitting ||
      !organizationId ||
      !templeId ||
      !procurementActor ||
      !procurementService ||
      !canManageProcurement ||
      !state.itemPreferenceForm.itemId ||
      !state.itemPreferenceForm.preferredPurchaseLocationId
    ) {
      return;
    }

    submitLock.current = true;
    setState((currentState) => ({
      ...currentState,
      error: null,
      isSubmitting: true
    }));

    try {
      await procurementService.createItemPurchasePreference({
        createdBy: procurementActor,
        estimatedUnitCost: optionalNumber(state.itemPreferenceForm.estimatedUnitCostText),
        itemId: state.itemPreferenceForm.itemId,
        notes: state.itemPreferenceForm.notes,
        organizationId,
        packSize: optionalNumber(state.itemPreferenceForm.packSizeText),
        preferredPurchaseLocationId: state.itemPreferenceForm.preferredPurchaseLocationId,
        preferredPurchaseUnit: state.itemPreferenceForm.preferredPurchaseUnit || null,
        purchaserUserId: optionalId(state.itemPreferenceForm.purchaserUserId),
        templeId
      });

      setState((currentState) => ({
        ...currentState,
        isSubmitting: false,
        itemPreferenceForm: initialItemPreferenceForm
      }));
      refresh();
    } catch (error) {
      setState((currentState) => ({
        ...currentState,
        error: error instanceof Error ? error.message : "Item purchase preference save failed.",
        isSubmitting: false
      }));
    } finally {
      submitLock.current = false;
    }
  }

  return {
    ...state,
    activeItems,
    activePurchaseLocations,
    canManageProcurement,
    createItemPurchasePreference,
    createPurchaseLocation,
    refresh,
    setItemPreferenceEstimatedUnitCostText(estimatedUnitCostText: string) {
      setState((currentState) => ({
        ...currentState,
        itemPreferenceForm: {
          ...currentState.itemPreferenceForm,
          estimatedUnitCostText
        }
      }));
    },
    setItemPreferenceItemId(itemId: string) {
      setState((currentState) => ({
        ...currentState,
        itemPreferenceForm: {
          ...currentState.itemPreferenceForm,
          itemId
        }
      }));
    },
    setItemPreferenceLocationId(preferredPurchaseLocationId: string) {
      setState((currentState) => ({
        ...currentState,
        itemPreferenceForm: {
          ...currentState.itemPreferenceForm,
          preferredPurchaseLocationId
        }
      }));
    },
    setItemPreferenceNotes(notes: string) {
      setState((currentState) => ({
        ...currentState,
        itemPreferenceForm: {
          ...currentState.itemPreferenceForm,
          notes
        }
      }));
    },
    setItemPreferencePackSizeText(packSizeText: string) {
      setState((currentState) => ({
        ...currentState,
        itemPreferenceForm: {
          ...currentState.itemPreferenceForm,
          packSizeText
        }
      }));
    },
    setItemPreferencePurchaserUserId(purchaserUserId: string) {
      setState((currentState) => ({
        ...currentState,
        itemPreferenceForm: {
          ...currentState.itemPreferenceForm,
          purchaserUserId
        }
      }));
    },
    setItemPreferenceUnit(preferredPurchaseUnit: ItemUnit | "") {
      setState((currentState) => ({
        ...currentState,
        itemPreferenceForm: {
          ...currentState.itemPreferenceForm,
          preferredPurchaseUnit
        }
      }));
    },
    setLocationDefaultPurchaserUserId(defaultPurchaserUserId: string) {
      setState((currentState) => ({
        ...currentState,
        locationForm: {
          ...currentState.locationForm,
          defaultPurchaserUserId
        }
      }));
    },
    setLocationDescription(description: string) {
      setState((currentState) => ({
        ...currentState,
        locationForm: {
          ...currentState.locationForm,
          description
        }
      }));
    },
    setLocationName(name: string) {
      setState((currentState) => ({
        ...currentState,
        locationForm: {
          ...currentState.locationForm,
          name
        }
      }));
    },
    setLocationNotes(notes: string) {
      setState((currentState) => ({
        ...currentState,
        locationForm: {
          ...currentState.locationForm,
          notes
        }
      }));
    },
    setPurchaseLocationArchived,
    units: ITEM_MANAGEMENT_UNITS
  };
}
