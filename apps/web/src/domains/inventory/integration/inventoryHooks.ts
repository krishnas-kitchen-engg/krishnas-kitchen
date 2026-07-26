import { useMemo } from "react";

import { hasPermission, useAuth } from "@/features/auth";
import type { AuthContextValue } from "@/features/auth/providers/AuthContext";
import type { InventoryActor } from "../domain/types";

import { useInventoryServices } from "./inventoryServiceHooks";

export type InventoryPermissionFlags = {
  canAdjustInventory: boolean;
  canArchiveItems: boolean;
  canConsumeInventory: boolean;
  canCreateItems: boolean;
  canEditItems: boolean;
  canManageLocations: boolean;
  canReadInventory: boolean;
  canReceiveInventory: boolean;
  canReturnInventory: boolean;
  canTransferInventory: boolean;
  canUndoInventory: boolean;
};

export function resolveInventoryActor(
  auth: Pick<AuthContextValue, "isTemporaryVolunteer" | "profile" | "temporaryVolunteerSession">
): InventoryActor | null {
  if (auth.isTemporaryVolunteer && auth.temporaryVolunteerSession) {
    return {
      tempSessionId: auth.temporaryVolunteerSession.id,
      type: "temporary_volunteer"
    };
  }

  if (auth.profile) {
    return {
      type: "user",
      userId: auth.profile.id
    };
  }

  return null;
}

export function getInventoryPermissionFlags(
  permissions: AuthContextValue["permissions"]
): InventoryPermissionFlags {
  return {
    canAdjustInventory: hasPermission(permissions, "inventory.adjust"),
    canArchiveItems: hasPermission(permissions, "items.archive"),
    canConsumeInventory: hasPermission(permissions, "inventory.consume"),
    canCreateItems: hasPermission(permissions, "items.create"),
    canEditItems: hasPermission(permissions, "items.edit"),
    canManageLocations:
      hasPermission(permissions, "locations.create") ||
      hasPermission(permissions, "locations.edit"),
    canReadInventory: hasPermission(permissions, "inventory.read"),
    canReceiveInventory: hasPermission(permissions, "inventory.receive"),
    canReturnInventory: hasPermission(permissions, "inventory.return"),
    canTransferInventory: hasPermission(permissions, "inventory.transfer"),
    canUndoInventory: hasPermission(permissions, "inventory.undo")
  };
}

export function useInventoryActor(): InventoryActor | null {
  const auth = useAuth();

  return useMemo(() => resolveInventoryActor(auth), [auth]);
}

export function useInventoryPermissions(): InventoryPermissionFlags {
  const auth = useAuth();

  return useMemo(() => getInventoryPermissionFlags(auth.permissions), [auth.permissions]);
}

export function useInventoryCatalogQueries() {
  return useInventoryServices().catalogQueries;
}

export function useInventoryVisibility() {
  return useInventoryServices().visibility;
}

export function useReceivingWorkflow() {
  return useInventoryServices().receivingWorkflow;
}

export function useConsumptionWorkflow() {
  return useInventoryServices().consumptionWorkflow;
}

export function useTransferWorkflow() {
  return useInventoryServices().transferWorkflow;
}

export function useReturnWorkflow() {
  return useInventoryServices().returnWorkflow;
}

export function useInventoryBarcodeLookup() {
  return useInventoryServices().barcodeLookup;
}

export function useInventoryBarcodeCatalog() {
  return useInventoryServices().barcodeCatalog;
}

export function useUnknownBarcodeManagement() {
  return useInventoryServices().unknownBarcodes;
}

export function useCameraScanning() {
  return useInventoryServices().cameraScanning;
}
