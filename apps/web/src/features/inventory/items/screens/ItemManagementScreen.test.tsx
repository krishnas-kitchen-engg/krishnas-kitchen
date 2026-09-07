import assert from "node:assert/strict";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@krishnas-kitchen/types";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it } from "vitest";

import { AuthContext } from "@/features/auth/providers/AuthContext";
import type { AuthContextValue } from "@/features/auth/providers/AuthContext";

import { ItemManagementScreen } from "./ItemManagementScreen";

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
    permissions: ["inventory.read", "items.create", "items.edit"],
    profile: null,
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

function renderScreen(auth: AuthContextValue) {
  return renderToStaticMarkup(
    <AuthContext.Provider value={auth}>
      <ItemManagementScreen />
    </AuthContext.Provider>
  );
}

describe("ItemManagementScreen", () => {
  it("blocks users without item management permission", () => {
    const markup = renderScreen(
      createAuthValue({
        permissions: ["inventory.read", "items.read"]
      })
    );

    assert.match(markup, /Item management unavailable/);
    assert.doesNotMatch(markup, /Manage item catalog/);
  });

  it("renders create and search controls for authorized managers", () => {
    const markup = renderScreen(createAuthValue());

    assert.match(markup, /Manage item catalog/);
    assert.match(markup, /Create item/);
    assert.match(markup, /Minimum stock level \(reorder point\)/);
    assert.match(markup, /Optional\. When stock reaches or falls below this level/);
    assert.match(markup, /change or remove it at any time/);
    assert.match(markup, /Target stock level/);
    assert.match(markup, /purchasing is recommended up to this level/);
    assert.match(markup, /Search items/);
  });
});
