import { navigateTo } from "@/app/routes/router";

import type { VolunteerHomeQuickAction } from "../types/volunteerHomeTypes";
import { QuickActionButton } from "./QuickActionButton";

type QuickActionsGridProps = {
  actions: readonly VolunteerHomeQuickAction[];
};

export function QuickActionsGrid({ actions }: QuickActionsGridProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-stone-950">Quick actions</h2>
      {actions.length > 0 ? (
        <div className="grid gap-2">
          {actions.map((action) => (
            <QuickActionButton
              key={action.path}
              label={action.label}
              onNavigate={navigateTo}
              path={action.path}
            />
          ))}
        </div>
      ) : (
        <p className="rounded-md border border-stone-200 bg-white p-4 text-sm text-stone-600">
          No inventory actions are available for this session.
        </p>
      )}
    </section>
  );
}
