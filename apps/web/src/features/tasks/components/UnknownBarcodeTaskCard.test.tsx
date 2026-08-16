import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it } from "vitest";

import type { InventoryCatalogItem } from "@/domains/inventory";

import type { UnknownBarcodeReviewTask } from "../types/taskTypes";
import { UnknownBarcodeTaskCard } from "./UnknownBarcodeTaskCard";

const task: UnknownBarcodeReviewTask = {
  barcode: {
    format: "upc_a",
    value: "036000291452"
  },
  barcodeLabel: "upc_a: 036000291452",
  category: "unknown_barcode",
  description: "Seen 2 times. Review and link when the item is known.",
  id: "unknown-barcode:unknown-1",
  priority: "attention",
  scanCount: 2,
  templeId: "temple-1",
  title: "Review unknown barcode",
  unknownBarcodeId: "unknown-1"
};

const item: InventoryCatalogItem = {
  barcodes: [],
  category: "Dry goods",
  defaultUnit: "lb",
  deletedAt: null,
  id: "item-1",
  name: "Rice",
  organizationId: "org-1",
  receivingUnits: ["lb"]
};

function renderCard(canResolve: boolean) {
  return renderToStaticMarkup(
    <UnknownBarcodeTaskCard
      canResolve={canResolve}
      dismissReason=""
      isSubmitting={false}
      items={[item]}
      linkItemId=""
      onDismiss={() => undefined}
      onDismissReasonChange={() => undefined}
      onLink={() => undefined}
      onLinkItemChange={() => undefined}
      task={task}
    />
  );
}

describe("UnknownBarcodeTaskCard", () => {
  it("shows manager resolution controls when allowed", () => {
    const markup = renderCard(true);

    assert.match(markup, /Unknown barcode/);
    assert.match(markup, /upc_a: 036000291452/);
    assert.match(markup, /Link to item/);
    assert.match(markup, /Rice \(lb\)/);
    assert.match(markup, /Dismissal reason/);
  });

  it("hides resolution controls for read-only users", () => {
    const markup = renderCard(false);

    assert.match(markup, /Unknown barcode/);
    assert.doesNotMatch(markup, /Link to item/);
    assert.doesNotMatch(markup, /Dismissal reason/);
  });
});
