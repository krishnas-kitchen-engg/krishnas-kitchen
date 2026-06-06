type ScanInvalidBarcodeCardProps = {
  error: string | null;
};

export function ScanInvalidBarcodeCard({ error }: ScanInvalidBarcodeCardProps) {
  return (
    <section className="rounded-md border border-red-200 bg-red-50 p-4">
      <p className="text-xs font-semibold uppercase text-red-800">Invalid barcode</p>
      <h2 className="mt-1 text-lg font-semibold text-stone-950">Check the barcode value</h2>
      {error ? <p className="mt-1 text-sm font-medium text-red-800">{error}</p> : null}
    </section>
  );
}
