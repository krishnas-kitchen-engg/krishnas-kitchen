import type { AppPath } from "@/app/routes/router";
import type { Permission } from "@krishnas-kitchen/types";

export type BottomNavigationItem = {
  label: string;
  path: AppPath;
  requiredPermission?: Permission;
};

export const bottomNavigationItems = [
  {
    label: "Home",
    path: "/"
  },
  {
    label: "Inventory",
    path: "/inventory",
    requiredPermission: "inventory.read"
  },
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
    label: "Tasks",
    path: "/tasks",
    requiredPermission: "inventory.read"
  }
] satisfies BottomNavigationItem[];
