import type { VolunteerTaskCategory } from "../types/taskTypes";

const categories = [
  ["all", "All"],
  ["unknown_barcode", "Barcodes"],
  ["low_stock", "Low stock"]
] satisfies Array<[VolunteerTaskCategory, string]>;

type TaskCategoryTabsProps = {
  onChange: (category: VolunteerTaskCategory) => void;
  selectedCategory: VolunteerTaskCategory;
};

export function TaskCategoryTabs({ onChange, selectedCategory }: TaskCategoryTabsProps) {
  return (
    <div className="grid grid-cols-3 gap-1 rounded-md bg-stone-100 p-1">
      {categories.map(([value, label]) => {
        const isSelected = selectedCategory === value;

        return (
          <button
            aria-pressed={isSelected}
            className={[
              "min-h-10 rounded-md px-2 text-sm font-semibold",
              isSelected ? "bg-white text-brand-900 shadow-sm" : "text-stone-600"
            ].join(" ")}
            key={value}
            onClick={() => onChange(value)}
            type="button"
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
