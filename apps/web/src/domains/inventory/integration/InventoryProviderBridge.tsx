import { useMemo } from "react";
import type { PropsWithChildren } from "react";

import { useAuth } from "@/features/auth";

import { createSupabaseInventoryRepositoryAdapters } from "../infrastructure/supabase/supabaseInventoryRepositoryAdapters";
import { InventoryIntegrationProvider } from "./InventoryIntegrationContext";
import { InventoryAvailabilityContext } from "./inventoryContextValue";
import { createInventoryServiceBundle } from "./inventoryServiceFactory";

export function InventoryProviderBridge({ children }: PropsWithChildren) {
  const auth = useAuth();
  const status =
    auth.isLoading || !auth.currentOrganization || !auth.currentTemple
      ? "loading"
      : auth.client
        ? "ready"
        : "unavailable";
  const services = useMemo(() => {
    if (status !== "ready" || !auth.client) {
      return null;
    }

    return createInventoryServiceBundle({
      repositories: createSupabaseInventoryRepositoryAdapters(auth.client)
    });
  }, [auth.client, status]);

  if (!services) {
    return (
      <InventoryAvailabilityContext.Provider value={{ status }}>
        {children}
      </InventoryAvailabilityContext.Provider>
    );
  }

  return (
    <InventoryAvailabilityContext.Provider value={{ status: "ready" }}>
      <InventoryIntegrationProvider services={services}>{children}</InventoryIntegrationProvider>
    </InventoryAvailabilityContext.Provider>
  );
}
