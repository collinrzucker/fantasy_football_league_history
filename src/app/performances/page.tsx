import { getExtremeScores, getManagerMap } from "@/lib/data";
import { PerformancesTable } from "@/components/PerformancesTable";
import { FilterTabs } from "@/components/FilterTabs";

interface PerformancesPageProps {
  searchParams: Promise<{ view?: string }>;
}

const VIEW_OPTIONS = [
  { value: "best", label: "Best" },
  { value: "worst", label: "Stinkers" },
];

export default async function PerformancesPage({
  searchParams,
}: PerformancesPageProps) {
  const { view } = await searchParams;
  const activeView = view === "worst" ? "worst" : "best";

  const managerMap = Object.fromEntries(getManagerMap());
  const { best, worst } = getExtremeScores(10);
  const performances = activeView === "worst" ? worst : best;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-sm font-medium text-text-primary">
          All-time performances
        </h2>
        <p className="text-sm text-text-muted">
          {activeView === "worst"
            ? "The 10 lowest single-week scores in league history."
            : "The 10 highest single-week scores in league history."}
        </p>
      </div>

      <FilterTabs
        basePath="/performances"
        paramName="view"
        options={VIEW_OPTIONS}
        activeValue={activeView}
      />

      <PerformancesTable performances={performances} managerMap={managerMap} />
    </div>
  );
}
