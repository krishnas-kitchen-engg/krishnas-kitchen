import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { getTemporaryVolunteerPermissions } from "./permissions";

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
