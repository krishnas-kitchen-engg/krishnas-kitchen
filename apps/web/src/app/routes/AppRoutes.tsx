import { useEffect } from "react";

import { HomeScreen } from "@/app/screens/HomeScreen";
import {
  AuthLoadingScreen,
  LoginScreen,
  TempleSelectionScreen,
  UnauthorizedScreen,
  useAuth
} from "@/features/auth";

import { RouteGuard } from "./RouteGuard";
import { navigateTo, useCurrentPath } from "./router";

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
  const path = useCurrentPath();

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

  return (
    <RouteGuard requireAuth requireTemple>
      <HomeScreen />
    </RouteGuard>
  );
}
