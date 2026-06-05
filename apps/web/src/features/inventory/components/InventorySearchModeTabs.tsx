import type { InventoryLookupMode } from "../types/inventoryLookupTypes";

type InventorySearchModeTabsProps = {
  mode: InventoryLookupMode;
  onChange: (mode: InventoryLookupMode) => void;
};

const modes = [
  ["items", "Items"],
  ["locations", "Locations"],
  ["barcodes", "Barcodes"]
] satisfies Array<[InventoryLookupMode, string]>;

export function InventorySearchModeTabs({ mode, onChange }: InventorySearchModeTabsProps) {
  return (
    <div aria-label="Inventory search type" className="grid grid-cols-3 gap-1" role="tablist">
      {modes.map(([value, label]) => {
        const isActive = value === mode;

        return (
          <button
            aria-selected={isActive}
            className={[
              "min-h-11 rounded-md px-2 text-sm font-semibold",
              isActive ? "bg-brand-900 text-white" : "bg-white text-stone-700"
            ].join(" ")}
            key={value}
            onClick={() => onChange(value)}
            role="tab"
            type="button"
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
