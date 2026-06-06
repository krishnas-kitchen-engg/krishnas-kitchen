import type { InventoryBarcodeScanEvent } from "@/domains/inventory";

type ScanDuplicateCardProps = {
  duplicateOf: InventoryBarcodeScanEvent | null;
};

export function ScanDuplicateCard({ duplicateOf }: ScanDuplicateCardProps) {
  return (
    <section className="rounded-md border border-stone-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase text-stone-600">Duplicate scan</p>
      <h2 className="mt-1 text-lg font-semibold text-stone-950">Already scanned</h2>
      {duplicateOf ? (
        <p className="mt-1 text-sm text-stone-600">
          {duplicateOf.barcode.format}: {duplicateOf.barcode.value}
        </p>
      ) : null}
    </section>
  );
}
