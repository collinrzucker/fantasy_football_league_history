import { getHeadToHead, getManagerMap, getMatchups, getSeasons } from "@/lib/data";
import type { MatchupFilter } from "@/lib/data";
import { HeadToHeadMatrix } from "@/components/HeadToHeadMatrix";
import { FilterTabs } from "@/components/FilterTabs";

interface HeadToHeadPageProps {
  searchParams: Promise<{ type?: string; view?: string }>;
}

const TYPE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "regular", label: "Regular season" },
  { value: "playoffs", label: "Playoffs" },
];

const VIEW_OPTIONS = [
  { value: "record", label: "Record (W-L)" },
  { value: "pointsFor", label: "Avg points scored" },
  { value: "pointsAgainst", label: "Avg points allowed" },
  { value: "margin", label: "Avg margin of victory" },
];

export default async function HeadToHeadPage({
  searchParams,
}: HeadToHeadPageProps) {
  const { type, view } = await searchParams;
  const filter: MatchupFilter =
    type === "regular" || type === "playoffs" ? type : "all";
  const activeView =
    view === "pointsFor" || view === "pointsAgainst" || view === "margin"
      ? view
      : "record";

  const managerMap = getManagerMap();
  const data = getHeadToHead(filter);

  if (data.managerIds.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-medium text-text-primary">
            Head-to-head records
          </h2>
        </div>
        <FilterTabs
          basePath="/head-to-head"
          paramName="type"
          options={TYPE_OPTIONS}
          activeValue={filter}
          otherParams={{ view: activeView }}
        />
        <div className="rounded-lg border border-border bg-surface-1 px-6 py-10 text-sm text-text-muted">
          No matchup data for this filter yet.
        </div>
      </div>
    );
  }

  const first = data.seasonsCovered[0];
  const last = data.seasonsCovered[data.seasonsCovered.length - 1];

  const seasons = getSeasons();
  const lastSeasonInfo = seasons.find((s) => s.year === last);
  const latestWeek = !lastSeasonInfo?.complete
    ? Math.max(
        0,
        ...getMatchups()
          .filter((m) => m.year === last)
          .map((m) => m.week)
      )
    : null;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-sm font-medium text-text-primary">
          Head-to-head records
        </h2>
        <p className="text-sm text-text-muted">
          Row&apos;s {activeView === "record" ? "record" : "average"} against
          column, {first}
          {last !== first ? `–${last}` : ""}
          {latestWeek ? ` (Week ${latestWeek})` : ""}.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <FilterTabs
          basePath="/head-to-head"
          paramName="type"
          options={TYPE_OPTIONS}
          activeValue={filter}
          otherParams={{ view: activeView }}
        />
        <FilterTabs
          basePath="/head-to-head"
          paramName="view"
          options={VIEW_OPTIONS}
          activeValue={activeView}
          otherParams={{ type: filter }}
        />
      </div>

      <HeadToHeadMatrix data={data} managerMap={managerMap} view={activeView} />
    </div>
  );
}
