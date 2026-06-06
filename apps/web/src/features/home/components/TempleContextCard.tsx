type TempleContextCardProps = {
  roleLabel: string;
  sessionLabel: string;
  templeName: string;
};

export function TempleContextCard({ roleLabel, sessionLabel, templeName }: TempleContextCardProps) {
  return (
    <dl className="space-y-3 rounded-md border border-stone-200 bg-white p-4 text-sm">
      <div className="flex items-start justify-between gap-3">
        <dt className="font-medium text-stone-600">Temple</dt>
        <dd className="text-right font-semibold text-stone-950">{templeName}</dd>
      </div>
      <div className="flex items-start justify-between gap-3">
        <dt className="font-medium text-stone-600">Session</dt>
        <dd className="text-right font-semibold text-stone-950">{sessionLabel}</dd>
      </div>
      <div className="flex items-start justify-between gap-3">
        <dt className="font-medium text-stone-600">Role</dt>
        <dd className="text-right font-semibold text-stone-950">{roleLabel}</dd>
      </div>
    </dl>
  );
}
