import { useEffect, useMemo, useRef, useState } from "react";
import type { ItemUnit } from "@krishnas-kitchen/types";

import {
  createItemManagementService,
  createSupabaseItemManagementRepository,
  ITEM_MANAGEMENT_UNITS,
  useInventoryActor,
  useInventoryPermissions,
  type ManagedInventoryItem
} from "@/domains/inventory";
import { useAuth } from "@/features/auth";

type ItemFormState = {
  category: string;
  contentsLabel: string;
  contentsQuantityText: string;
  contentsUnit: ItemUnit | "";
  defaultUnit: ItemUnit | "";
  description: string;
  editingItemId: string | null;
  handlingUnit: ItemUnit | "";
  name: string;
  packageDescription: string;
  productName: string;
  reorderThresholdText: string;
  targetStockLevelText: string;
};

export type ItemManagementUiState = {
  error: string | null;
  form: ItemFormState;
  isLoading: boolean;
  isSubmitting: boolean;
  items: readonly ManagedInventoryItem[];
  searchText: string;
};

const initialForm: ItemFormState = {
  category: "",
  contentsLabel: "",
  contentsQuantityText: "",
  contentsUnit: "",
  defaultUnit: "kg",
  description: "",
  editingItemId: null,
  handlingUnit: "",
  name: "",
  packageDescription: "",
  productName: "",
  reorderThresholdText: "",
  targetStockLevelText: ""
};

function toReorderThreshold(value: string): number | null {
  const trimmedValue = value.trim();

  return trimmedValue ? Number(trimmedValue) : null;
}

