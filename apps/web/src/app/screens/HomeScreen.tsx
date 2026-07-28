import { Button } from "@krishnas-kitchen/ui";

import { navigateTo } from "@/app/routes/router";
import { useInventoryPermissions } from "@/domains/inventory";
import { hasPermission, useAuth } from "@/features/auth";
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

function getVisibleQuickActions(
  permissions: ReturnType<typeof useInventoryPermissions>,
  authPermissions: ReturnType<typeof useAuth>["permissions"]
) {
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
      label: "Consume",
      path: "/consume",
      requiredPermission: "inventory.consume"
    },
    {
      label: "Adjust",
      path: "/adjust",
      requiredPermission: "inventory.adjust"
    },
    {
      label: "Dashboard",
      path: "/dashboard",
      requiredPermission: "inventory.adjust"
    },
    {
      label: "Low Stock",
      path: "/low-stock",
      requiredPermission: "inventory.adjust"
    },
    {
      label: "Locations",
      path: "/locations",
      requiredPermission: "inventory.adjust"
    },
    {
      label: "Items",
      path: "/items",
      requiredPermission: "items.edit"
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
    },
    {
      label: "Recipes",
      path: "/recipes",
      requiredPermission: "recipes.read"
    },
    {
      label: "Request",
      path: "/purchase-requests",
      requiredPermission: "procurement.requests.create"
    },
    {
      label: "My Purchases",
      path: "/my-purchases",
      requiredPermission: "procurement.purchases.read_assigned"
    },
    {
      label: "Review",
      path: "/purchase-review",
      requiredPermission: "procurement.requests.review"
    },
    {
      label: "Receipts",
      path: "/receipt-review",
      requiredPermission: "procurement.receipts.review"
    },
    {
      label: "Procurement",
      path: "/procurement-admin",
      requiredPermission: "procurement.admin"
    }
  ];

  return actions.filter((action) => {
    if (action.requiredPermission === "inventory.read") {
      return permissions.canReadInventory;
    }

    if (action.requiredPermission === "inventory.receive") {
      return permissions.canReceiveInventory;
    }

    if (action.requiredPermission === "inventory.consume") {
      return permissions.canConsumeInventory;
    }

    if (action.requiredPermission === "inventory.adjust") {
      return permissions.canAdjustInventory;
    }

    if (action.requiredPermission === "inventory.transfer") {
      return permissions.canTransferInventory;
    }

    if (action.requiredPermission === "items.edit") {
      return permissions.canCreateItems || permissions.canEditItems;
    }

    if (action.requiredPermission === "recipes.read") {
      return hasPermission(authPermissions, "recipes.read");
    }

    if (action.requiredPermission === "procurement.admin") {
      return hasPermission(authPermissions, "procurement.admin");
    }

    if (action.requiredPermission === "procurement.requests.create") {
      return hasPermission(authPermissions, "procurement.requests.create");
    }

    if (action.requiredPermission === "procurement.purchases.read_assigned") {
      return hasPermission(authPermissions, "procurement.purchases.read_assigned");
    }

    if (action.requiredPermission === "procurement.requests.review") {
      return hasPermission(authPermissions, "procurement.requests.review");
    }

    if (action.requiredPermission === "procurement.receipts.review") {
      return hasPermission(authPermissions, "procurement.receipts.review");
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
  const quickActions = getVisibleQuickActions(permissions, auth.permissions);

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
