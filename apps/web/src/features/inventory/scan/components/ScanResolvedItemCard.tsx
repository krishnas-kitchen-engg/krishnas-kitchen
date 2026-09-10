import type { InventoryBarcodeItemReference, InventoryCatalogItem } from "@/domains/inventory";
import { InventoryItemPackageSummary } from "../../components/InventoryItemPackageSummary";

type ScanResolvedItemCardProps = {
  item: InventoryBarcodeItemReference | InventoryCatalogItem;
  sourceLabel: string;
};

export function ScanResolvedItemCard({ item, sourceLabel }: ScanResolvedItemCardProps) {
  return (
    <section className="rounded-md border border-emerald-200 bg-emerald-50 p-4">
      <p className="text-xs font-semibold uppercase text-emerald-800">{sourceLabel}</p>
      <h2 className="mt-1 text-lg font-semibold text-stone-950">{item.name}</h2>
      <InventoryItemPackageSummary item={item} showProductName />
      <p className="mt-1 text-sm text-stone-700">
        {item.barcodes.length} barcode{item.barcodes.length === 1 ? "" : "s"} on file
      </p>
    </section>
  );
}
