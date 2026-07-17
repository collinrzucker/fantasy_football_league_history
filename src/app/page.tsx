import { getCareerRecords, getManagerMap, getSeasons } from "@/lib/data";
import { StatTile } from "@/components/StatTile";
import { CareerWinPctChart } from "@/components/CareerWinPctChart";
import { CareerRecordsTable } from "@/components/CareerRecordsTable";

export default function Home() {
  const managerMap = getManagerMap();
  const records = getCareerRecords();
  const seasons = getSeasons();

  const completeSeasons = seasons.filter((s) => s.complete);
  const latestSeason = completeSeasons[completeSeasons.length - 1];
  const reigningChampion = latestSeason
    ? managerMap.get(latestSeason.champion!)?.fullName
    : "—";
  const activeManagerCount = Array.from(managerMap.values()).filter(
    (m) => m.active
  ).length;
  const mostTitles = [...records].sort(
    (a, b) => b.championships - a.championships
  )[0];

  const managerMapObj = Object.fromEntries(managerMap);

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
          value={reigningChampion ?? "—"}
          detail={String(latestSeason?.year)}
        />
        <StatTile
          label="Most titles"
          value={managerMap.get(mostTitles.managerId)?.fullName ?? "—"}
          detail={`${mostTitles.championships} championship${
            mostTitles.championships === 1 ? "" : "s"
          }`}
        />
      </section>

      <section>
        <CareerWinPctChart records={records} managerMap={managerMapObj} />
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
    </div>
  );
}
