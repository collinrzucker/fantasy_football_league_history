import type { Manager } from "@/types/league";
import type { ScorePerformance } from "@/lib/data";
import { firstName } from "@/lib/format";

interface PerformancesTableProps {
  performances: ScorePerformance[];
  managerMap: Record<string, Manager>;
}

const ROUND_LABELS: Record<string, string> = {
  firstround: "First Round",
  semifinal: "Semifinal",
  championship: "Championship",
};

function contextText(p: ScorePerformance, managerMap: Record<string, Manager>) {
  const opponent =
    managerMap[p.opponentId]?.fullName ? firstName(managerMap[p.opponentId].fullName) : p.opponentId;
  const round = p.type === "regular" ? `Week ${p.week}` : ROUND_LABELS[p.type];
  return `${p.year} ${round} vs. ${opponent}`;
}

export function PerformancesTable({
  performances,
  managerMap,
}: PerformancesTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface-1">
      <table className="w-full min-w-[480px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border">
            <th scope="col" className="px-4 py-3 text-left font-medium text-text-muted">
              #
            </th>
            <th scope="col" className="px-4 py-3 text-left font-medium text-text-muted">
              Manager
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium text-text-muted">
              Score
            </th>
          </tr>
        </thead>
        <tbody>
          {performances.map((p, i) => (
            <tr
              key={`${p.managerId}-${p.year}-${p.week}-${p.opponentId}`}
              className={i % 2 === 1 ? "bg-page/40" : undefined}
            >
              <td className="px-4 py-2.5 text-text-secondary tabular-nums">
                {i + 1}
              </td>
              <td className="px-4 py-2.5 text-text-primary">
                {managerMap[p.managerId]?.fullName ?? p.managerId}
                <span className="ml-2 text-xs text-text-secondary">
                  {contextText(p, managerMap)}
                </span>
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums font-medium text-text-primary">
                {p.score.toFixed(1)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
