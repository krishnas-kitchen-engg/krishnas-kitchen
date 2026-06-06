import type { InventoryBarcodeItemReference } from "@/domains/inventory";

type ScanAmbiguousBarcodeCardProps = {
  items: readonly InventoryBarcodeItemReference[];
};

export function ScanAmbiguousBarcodeCard({ items }: ScanAmbiguousBarcodeCardProps) {
  return (
    <section className="space-y-3 rounded-md border border-amber-200 bg-amber-50 p-4">
      <div>
        <p className="text-xs font-semibold uppercase text-amber-800">Ambiguous barcode</p>
        <h2 className="mt-1 text-lg font-semibold text-stone-950">Multiple items matched</h2>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div className="rounded-md bg-white p-3 text-sm" key={item.id}>
            <p className="font-semibold text-stone-950">{item.name}</p>
            <p className="mt-1 text-stone-600">Default unit: {item.defaultUnit}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
