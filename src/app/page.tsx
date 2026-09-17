import {
  getCareerRecords,
  getManagerMap,
  getMatchupCareerStats,
  getSeasons,
} from "@/lib/data";
import type { MatchupFilter } from "@/lib/data";
import { firstName } from "@/lib/format";
import { StatTile } from "@/components/StatTile";
import { CareerRecordsTable } from "@/components/CareerRecordsTable";
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
  const records = getCareerRecords();
  const seasons = getSeasons();
  const { stats: matchupStats, seasonsCovered } = getMatchupCareerStats(filter);

  const completeSeasons = seasons.filter((s) => s.complete);
  const latestSeason = completeSeasons[completeSeasons.length - 1];
  const reigningChampion = latestSeason
    ? managerMap.get(latestSeason.champion!)?.fullName
    : undefined;
  const activeManagerCount = Array.from(managerMap.values()).filter(
    (m) => m.active
  ).length;
  const mostTitles = [...records].sort(
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

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-sm font-medium text-text-primary">
            Career records
          </h2>
          <p className="text-sm text-text-muted">
            All-time regular season and postseason totals, 2012–2025
          </p>
        </div>
        <CareerRecordsTable records={records} managerMap={managerMapObj} />
      </section>

      {matchupStats.length > 0 && (
        <section className="flex flex-col gap-3">
          <div>
            <h2 className="text-sm font-medium text-text-primary">
              Matchup stats
            </h2>
            <p className="text-sm text-text-muted">
              {first}
              {last !== first ? `–${last}` : ""} only — based on week-by-week
              matchup data entered so far. Will expand to full history as more
              seasons are added.
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
