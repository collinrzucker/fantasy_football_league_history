import type { KeeperWithStreak, Manager } from "@/types/league";

interface KeepersTableProps {
  keepers: KeeperWithStreak[];
  managerMap: Map<string, Manager>;
}

function rowClass(streak: number) {
  if (streak >= 3) return "bg-status-critical/15";
  if (streak === 2) return "bg-status-warning/20";
  return undefined;
}

function streakNote(streak: number) {
  if (streak >= 3) return "3rd+ year kept — cannot be kept again";
  if (streak === 2) return "2nd year kept — one keep remaining";
  return null;
}

export function KeepersTable({ keepers, managerMap }: KeepersTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface-1">
      <table className="w-full min-w-[520px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border">
            <th scope="col" className="px-4 py-3 text-left font-medium text-text-muted">
              Manager
            </th>
            <th scope="col" className="px-4 py-3 text-left font-medium text-text-muted">
              Kept player
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium text-text-muted">
              Round lost
            </th>
          </tr>
        </thead>
        <tbody>
          {keepers.map((keeper) => {
            const manager = managerMap.get(keeper.managerId);
            const note = streakNote(keeper.streak);
            return (
              <tr
                key={`${keeper.managerId}-${keeper.player}`}
                className={rowClass(keeper.streak)}
              >
                <td className="px-4 py-2.5 text-text-primary">
                  {manager?.fullName ?? keeper.managerId}
                </td>
                <td className="px-4 py-2.5 text-text-primary">
                  {keeper.player}
                  {note && (
                    <span className="ml-2 text-xs text-text-secondary">
                      {note}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums text-text-secondary">
                  {keeper.roundLost}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="flex flex-wrap gap-4 border-t border-border px-4 py-2 text-xs text-text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-status-warning" />
          Kept 2 years running — one keep left
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-status-critical" />
          Kept 3+ years running — final year, cannot be kept again
        </span>
      </p>
    </div>
  );
}
