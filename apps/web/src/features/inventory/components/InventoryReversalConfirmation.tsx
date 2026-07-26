import type { InventoryTransaction } from "@/domains/inventory";

type InventoryReversalConfirmationProps = {
  error: string | null;
  isSubmitting: boolean;
  notes: string;
  onCancel: () => void;
  onConfirm: () => void;
  onNotesChange: (notes: string) => void;
  transaction: InventoryTransaction;
};

function getMovementLabel(transaction: InventoryTransaction): string {
  if (transaction.sourceLocationId && transaction.destinationLocationId) {
    return `${transaction.sourceLocationId} to ${transaction.destinationLocationId}`;
  }

  if (transaction.destinationLocationId) {
    return `into ${transaction.destinationLocationId}`;
  }

  if (transaction.sourceLocationId) {
    return `from ${transaction.sourceLocationId}`;
  }

  return "without location movement";
}

function getActorLabel(transaction: InventoryTransaction): string {
  if (transaction.actor.type === "temporary_volunteer") {
    return `Temporary volunteer ${transaction.actor.tempSessionId}`;
  }

  if (transaction.actor.type === "user") {
    return `User ${transaction.actor.userId}`;
  }

  return "System";
}

export function InventoryReversalConfirmation({
  error,
  isSubmitting,
  notes,
  onCancel,
  onConfirm,
  onNotesChange,
  transaction
}: InventoryReversalConfirmationProps) {
  return (
    <section className="space-y-4 rounded-md border border-red-200 bg-red-50 p-4">
      <div>
        <p className="text-xs font-semibold uppercase text-red-800">Confirm reversal</p>
        <h3 className="mt-1 text-lg font-semibold text-red-950">
          Reverse {transaction.transactionType} {transaction.quantity} {transaction.unit}
        </h3>
        <p className="mt-2 text-sm leading-6 text-red-900">
          This appends a full reversal transaction for item {transaction.itemId}{" "}
          {getMovementLabel(transaction)}. The original transaction remains in history.
        </p>
        <dl className="mt-3 grid gap-2 text-sm text-red-950">
          <div>
            <dt className="font-semibold">Original transaction</dt>
            <dd>{transaction.id}</dd>
          </div>
          <div>
            <dt className="font-semibold">Recorded by</dt>
            <dd>
              {getActorLabel(transaction)} at {transaction.createdAt}
            </dd>
          </div>
        </dl>
      </div>

      {error ? (
        <div className="rounded-md border border-red-300 bg-white p-3 text-sm font-medium text-red-800">
          {error}
        </div>
      ) : null}

      <label className="block text-sm font-medium text-red-950">
        Reason or notes
        <textarea
          className="mt-2 min-h-24 w-full rounded-md border border-red-200 bg-white px-3 py-2 text-base text-stone-950"
          onChange={(event) => onNotesChange(event.target.value)}
          placeholder="Wrong item, wrong quantity, duplicate entry..."
          value={notes}
        />
      </label>

      <div className="grid grid-cols-2 gap-2">
        <button
          className="min-h-11 rounded-md border border-red-300 bg-white px-4 text-sm font-semibold text-red-800"
          disabled={isSubmitting}
          onClick={onCancel}
          type="button"
        >
          Cancel
        </button>
        <button
          className="min-h-11 rounded-md bg-red-800 px-4 text-sm font-semibold text-white disabled:bg-stone-300"
          disabled={isSubmitting}
          onClick={onConfirm}
          type="button"
        >
          {isSubmitting ? "Reversing..." : "Confirm reversal"}
        </button>
      </div>
    </section>
  );
}
