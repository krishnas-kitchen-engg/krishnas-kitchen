import { Button } from "@krishnas-kitchen/ui";

import { navigateTo } from "@/app/routes/router";
import { useInventoryPermissions } from "@/domains/inventory";
import { useAuth } from "@/features/auth";
import {
  HomeSummaryLoading,
  LowStockSummary,
  PendingUnknownBarcodeSummary,
  QuickActionsGrid,
  RecentInventoryActivity,
  TempleContextCard,
  useVolunteerHomeSummary,
  VolunteerHomeHeader,
  type VolunteerHomeQuickAction
} from "@/features/home";

function getVisibleQuickActions(permissions: ReturnType<typeof useInventoryPermissions>) {
  const actions: VolunteerHomeQuickAction[] = [
    {
      label: "Scan",
      path: "/scan",
      requiredPermission: "inventory.read"
    },
    {
      label: "Receive",
      path: "/receive",
      requiredPermission: "inventory.receive"
    },
    {
      label: "Transfer",
      path: "/transfer",
      requiredPermission: "inventory.transfer"
    },
    {
      label: "Return",
      path: "/return",
      requiredPermission: "inventory.return"
    },
    {
      label: "Inventory",
      path: "/inventory",
      requiredPermission: "inventory.read"
    }
  ];

  return actions.filter((action) => {
    if (action.requiredPermission === "inventory.read") {
      return permissions.canReadInventory;
    }

    if (action.requiredPermission === "inventory.receive") {
      return permissions.canReceiveInventory;
    }

    if (action.requiredPermission === "inventory.transfer") {
      return permissions.canTransferInventory;
    }

    return permissions.canReturnInventory;
  });
}

export function HomeScreen() {
  const auth = useAuth();
  const permissions = useInventoryPermissions();
  const summary = useVolunteerHomeSummary();
  const roleLabel = auth.isTemporaryVolunteer
    ? "Temporary volunteer"
    : auth.roles.length > 0
      ? auth.roles.join(", ")
      : "No role assigned";
  const sessionLabel = auth.isTemporaryVolunteer ? "Temporary volunteer" : auth.status;
  const quickActions = getVisibleQuickActions(permissions);

  return (
    <section className="flex w-full flex-col gap-5">
      <VolunteerHomeHeader
        organizationName={auth.currentOrganization?.name ?? "Krishna's Kitchen"}
      />
      <TempleContextCard
        roleLabel={roleLabel}
        sessionLabel={sessionLabel}
        templeName={auth.currentTemple?.name ?? "Not selected"}
      />
      <QuickActionsGrid actions={quickActions} />
      {summary.isLoading ? <HomeSummaryLoading /> : null}
      <RecentInventoryActivity activity={summary.recentActivity} />
      <LowStockSummary lowStock={summary.lowStock} />
      <PendingUnknownBarcodeSummary pendingUnknownBarcodes={summary.pendingUnknownBarcodes} />
      <div className="grid gap-2">
        {!auth.isTemporaryVolunteer ? (
          <Button
            className="w-full bg-stone-900 hover:bg-stone-700"
            onClick={() => navigateTo("/select-temple")}
            type="button"
          >
            Change temple
          </Button>
        ) : null}
        <Button
          className="w-full bg-stone-900 hover:bg-stone-700"
          onClick={() => void auth.signOut()}
          type="button"
        >
          End session
        </Button>
      </div>
    </section>
  );
}
