import type { PropsWithChildren } from "react";

import { useAuth } from "@/features/auth";

import { useCurrentRoute } from "../routes/router";
import { BottomNavigation } from "./BottomNavigation";
import { MobileTopBar } from "./MobileTopBar";

function getRouteTitle(routeName: ReturnType<typeof useCurrentRoute>["name"]): string {
  if (routeName === "admin") {
    return "Admin";
  }

  if (routeName === "adjust") {
    return "Adjust";
  }

  if (routeName === "inventory_item") {
    return "Item detail";
  }

  if (routeName === "inventory_location") {
    return "Location detail";
  }

  if (routeName === "inventory") {
    return "Inventory";
  }

  if (routeName === "items") {
    return "Items";
  }

  if (routeName === "low_stock") {
    return "Low Stock";
  }

  if (routeName === "locations") {
    return "Locations";
  }

  if (routeName === "my_purchases") {
    return "Purchases";
  }

  if (routeName === "profile") {
    return "Profile";
  }

  if (routeName === "procurement_admin") {
    return "Procurement";
  }

  if (routeName === "purchase_review") {
    return "Review";
  }

  if (routeName === "purchase_requests") {
    return "Requests";
  }

  if (routeName === "receipt_review") {
    return "Receipts";
  }

  if (routeName === "consume") {
    return "Consume";
  }

  if (routeName === "dashboard") {
    return "Dashboard";
  }

  if (routeName === "receive") {
    return "Receive";
  }

  if (routeName === "return") {
    return "Return";
  }

  if (routeName === "reset_password") {
    return "Reset password";
  }

  if (routeName === "recipes") {
    return "Recipes";
  }

  if (routeName === "scan") {
    return "Scan";
  }

  if (routeName === "tasks") {
    return "Tasks";
  }

  if (routeName === "transfer") {
    return "Transfer";
  }

  return "Home";
}

export function MobileAppShell({ children }: PropsWithChildren) {
  const auth = useAuth();
  const currentRoute = useCurrentRoute();
  const templeContext = auth.currentTemple?.name
    ? auth.roles.includes("super_admin")
      ? `Super admin · Viewing ${auth.currentTemple.name}`
      : auth.currentTemple.name
    : undefined;

  return (
    <div className="min-h-dvh bg-stone-50 text-stone-950">
      <MobileTopBar
        organizationName={auth.currentOrganization?.name}
        templeName={templeContext}
        title={getRouteTitle(currentRoute.name)}
      />
      <main className="mx-auto w-full max-w-md px-5 pb-28 pt-5">{children}</main>
      <BottomNavigation currentPath={currentRoute.path} permissions={auth.permissions} />
    </div>
  );
}
