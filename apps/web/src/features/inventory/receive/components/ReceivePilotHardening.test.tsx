import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it } from "vitest";

import { ReceiveItemPicker } from "./ReceiveItemPicker";
import { ReceiveLocationPicker } from "./ReceiveLocationPicker";
import { ReceiveUnitPicker } from "./ReceiveUnitPicker";

describe("receiving pilot hardening states", () => {
  it("shows a loading state before manual receiving items are available", () => {
    const markup = renderToStaticMarkup(
      <ReceiveItemPicker
        isLoading={true}
        items={[]}
        onSearchChange={() => {}}
        onSelect={() => {}}
        searchText=""
      />
    );

    assert.match(markup, /Loading receiving items/);
    assert.doesNotMatch(markup, /No active receiving items are available/);
  });

  it("gives volunteers a clear recovery path when no manual item matches", () => {
    const markup = renderToStaticMarkup(
      <ReceiveItemPicker
        isLoading={false}
        items={[]}
        onSearchChange={() => {}}
        onSelect={() => {}}
        searchText="basmati"
      />
    );

    assert.match(markup, /No active receiving items match &quot;basmati&quot;/);
    assert.match(markup, /ask a manager to add the item/i);
  });

  it("explains when receiving locations are unavailable", () => {
    const markup = renderToStaticMarkup(
      <ReceiveLocationPicker error={undefined} locations={[]} onChange={() => {}} value="" />
    );

    assert.match(markup, /No active receiving locations are available/);
    assert.match(markup, /disabled=""/);
  });

  it("explains when an item has no receiving units", () => {
    const markup = renderToStaticMarkup(
      <ReceiveUnitPicker error={undefined} onChange={() => {}} units={[]} value="" />
    );

    assert.match(markup, /no receiving units available/i);
    assert.match(markup, /disabled=""/);
  });
});
