import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@krishnas-kitchen/types";
import { describe, it } from "vitest";

import { AuthContext } from "@/features/auth/providers/AuthContext";
import type { AuthContextValue } from "@/features/auth/providers/AuthContext";
import { InventoryAvailabilityContext } from "@/domains/inventory/integration/inventoryContextValue";

import { RecipeProviderBridge } from "./RecipeIntegrationContext";

function createAuthValue(overrides: Partial<AuthContextValue> = {}): AuthContextValue {
  return {
    client: null,
    currentOrganization: null,
    currentTemple: null,
    isAuthenticated: false,
    isConfigured: true,
    isLoading: false,
    isTemporaryVolunteer: false,
    permissions: [],
    profile: null,
    roles: [],
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
    status: "unauthenticated",
    temporaryVolunteerSession: null,
    ...overrides
  };
}

describe("RecipeProviderBridge", () => {
  it("does not require inventory services before authenticated app context is ready", () => {
    const markup = renderToStaticMarkup(
      <AuthContext.Provider value={createAuthValue({ client: {} as SupabaseClient<Database> })}>
        <InventoryAvailabilityContext.Provider value={{ status: "loading" }}>
          <RecipeProviderBridge>
            <p>login-shell-renders</p>
          </RecipeProviderBridge>
        </InventoryAvailabilityContext.Provider>
      </AuthContext.Provider>
    );

    assert.match(markup, /login-shell-renders/);
  });
});
