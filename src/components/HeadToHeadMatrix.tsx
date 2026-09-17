import type { Manager } from "@/types/league";
import type { HeadToHeadData } from "@/lib/data";

interface HeadToHeadMatrixProps {
  data: HeadToHeadData;
  managerMap: Map<string, Manager>;
}

export function HeadToHeadMatrix({ data, managerMap }: HeadToHeadMatrixProps) {
  const { managerIds, matrix } = data;

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
                const cell = matrix[rowId]?.[colId];
                return (
                  <td
                    key={colId}
                    className="px-3 py-2.5 text-center tabular-nums text-text-primary"
                  >
                    {cell ? `${cell.wins}-${cell.losses}` : "—"}
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
