import type { Manager, Season } from "@/types/league";

interface SeasonStandingsTableProps {
  season: Season;
  managerMap: Map<string, Manager>;
}

export function SeasonStandingsTable({
  season,
  managerMap,
}: SeasonStandingsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface-1">
      <table className="w-full min-w-[420px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border">
            <th scope="col" className="px-4 py-3 text-left font-medium text-text-muted">
              Rank
            </th>
            <th scope="col" className="px-4 py-3 text-left font-medium text-text-muted">
              Manager
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium text-text-muted">
              W
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium text-text-muted">
              L
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium text-text-muted">
              Win%
            </th>
          </tr>
        </thead>
        <tbody>
          {season.standings.map((standing, i) => {
            const manager = managerMap.get(standing.managerId);
            const games = (standing.wins ?? 0) + (standing.losses ?? 0);
            const pct = games > 0 ? ((standing.wins ?? 0) / games) * 100 : null;
            return (
              <tr
                key={standing.managerId}
                className={i % 2 === 1 ? "bg-page/40" : undefined}
              >
                <td className="px-4 py-2.5 text-text-secondary tabular-nums">
                  {standing.rank}
                </td>
                <td
                  className={`px-4 py-2.5 text-text-primary ${
                    standing.playoffs ? "font-semibold" : ""
                  }`}
                  title={standing.playoffs ? "Made the playoffs" : undefined}
                >
                  {manager?.fullName ?? standing.managerId}
                  {standing.championship && (
                    <span className="ml-1.5 text-xs text-text-muted" aria-label="Reached the championship">
                      🏆
                    </span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums text-text-primary">
                  {standing.wins ?? "—"}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums text-text-secondary">
                  {standing.losses ?? "—"}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums text-text-primary">
                  {pct !== null ? `${pct.toFixed(1)}%` : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {!season.complete && (
        <p className="border-t border-border px-4 py-2 text-xs text-text-muted">
          Season in progress — order shown is not yet a final ranking.
        </p>
      )}
      <p className="border-t border-border px-4 py-2 text-xs text-text-muted">
        <span className="font-semibold text-text-primary">Bold</span> = made the playoffs
        {season.complete && <> · 🏆 = reached the championship</>}
      </p>
    </div>
  );
}
