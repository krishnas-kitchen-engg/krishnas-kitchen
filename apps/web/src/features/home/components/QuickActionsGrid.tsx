import { navigateTo } from "@/app/routes/router";

import type { VolunteerHomeQuickAction } from "../types/volunteerHomeTypes";
import { QuickActionButton } from "./QuickActionButton";

type QuickActionsGridProps = {
  actions: readonly VolunteerHomeQuickAction[];
};

const groupLabels: Record<VolunteerHomeQuickAction["group"], string> = {
  administration: "Administration",
  inventory: "Inventory operations",
  kitchen: "Kitchen planning",
  procurement: "Approvals and finance",
  purchasing: "Purchasing",
  volunteer: "Requests"
};

const groupDescriptions: Record<VolunteerHomeQuickAction["group"], string> = {
  administration: "Configure users, roles, temples, catalog, locations, and purchase sources.",
  inventory: "Move stock through receiving, usage, counts, and visibility.",
  kitchen: "Plan recipes, production, and ingredient needs.",
  procurement: "Review requests, publish lists, and reconcile receipts.",
  purchasing: "Buy assigned items and upload receipt evidence.",
  volunteer: "Ask for items needed by the temple kitchen."
};

const groupOrder: VolunteerHomeQuickAction["group"][] = [
  "volunteer",
  "purchasing",
  "procurement",
  "inventory",
  "kitchen",
  "administration"
];

export function QuickActionsGrid({ actions }: QuickActionsGridProps) {
  const groups = groupOrder
    .map((group) => ({
      actions: actions.filter((action) => action.group === group),
      group
    }))
    .filter((group) => group.actions.length > 0);

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-base font-semibold text-stone-950">Workflows</h2>
        <p className="mt-1 text-sm leading-6 text-stone-600">
          Start with the section that matches your role today.
        </p>
      </div>
      {groups.length > 0 ? (
        <div className="space-y-4">
          {groups.map((group) => (
            <section
              className="space-y-3 rounded-md border border-stone-200 bg-white p-4"
              key={group.group}
            >
              <div>
                <h3 className="text-sm font-semibold uppercase text-brand-800">
                  {groupLabels[group.group]}
                </h3>
                <p className="mt-1 text-sm leading-6 text-stone-600">
                  {groupDescriptions[group.group]}
                </p>
              </div>
              <div className="grid gap-2">
                {group.actions.map((action) => (
                  <QuickActionButton
                    description={action.description}
                    key={action.path}
                    label={action.label}
                    onNavigate={navigateTo}
                    path={action.path}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <p className="rounded-md border border-stone-200 bg-white p-4 text-sm text-stone-600">
          No workflows are available for this session.
        </p>
      )}
    </section>
  );
}
