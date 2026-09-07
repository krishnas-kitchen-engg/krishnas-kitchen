import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it } from "vitest";

import { BottomNavigation } from "./BottomNavigation";
import { bottomNavigationItems } from "./bottomNavigationItems";

describe("BottomNavigation", () => {
  it("renders volunteer shell navigation with active route state", () => {
    const markup = renderToStaticMarkup(
      <BottomNavigation
        currentPath="/inventory"
        permissions={["inventory.read", "inventory.receive"]}
      />
    );

    assert.match(markup, /Home/);
    assert.match(markup, /Inventory/);
    assert.match(markup, /Scan/);
    assert.match(markup, /Receive/);
    assert.match(markup, /Tasks/);
    assert.match(markup, /aria-current="page"/);
  });

  it("includes a direct scan navigation target", () => {
    assert.deepEqual(
      bottomNavigationItems.find((item) => item.label === "Scan"),
      {
        label: "Scan",
        path: "/scan",
        requiredPermission: "inventory.read"
      }
    );
  });

  it("keeps inventory and tasks in primary navigation", () => {
    assert.deepEqual(
      bottomNavigationItems.map((item) => item.label),
      ["Home", "Inventory", "Scan", "Receive", "Tasks"]
    );
  });

  it("hides actions the current role cannot use", () => {
    const markup = renderToStaticMarkup(
      <BottomNavigation currentPath="/" permissions={["inventory.read"]} />
    );

    assert.match(markup, /Inventory/);
    assert.doesNotMatch(markup, /Receive/);
  });
});
