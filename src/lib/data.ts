import fs from "fs";
import path from "path";
import type {
  Manager,
  Season,
  KeeperYear,
  DraftYear,
  DraftAverage,
  CareerRecord,
  ManagerId,
  KeeperWithStreak,
} from "@/types/league";

const dataDir = path.join(process.cwd(), "data");

function readJson<T>(filename: string): T {
  const filePath = path.join(dataDir, filename);
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
}

export function getManagers(): Manager[] {
  return readJson<Manager[]>("managers.json");
}

export function getManagerMap(): Map<ManagerId, Manager> {
  return new Map(getManagers().map((m) => [m.id, m]));
}

export function getSeasons(): Season[] {
  return readJson<Season[]>("seasons.json").sort((a, b) => a.year - b.year);
}

export function getKeeperYears(): KeeperYear[] {
  return readJson<KeeperYear[]>("keepers.json").sort((a, b) => a.year - b.year);
}

export function getDraftYears(): DraftYear[] {
  return readJson<DraftYear[]>("draftOrder.json").sort(
    (a, b) => a.year - b.year
  );
}

export interface KeeperYearWithStreaks {
  year: number;
  keepers: KeeperWithStreak[];
}

/**
 * Streak = consecutive years (including this one) the same manager has kept
 * the same player. 2 = one keep left; 3+ = cannot be kept again.
 */
export function getKeepersWithStreaks(): KeeperYearWithStreaks[] {
  const years = getKeeperYears();
  let previousStreaks = new Map<string, number>();

  return years.map((yearEntry) => {
    const currentStreaks = new Map<string, number>();
    const keepers: KeeperWithStreak[] = yearEntry.keepers.map((keeper) => {
      const key = `${keeper.managerId}|${keeper.player}`;
      const streak = (previousStreaks.get(key) ?? 0) + 1;
      currentStreaks.set(key, streak);
      return { ...keeper, streak };
    });
    previousStreaks = currentStreaks;
    return { year: yearEntry.year, keepers };
  });
}

export function getDraftAverages(): DraftAverage[] {
  const draftYears = getDraftYears(); // ascending
  const managers = getManagers();
  const recent = (n: number) => draftYears.slice(-n);

  function average(years: DraftYear[], managerId: ManagerId): number | null {
    const picks = years
      .map((y) => y.order.find((o) => o.managerId === managerId)?.pick)
      .filter((p): p is number => p !== undefined);
    if (picks.length === 0) return null;
    return picks.reduce((sum, p) => sum + p, 0) / picks.length;
  }

  return managers
    .map((manager) => ({
      managerId: manager.id,
      allTime: average(draftYears, manager.id),
      last3: average(recent(3), manager.id),
      last5: average(recent(5), manager.id),
    }))
    .filter((row) => row.allTime !== null)
    .map((row) => ({ ...row, allTime: row.allTime as number }));
}

export function getCareerRecords(): CareerRecord[] {
  const managers = getManagers();
  const seasons = getSeasons().filter((s) => s.complete);

  return managers
    .map((manager) => {
      let wins = 0;
      let losses = 0;
      let playoffApps = 0;
      let championshipApps = 0;
      let championships = 0;

      for (const season of seasons) {
        const standing = season.standings.find(
          (s) => s.managerId === manager.id
        );
        if (!standing) continue;

        wins += standing.wins ?? 0;
        losses += standing.losses ?? 0;
        if (standing.playoffs) playoffApps += 1;
        if (standing.championship) championshipApps += 1;
        if (season.champion === manager.id) championships += 1;
      }

      const games = wins + losses;
      return {
        managerId: manager.id,
        wins,
        losses,
        games,
        winPct: games > 0 ? wins / games : 0,
        playoffApps,
        championshipApps,
        championships,
      };
    })
    .filter((record) => record.games > 0)
    .sort((a, b) => b.wins - a.wins);
}
