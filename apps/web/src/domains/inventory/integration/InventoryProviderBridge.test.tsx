import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@krishnas-kitchen/types";
import { describe, it } from "vitest";

import { AuthContext } from "@/features/auth/providers/AuthContext";
import type { AuthContextValue } from "@/features/auth/providers/AuthContext";

import { useInventoryServices } from "./inventoryServiceHooks";
import { InventoryProviderBridge } from "./InventoryProviderBridge";

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
    startTemporaryVolunteerSession() {
      return Promise.resolve();
    },
    status: "authenticated",
    temporaryVolunteerSession: null,
    ...overrides
  };
}

function InventoryServicesProbe() {
  const services = useInventoryServices();

  return <p>{services.catalogQueries ? "inventory-hooks-ready" : "missing"}</p>;
}

describe("InventoryProviderBridge", () => {
  it("initializes inventory services when auth, client, and temple context are ready", () => {
    const markup = renderToStaticMarkup(
      <AuthContext.Provider value={createAuthValue()}>
        <InventoryProviderBridge>
          <InventoryServicesProbe />
        </InventoryProviderBridge>
      </AuthContext.Provider>
    );

    assert.match(markup, /inventory-hooks-ready/);
  });

  it("does not crash when the Supabase client is unavailable", () => {
    const markup = renderToStaticMarkup(
      <AuthContext.Provider value={createAuthValue({ client: null })}>
        <InventoryProviderBridge>
          <p>auth-shell-still-renders</p>
        </InventoryProviderBridge>
      </AuthContext.Provider>
    );

    assert.match(markup, /auth-shell-still-renders/);
  });
});
