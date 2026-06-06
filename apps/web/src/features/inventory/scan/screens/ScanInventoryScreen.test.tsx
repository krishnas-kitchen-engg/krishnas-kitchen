import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@krishnas-kitchen/types";
import { describe, it } from "vitest";

import { InventoryIntegrationProvider, type InventoryServiceBundle } from "@/domains/inventory";
import { InventoryAvailabilityContext } from "@/domains/inventory/integration/inventoryContextValue";
import { AuthContext } from "@/features/auth/providers/AuthContext";
import type { AuthContextValue } from "@/features/auth/providers/AuthContext";

import { ScanInventoryScreen } from "./ScanInventoryScreen";

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
    startTemporaryVolunteerSession() {},
    status: "authenticated",
    temporaryVolunteerSession: null,
    ...overrides
  };
}

const services = {
  barcodeLookup: {},
  cameraScanning: null,
  catalogQueries: {
    searchItems() {
      return Promise.resolve([]);
    }
  },
  unknownBarcodes: {}
} as unknown as InventoryServiceBundle;

function renderScreen(auth: AuthContextValue) {
  return renderToStaticMarkup(
    <AuthContext.Provider value={auth}>
      <InventoryAvailabilityContext.Provider value={{ status: "ready" }}>
        <InventoryIntegrationProvider services={services}>
          <ScanInventoryScreen />
        </InventoryIntegrationProvider>
      </InventoryAvailabilityContext.Provider>
    </AuthContext.Provider>
  );
}

describe("ScanInventoryScreen", () => {
  it("renders barcode entry, camera placeholder, and recent scans for inventory readers", () => {
    const markup = renderScreen(createAuthValue());

    assert.match(markup, /Inventory scan/);
    assert.match(markup, /Barcode entry/);
    assert.match(markup, /Camera scan/);
    assert.match(markup, /Recent scans/);
  });

  it("blocks users without inventory read permission", () => {
    const markup = renderScreen(
      createAuthValue({
        permissions: []
      })
    );

    assert.match(markup, /Scan unavailable/);
  });
});
