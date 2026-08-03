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
      description: "Look up an item by barcode or manual search.",
      group: "inventory",
      label: "Scan",
      path: "/scan",
      requiredPermission: "inventory.read"
    },
    {
      description: "Add newly delivered stock into inventory.",
      group: "inventory",
      label: "Receive",
      path: "/receive",
      requiredPermission: "inventory.receive"
    },
    {
      description: "Record ingredients used by kitchen operations.",
      group: "inventory",
      label: "Consume",
      path: "/consume",
      requiredPermission: "inventory.consume"
    },
    {
      description: "Correct balances after a physical count.",
      group: "inventory",
      label: "Adjust",
      path: "/adjust",
      requiredPermission: "inventory.adjust"
    },
    {
      description: "Review inventory health and today's activity.",
      group: "inventory",
      label: "Dashboard",
      path: "/dashboard",
      requiredPermission: "inventory.adjust"
    },
    {
      description: "Find items that need replenishment.",
      group: "inventory",
      label: "Low Stock",
      path: "/low-stock",
      requiredPermission: "inventory.adjust"
    },
    {
      description: "Manage pantry, fridge, freezer, and storage areas.",
      group: "administration",
      label: "Locations",
      path: "/locations",
      requiredPermission: "inventory.adjust"
    },
    {
      description: "Manage item names, units, categories, and thresholds.",
      group: "administration",
      label: "Items",
      path: "/items",
      requiredPermission: "items.edit"
    },
    {
      description: "Move stock between storage locations.",
      group: "inventory",
      label: "Transfer",
      path: "/transfer",
      requiredPermission: "inventory.transfer"
    },
    {
      description: "Return stock from service back to storage.",
      group: "inventory",
      label: "Return",
      path: "/return",
      requiredPermission: "inventory.return"
    },
    {
      description: "Search current balances and transaction history.",
      group: "inventory",
      label: "Inventory",
      path: "/inventory",
      requiredPermission: "inventory.read"
    },
    {
      description: "Create recipes and plan ingredient needs.",
      group: "kitchen",
      label: "Recipes",
      path: "/recipes",
      requiredPermission: "recipes.read"
    },
    {
      description: "Ask purchasers to buy an item for the temple.",
      group: "volunteer",
      label: "Request items",
      path: "/purchase-requests",
      requiredPermission: "procurement.requests.create"
    },
    {
      description: "See assigned items grouped by purchase source.",
      group: "purchasing",
      label: "My Purchases",
      path: "/my-purchases",
      requiredPermission: "procurement.purchases.read_assigned"
    },
    {
      description: "Approve requests and publish buyer lists.",
      group: "procurement",
      label: "Review Requests",
      path: "/purchase-review",
      requiredPermission: "procurement.requests.review"
    },
    {
      description: "Review receipt uploads and export finance evidence.",
      group: "procurement",
      label: "Receipt Review",
      path: "/receipt-review",
      requiredPermission: "procurement.receipts.review"
    },
    {
      description: "Onboard users, assign roles, and manage temple access.",
      group: "administration",
      label: "Users & Temples",
      path: "/admin",
      requiredPermission: "users.manage"
    },
    {
      description: "Configure stores and item purchasing preferences.",
      group: "administration",
      label: "Procurement Setup",
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

    if (action.requiredPermission === "users.manage") {
      return hasPermission(authPermissions, "users.manage");
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
