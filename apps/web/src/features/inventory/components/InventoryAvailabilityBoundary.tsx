import type { PropsWithChildren } from "react";

import { useInventoryAvailability } from "@/domains/inventory";

import { InventoryLoadingState } from "./InventoryLoadingState";
import { InventoryUnavailableState } from "./InventoryUnavailableState";

export function InventoryAvailabilityBoundary({ children }: PropsWithChildren) {
  const availability = useInventoryAvailability();

  if (availability.status === "loading") {
    return <InventoryLoadingState />;
  }

  if (availability.status === "unavailable") {
    return <InventoryUnavailableState />;
  }

  return children;
}
