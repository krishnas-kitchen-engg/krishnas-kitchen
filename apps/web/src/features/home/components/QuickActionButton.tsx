import { Button } from "@krishnas-kitchen/ui";

import type { AppPath } from "@/app/routes/router";

type QuickActionButtonProps = {
  label: string;
  onNavigate: (path: AppPath) => void;
  path: AppPath;
};

export function QuickActionButton({ label, onNavigate, path }: QuickActionButtonProps) {
  return (
    <Button className="min-h-12 w-full" onClick={() => onNavigate(path)} type="button">
      {label}
    </Button>
  );
}
