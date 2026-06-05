type MobileTopBarProps = {
  organizationName?: string | null | undefined;
  templeName?: string | null | undefined;
  title: string;
};

export function MobileTopBar({ organizationName, templeName, title }: MobileTopBarProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-stone-200 bg-stone-50/95 px-5 py-4 backdrop-blur">
      <div className="mx-auto max-w-md">
        <p className="text-xs font-semibold uppercase text-brand-700">
          {organizationName ?? "Krishna's Kitchen"}
        </p>
        <div className="mt-1 flex items-start justify-between gap-3">
          <h1 className="text-xl font-semibold text-brand-950">{title}</h1>
          {templeName ? (
            <p className="max-w-32 text-right text-xs font-medium leading-5 text-stone-600">
              {templeName}
            </p>
          ) : null}
        </div>
      </div>
    </header>
  );
}
