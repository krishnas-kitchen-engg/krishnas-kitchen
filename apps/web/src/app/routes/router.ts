import { useEffect, useState } from "react";

export type AppPath = "/" | "/login" | "/select-temple" | "/unauthorized";

const appPaths = ["/", "/login", "/select-temple", "/unauthorized"] satisfies AppPath[];

export function getCurrentPath(): AppPath {
  return appPaths.includes(window.location.pathname as AppPath)
    ? (window.location.pathname as AppPath)
    : "/";
}

export function navigateTo(path: AppPath): void {
  if (window.location.pathname === path) {
    return;
  }

  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
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
