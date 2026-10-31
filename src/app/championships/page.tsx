import { getChampionshipHistory, getManagerMap } from "@/lib/data";
import { ChampionshipHistoryTable } from "@/components/ChampionshipHistoryTable";

export default function ChampionshipsPage() {
  const managerMap = Object.fromEntries(getManagerMap());
  const championships = getChampionshipHistory();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-sm font-medium text-text-primary">
          Championship history
        </h2>
        <p className="text-sm text-text-muted">
          Every championship game, most recent first.
        </p>
      </div>

      <ChampionshipHistoryTable
        championships={championships}
        managerMap={managerMap}
      />
    </div>
  );
}
