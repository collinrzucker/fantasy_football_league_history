import { getKeepersWithStreaks, getManagerMap } from "@/lib/data";
import { YearTabs } from "@/components/YearTabs";
import { KeepersTable } from "@/components/KeepersTable";

interface KeepersPageProps {
  searchParams: Promise<{ year?: string }>;
}

export default async function KeepersPage({ searchParams }: KeepersPageProps) {
  const { year } = await searchParams;
  const managerMap = getManagerMap();
  const keeperYears = getKeepersWithStreaks();
  const years = keeperYears.map((k) => k.year).sort((a, b) => b - a);

  const activeYear: number | "all" =
    year === "all"
      ? "all"
      : year
        ? Number(year)
        : keeperYears[keeperYears.length - 1].year;

  const yearsToShow =
    activeYear === "all"
      ? [...keeperYears].sort((a, b) => b.year - a.year)
      : keeperYears.filter((k) => k.year === activeYear);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-sm font-medium text-text-primary">Keepers log</h2>
        <p className="text-sm text-text-muted">
          Keeper picks and the round given up to keep them, {years[years.length - 1]}–{years[0]}
        </p>
      </div>

      <YearTabs basePath="/keepers" years={years} activeYear={activeYear} />

      <div className="flex flex-col gap-8">
        {yearsToShow.map((yearEntry) => (
          <div key={yearEntry.year} className="flex flex-col gap-2">
            {activeYear === "all" && (
              <h3 className="text-sm font-semibold text-text-primary">
                {yearEntry.year}
              </h3>
            )}
            <KeepersTable keepers={yearEntry.keepers} managerMap={managerMap} />
          </div>
        ))}
      </div>
    </div>
  );
}
