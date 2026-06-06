type VolunteerHomeHeaderProps = {
  organizationName: string;
};

export function VolunteerHomeHeader({ organizationName }: VolunteerHomeHeaderProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold uppercase text-brand-800">{organizationName}</p>
      <h1 className="text-3xl font-semibold text-brand-900">Volunteer home</h1>
      <p className="text-sm leading-6 text-stone-700">
        Start an inventory workflow or check what needs attention at this temple.
      </p>
    </div>
  );
}
