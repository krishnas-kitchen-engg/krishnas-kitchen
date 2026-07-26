import type { ItemUnit } from "@krishnas-kitchen/types";

type ReceiveUnitPickerProps = {
  error?: string | undefined;
  onChange: (unit: ItemUnit) => void;
  units: readonly ItemUnit[];
  value: ItemUnit | "";
};

export function ReceiveUnitPicker({ error, onChange, units, value }: ReceiveUnitPickerProps) {
  const hasUnits = units.length > 0;

  return (
    <label className="block space-y-1 text-sm font-medium text-stone-700">
      Unit
      <select
        className="min-h-12 w-full rounded-md border border-stone-300 bg-white px-3 text-base"
        disabled={!hasUnits}
        onChange={(event) => onChange(event.target.value as ItemUnit)}
        value={value}
      >
        <option value="">Select unit</option>
        {units.map((unit) => (
          <option key={unit} value={unit}>
            {unit}
          </option>
        ))}
      </select>
      {!hasUnits ? (
        <span className="block rounded-md border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-900">
          This item has no receiving units available. Ask a manager to update the item before
          receiving it.
        </span>
      ) : null}
      {error ? <span className="block text-sm font-medium text-red-700">{error}</span> : null}
    </label>
  );
}
