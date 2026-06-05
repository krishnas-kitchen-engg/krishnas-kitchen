import type { InventoryCatalogLocation } from "@/domains/inventory";

type TransferLocationPickerProps = {
  error?: string | undefined;
  label: string;
  locations: readonly InventoryCatalogLocation[];
  onChange: (locationId: string) => void;
  value: string;
};

export function TransferLocationPicker({
  error,
  label,
  locations,
  onChange,
  value
}: TransferLocationPickerProps) {
  return (
    <label className="block space-y-1 text-sm font-medium text-stone-700">
      {label}
      <select
        className="min-h-12 w-full rounded-md border border-stone-300 bg-white px-3 text-base"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        <option value="">Select location</option>
        {locations.map((location) => (
          <option key={location.id} value={location.id}>
            {location.name}
          </option>
        ))}
      </select>
      {error ? <span className="block text-sm font-medium text-red-700">{error}</span> : null}
    </label>
  );
}
