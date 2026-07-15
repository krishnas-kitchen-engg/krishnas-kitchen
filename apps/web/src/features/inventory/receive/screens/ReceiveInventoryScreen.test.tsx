import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@krishnas-kitchen/types";
import { describe, it } from "vitest";

import { InventoryIntegrationProvider, type InventoryServiceBundle } from "@/domains/inventory";
import { AuthContext } from "@/features/auth/providers/AuthContext";
import type { AuthContextValue } from "@/features/auth/providers/AuthContext";

import { ReceiveInventoryScreen } from "./ReceiveInventoryScreen";

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
    permissions: ["inventory.read", "inventory.receive"],
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
  barcodeLookup: {},
  catalogQueries: {},
  receivingWorkflow: {},
  visibility: {}
} as InventoryServiceBundle;

function renderScreen(auth: AuthContextValue) {
  return renderToStaticMarkup(
    <AuthContext.Provider value={auth}>
      <InventoryIntegrationProvider services={services}>
        <ReceiveInventoryScreen />
      </InventoryIntegrationProvider>
    </AuthContext.Provider>
  );
}

describe("ReceiveInventoryScreen", () => {
  it("blocks temporary volunteers without inventory.receive permission", () => {
    const markup = renderScreen(
      createAuthValue({
        isTemporaryVolunteer: true,
        permissions: [
          "locations.read",
          "items.read",
          "inventory.read",
          "volunteer_sessions.create"
        ],
        profile: null,
        temporaryVolunteerSession: {
          expiresAt: "2026-06-05T12:00:00.000Z",
          displayName: "Festival Volunteer",
          id: "temp-1",
          organizationId: "org-1",
          startedAt: "2026-06-05T08:00:00.000Z",
          templeId: "temple-1"
        }
      })
    );

    assert.match(markup, /Receiving unavailable/);
    assert.doesNotMatch(markup, /Add stock/);
  });

  it("blocks users without receiving permission", () => {
    const markup = renderScreen(
      createAuthValue({
        permissions: ["inventory.read"]
      })
    );

    assert.match(markup, /Receiving unavailable/);
  });
});
