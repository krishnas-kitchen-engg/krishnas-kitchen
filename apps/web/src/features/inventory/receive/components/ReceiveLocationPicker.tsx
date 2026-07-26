import type { InventoryCatalogLocation } from "@/domains/inventory";

type ReceiveLocationPickerProps = {
  error?: string | undefined;
  locations: readonly InventoryCatalogLocation[];
  onChange: (locationId: string) => void;
  value: string;
};

export function ReceiveLocationPicker({
  error,
  locations,
  onChange,
  value
}: ReceiveLocationPickerProps) {
  const hasLocations = locations.length > 0;

  return (
    <label className="block space-y-1 text-sm font-medium text-stone-700">
      Location
      <select
        className="min-h-12 w-full rounded-md border border-stone-300 bg-white px-3 text-base"
        disabled={!hasLocations}
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
      {!hasLocations ? (
        <span className="block rounded-md border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-900">
          No active receiving locations are available. Ask a manager to add a pilot receiving
          location.
        </span>
      ) : null}
      {error ? <span className="block text-sm font-medium text-red-700">{error}</span> : null}
    </label>
  );
}
