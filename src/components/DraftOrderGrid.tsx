import type { DraftYear, Manager } from "@/types/league";

interface DraftOrderGridProps {
  draftYears: DraftYear[];
  managerMap: Map<string, Manager>;
}

export function DraftOrderGrid({ draftYears, managerMap }: DraftOrderGridProps) {
  const years = draftYears.map((d) => d.year);
  const pickCount = Math.max(...draftYears.map((d) => d.order.length));
  const picks = Array.from({ length: pickCount }, (_, i) => i + 1);

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface-1">
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border">
            <th scope="col" className="px-4 py-3 text-left font-medium text-text-muted">
              Pick
            </th>
            {years.map((year) => (
              <th
                key={year}
                scope="col"
                className="px-4 py-3 text-left font-medium text-text-muted"
              >
                {year}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {picks.map((pick, i) => (
            <tr key={pick} className={i % 2 === 1 ? "bg-page/40" : undefined}>
              <td className="px-4 py-2.5 text-text-secondary tabular-nums">
                {pick}
              </td>
              {draftYears.map((draftYear) => {
                const entry = draftYear.order.find((o) => o.pick === pick);
                const manager = entry ? managerMap.get(entry.managerId) : undefined;
                return (
                  <td key={draftYear.year} className="px-4 py-2.5 text-text-primary">
                    {manager?.fullName.split(" ")[0] ?? "—"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
