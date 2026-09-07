import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@krishnas-kitchen/types";
import { describe, it } from "vitest";

import { InventoryIntegrationProvider, type InventoryServiceBundle } from "@/domains/inventory";
import { AuthContext } from "@/features/auth/providers/AuthContext";
import type { AuthContextValue } from "@/features/auth/providers/AuthContext";

import { AdjustInventoryScreen } from "./AdjustInventoryScreen";

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
    permissions: ["inventory.read", "inventory.adjust"],
    profile: {
      authUserId: "auth-user-1",
      displayName: "Manager",
      email: "manager@example.com",
      id: "user-1",
      organization: {
        id: "org-1",
        name: "Krishna's Kitchen"
      },
      roles: ["inventory_manager"],
      temples: [
        {
          id: "temple-1",
          name: "Main Temple",
          organizationId: "org-1"
        }
      ]
    },
    roles: ["inventory_manager"],
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

const services = {
  catalogQueries: {},
  inventory: {},
  visibility: {}
} as InventoryServiceBundle;

function renderScreen(auth: AuthContextValue) {
  return renderToStaticMarkup(
    <AuthContext.Provider value={auth}>
      <InventoryIntegrationProvider services={services}>
        <AdjustInventoryScreen />
      </InventoryIntegrationProvider>
    </AuthContext.Provider>
  );
}

describe("AdjustInventoryScreen", () => {
  it("blocks users without manager adjustment permission", () => {
    const markup = renderScreen(
      createAuthValue({
        permissions: ["inventory.read"]
      })
    );

    assert.match(markup, /Adjustments unavailable/);
    assert.doesNotMatch(markup, /Reconcile physical count/);
  });

  it("renders the adjustment workflow for authorized managers", () => {
    const markup = renderScreen(createAuthValue());

    assert.match(markup, /Inventory adjustment/);
    assert.match(markup, /Reconcile physical count/);
    assert.match(markup, /Quantity physically counted/);
    assert.match(markup, /app calculates the correction for you/);
    assert.match(markup, /Reason for correction/);
  });
});
