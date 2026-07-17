import Link from "next/link";

interface YearTabsProps {
  basePath: string;
  years: number[];
  activeYear: number | "all";
  includeAll?: boolean;
}

export function YearTabs({
  basePath,
  years,
  activeYear,
  includeAll = true,
}: YearTabsProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {includeAll && (
        <Link
          href={`${basePath}?year=all`}
          className={`rounded-full border px-3 py-1 text-sm transition-colors ${
            activeYear === "all"
              ? "border-seq-450 bg-seq-450 text-white"
              : "border-border text-text-secondary hover:text-text-primary"
          }`}
        >
          All
        </Link>
      )}
      {years.map((year) => (
        <Link
          key={year}
          href={`${basePath}?year=${year}`}
          className={`rounded-full border px-3 py-1 text-sm transition-colors ${
            activeYear === year
              ? "border-seq-450 bg-seq-450 text-white"
              : "border-border text-text-secondary hover:text-text-primary"
          }`}
        >
          {year}
        </Link>
      ))}
    </div>
  );
}
