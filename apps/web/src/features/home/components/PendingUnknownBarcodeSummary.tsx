import type { UnknownBarcodeRecord } from "@/domains/inventory";

import type { VolunteerHomeSectionState } from "../types/volunteerHomeTypes";
import { HomeSummaryError } from "./HomeSummaryError";

type PendingUnknownBarcodeSummaryProps = {
  pendingUnknownBarcodes: VolunteerHomeSectionState<UnknownBarcodeRecord>;
};

export function PendingUnknownBarcodeSummary({
  pendingUnknownBarcodes
}: PendingUnknownBarcodeSummaryProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-stone-950">Pending barcode reviews</h2>
      {pendingUnknownBarcodes.status === "unavailable" ? (
        <HomeSummaryError message="Pending barcode reviews are unavailable." />
      ) : pendingUnknownBarcodes.items.length > 0 ? (
        <ul className="space-y-2">
          {pendingUnknownBarcodes.items.map((record) => (
            <li className="rounded-md border border-stone-200 bg-white p-3 text-sm" key={record.id}>
              <span className="block font-semibold text-stone-950">
                {record.barcode.format}: {record.barcode.value}
              </span>
              <span className="mt-1 block text-stone-600">
                Seen {record.scanCount} time{record.scanCount === 1 ? "" : "s"}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-md border border-stone-200 bg-white p-4 text-sm text-stone-600">
          No pending barcode reviews
        </p>
      )}
    </section>
  );
}
