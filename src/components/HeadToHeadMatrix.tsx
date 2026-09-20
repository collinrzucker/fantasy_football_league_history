import type { Manager } from "@/types/league";
import type { HeadToHeadData } from "@/lib/data";

interface HeadToHeadMatrixProps {
  data: HeadToHeadData;
  managerMap: Map<string, Manager>;
  view: "record" | "pointsFor" | "pointsAgainst" | "margin";
}

const SEQ_STEPS = [
  "var(--seq-100)",
  "var(--seq-200)",
  "var(--seq-300)",
  "var(--seq-400)",
  "var(--seq-500)",
];

const DIVERGING_STEPS = [
  "var(--div-red-500)",
  "var(--div-red-300)",
  "var(--div-red-100)",
  "var(--div-mid)",
  "var(--seq-100)",
  "var(--seq-300)",
  "var(--seq-500)",
];

function cellValue(
  c: { pointsFor: number; pointsAgainst: number } | undefined,
  games: number,
  view: "pointsFor" | "pointsAgainst" | "margin"
): number | null {
  if (!c || games === 0) return null;
  if (view === "pointsFor") return c.pointsFor / games;
  if (view === "pointsAgainst") return c.pointsAgainst / games;
  return (c.pointsFor - c.pointsAgainst) / games;
}

export function HeadToHeadMatrix({
  data,
  managerMap,
  view,
}: HeadToHeadMatrixProps) {
  const { managerIds, matrix } = data;

  let min = Infinity;
  let max = -Infinity;
  if (view !== "record") {
    for (const a of managerIds) {
      for (const b of managerIds) {
        if (a === b) continue;
        const c = matrix[a]?.[b];
        const games = c ? c.wins + c.losses : 0;
        const value = cellValue(c, games, view);
        if (value === null) continue;
        min = Math.min(min, value);
        max = Math.max(max, value);
      }
    }
  }
  const maxAbs = Math.max(Math.abs(min), Math.abs(max), 1);

  function heatIndex(value: number): number | undefined {
    if (view === "record") return undefined;
    if (view === "margin") {
      const t = Math.max(-1, Math.min(1, value / maxAbs)); // -1..1
      return Math.min(
        DIVERGING_STEPS.length - 1,
        Math.floor(((t + 1) / 2) * DIVERGING_STEPS.length)
      );
    }
    if (max === min) return undefined;
    const t = (value - min) / (max - min);
    return Math.min(SEQ_STEPS.length - 1, Math.floor(t * SEQ_STEPS.length));
  }

  function heatColor(idx: number): string {
    return view === "margin" ? DIVERGING_STEPS[idx] : SEQ_STEPS[idx];
  }

  function isDarkStep(idx: number): boolean {
    if (view === "margin") return idx <= 1 || idx >= 5;
    return idx >= 3;
  }

  function rowTotal(rowId: string) {
    let wins = 0;
    let losses = 0;
    let pointsFor = 0;
    let pointsAgainst = 0;
    for (const colId of managerIds) {
      if (colId === rowId) continue;
      const c = matrix[rowId]?.[colId];
      if (!c) continue;
      wins += c.wins;
      losses += c.losses;
      pointsFor += c.pointsFor;
      pointsAgainst += c.pointsAgainst;
    }
    const games = wins + losses;
    return { wins, losses, pointsFor, pointsAgainst, games };
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface-1">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-surface-1 px-4 py-3 text-left font-medium text-text-muted">
              vs &rarr;
            </th>
            {managerIds.map((id) => (
              <th
                key={id}
                scope="col"
                className="px-3 py-3 text-center font-medium text-text-muted"
              >
                {managerMap.get(id)?.fullName.split(" ")[0] ?? id}
              </th>
            ))}
            <th
              scope="col"
              className="border-l-2 border-border px-3 py-3 text-center font-medium text-text-muted"
            >
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {managerIds.map((rowId, i) => (
            <tr key={rowId} className={i % 2 === 1 ? "bg-page/40" : undefined}>
              <th
                scope="row"
                className="sticky left-0 z-10 bg-inherit px-4 py-2.5 text-left font-medium text-text-primary"
              >
                {managerMap.get(rowId)?.fullName.split(" ")[0] ?? rowId}
              </th>
              {managerIds.map((colId) => {
                if (colId === rowId) {
                  return (
                    <td
                      key={colId}
                      className="px-3 py-2.5 text-center text-text-muted"
                    >
                      &mdash;
                    </td>
                  );
                }
                const c = matrix[rowId]?.[colId];
                const games = c ? c.wins + c.losses : 0;

                if (view === "record") {
                  return (
                    <td
                      key={colId}
                      className="px-3 py-2.5 text-center tabular-nums text-text-primary"
                    >
                      {c ? `${c.wins}-${c.losses}` : "—"}
                    </td>
                  );
                }

                const value = cellValue(c, games, view);
                if (value === null) {
                  return (
                    <td
                      key={colId}
                      className="px-3 py-2.5 text-center tabular-nums text-text-muted"
                    >
                      —
                    </td>
                  );
                }
                const idx = heatIndex(value);
                const label =
                  view === "margin" && value > 0
                    ? `+${value.toFixed(1)}`
                    : value.toFixed(1);
                return (
                  <td
                    key={colId}
                    className={`px-3 py-2.5 text-center tabular-nums ${
                      idx !== undefined && isDarkStep(idx)
                        ? "text-white"
                        : "text-text-primary"
                    }`}
                    style={idx !== undefined ? { backgroundColor: heatColor(idx) } : undefined}
                  >
                    {label}
                  </td>
                );
              })}
              {(() => {
                const t = rowTotal(rowId);
                if (view === "record") {
                  return (
                    <td className="border-l-2 border-border px-3 py-2.5 text-center tabular-nums font-medium text-text-primary">
                      {t.games > 0 ? `${t.wins}-${t.losses}` : "—"}
                    </td>
                  );
                }
                if (t.games === 0) {
                  return (
                    <td className="border-l-2 border-border px-3 py-2.5 text-center tabular-nums text-text-muted">
                      —
                    </td>
                  );
                }
                const value =
                  view === "pointsFor"
                    ? t.pointsFor / t.games
                    : view === "pointsAgainst"
                      ? t.pointsAgainst / t.games
                      : (t.pointsFor - t.pointsAgainst) / t.games;
                const label =
                  view === "margin" && value > 0
                    ? `+${value.toFixed(1)}`
                    : value.toFixed(1);
                return (
                  <td className="border-l-2 border-border px-3 py-2.5 text-center tabular-nums font-medium text-text-primary">
                    {label}
                  </td>
                );
              })()}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
