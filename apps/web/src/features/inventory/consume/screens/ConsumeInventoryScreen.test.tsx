import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@krishnas-kitchen/types";
import { describe, it } from "vitest";

import { InventoryIntegrationProvider, type InventoryServiceBundle } from "@/domains/inventory";
import { AuthContext } from "@/features/auth/providers/AuthContext";
import type { AuthContextValue } from "@/features/auth/providers/AuthContext";

import { ConsumeInventoryScreen } from "./ConsumeInventoryScreen";

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
    permissions: ["inventory.read", "inventory.consume"],
    profile: {
      authUserId: "auth-user-1",
      displayName: "Volunteer",
      email: "volunteer@example.com",
      id: "user-1",
      organization: {
        id: "org-1",
        name: "Krishna's Kitchen"
      },
      roles: ["volunteer"],
      temples: [
        {
          id: "temple-1",
          name: "Main Temple",
          organizationId: "org-1"
        }
      ]
    },
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

const services = {
  catalogQueries: {},
  consumptionWorkflow: {},
  visibility: {}
} as InventoryServiceBundle;

function renderScreen(auth: AuthContextValue) {
  return renderToStaticMarkup(
    <AuthContext.Provider value={auth}>
      <InventoryIntegrationProvider services={services}>
        <ConsumeInventoryScreen />
      </InventoryIntegrationProvider>
    </AuthContext.Provider>
  );
}

describe("ConsumeInventoryScreen", () => {
  it("blocks users without consumption permission", () => {
    const markup = renderScreen(
      createAuthValue({
        permissions: ["inventory.read"]
      })
    );

    assert.match(markup, /Consumption unavailable/);
    assert.doesNotMatch(markup, /Record ingredient use/);
  });

  it("renders the consume workflow for authorized users", () => {
    const markup = renderScreen(createAuthValue());

    assert.match(markup, /Consume inventory/);
    assert.match(markup, /Record ingredient use/);
    assert.match(markup, /Search items/);
  });
});
