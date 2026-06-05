import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it } from "vitest";

import { BottomNavigation } from "./BottomNavigation";

describe("BottomNavigation", () => {
  it("renders volunteer shell navigation with active route state", () => {
    const markup = renderToStaticMarkup(<BottomNavigation currentPath="/inventory" />);

    assert.match(markup, /Home/);
    assert.match(markup, /Inventory/);
    assert.match(markup, /Receive/);
    assert.match(markup, /Scan/);
    assert.match(markup, /Profile/);
    assert.match(markup, /aria-current="page"/);
  });
});
