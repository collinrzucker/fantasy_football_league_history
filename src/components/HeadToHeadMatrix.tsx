import type { Manager } from "@/types/league";
import type { HeadToHeadData } from "@/lib/data";

interface HeadToHeadMatrixProps {
  data: HeadToHeadData;
  managerMap: Map<string, Manager>;
  view: "record" | "pointsFor" | "pointsAgainst";
}

const SEQ_STEPS = [
  "var(--seq-100)",
  "var(--seq-200)",
  "var(--seq-300)",
  "var(--seq-400)",
  "var(--seq-500)",
];

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
        if (!c) continue;
        const games = c.wins + c.losses;
        if (games === 0) continue;
        const value = (view === "pointsFor" ? c.pointsFor : c.pointsAgainst) / games;
        min = Math.min(min, value);
        max = Math.max(max, value);
      }
    }
  }

  function heatIndex(value: number): number | undefined {
    if (view === "record" || max === min) return undefined;
    const t = (value - min) / (max - min);
    return Math.min(SEQ_STEPS.length - 1, Math.floor(t * SEQ_STEPS.length));
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

                if (games === 0) {
                  return (
                    <td
                      key={colId}
                      className="px-3 py-2.5 text-center tabular-nums text-text-muted"
                    >
                      —
                    </td>
                  );
                }
                const value =
                  (view === "pointsFor" ? c!.pointsFor : c!.pointsAgainst) / games;
                const idx = heatIndex(value);
                return (
                  <td
                    key={colId}
                    className={`px-3 py-2.5 text-center tabular-nums ${
                      idx !== undefined && idx >= 3 ? "text-white" : "text-text-primary"
                    }`}
                    style={idx !== undefined ? { backgroundColor: SEQ_STEPS[idx] } : undefined}
                  >
                    {value.toFixed(1)}
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
