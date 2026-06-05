type InventorySearchFieldProps = {
  onChange: (value: string) => void;
  value: string;
};

export function InventorySearchField({ onChange, value }: InventorySearchFieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-stone-700">Search inventory</span>
      <input
        className="mt-2 min-h-12 w-full rounded-md border border-stone-300 bg-white px-3 text-base text-stone-950 outline-none transition focus:border-brand-700 focus:ring-2 focus:ring-brand-700/20"
        onChange={(event) => onChange(event.currentTarget.value)}
        placeholder="Rice, pantry, or barcode"
        type="search"
        value={value}
      />
    </label>
  );
}
