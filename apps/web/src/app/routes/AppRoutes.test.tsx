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
    signOut() {
      return Promise.resolve();
    },
    startTemporaryVolunteerSession() {},
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
