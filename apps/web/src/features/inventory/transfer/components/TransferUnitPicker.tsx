import type { ItemUnit } from "@krishnas-kitchen/types";

type TransferUnitPickerProps = {
  error?: string | undefined;
  onChange: (unit: ItemUnit) => void;
  units: readonly ItemUnit[];
  value: ItemUnit | "";
};

export function TransferUnitPicker({ error, onChange, units, value }: TransferUnitPickerProps) {
  return (
    <label className="block space-y-1 text-sm font-medium text-stone-700">
      Unit
      <select
        className="min-h-12 w-full rounded-md border border-stone-300 bg-white px-3 text-base"
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
      {error ? <span className="block text-sm font-medium text-red-700">{error}</span> : null}
    </label>
  );
}
