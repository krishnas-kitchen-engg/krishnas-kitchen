import type {
  VolunteerHomeActivityItem,
  VolunteerHomeSectionState
} from "../types/volunteerHomeTypes";
import { HomeSummaryError } from "./HomeSummaryError";

type RecentInventoryActivityProps = {
  activity: VolunteerHomeSectionState<VolunteerHomeActivityItem>;
};

export function RecentInventoryActivity({ activity }: RecentInventoryActivityProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-stone-950">Recent activity</h2>
      {activity.status === "unavailable" ? (
        <HomeSummaryError message="Recent inventory activity is unavailable." />
      ) : activity.items.length > 0 ? (
        <ol className="space-y-2">
          {activity.items.map((item) => (
            <li className="rounded-md border border-stone-200 bg-white p-3 text-sm" key={item.id}>
              <span className="block font-semibold text-stone-950">{item.description}</span>
              <span className="mt-1 block text-stone-600">{item.timestamp}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="rounded-md border border-stone-200 bg-white p-4 text-sm text-stone-600">
          No recent inventory activity
        </p>
      )}
    </section>
  );
}
