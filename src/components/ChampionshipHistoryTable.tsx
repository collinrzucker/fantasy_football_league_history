import type { Manager } from "@/types/league";
import type { ChampionshipResult } from "@/lib/data";

interface ChampionshipHistoryTableProps {
  championships: ChampionshipResult[];
  managerMap: Record<string, Manager>;
}

export function ChampionshipHistoryTable({
  championships,
  managerMap,
}: ChampionshipHistoryTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface-1">
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border">
            <th scope="col" className="px-4 py-3 text-left font-medium text-text-muted">
              Season
            </th>
            <th scope="col" className="px-4 py-3 text-left font-medium text-text-muted">
              Champion
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium text-text-muted">
              Champion Score
            </th>
            <th scope="col" className="px-4 py-3 text-left font-medium text-text-muted">
              Runner-Up
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium text-text-muted">
              Runner-Up Score
            </th>
          </tr>
        </thead>
        <tbody>
          {championships.map((c, i) => (
            <tr key={c.year} className={i % 2 === 1 ? "bg-page/40" : undefined}>
              <td className="px-4 py-2.5 text-text-secondary tabular-nums">
                {c.year}
              </td>
              <td className="px-4 py-2.5 font-medium text-text-primary">
                {managerMap[c.championId]?.fullName ?? c.championId}
                <span className="ml-1.5 text-xs" aria-label="Champion">
                  🏆
                </span>
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums font-medium text-text-primary">
                {c.championScore.toFixed(1)}
              </td>
              <td className="px-4 py-2.5 text-text-secondary">
                {managerMap[c.runnerUpId]?.fullName ?? c.runnerUpId}
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums text-text-secondary">
                {c.runnerUpScore.toFixed(1)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
