import type { Manager, Season } from "@/types/league";
import type { SeasonPythagStat } from "@/lib/data";

interface SeasonStandingsTableProps {
  season: Season;
  managerMap: Map<string, Manager>;
  pythagStats: Map<string, SeasonPythagStat>;
}

function winPct(standing: Season["standings"][number]) {
  const games = (standing.wins ?? 0) + (standing.losses ?? 0);
  return games > 0 ? (standing.wins ?? 0) / games : 0;
}

/** Standard competition ("1224") ranking: ties share a rank, the next
 * distinct value resumes at that many spots down (not the next integer). */
function computeRanks(
  standings: Season["standings"]
): Map<string, number> {
  const sorted = [...standings].sort((a, b) => winPct(b) - winPct(a));
  const ranks = new Map<string, number>();
  let rank = 0;
  let previousPct: number | null = null;
  sorted.forEach((standing, i) => {
    const pct = winPct(standing);
    if (previousPct === null || pct !== previousPct) {
      rank = i + 1;
      previousPct = pct;
    }
    ranks.set(standing.managerId, rank);
  });
  return ranks;
}

export function SeasonStandingsTable({
  season,
  managerMap,
  pythagStats,
}: SeasonStandingsTableProps) {
  const ranks = season.complete ? null : computeRanks(season.standings);
  const standings = season.complete
    ? season.standings
    : [...season.standings].sort((a, b) => winPct(b) - winPct(a));

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface-1">
      <table className="w-full min-w-[640px] border-collapse text-sm">
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
            <th scope="col" className="px-4 py-3 text-right font-medium text-text-muted">
              Expected Win%
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium text-text-muted">
              Luck Index
            </th>
          </tr>
        </thead>
        <tbody>
          {standings.map((standing, i) => {
            const manager = managerMap.get(standing.managerId);
            const games = (standing.wins ?? 0) + (standing.losses ?? 0);
            const pct = games > 0 ? ((standing.wins ?? 0) / games) * 100 : null;
            const pythag = pythagStats.get(standing.managerId);
            return (
              <tr
                key={standing.managerId}
                className={i % 2 === 1 ? "bg-page/40" : undefined}
              >
                <td className="px-4 py-2.5 text-text-secondary tabular-nums">
                  {ranks ? ranks.get(standing.managerId) : standing.rank}
                </td>
                <td
                  className={`px-4 py-2.5 text-text-primary ${
                    standing.playoffs ? "font-semibold" : ""
                  }`}
                  title={standing.playoffs ? "Made the playoffs" : undefined}
                >
                  {manager?.fullName ?? standing.managerId}
                  {season.champion === standing.managerId && (
                    <span className="ml-1.5 text-xs" aria-label="Champion">
                      🏆
                    </span>
                  )}
                  {season.runnerUp === standing.managerId && (
                    <span className="ml-1.5 text-xs" aria-label="Runner-up">
                      🥈
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
                <td className="px-4 py-2.5 text-right tabular-nums text-text-secondary">
                  {pythag ? `${(pythag.expectedWinPct * 100).toFixed(1)}%` : "—"}
                </td>
                <td
                  className={`px-4 py-2.5 text-right tabular-nums ${
                    !pythag
                      ? "text-text-secondary"
                      : pythag.luckIndex > 0
                        ? "text-status-good"
                        : pythag.luckIndex < 0
                          ? "text-status-critical"
                          : "text-text-secondary"
                  }`}
                >
                  {pythag
                    ? `${pythag.luckIndex >= 0 ? "+" : ""}${(pythag.luckIndex * 100).toFixed(1)}%`
                    : "—"}
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
        {season.complete && <> · 🏆 = champion · 🥈 = runner-up</>}
      </p>
    </div>
  );
}
