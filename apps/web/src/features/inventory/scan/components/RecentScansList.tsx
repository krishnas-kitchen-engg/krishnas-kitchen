import type { InventoryBarcodeScanEvent } from "@/domains/inventory";

type RecentScansListProps = {
  scans: readonly InventoryBarcodeScanEvent[];
};

export function RecentScansList({ scans }: RecentScansListProps) {
  return (
    <section className="space-y-3 rounded-md border border-stone-200 bg-white p-4">
      <h2 className="text-base font-semibold text-stone-950">Recent scans</h2>
      {scans.length > 0 ? (
        <ol className="space-y-2">
          {scans.slice(0, 5).map((scan) => (
            <li
              className="rounded-md bg-stone-50 p-3 text-sm"
              key={`${scan.barcode.format}:${scan.barcode.value}:${scan.scannedAt}`}
            >
              <span className="block font-semibold text-stone-950">
                {scan.barcode.format}: {scan.barcode.value}
              </span>
              <span className="mt-1 block text-stone-600">{scan.scannedAt}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-sm text-stone-600">No scans yet.</p>
      )}
    </section>
  );
}
