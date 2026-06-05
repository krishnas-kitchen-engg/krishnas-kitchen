import { useEffect } from "react";

import { HomeScreen } from "@/app/screens/HomeScreen";
import { MobileAppShell } from "@/app/shell/MobileAppShell";
import {
  AuthLoadingScreen,
  LoginScreen,
  TempleSelectionScreen,
  UnauthorizedScreen,
  useAuth
} from "@/features/auth";
import {
  InventoryAvailabilityBoundary,
  InventoryItemDetailScreen,
  InventoryLocationDetailScreen,
  InventoryLookupScreen,
  ReceiveInventoryScreen,
  TransferInventoryScreen
} from "@/features/inventory";

import { RouteGuard } from "./RouteGuard";
import { navigateTo, useCurrentRoute } from "./router";

export function AppRoutes() {
  const auth = useAuth();

  if (auth.isLoading) {
    return <AuthLoadingScreen />;
  }

  if (auth.status === "unauthenticated") {
    return <LoginScreen />;
  }

  return <AuthenticatedRoutes />;
}

function AuthenticatedRoutes() {
  const route = useCurrentRoute();
  const path = route.path;

  useEffect(() => {
    if (path === "/login") {
      navigateTo("/");
    }
  }, [path]);

  if (path === "/login") {
    return <AuthLoadingScreen />;
  }

  if (path === "/select-temple") {
    return (
      <RouteGuard requireAuth>
        <TempleSelectionScreen />
      </RouteGuard>
    );
  }

  if (path === "/unauthorized") {
    return <UnauthorizedScreen />;
  }

  let screen = <HomeScreen />;

  if (route.name === "inventory") {
    screen = (
      <InventoryAvailabilityBoundary>
        <InventoryLookupScreen />
      </InventoryAvailabilityBoundary>
    );
  }

  if (route.name === "inventory_item") {
    screen = (
      <InventoryAvailabilityBoundary>
        <InventoryItemDetailScreen itemId={route.itemId} />
      </InventoryAvailabilityBoundary>
    );
  }

  if (route.name === "inventory_location") {
    screen = (
      <InventoryAvailabilityBoundary>
        <InventoryLocationDetailScreen locationId={route.locationId} />
      </InventoryAvailabilityBoundary>
    );
  }

  if (route.name === "receive") {
    screen = (
      <InventoryAvailabilityBoundary>
        <ReceiveInventoryScreen />
      </InventoryAvailabilityBoundary>
    );
  }

  if (route.name === "transfer") {
    screen = (
      <InventoryAvailabilityBoundary>
        <TransferInventoryScreen />
      </InventoryAvailabilityBoundary>
    );
  }

  if (path === "/scan") {
    screen = <ShellPlaceholder title="Scan" />;
  }

  if (path === "/profile") {
    screen = <ShellPlaceholder title="Profile" />;
  }

  return (
    <RouteGuard requireAuth requireTemple>
      <MobileAppShell>{screen}</MobileAppShell>
    </RouteGuard>
  );
}

function ShellPlaceholder({ title }: { title: string }) {
  return (
    <section className="rounded-md border border-stone-200 bg-white p-4">
      <h2 className="text-lg font-semibold text-brand-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-stone-600">This area is ready for Phase 1B.</p>
    </section>
  );
}
