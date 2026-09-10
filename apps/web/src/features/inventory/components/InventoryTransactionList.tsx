import { formatInventoryTransactionQuantity, type InventoryTransaction } from "@/domains/inventory";

type InventoryTransactionListProps = {
  canReverse?: boolean;
  onReverseRequest?: (transaction: InventoryTransaction) => void;
  reversingTransactionId?: string | null;
  transactions: readonly InventoryTransaction[];
};

function getActorLabel(transaction: InventoryTransaction): string {
  if (transaction.actor.type === "temporary_volunteer") {
    return `Temporary volunteer ${transaction.actor.tempSessionId}`;
  }

  if (transaction.actor.type === "user") {
    return `User ${transaction.actor.userId}`;
  }

  return "System";
}

function getLocationLabel(transaction: InventoryTransaction): string {
  if (transaction.sourceLocationId && transaction.destinationLocationId) {
    return `from ${transaction.sourceLocationId} to ${transaction.destinationLocationId}`;
  }

  if (transaction.destinationLocationId) {
    return `into ${transaction.destinationLocationId}`;
  }

  if (transaction.sourceLocationId) {
    return `from ${transaction.sourceLocationId}`;
  }

  return "no location movement";
}

function isReversibleTransaction(transaction: InventoryTransaction): boolean {
  return (
    transaction.transactionType === "received" ||
    transaction.transactionType === "consumed" ||
    transaction.transactionType === "returned" ||
    transaction.transactionType === "transfer"
  );
}

export function InventoryTransactionList({
  canReverse = false,
  onReverseRequest,
  reversingTransactionId = null,
  transactions
}: InventoryTransactionListProps) {
  if (transactions.length === 0) {
    return <p className="text-sm text-stone-600">No recent transactions.</p>;
  }

  const reversedTransactionIds = new Set(
    transactions.flatMap((transaction) =>
      transaction.reversalOfTransactionId ? [transaction.reversalOfTransactionId] : []
    )
  );

  return (
    <ul className="space-y-2">
      {transactions.map((transaction) => {
        const alreadyReversed = reversedTransactionIds.has(transaction.id);
        const canReverseTransaction =
          canReverse && isReversibleTransaction(transaction) && !alreadyReversed;

        return (
          <li
            className="rounded-md border border-stone-200 bg-white p-3 text-sm"
            key={transaction.id}
          >
            <span className="block font-semibold capitalize text-stone-950">
              {transaction.transactionType.replace("_", " ")}{" "}
              {formatInventoryTransactionQuantity(transaction)}
            </span>
            <span className="mt-1 block text-stone-600">
              Item {transaction.itemId} {getLocationLabel(transaction)}
            </span>
            <span className="mt-1 block text-stone-600">
              By {getActorLabel(transaction)} at {transaction.createdAt}
            </span>
            {transaction.reversalOfTransactionId ? (
              <span className="mt-1 block font-medium text-amber-800">
                Corrects transaction {transaction.reversalOfTransactionId}
              </span>
            ) : null}
            {alreadyReversed ? (
              <span className="mt-2 block text-xs font-semibold uppercase text-amber-800">
                Already reversed
              </span>
            ) : null}
            {canReverseTransaction && onReverseRequest ? (
              <button
                className="mt-3 min-h-11 w-full rounded-md border border-red-300 bg-red-50 px-4 text-sm font-semibold text-red-800 disabled:border-stone-200 disabled:bg-stone-100 disabled:text-stone-500"
                disabled={reversingTransactionId === transaction.id}
                onClick={() => onReverseRequest(transaction)}
                type="button"
              >
                {reversingTransactionId === transaction.id ? "Reversing..." : "Reverse"}
              </button>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
