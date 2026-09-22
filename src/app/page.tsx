import { getManagerMap, getMergedCareerStats, getSeasons } from "@/lib/data";
import type { MatchupFilter } from "@/lib/data";
import { firstName } from "@/lib/format";
import { StatTile } from "@/components/StatTile";
import { MatchupCareerTable } from "@/components/MatchupCareerTable";
import { FilterTabs } from "@/components/FilterTabs";

interface HomeProps {
  searchParams: Promise<{ type?: string }>;
}

const TYPE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "regular", label: "Regular season" },
  { value: "playoffs", label: "Playoffs" },
];

export default async function Home({ searchParams }: HomeProps) {
  const { type } = await searchParams;
  const filter: MatchupFilter =
    type === "regular" || type === "playoffs" ? type : "all";

  const managerMap = getManagerMap();
  const seasons = getSeasons();
  const { stats: matchupStats, seasonsCovered } = getMergedCareerStats(filter);

  const completeSeasons = seasons.filter((s) => s.complete);
  const latestSeason = completeSeasons[completeSeasons.length - 1];
  const reigningChampion = latestSeason
    ? managerMap.get(latestSeason.champion!)?.fullName
    : undefined;
  const activeManagerCount = Array.from(managerMap.values()).filter(
    (m) => m.active
  ).length;
  const mostTitles = [...matchupStats].sort(
    (a, b) => b.championships - a.championships
  )[0];

  const managerMapObj = Object.fromEntries(managerMap);
  const first = seasonsCovered[0];
  const last = seasonsCovered[seasonsCovered.length - 1];

  return (
    <div className="flex flex-col gap-8">
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile
          label="Seasons completed"
          value={String(completeSeasons.length)}
          detail={`${seasons[0].year}–${latestSeason?.year}`}
        />
        <StatTile label="Active managers" value={String(activeManagerCount)} />
        <StatTile
          label="Reigning champion"
          value={reigningChampion ? firstName(reigningChampion) : "—"}
          detail={String(latestSeason?.year)}
        />
        <StatTile
          label="Most titles"
          value={
            managerMap.get(mostTitles.managerId)
              ? firstName(managerMap.get(mostTitles.managerId)!.fullName)
              : "—"
          }
          detail={`${mostTitles.championships} championship${
            mostTitles.championships === 1 ? "" : "s"
          }`}
        />
      </section>

      {matchupStats.length > 0 && (
        <section className="flex flex-col gap-3">
          <div>
            <h2 className="text-sm font-medium text-text-primary">
              Career records
            </h2>
            <p className="text-sm text-text-muted">
              {first}
              {last !== first ? `–${last}` : ""}. W/L/Win%/points respond to
              the filter below; Playoffs/Finals/Titles are all-time
              appearance counts and don&apos;t change with it.
            </p>
          </div>
          <FilterTabs
            basePath="/"
            paramName="type"
            options={TYPE_OPTIONS}
            activeValue={filter}
          />
          <MatchupCareerTable stats={matchupStats} managerMap={managerMapObj} />
        </section>
      )}
    </div>
  );
}
