import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { getPermissionsForRoles, getTemporaryVolunteerPermissions } from "./permissions";

describe("temporary volunteer permissions", () => {
  it("limits temporary volunteers to read and session capabilities", () => {
    assert.deepEqual(getTemporaryVolunteerPermissions(), [
      "locations.read",
      "items.read",
      "inventory.read",
      "volunteer_sessions.create"
    ]);
  });
});

describe("role permissions", () => {
  it("grants recipe management to kitchen leadership roles", () => {
    assert.equal(getPermissionsForRoles(["senior_cook"]).includes("recipes.manage"), true);
    assert.equal(getPermissionsForRoles(["inventory_manager"]).includes("recipes.manage"), true);
    assert.equal(getPermissionsForRoles(["volunteer"]).includes("recipes.manage"), false);
  });
});
