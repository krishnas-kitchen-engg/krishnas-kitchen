import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@krishnas-kitchen/types";
import { describe, it, vi } from "vitest";

import { AuthContext } from "@/features/auth/providers/AuthContext";
import type { AuthContextValue } from "@/features/auth/providers/AuthContext";

import { AppRoutes } from "./AppRoutes";

function createAuthValue(overrides: Partial<AuthContextValue> = {}): AuthContextValue {
  return {
    client: {} as SupabaseClient<Database>,
    currentOrganization: {
      id: "org-1",
      name: "Krishna's Kitchen"
    },
    currentTemple: {
      id: "temple-1",
      name: "Main Temple",
      organizationId: "org-1"
    },
    isAuthenticated: true,
    isConfigured: true,
    isLoading: false,
    isTemporaryVolunteer: false,
    permissions: ["inventory.read"],
    profile: null,
    roles: ["volunteer"],
    selectTemple() {},
    session: null,
    signInWithEmail() {
      return Promise.resolve();
    },
    signUpWithEmail() {
      return Promise.resolve();
    },
    signOut() {
      return Promise.resolve();
    },
    startTemporaryVolunteerSession() {
      return Promise.resolve();
    },
    status: "authenticated",
    temporaryVolunteerSession: null,
    ...overrides
  };
}

function stubWindow(pathname: string) {
  vi.stubGlobal("window", {
    addEventListener() {},
    location: {
      pathname
    },
    removeEventListener() {}
  });
}

