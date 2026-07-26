import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@krishnas-kitchen/types";
import { describe, it } from "vitest";

import { InventoryIntegrationProvider, type InventoryServiceBundle } from "@/domains/inventory";
import { RecipeIntegrationContext, type RecipeIntegrationContextValue } from "@/domains/recipes";
import { AuthContext } from "@/features/auth/providers/AuthContext";
import type { AuthContextValue } from "@/features/auth/providers/AuthContext";

import { InventoryDashboardScreen } from "./InventoryDashboardScreen";

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
    profile: null,
    roles: ["inventory_manager"],
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

const inventoryServices = {
  catalogQueries: {},
  visibility: {}
} as InventoryServiceBundle;

const recipeContext = {
  productionRunRepository: {},
  productionService: {},
  service: {}
} as RecipeIntegrationContextValue;

function renderScreen(auth: AuthContextValue) {
  return renderToStaticMarkup(
    <AuthContext.Provider value={auth}>
      <InventoryIntegrationProvider services={inventoryServices}>
        <RecipeIntegrationContext.Provider value={recipeContext}>
          <InventoryDashboardScreen />
        </RecipeIntegrationContext.Provider>
      </InventoryIntegrationProvider>
    </AuthContext.Provider>
  );
}

describe("InventoryDashboardScreen", () => {
  it("blocks users without manager dashboard permission", () => {
    const markup = renderScreen(
      createAuthValue({
        permissions: ["inventory.read"]
      })
    );

    assert.match(markup, /Dashboard unavailable/);
    assert.doesNotMatch(markup, /Today&#x27;s kitchen view/);
  });

  it("renders dashboard cards for authorized managers", () => {
    const markup = renderScreen(createAuthValue());

    assert.match(markup, /Inventory dashboard/);
    assert.match(markup, /Active items/);
    assert.match(markup, /Production runs today/);
  });
});
