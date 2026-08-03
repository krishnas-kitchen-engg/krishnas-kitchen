import { useEffect, useState } from "react";

export type AppPath =
  | "/"
  | "/admin"
  | "/adjust"
  | "/consume"
  | "/dashboard"
  | "/inventory"
  | `/inventory/item/${string}`
  | `/inventory/location/${string}`
  | "/items"
  | "/locations"
  | "/low-stock"
  | "/login"
  | "/my-purchases"
  | "/profile"
  | "/procurement-admin"
  | "/receipt-review"
  | "/purchase-review"
  | "/purchase-requests"
  | "/receive"
  | "/return"
  | "/recipes"
  | "/scan"
  | "/select-temple"
  | "/tasks"
  | "/transfer"
  | "/unauthorized";

const appPaths = [
  "/",
  "/admin",
  "/adjust",
  "/consume",
  "/dashboard",
  "/inventory",
  "/items",
  "/locations",
  "/low-stock",
  "/login",
  "/my-purchases",
  "/profile",
  "/procurement-admin",
  "/receipt-review",
  "/purchase-review",
  "/purchase-requests",
  "/receive",
  "/return",
  "/recipes",
  "/scan",
  "/select-temple",
  "/tasks",
  "/transfer",
  "/unauthorized"
] satisfies string[];

export type AppRoute =
  | {
      name: "admin";
      path: "/admin";
    }
  | {
      name: "adjust";
      path: "/adjust";
    }
  | {
      name: "consume";
      path: "/consume";
    }
  | {
      name: "dashboard";
      path: "/dashboard";
    }
  | {
      name: "home";
      path: "/";
    }
  | {
      name: "inventory";
      path: "/inventory";
    }
  | {
      itemId: string;
      name: "inventory_item";
      path: `/inventory/item/${string}`;
    }
  | {
      locationId: string;
      name: "inventory_location";
      path: `/inventory/location/${string}`;
    }
  | {
      name: "items";
      path: "/items";
    }
  | {
      name: "locations";
      path: "/locations";
    }
  | {
      name: "low_stock";
      path: "/low-stock";
    }
  | {
      name: "login";
      path: "/login";
    }
  | {
      name: "my_purchases";
      path: "/my-purchases";
    }
  | {
      name: "profile";
      path: "/profile";
    }
  | {
      name: "procurement_admin";
      path: "/procurement-admin";
    }
  | {
      name: "receipt_review";
      path: "/receipt-review";
    }
  | {
      name: "purchase_review";
      path: "/purchase-review";
    }
  | {
      name: "purchase_requests";
      path: "/purchase-requests";
    }
  | {
      name: "receive";
      path: "/receive";
    }
  | {
      name: "return";
      path: "/return";
    }
  | {
      name: "recipes";
      path: "/recipes";
    }
  | {
      name: "scan";
      path: "/scan";
    }
  | {
      name: "select_temple";
      path: "/select-temple";
    }
  | {
      name: "tasks";
      path: "/tasks";
    }
  | {
      name: "transfer";
      path: "/transfer";
    }
  | {
      name: "unauthorized";
      path: "/unauthorized";
    };

function readRouteSegment(pathname: string, prefix: string): string | null {
  if (!pathname.startsWith(prefix)) {
    return null;
  }

  const value = decodeURIComponent(pathname.slice(prefix.length)).trim();

  return value && !value.includes("/") ? value : null;
}

export function getCurrentPath(): AppPath {
  const route = getCurrentRoute();

  return route.path;
}

export function getCurrentRoute(): AppRoute {
  const pathname = window.location.pathname;
  const itemId = readRouteSegment(pathname, "/inventory/item/");
  if (itemId) {
    return {
      itemId,
      name: "inventory_item",
      path: `/inventory/item/${itemId}`
    };
  }

  const locationId = readRouteSegment(pathname, "/inventory/location/");
  if (locationId) {
    return {
      locationId,
      name: "inventory_location",
      path: `/inventory/location/${locationId}`
    };
  }

  if (appPaths.includes(pathname)) {
    if (pathname === "/adjust") {
      return {
        name: "adjust",
        path: pathname
      };
    }

    if (pathname === "/admin") {
      return {
        name: "admin",
        path: pathname
      };
    }

    if (pathname === "/consume") {
      return {
        name: "consume",
        path: pathname
      };
    }

    if (pathname === "/dashboard") {
      return {
        name: "dashboard",
        path: pathname
      };
    }

    if (pathname === "/inventory") {
      return {
        name: "inventory",
        path: pathname
      };
    }

    if (pathname === "/items") {
      return {
        name: "items",
        path: pathname
      };
    }

    if (pathname === "/locations") {
      return {
        name: "locations",
        path: pathname
      };
    }

    if (pathname === "/low-stock") {
      return {
        name: "low_stock",
        path: pathname
      };
    }

    if (pathname === "/login") {
      return {
        name: "login",
        path: pathname
      };
    }

    if (pathname === "/my-purchases") {
      return {
        name: "my_purchases",
        path: pathname
      };
    }

    if (pathname === "/profile") {
      return {
        name: "profile",
        path: pathname
      };
    }

    if (pathname === "/procurement-admin") {
      return {
        name: "procurement_admin",
        path: pathname
      };
    }

    if (pathname === "/receipt-review") {
      return {
        name: "receipt_review",
        path: pathname
      };
    }

    if (pathname === "/purchase-review") {
      return {
        name: "purchase_review",
        path: pathname
      };
    }

    if (pathname === "/purchase-requests") {
      return {
        name: "purchase_requests",
        path: pathname
      };
    }

    if (pathname === "/receive") {
      return {
        name: "receive",
        path: pathname
      };
    }

    if (pathname === "/return") {
      return {
        name: "return",
        path: pathname
      };
    }

    if (pathname === "/recipes") {
      return {
        name: "recipes",
        path: pathname
      };
    }

    if (pathname === "/scan") {
      return {
        name: "scan",
        path: pathname
      };
    }

    if (pathname === "/select-temple") {
      return {
        name: "select_temple",
        path: pathname
      };
    }

    if (pathname === "/tasks") {
      return {
        name: "tasks",
        path: pathname
      };
    }

    if (pathname === "/transfer") {
      return {
        name: "transfer",
        path: pathname
      };
    }

    if (pathname === "/unauthorized") {
      return {
        name: "unauthorized",
        path: pathname
      };
    }
  }

  return {
    name: "home",
    path: "/"
  };
}

export function navigateTo(path: AppPath): void {
  if (window.location.pathname === path) {
    return;
  }

  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export function navigateToInventoryItem(itemId: string): void {
  navigateTo(`/inventory/item/${encodeURIComponent(itemId)}`);
}

export function navigateToInventoryLocation(locationId: string): void {
  navigateTo(`/inventory/location/${encodeURIComponent(locationId)}`);
}

export function useCurrentPath(): AppPath {
  const [path, setPath] = useState(() => getCurrentPath());

  useEffect(() => {
    function handleNavigation() {
      setPath(getCurrentPath());
    }

    window.addEventListener("popstate", handleNavigation);

    return () => {
      window.removeEventListener("popstate", handleNavigation);
    };
  }, []);

  return path;
}

export function useCurrentRoute(): AppRoute {
  const [route, setRoute] = useState(() => getCurrentRoute());

  useEffect(() => {
    function handleNavigation() {
      setRoute(getCurrentRoute());
    }

    window.addEventListener("popstate", handleNavigation);

    return () => {
      window.removeEventListener("popstate", handleNavigation);
    };
  }, []);

  return route;
}
