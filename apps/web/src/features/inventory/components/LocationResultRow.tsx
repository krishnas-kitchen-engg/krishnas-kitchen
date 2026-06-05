import type { InventoryCatalogLocation } from "@/domains/inventory";

type LocationResultRowProps = {
  location: InventoryCatalogLocation;
  onSelect: (locationId: string) => void;
};

export function LocationResultRow({ location, onSelect }: LocationResultRowProps) {
  return (
    <button
      className="min-h-16 w-full rounded-md border border-stone-200 bg-white p-3 text-left"
      onClick={() => onSelect(location.id)}
      type="button"
    >
      <span className="block font-semibold text-stone-950">{location.name}</span>
      <span className="mt-1 block text-sm text-stone-600">Location ID: {location.id}</span>
    </button>
  );
}
