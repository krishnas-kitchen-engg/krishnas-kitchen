import { Button } from "@krishnas-kitchen/ui";

import type { AppPath } from "@/app/routes/router";

type QuickActionButtonProps = {
  description: string;
  label: string;
  onNavigate: (path: AppPath) => void;
  path: AppPath;
};

export function QuickActionButton({
  description,
  label,
  onNavigate,
  path
}: QuickActionButtonProps) {
  return (
    <Button
      className="min-h-16 w-full flex-col items-start !bg-white px-3 py-3 text-left !text-stone-950 ring-1 ring-stone-200 hover:!bg-stone-50"
      onClick={() => onNavigate(path)}
      type="button"
    >
      <span className="text-sm font-semibold text-stone-950">{label}</span>
      <span className="mt-1 text-xs font-medium leading-5 text-stone-600">{description}</span>
    </Button>
  );
}