export function useItemManagement() {
  const auth = useAuth();
  const actor = useInventoryActor();
  const permissions = useInventoryPermissions();
  const submitLock = useRef(false);
  const organizationId = auth.currentOrganization?.id;
  const templeId = auth.currentTemple?.id;
  const canArchiveItems = permissions.canArchiveItems;
  const canCreateItems = permissions.canCreateItems;
  const canEditItems = permissions.canEditItems;
  const canManageItems = canArchiveItems || canCreateItems || canEditItems;
  const service = useMemo(() => {
    if (!auth.client) {
      return null;
    }

    return createItemManagementService(createSupabaseItemManagementRepository(auth.client));
  }, [auth.client]);
  const [refreshIndex, setRefreshIndex] = useState(0);
  const [state, setState] = useState<ItemManagementUiState>({
    error: null,
    form: initialForm,
    isLoading: false,
    isSubmitting: false,
    items: [],
    searchText: ""
  });
  const filteredItems = useMemo(() => {
    const searchText = state.searchText.trim().toLocaleLowerCase();

    return state.items.filter(
      (item) =>
        !searchText ||
        item.name.toLocaleLowerCase().includes(searchText) ||
        item.id.toLocaleLowerCase().includes(searchText) ||
        (item.category?.toLocaleLowerCase().includes(searchText) ?? false) ||
        (item.description?.toLocaleLowerCase().includes(searchText) ?? false)
    );
  }, [state.items, state.searchText]);

  useEffect(() => {
    if (!canManageItems || !organizationId || !templeId || !service) {
      setState((currentState) => ({
        ...currentState,
        error: null,
        isLoading: false,
        items: []
      }));
      return;
    }

    let isActive = true;
    const currentOrganizationId = organizationId;
    const currentTempleId = templeId;
    const currentService = service;

    async function load() {
      setState((currentState) => ({
        ...currentState,
        error: null,
        isLoading: true
      }));

      try {
        const items = await currentService.listItems({
          organizationId: currentOrganizationId,
          templeId: currentTempleId
        });

        if (isActive) {
          setState((currentState) => ({
            ...currentState,
            error: null,
            isLoading: false,
            items
          }));
        }
      } catch (error) {
        if (isActive) {
          setState((currentState) => ({
            ...currentState,
            error: error instanceof Error ? error.message : "Items failed to load.",
            isLoading: false,
            items: []
          }));
        }
      }
    }

    void load();

    return () => {
      isActive = false;
    };
  }, [canManageItems, organizationId, refreshIndex, service, templeId]);

  function refresh() {
    setRefreshIndex((currentIndex) => currentIndex + 1);
  }

  async function submitItem() {
    if (
      submitLock.current ||
      state.isSubmitting ||
      !service ||
      !organizationId ||
      !templeId ||
      !actor ||
      !canManageItems ||
      !state.form.defaultUnit ||
      (state.form.editingItemId ? !canEditItems : !canCreateItems)
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
      const input = {
        actor,
        category: state.form.category,
        contentsLabel: state.form.contentsLabel,
        contentsQuantity: toReorderThreshold(state.form.contentsQuantityText),
        contentsUnit: state.form.contentsUnit || null,
        defaultUnit: state.form.defaultUnit,
        description: state.form.description,
        handlingUnit: state.form.handlingUnit || null,
        name: state.form.name,
        organizationId,
        packageDescription: state.form.packageDescription,
        productName: state.form.productName,
        reorderThreshold: toReorderThreshold(state.form.reorderThresholdText),
        targetStockLevel: toReorderThreshold(state.form.targetStockLevelText),
        templeId
      };

      if (state.form.editingItemId) {
        await service.updateItem({
          ...input,
          id: state.form.editingItemId
        });
      } else {
        await service.createItem(input);
      }

      setState((currentState) => ({
        ...currentState,
        form: initialForm,
        isSubmitting: false
      }));
      refresh();
    } catch (error) {
      setState((currentState) => ({
        ...currentState,
        error: error instanceof Error ? error.message : "Item save failed.",
        isSubmitting: false
      }));
    } finally {
      submitLock.current = false;
    }
  }

  async function setArchived(item: ManagedInventoryItem, archived: boolean) {
    if (
      submitLock.current ||
      state.isSubmitting ||
      !service ||
      !organizationId ||
      !templeId ||
      !actor ||
      !canArchiveItems
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
        await service.archiveItem({
          actor,
          id: item.id,
          organizationId,
          templeId
        });
      } else {
        await service.restoreItem({
          actor,
          id: item.id,
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
        error: error instanceof Error ? error.message : "Item status update failed.",
        isSubmitting: false
      }));
    } finally {
      submitLock.current = false;
    }
  }

  return {
    ...state,
    canArchiveItems,
    canCreateItems,
    canEditItems,
    canManageItems,
    filteredItems,
    refresh,
    resetForm() {
      setState((currentState) => ({
        ...currentState,
        error: null,
        form: initialForm
      }));
    },
    setArchived,
    setCategory(category: string) {
      setState((currentState) => ({
        ...currentState,
        form: {
          ...currentState.form,
          category
        }
      }));
    },
    setContentsQuantityText(contentsQuantityText: string) {
      setState((currentState) => ({
        ...currentState,
        form: { ...currentState.form, contentsQuantityText }
      }));
    },
    setContentsLabel(contentsLabel: string) {
      setState((currentState) => ({
        ...currentState,
        form: { ...currentState.form, contentsLabel }
      }));
    },
    setContentsUnit(contentsUnit: ItemUnit | "") {
      setState((currentState) => ({
        ...currentState,
        form: { ...currentState.form, contentsUnit }
      }));
    },
    setDefaultUnit(defaultUnit: ItemUnit | "") {
      setState((currentState) => ({
        ...currentState,
        form: {
          ...currentState.form,
          defaultUnit
        }
      }));
    },
    setDescription(description: string) {
      setState((currentState) => ({
        ...currentState,
        form: {
          ...currentState.form,
          description
        }
      }));
    },
    setEditingItem(item: ManagedInventoryItem) {
      setState((currentState) => ({
        ...currentState,
        error: null,
        form: {
          category: item.category ?? "",
          contentsLabel: item.contentsLabel ?? "",
          contentsQuantityText:
            typeof item.contentsQuantity === "number" ? String(item.contentsQuantity) : "",
          contentsUnit: item.contentsUnit ?? "",
          defaultUnit: item.defaultUnit,
          description: item.description ?? "",
          editingItemId: item.id,
          handlingUnit: item.handlingUnit ?? "",
          name: item.name,
          packageDescription: item.packageDescription ?? "",
          productName: item.productName ?? "",
          reorderThresholdText:
            typeof item.reorderThreshold === "number" ? String(item.reorderThreshold) : "",
          targetStockLevelText:
            typeof item.targetStockLevel === "number" ? String(item.targetStockLevel) : ""
        }
      }));
    },
    setName(name: string) {
      setState((currentState) => ({
        ...currentState,
        form: {
          ...currentState.form,
          name
        }
      }));
    },
    setHandlingUnit(handlingUnit: ItemUnit | "") {
      setState((currentState) => ({
        ...currentState,
        form: { ...currentState.form, handlingUnit }
      }));
    },
    setPackageDescription(packageDescription: string) {
      setState((currentState) => ({
        ...currentState,
        form: { ...currentState.form, packageDescription }
      }));
    },
    setProductName(productName: string) {
      setState((currentState) => ({
        ...currentState,
        form: { ...currentState.form, productName }
      }));
    },
    setReorderThresholdText(reorderThresholdText: string) {
      setState((currentState) => ({
        ...currentState,
        form: {
          ...currentState.form,
          reorderThresholdText
        }
      }));
    },
    setTargetStockLevelText(targetStockLevelText: string) {
      setState((currentState) => ({
        ...currentState,
        form: {
          ...currentState.form,
          targetStockLevelText
        }
      }));
    },
    setSearchText(searchText: string) {
      setState((currentState) => ({
        ...currentState,
        searchText
      }));
    },
    submitItem,
    units: ITEM_MANAGEMENT_UNITS
  };
}
