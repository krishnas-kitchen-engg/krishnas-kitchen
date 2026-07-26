import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@krishnas-kitchen/types";
import { describe, it } from "vitest";

import { InventoryAvailabilityContext } from "@/domains/inventory/integration/inventoryContextValue";
import { AuthContext } from "@/features/auth/providers/AuthContext";
import type { AuthContextValue } from "@/features/auth/providers/AuthContext";

import { HomeScreen } from "./HomeScreen";

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

function renderHome(auth: AuthContextValue) {
  return renderToStaticMarkup(
    <AuthContext.Provider value={auth}>
      <InventoryAvailabilityContext.Provider value={{ status: "unavailable" }}>
        <HomeScreen />
      </InventoryAvailabilityContext.Provider>
    </AuthContext.Provider>
  );
}

describe("HomeScreen", () => {
  it("shows authenticated volunteer temple context and empty states", () => {
    const markup = renderHome(createAuthValue());

    assert.match(markup, /Volunteer home/);
    assert.match(markup, /Main Temple/);
    assert.match(markup, /No recent inventory activity/);
    assert.match(markup, /No low stock alerts/);
    assert.match(markup, /No pending barcode reviews/);
  });

  it("renders temporary volunteer label", () => {
    const markup = renderHome(
      createAuthValue({
        isTemporaryVolunteer: true,
        temporaryVolunteerSession: {
          displayName: "Festival Volunteer",
          expiresAt: "2026-06-05T12:00:00.000Z",
          id: "temp-1",
          organizationId: "org-1",
          startedAt: "2026-06-05T08:00:00.000Z",
          templeId: "temple-1"
        }
      })
    );

    assert.match(markup, /Temporary volunteer/);
  });

  it("renders permission-aware quick actions in workflow order", () => {
    const markup = renderHome(
      createAuthValue({
        permissions: [
          "inventory.read",
          "inventory.receive",
          "inventory.consume",
          "inventory.transfer",
          "inventory.return",
          "recipes.read"
        ]
      })
    );

    assert.match(markup, /Scan/);
    assert.match(markup, /Receive/);
    assert.match(markup, /Consume/);
    assert.match(markup, /Transfer/);
    assert.match(markup, /Return/);
    assert.match(markup, /Inventory/);
    assert.match(markup, /Recipes/);
    assert.ok(markup.indexOf("Scan") < markup.indexOf("Receive"));
    assert.ok(markup.indexOf("Receive") < markup.indexOf("Consume"));
    assert.ok(markup.indexOf("Consume") < markup.indexOf("Transfer"));
    assert.ok(markup.indexOf("Transfer") < markup.indexOf("Return"));
    assert.ok(markup.indexOf("Return") < markup.indexOf("Inventory"));
    assert.ok(markup.indexOf("Inventory") < markup.indexOf("Recipes"));
  });

  it("hides unauthorized quick actions", () => {
    const markup = renderHome(
      createAuthValue({
        permissions: ["inventory.read"]
      })
    );

    assert.match(markup, /Scan/);
    assert.match(markup, /Inventory/);
    assert.doesNotMatch(markup, />Receive</);
    assert.doesNotMatch(markup, />Consume</);
    assert.doesNotMatch(markup, />Transfer</);
    assert.doesNotMatch(markup, />Return</);
    assert.doesNotMatch(markup, />Recipes</);
  });

  it("renders pending unknown barcode empty state", () => {
    const markup = renderHome(createAuthValue());

    assert.match(markup, /Pending barcode reviews/);
    assert.match(markup, /No pending barcode reviews/);
  });
});
