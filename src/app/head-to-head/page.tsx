import { getHeadToHead, getManagerMap } from "@/lib/data";
import { HeadToHeadMatrix } from "@/components/HeadToHeadMatrix";

export default function HeadToHeadPage() {
  const managerMap = getManagerMap();
  const data = getHeadToHead();

  if (data.managerIds.length === 0) {
    return (
      <div className="flex flex-col items-start gap-2 rounded-lg border border-border bg-surface-1 px-6 py-10">
        <h2 className="text-sm font-medium text-text-primary">
          Head-to-head records
        </h2>
        <p className="max-w-md text-sm text-text-muted">
          No matchup data yet — this fills in as week-by-week results get
          added to the league history.
        </p>
      </div>
    );
  }

  const first = data.seasonsCovered[0];
  const last = data.seasonsCovered[data.seasonsCovered.length - 1];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-sm font-medium text-text-primary">
          Head-to-head records
        </h2>
        <p className="text-sm text-text-muted">
          Row&apos;s record against column, {first}
          {last !== first ? `–${last}` : ""}. Includes regular season and
          playoffs. Partial history — only seasons entered so far are
          reflected here.
        </p>
      </div>
      <HeadToHeadMatrix data={data} managerMap={managerMap} />
    </div>
  );
}
