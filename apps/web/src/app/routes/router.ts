import { useEffect, useState } from "react";

export type AppPath =
  | "/"
  | "/inventory"
  | `/inventory/item/${string}`
  | `/inventory/location/${string}`
  | "/login"
  | "/profile"
  | "/receive"
  | "/scan"
  | "/select-temple"
  | "/transfer"
  | "/unauthorized";

const appPaths = [
  "/",
  "/inventory",
  "/login",
  "/profile",
  "/receive",
  "/scan",
  "/select-temple",
  "/transfer",
  "/unauthorized"
] satisfies string[];

export type AppRoute =
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
      name: "login";
      path: "/login";
    }
  | {
      name: "profile";
      path: "/profile";
    }
  | {
      name: "receive";
      path: "/receive";
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
    if (pathname === "/inventory") {
      return {
        name: "inventory",
        path: pathname
      };
    }

    if (pathname === "/login") {
      return {
        name: "login",
        path: pathname
      };
    }

    if (pathname === "/profile") {
      return {
        name: "profile",
        path: pathname
      };
    }

    if (pathname === "/receive") {
      return {
        name: "receive",
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