describe("AppRoutes", () => {
  it("renders authenticated home route inside the mobile shell", () => {
    stubWindow("/");

    const markup = renderToStaticMarkup(
      <AuthContext.Provider value={createAuthValue()}>
        <AppRoutes />
      </AuthContext.Provider>
    );

    assert.match(markup, /Volunteer home/);
    assert.match(markup, /Home/);
    assert.match(markup, /Inventory/);
    assert.match(markup, /Scan/);
    assert.match(markup, /Receive/);
    assert.match(markup, /Tasks/);
  });

  it("renders authenticated inventory route inside the mobile shell", () => {
    stubWindow("/inventory");

    const markup = renderToStaticMarkup(
      <AuthContext.Provider value={createAuthValue()}>
        <AppRoutes />
      </AuthContext.Provider>
    );

    assert.match(markup, /Inventory/);
    assert.match(markup, /Inventory unavailable/);
    assert.match(markup, /Home/);
    assert.match(markup, /Scan/);
  });

  it("requires valid temple context for the inventory route", () => {
    stubWindow("/inventory");

    const markup = renderToStaticMarkup(
      <AuthContext.Provider
        value={createAuthValue({
          currentTemple: null
        })}
      >
        <AppRoutes />
      </AuthContext.Provider>
    );

    assert.match(markup, /Checking your session/);
  });

  it("renders authenticated receive route inside the mobile shell", () => {
    stubWindow("/receive");

    const markup = renderToStaticMarkup(
      <AuthContext.Provider value={createAuthValue()}>
        <AppRoutes />
      </AuthContext.Provider>
    );

    assert.match(markup, /Receive/);
    assert.match(markup, /Inventory unavailable/);
  });

  it("renders authenticated admin route inside the mobile shell", () => {
    stubWindow("/admin");

    const markup = renderToStaticMarkup(
      <AuthContext.Provider
        value={createAuthValue({
          permissions: ["users.manage", "temple.manage", "roles.manage"],
          profile: {
            authUserId: "admin-user-1",
            displayName: "Admin User",
            email: "admin@example.com",
            id: "admin-user-1",
            organization: {
              id: "org-1",
              name: "Krishna's Kitchen"
            },
            roles: ["super_admin"],
            temples: [
              {
                id: "temple-1",
                name: "Main Temple",
                organizationId: "org-1"
              }
            ]
          },
          roles: ["super_admin"]
        })}
      >
        <AppRoutes />
      </AuthContext.Provider>
    );

    assert.match(markup, /Admin/);
    assert.match(markup, /Users and temples/);
  });

  it("allows authenticated admins to open admin route before selecting a temple", () => {
    stubWindow("/admin");

    const markup = renderToStaticMarkup(
      <AuthContext.Provider
        value={createAuthValue({
          currentTemple: null,
          permissions: ["users.manage", "temple.manage", "roles.manage"],
          profile: {
            authUserId: "admin-user-1",
            displayName: "Admin User",
            email: "admin@example.com",
            id: "admin-user-1",
            organization: {
              id: "org-1",
              name: "Krishna's Kitchen"
            },
            roles: ["super_admin"],
            temples: []
          },
          roles: ["super_admin"]
        })}
      >
        <AppRoutes />
      </AuthContext.Provider>
    );

    assert.doesNotMatch(markup, /Checking your session/);
    assert.match(markup, /Users and temples/);
  });

  it("renders authenticated adjust route inside the mobile shell", () => {
    stubWindow("/adjust");

    const markup = renderToStaticMarkup(
      <AuthContext.Provider value={createAuthValue()}>
        <AppRoutes />
      </AuthContext.Provider>
    );

    assert.match(markup, /Adjust/);
    assert.match(markup, /Inventory unavailable/);
  });

  it("renders authenticated consume route inside the mobile shell", () => {
    stubWindow("/consume");

    const markup = renderToStaticMarkup(
      <AuthContext.Provider value={createAuthValue()}>
        <AppRoutes />
      </AuthContext.Provider>
    );

    assert.match(markup, /Consume/);
    assert.match(markup, /Inventory unavailable/);
  });

  it("renders authenticated dashboard route inside the mobile shell", () => {
    stubWindow("/dashboard");

    const markup = renderToStaticMarkup(
      <AuthContext.Provider value={createAuthValue()}>
        <AppRoutes />
      </AuthContext.Provider>
    );

    assert.match(markup, /Dashboard/);
    assert.match(markup, /Inventory unavailable/);
  });

  it("renders authenticated low-stock route inside the mobile shell", () => {
    stubWindow("/low-stock");

    const markup = renderToStaticMarkup(
      <AuthContext.Provider value={createAuthValue()}>
        <AppRoutes />
      </AuthContext.Provider>
    );

    assert.match(markup, /Low Stock/);
    assert.match(markup, /Inventory unavailable/);
  });

  it("renders authenticated items route inside the mobile shell", () => {
    stubWindow("/items");

    const markup = renderToStaticMarkup(
      <AuthContext.Provider value={createAuthValue()}>
        <AppRoutes />
      </AuthContext.Provider>
    );

    assert.match(markup, /Items/);
    assert.match(markup, /Inventory unavailable/);
  });

  it("renders authenticated locations route inside the mobile shell", () => {
    stubWindow("/locations");

    const markup = renderToStaticMarkup(
      <AuthContext.Provider value={createAuthValue()}>
        <AppRoutes />
      </AuthContext.Provider>
    );

    assert.match(markup, /Locations/);
    assert.match(markup, /Inventory unavailable/);
  });

  it("renders authenticated transfer route inside the mobile shell", () => {
    stubWindow("/transfer");

    const markup = renderToStaticMarkup(
      <AuthContext.Provider value={createAuthValue()}>
        <AppRoutes />
      </AuthContext.Provider>
    );

    assert.match(markup, /Transfer/);
    assert.match(markup, /Inventory unavailable/);
  });

  it("renders authenticated return route inside the mobile shell", () => {
    stubWindow("/return");

    const markup = renderToStaticMarkup(
      <AuthContext.Provider value={createAuthValue()}>
        <AppRoutes />
      </AuthContext.Provider>
    );

    assert.match(markup, /Return/);
    assert.match(markup, /Inventory unavailable/);
  });

  it("renders authenticated recipes route inside the mobile shell", () => {
    stubWindow("/recipes");

    const markup = renderToStaticMarkup(
      <AuthContext.Provider value={createAuthValue()}>
        <AppRoutes />
      </AuthContext.Provider>
    );

    assert.match(markup, /Recipes/);
    assert.match(markup, /Inventory unavailable/);
  });

  it("renders authenticated scan route inside the mobile shell", () => {
    stubWindow("/scan");

    const markup = renderToStaticMarkup(
      <AuthContext.Provider value={createAuthValue()}>
        <AppRoutes />
      </AuthContext.Provider>
    );

    assert.match(markup, /Scan/);
    assert.match(markup, /Inventory unavailable/);
  });

  it("renders authenticated tasks route inside the mobile shell", () => {
    stubWindow("/tasks");

    const markup = renderToStaticMarkup(
      <AuthContext.Provider value={createAuthValue()}>
        <AppRoutes />
      </AuthContext.Provider>
    );

    assert.match(markup, /Tasks/);
    assert.match(markup, /Inventory unavailable/);
  });

  it("keeps unauthenticated users on login", () => {
    stubWindow("/");

    const markup = renderToStaticMarkup(
      <AuthContext.Provider
        value={createAuthValue({
          currentOrganization: null,
          currentTemple: null,
          isAuthenticated: false,
          permissions: [],
          roles: [],
          status: "unauthenticated"
        })}
      >
        <AppRoutes />
      </AuthContext.Provider>
    );

    assert.match(markup, /Sign in/);
  });
});
