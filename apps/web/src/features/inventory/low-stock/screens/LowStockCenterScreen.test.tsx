import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@krishnas-kitchen/types";
import { describe, it } from "vitest";

import { InventoryIntegrationProvider, type InventoryServiceBundle } from "@/domains/inventory";
import { AuthContext } from "@/features/auth/providers/AuthContext";
import type { AuthContextValue } from "@/features/auth/providers/AuthContext";

import { LowStockCenterScreen } from "./LowStockCenterScreen";

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

const services = {
  catalogQueries: {},
  visibility: {}
} as InventoryServiceBundle;

function renderScreen(auth: AuthContextValue) {
  return renderToStaticMarkup(
    <AuthContext.Provider value={auth}>
      <InventoryIntegrationProvider services={services}>
        <LowStockCenterScreen />
      </InventoryIntegrationProvider>
    </AuthContext.Provider>
  );
}

describe("LowStockCenterScreen", () => {
  it("blocks users without manager low-stock permission", () => {
    const markup = renderScreen(
      createAuthValue({
        permissions: ["inventory.read"]
      })
    );

    assert.match(markup, /Low Stock Center unavailable/);
    assert.doesNotMatch(markup, /Replenishment priorities/);
  });

  it("renders low-stock filters for authorized managers", () => {
    const markup = renderScreen(createAuthValue());

    assert.match(markup, /Low Stock Center/);
    assert.match(markup, /Search item/);
    assert.match(markup, /Out of Stock/);
  });
});
