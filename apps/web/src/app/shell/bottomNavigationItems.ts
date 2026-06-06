import type { AppPath } from "@/app/routes/router";

export type BottomNavigationItem = {
  label: string;
  path: AppPath;
};

export const bottomNavigationItems = [
  {
    label: "Home",
    path: "/"
  },
  {
    label: "Inventory",
    path: "/inventory"
  },
  {
    label: "Scan",
    path: "/scan"
  },
  {
    label: "Receive",
    path: "/receive"
  },
  {
    label: "Transfer",
    path: "/transfer"
  }
] satisfies BottomNavigationItem[];
