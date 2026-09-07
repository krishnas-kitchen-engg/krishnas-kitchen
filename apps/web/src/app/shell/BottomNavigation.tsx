import { navigateTo, type AppPath } from "@/app/routes/router";
import { hasPermission } from "@/features/auth";
import type { Permission } from "@krishnas-kitchen/types";

import { bottomNavigationItems } from "./bottomNavigationItems";

type BottomNavigationProps = {
  currentPath: AppPath;
  permissions: readonly Permission[];
};

function isActivePath(currentPath: AppPath, itemPath: AppPath): boolean {
  if (itemPath === "/inventory") {
    return currentPath === "/inventory" || currentPath.startsWith("/inventory/");
  }

  return currentPath === itemPath;
}

export function BottomNavigation({ currentPath, permissions }: BottomNavigationProps) {
  const visibleItems = bottomNavigationItems.filter((item) =>
    hasPermission(permissions, item.requiredPermission)
  );

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 border-t border-stone-200 bg-white/95 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 shadow-[0_-8px_24px_rgba(28,25,23,0.08)] backdrop-blur"
    >
      <div
        className="mx-auto grid max-w-md gap-1"
        style={{ gridTemplateColumns: `repeat(${visibleItems.length}, minmax(0, 1fr))` }}
      >
        {visibleItems.map((item) => {
          const isActive = isActivePath(currentPath, item.path);

          return (
            <button
              aria-current={isActive ? "page" : undefined}
              className={[
                "min-h-12 rounded-md px-2 text-xs font-semibold transition",
                isActive
                  ? "bg-brand-900 text-white"
                  : "text-stone-600 hover:bg-stone-100 hover:text-stone-950"
              ].join(" ")}
              key={item.path}
              onClick={() => navigateTo(item.path)}
              type="button"
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
