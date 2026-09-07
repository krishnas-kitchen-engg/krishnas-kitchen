import { useEffect } from "react";
import type { PropsWithChildren } from "react";
import type { Permission } from "@krishnas-kitchen/types";

import { AuthLoadingScreen, hasPermission, useAuth } from "@/features/auth";

import { navigateTo } from "./router";

type RouteGuardProps = PropsWithChildren<{
  requireAnyPermission?: readonly Permission[];
  requireAuth?: boolean;
  requirePermission?: Permission;
  requireTemple?: boolean;
}>;

export function RouteGuard({
  children,
  requireAnyPermission = [],
  requireAuth = false,
  requirePermission,
  requireTemple = false
}: RouteGuardProps) {
  const auth = useAuth();
  const isMissingAuth = requireAuth && !auth.isAuthenticated;
  const isMissingTemple = requireTemple && auth.isAuthenticated && !auth.currentTemple;
  const isMissingPermission = !hasPermission(auth.permissions, requirePermission);
  const isMissingAnyPermission =
    requireAnyPermission.length > 0 &&
    !requireAnyPermission.some((permission) => hasPermission(auth.permissions, permission));

  useEffect(() => {
    if (auth.isLoading) {
      return;
    }

    if (isMissingAuth) {
      navigateTo("/login");
      return;
    }

    if (isMissingTemple) {
      navigateTo("/select-temple");
      return;
    }

    if (isMissingPermission || isMissingAnyPermission) {
      navigateTo("/unauthorized");
    }
  }, [auth.isLoading, isMissingAnyPermission, isMissingAuth, isMissingPermission, isMissingTemple]);

  if (
    auth.isLoading ||
    isMissingAuth ||
    isMissingTemple ||
    isMissingPermission ||
    isMissingAnyPermission
  ) {
    return <AuthLoadingScreen />;
  }

  return children;
}
