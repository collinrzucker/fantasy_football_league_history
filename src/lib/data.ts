import fs from "fs";
import path from "path";
import type {
  Manager,
  Season,
  KeeperYear,
  DraftYear,
  CareerRecord,
  ManagerId,
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
