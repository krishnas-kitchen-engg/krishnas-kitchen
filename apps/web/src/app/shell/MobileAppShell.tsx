import type { PropsWithChildren } from "react";

import { useAuth } from "@/features/auth";

import { useCurrentRoute } from "../routes/router";
import { BottomNavigation } from "./BottomNavigation";
import { MobileTopBar } from "./MobileTopBar";

function getRouteTitle(routeName: ReturnType<typeof useCurrentRoute>["name"]): string {
  if (routeName === "inventory_item") {
    return "Item detail";
  }

  if (routeName === "inventory_location") {
    return "Location detail";
  }

  if (routeName === "inventory") {
    return "Inventory";
  }

  if (routeName === "profile") {
    return "Profile";
  }

  if (routeName === "receive") {
    return "Receive";
  }

  if (routeName === "scan") {
    return "Scan";
  }

  return "Home";
}

export function MobileAppShell({ children }: PropsWithChildren) {
  const auth = useAuth();
  const currentRoute = useCurrentRoute();

  return (
    <div className="min-h-dvh bg-stone-50 text-stone-950">
      <MobileTopBar
        organizationName={auth.currentOrganization?.name}
        templeName={auth.currentTemple?.name}
        title={getRouteTitle(currentRoute.name)}
      />
      <main className="mx-auto w-full max-w-md px-5 pb-28 pt-5">{children}</main>
      <BottomNavigation currentPath={currentRoute.path} />
    </div>
  );
}
