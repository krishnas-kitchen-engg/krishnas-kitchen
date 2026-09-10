import assert from "node:assert/strict";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@krishnas-kitchen/types";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it } from "vitest";

import { AuthContext } from "@/features/auth/providers/AuthContext";
import type { AuthContextValue } from "@/features/auth/providers/AuthContext";

import { ItemForm, ItemManagementScreen } from "./ItemManagementScreen";

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

  it("keeps item creation collapsed so the searchable list stays close to the top", () => {
    const markup = renderScreen(createAuthValue());

    assert.match(markup, /Manage item catalog/);
    assert.match(markup, /Add new inventory item/);
    assert.match(markup, /Add item/);
    assert.match(markup, /aria-expanded="false"/);
    assert.match(markup, /Search items/);
    assert.doesNotMatch(markup, /Item name/);
  });

  it("renders a complete, prefilled editor with local save and cancel actions", () => {
    const noOp = () => {};
    const management = {
      canCreateItems: true,
      canEditItems: true,
      error: null,
      form: {
        category: "Grains",
        contentsLabel: "",
        contentsQuantityText: "50",
        contentsUnit: "lb",
        defaultUnit: "lb",
        description: "Bulk beans",
        editingItemId: "item-1",
        handlingUnit: "bag",
        name: "Pinto Beans — 50 lb Bag",
        packageDescription: "50 lb per bag",
        productName: "Pinto Beans",
        reorderThresholdText: "100",
        targetStockLevelText: "250"
      },
      isSubmitting: false,
      setCategory: noOp,
      setContentsLabel: noOp,
      setContentsQuantityText: noOp,
      setContentsUnit: noOp,
      setDefaultUnit: noOp,
      setDescription: noOp,
      setHandlingUnit: noOp,
      setName: noOp,
      setPackageDescription: noOp,
      setProductName: noOp,
      setReorderThresholdText: noOp,
      setTargetStockLevelText: noOp,
      submitItem: () => Promise.resolve(),
      units: ["bag", "lb"]
    } as unknown as Parameters<typeof ItemForm>[0]["management"];

    const markup = renderToStaticMarkup(
      <ItemForm fieldIdPrefix="edit-item-1" management={management} mode="edit" onCancel={noOp} />
    );

    assert.match(markup, /Pinto Beans — 50 lb Bag/);
    assert.match(markup, /Package details/);
    assert.match(markup, /open=""/);
    assert.match(markup, /Save changes/);
    assert.match(markup, /Cancel/);
  });
});
