import { useEffect } from "react";
import type { PropsWithChildren } from "react";
import type { Permission } from "@krishnas-kitchen/types";

import { AuthLoadingScreen, hasPermission, useAuth } from "@/features/auth";

import { navigateTo } from "./router";

type RouteGuardProps = PropsWithChildren<{
  requireAuth?: boolean;
  requirePermission?: Permission;
  requireTemple?: boolean;
}>;

export function RouteGuard({
  children,
  requireAuth = false,
  requirePermission,
  requireTemple = false
}: RouteGuardProps) {
  const auth = useAuth();
  const isMissingAuth = requireAuth && !auth.isAuthenticated;
  const isMissingTemple = requireTemple && auth.isAuthenticated && !auth.currentTemple;
  const isMissingPermission = !hasPermission(auth.permissions, requirePermission);

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

    if (isMissingPermission) {
      navigateTo("/unauthorized");
    }
  }, [auth.isLoading, isMissingAuth, isMissingPermission, isMissingTemple]);

  if (auth.isLoading || isMissingAuth || isMissingTemple || isMissingPermission) {
    return <AuthLoadingScreen />;
  }

  return children;
}
