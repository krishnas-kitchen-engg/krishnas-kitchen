type TransferQuantityEntryProps = {
  error?: string | undefined;
  onChange: (value: string) => void;
  value: string;
};

export function TransferQuantityEntry({ error, onChange, value }: TransferQuantityEntryProps) {
  return (
    <label className="block space-y-1 text-sm font-medium text-stone-700">
      Quantity
      <input
        className="min-h-12 w-full rounded-md border border-stone-300 px-3 text-lg"
        inputMode="decimal"
        min="0"
        onChange={(event) => onChange(event.target.value)}
        placeholder="0"
        type="number"
        value={value}
      />
      {error ? <span className="block text-sm font-medium text-red-700">{error}</span> : null}
    </label>
  );
}
