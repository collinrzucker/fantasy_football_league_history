import { getManagerMap, getSeasons } from "@/lib/data";
import { YearTabs } from "@/components/YearTabs";
import { SeasonStandingsTable } from "@/components/SeasonStandingsTable";

interface SeasonsPageProps {
  searchParams: Promise<{ year?: string }>;
}

export default async function SeasonsPage({ searchParams }: SeasonsPageProps) {
  const { year } = await searchParams;
  const managerMap = getManagerMap();
  const seasons = getSeasons();
  const years = seasons.map((s) => s.year).sort((a, b) => b - a);

  const completeSeasons = seasons.filter((s) => s.complete);
  const defaultYear =
    completeSeasons[completeSeasons.length - 1]?.year ?? seasons[seasons.length - 1].year;
  const activeYear: number | "all" =
    year === "all" ? "all" : year ? Number(year) : defaultYear;

  const seasonsToShow =
    activeYear === "all"
      ? [...seasons].sort((a, b) => b.year - a.year)
      : seasons.filter((s) => s.year === activeYear);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-sm font-medium text-text-primary">
          Season-by-season standings
        </h2>
        <p className="text-sm text-text-muted">
          Final regular-season standings, 2012–2026
        </p>
      </div>

      <YearTabs basePath="/seasons" years={years} activeYear={activeYear} />

      <div className="flex flex-col gap-8">
        {seasonsToShow.map((season) => (
          <div key={season.year} className="flex flex-col gap-2">
            {activeYear === "all" && (
              <h3 className="text-sm font-semibold text-text-primary">
                {season.year}
              </h3>
            )}
            <SeasonStandingsTable season={season} managerMap={managerMap} />
          </div>
        ))}
      </div>
    </div>
  );
}
