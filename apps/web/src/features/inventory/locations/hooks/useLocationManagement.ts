import { useEffect, useMemo, useRef, useState } from "react";

import {
  createLocationManagementService,
  createSupabaseLocationManagementRepository,
  useInventoryPermissions,
  type ManagedInventoryLocation
} from "@/domains/inventory";
import { useAuth } from "@/features/auth";

type LocationFormState = {
  description: string;
  editingLocationId: string | null;
  name: string;
};

export type LocationManagementUiState = {
  error: string | null;
  form: LocationFormState;
  isLoading: boolean;
  isSubmitting: boolean;
  locations: readonly ManagedInventoryLocation[];
  searchText: string;
};

const initialForm: LocationFormState = {
  description: "",
  editingLocationId: null,
  name: ""
};

export function useLocationManagement() {
  const auth = useAuth();
  const permissions = useInventoryPermissions();
  const submitLock = useRef(false);
  const organizationId = auth.currentOrganization?.id;
  const templeId = auth.currentTemple?.id;
  const canManageLocations = permissions.canManageLocations;
  const service = useMemo(() => {
    if (!auth.client) {
      return null;
    }

    return createLocationManagementService(createSupabaseLocationManagementRepository(auth.client));
  }, [auth.client]);
  const [refreshIndex, setRefreshIndex] = useState(0);
  const [state, setState] = useState<LocationManagementUiState>({
    error: null,
    form: initialForm,
    isLoading: false,
    isSubmitting: false,
    locations: [],
    searchText: ""
  });
  const filteredLocations = useMemo(() => {
    const searchText = state.searchText.trim().toLocaleLowerCase();

    return state.locations.filter(
      (location) =>
        !searchText ||
        location.name.toLocaleLowerCase().includes(searchText) ||
        location.id.toLocaleLowerCase().includes(searchText) ||
        (location.description?.toLocaleLowerCase().includes(searchText) ?? false)
    );
  }, [state.locations, state.searchText]);

  useEffect(() => {
    if (!canManageLocations || !organizationId || !templeId || !service) {
      setState((currentState) => ({
        ...currentState,
        error: null,
        isLoading: false,
        locations: []
      }));
      return;
    }

    let isActive = true;
    const currentService = service;
    const currentOrganizationId = organizationId;
    const currentTempleId = templeId;

    async function load() {
      setState((currentState) => ({
        ...currentState,
        error: null,
        isLoading: true
      }));

      try {
        const locations = await currentService.listLocations({
          organizationId: currentOrganizationId,
          templeId: currentTempleId
        });

        if (isActive) {
          setState((currentState) => ({
            ...currentState,
            error: null,
            isLoading: false,
            locations
          }));
        }
      } catch (error) {
        if (isActive) {
          setState((currentState) => ({
            ...currentState,
            error: error instanceof Error ? error.message : "Locations failed to load.",
            isLoading: false,
            locations: []
          }));
        }
      }
    }

    void load();

    return () => {
      isActive = false;
    };
  }, [canManageLocations, organizationId, refreshIndex, service, templeId]);

  function refresh() {
    setRefreshIndex((currentIndex) => currentIndex + 1);
  }

  async function submitLocation() {
    if (
      submitLock.current ||
      state.isSubmitting ||
      !service ||
      !organizationId ||
      !templeId ||
      !canManageLocations
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
      if (state.form.editingLocationId) {
        await service.updateLocation({
          description: state.form.description,
          id: state.form.editingLocationId,
          name: state.form.name,
          organizationId,
          templeId
        });
      } else {
        await service.createLocation({
          description: state.form.description,
          name: state.form.name,
          organizationId,
          templeId
        });
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
        error: error instanceof Error ? error.message : "Location save failed.",
        isSubmitting: false
      }));
    } finally {
      submitLock.current = false;
    }
  }

  async function setArchived(location: ManagedInventoryLocation, archived: boolean) {
    if (submitLock.current || state.isSubmitting || !service || !organizationId || !templeId) {
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
        await service.archiveLocation({
          id: location.id,
          organizationId,
          templeId
        });
      } else {
        await service.restoreLocation({
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
        error: error instanceof Error ? error.message : "Location status update failed.",
        isSubmitting: false
      }));
    } finally {
      submitLock.current = false;
    }
  }

  return {
    ...state,
    canManageLocations,
    filteredLocations,
    refresh,
    resetForm() {
      setState((currentState) => ({
        ...currentState,
        form: initialForm
      }));
    },
    setArchived,
    setDescription(description: string) {
      setState((currentState) => ({
        ...currentState,
        form: {
          ...currentState.form,
          description
        }
      }));
    },
    setEditingLocation(location: ManagedInventoryLocation) {
      setState((currentState) => ({
        ...currentState,
        form: {
          description: location.description ?? "",
          editingLocationId: location.id,
          name: location.name
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
    setSearchText(searchText: string) {
      setState((currentState) => ({
        ...currentState,
        searchText
      }));
    },
    submitLocation
  };
}
