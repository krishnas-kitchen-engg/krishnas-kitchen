import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@krishnas-kitchen/types";
import { describe, it } from "vitest";

import { InventoryAvailabilityContext } from "@/domains/inventory/integration/inventoryContextValue";
import { AuthContext } from "@/features/auth/providers/AuthContext";
import type { AuthContextValue } from "@/features/auth/providers/AuthContext";

import { TasksScreen } from "./TasksScreen";

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
    startTemporaryVolunteerSession() {},
    status: "authenticated",
    temporaryVolunteerSession: null,
    ...overrides
  };
}

function renderTasks(auth: AuthContextValue) {
  return renderToStaticMarkup(
    <AuthContext.Provider value={auth}>
      <InventoryAvailabilityContext.Provider value={{ status: "unavailable" }}>
        <TasksScreen />
      </InventoryAvailabilityContext.Provider>
    </AuthContext.Provider>
  );
}

describe("TasksScreen", () => {
  it("renders volunteer tasks shell and empty state", () => {
    const markup = renderTasks(createAuthValue());

    assert.match(markup, /Tasks/);
    assert.match(markup, /Main Temple/);
    assert.match(markup, /All/);
    assert.match(markup, /Barcodes/);
    assert.match(markup, /Low stock/);
    assert.match(markup, /No open inventory tasks/);
  });

  it("blocks users without inventory read permission", () => {
    const markup = renderTasks(
      createAuthValue({
        permissions: []
      })
    );

    assert.match(markup, /Tasks unavailable/);
  });
});
