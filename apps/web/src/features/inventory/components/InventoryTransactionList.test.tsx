import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it } from "vitest";

import type { InventoryTransaction } from "@/domains/inventory";

import { InventoryTransactionList } from "./InventoryTransactionList";

const receivedTransaction = {
  actor: {
    tempSessionId: "morning-receiving-volunteer",
    type: "temporary_volunteer"
  },
  auditMetadata: {
    clientRequestId: "pilot-receiving-smoke-001",
    deviceId: "pilot-receiving-phone",
    reason: "barcode_scan_receiving",
    source: "online"
  },
  createdAt: "2026-07-18T08:01:00.000Z",
  destinationLocationId: "dry-store-pantry",
  id: "received-1",
  itemId: "sona-masoori-rice",
  notes: "Pilot donation intake: 25 kg rice",
  organizationId: "iskcon-bangalore",
  quantity: 25,
  quantityEffect: "increase",
  reversalOfTransactionId: null,
  sourceLocationId: null,
  templeId: "main-temple",
  transactionType: "received",
  unit: "kg"
} satisfies InventoryTransaction;

const reversalTransaction = {
  ...receivedTransaction,
  actor: {
    type: "user",
    userId: "manager-1"
  },
  auditMetadata: {
    reason: "wrong quantity",
    reversedTransactionId: "received-1",
    source: "online"
  },
  createdAt: "2026-07-18T08:05:00.000Z",
  id: "reversal-1",
  notes: "Correct receiving mistake",
  quantityEffect: "decrease",
  reversalOfTransactionId: "received-1",
  sourceLocationId: "dry-store-pantry",
  transactionType: "reversal"
} satisfies InventoryTransaction;

describe("InventoryTransactionList", () => {
  it("shows manager-readable receiving history with item, quantity, location, actor, and timestamp", () => {
    const markup = renderToStaticMarkup(
      <InventoryTransactionList transactions={[receivedTransaction]} />
    );

    assert.match(markup, /received 25 kg/i);
    assert.match(markup, /Item sona-masoori-rice into dry-store-pantry/);
    assert.match(markup, /By Temporary volunteer morning-receiving-volunteer/);
    assert.match(markup, /2026-07-18T08:01:00.000Z/);
  });

  it("keeps empty history understandable", () => {
    const markup = renderToStaticMarkup(<InventoryTransactionList transactions={[]} />);

    assert.match(markup, /No recent transactions/);
  });

  it("shows which original transaction a reversal corrects", () => {
    const markup = renderToStaticMarkup(
      <InventoryTransactionList transactions={[reversalTransaction, receivedTransaction]} />
    );

    assert.match(markup, /reversal 25 kg/i);
    assert.match(markup, /By User manager-1/);
    assert.match(markup, /Corrects transaction received-1/);
  });

  it("shows reversal actions for manager-reversible transactions", () => {
    const markup = renderToStaticMarkup(
      <InventoryTransactionList
        canReverse
        onReverseRequest={() => {}}
        transactions={[receivedTransaction]}
      />
    );

    assert.match(markup, />Reverse</);
  });

  it("marks already reversed transactions and hides duplicate reversal actions", () => {
    const markup = renderToStaticMarkup(
      <InventoryTransactionList
        canReverse
        onReverseRequest={() => {}}
        transactions={[reversalTransaction, receivedTransaction]}
      />
    );

    assert.match(markup, /Already reversed/);
    assert.doesNotMatch(markup, />Reverse</);
  });
});
