import { navigateTo } from "@/app/routes/router";

import { useInventoryDashboard } from "../hooks/useInventoryDashboard";
import type { InventoryDashboardMetric } from "../types/inventoryDashboardTypes";

function MetricCard({ metric }: { metric: InventoryDashboardMetric }) {
  return (
    <article className="rounded-md border border-stone-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase text-stone-500">{metric.label}</p>
      <p className="mt-2 text-3xl font-semibold text-stone-950">{metric.value}</p>
      {metric.status === "unavailable" ? (
        <p className="mt-1 text-sm font-medium text-amber-700">Data source unavailable</p>
      ) : null}
    </article>
  );
}

export function InventoryDashboardScreen() {
  const dashboard = useInventoryDashboard();
  const metrics = [
    dashboard.metrics.activeItems,
    dashboard.metrics.lowStockItems,
    dashboard.metrics.outOfStockItems,
    dashboard.metrics.receivedToday,
    dashboard.metrics.consumedToday,
    dashboard.metrics.productionRunsToday
  ];

  if (!dashboard.canViewDashboard) {
    return (
      <section className="rounded-md border border-stone-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-stone-950">Dashboard unavailable</h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Your current session does not include manager dashboard access.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase text-brand-800">Inventory dashboard</p>
          <h1 className="mt-1 text-2xl font-semibold text-stone-950">Today&apos;s kitchen view</h1>
        </div>
        <button
          className="min-h-10 rounded-md border border-stone-300 px-3 text-sm font-semibold text-stone-800 disabled:text-stone-400"
          disabled={dashboard.isLoading}
          onClick={() => dashboard.refresh()}
          type="button"
        >
          {dashboard.isLoading ? "Refreshing" : "Refresh"}
        </button>
      </div>

      {dashboard.error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800">
          {dashboard.error}
        </div>
      ) : null}

      <section className="grid grid-cols-2 gap-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-stone-950">Items needing attention</h2>
          <span className="text-sm font-medium text-stone-500">
            {dashboard.lowStockAlerts.length}
          </span>
        </div>
        <button
          className="min-h-10 w-full rounded-md border border-stone-300 px-3 text-sm font-semibold text-stone-800"
          onClick={() => navigateTo("/low-stock")}
          type="button"
        >
          Open Low Stock Center
        </button>
        {dashboard.lowStockAlerts.length > 0 ? (
          <div className="space-y-2">
            {dashboard.lowStockAlerts.slice(0, 6).map((alert) => (
              <article
                className="rounded-md border border-amber-200 bg-amber-50 p-3"
                key={`${alert.itemId}:${alert.locationId ?? "all"}:${alert.unit}`}
              >
                <p className="font-semibold text-amber-950">{alert.itemId}</p>
                <p className="mt-1 text-sm text-amber-800">
                  {alert.currentQuantity} {alert.unit} available, shortage {alert.shortageQuantity}{" "}
                  {alert.unit}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-md border border-stone-200 bg-white p-4 text-sm text-stone-600">
            No low-stock items require attention.
          </p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-stone-950">Recent activity</h2>
        {dashboard.recentActivity.length > 0 ? (
          <div className="space-y-2">
            {dashboard.recentActivity.map((activity) => (
              <article
                className="rounded-md border border-stone-200 bg-white p-3"
                key={activity.id}
              >
                <p className="text-sm font-semibold text-stone-950">{activity.description}</p>
                <p className="mt-1 text-xs text-stone-500">
                  {new Date(activity.timestamp).toLocaleString()}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-md border border-stone-200 bg-white p-4 text-sm text-stone-600">
            No recent inventory activity yet.
          </p>
        )}
      </section>
    </section>
  );
}
