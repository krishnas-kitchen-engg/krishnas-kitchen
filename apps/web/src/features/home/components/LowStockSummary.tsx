import type { InventoryLowStockAlert } from "@/domains/inventory";

import type { VolunteerHomeSectionState } from "../types/volunteerHomeTypes";
import { HomeSummaryError } from "./HomeSummaryError";

type LowStockSummaryProps = {
  lowStock: VolunteerHomeSectionState<InventoryLowStockAlert>;
};

export function LowStockSummary({ lowStock }: LowStockSummaryProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-stone-950">Low stock</h2>
      {lowStock.status === "unavailable" ? (
        <HomeSummaryError message="Low stock summary is unavailable." />
      ) : lowStock.items.length > 0 ? (
        <ul className="space-y-2">
          {lowStock.items.map((alert) => (
            <li
              className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm"
              key={`${alert.itemId}:${alert.locationId ?? "temple"}:${alert.unit}`}
            >
              <span className="block font-semibold text-stone-950">{alert.itemId}</span>
              <span className="mt-1 block text-stone-700">
                {alert.currentQuantity} {alert.unit} available
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-md border border-stone-200 bg-white p-4 text-sm text-stone-600">
          No low stock alerts
        </p>
      )}
    </section>
  );
}
