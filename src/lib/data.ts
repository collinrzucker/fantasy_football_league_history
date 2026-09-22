import fs from "fs";
import path from "path";
import type {
  Manager,
  Season,
  KeeperYear,
  DraftYear,
  DraftAverage,
  ManagerId,
  KeeperWithStreak,
  Matchup,
  MatchupType,
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

export function getMatchups(): Matchup[] {
  return readJson<Matchup[]>("matchups.json").sort(
    (a, b) => a.year - b.year || a.week - b.week
  );
}

export interface HeadToHeadCell {
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
}

export interface HeadToHeadData {
  managerIds: ManagerId[];
  /** matrix[a][b] = a's record/points against b */
  matrix: Record<ManagerId, Record<ManagerId, HeadToHeadCell>>;
  seasonsCovered: number[];
}

export type MatchupFilter = "all" | "regular" | "playoffs";

export function getHeadToHead(filter: MatchupFilter = "all"): HeadToHeadData {
  const allMatchups = getMatchups();
  const matchups = allMatchups.filter((m) =>
    filter === "all"
      ? true
      : filter === "regular"
        ? m.type === "regular"
        : m.type !== "regular"
  );
  const managers = getManagers();
  const matrix: HeadToHeadData["matrix"] = {};
  const involvedIds = new Set<ManagerId>();
  const seasonsCovered = new Set<number>();

  function cell(a: ManagerId, b: ManagerId): HeadToHeadCell {
    matrix[a] ??= {};
    matrix[a][b] ??= { wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0 };
    return matrix[a][b];
  }

  for (const m of matchups) {
    seasonsCovered.add(m.year);
    involvedIds.add(m.home);
    involvedIds.add(m.away);

    const home = cell(m.home, m.away);
    const away = cell(m.away, m.home);
    home.pointsFor += m.homeScore;
    home.pointsAgainst += m.awayScore;
    away.pointsFor += m.awayScore;
    away.pointsAgainst += m.homeScore;

    if (m.homeScore > m.awayScore) {
      home.wins += 1;
      away.losses += 1;
    } else {
      away.wins += 1;
      home.losses += 1;
    }
  }

  const managerIds = managers
    .filter((m) => involvedIds.has(m.id))
    .map((m) => m.id);

  return {
    managerIds,
    matrix,
    seasonsCovered: [...seasonsCovered].sort((a, b) => a - b),
  };
}

export interface MatchupCareerStat {
  managerId: ManagerId;
  wins: number;
  losses: number;
  games: number;
  winPct: number;
  avgPointsFor: number;
  avgPointsAgainst: number;
}

export function getMatchupCareerStats(
  filter: MatchupFilter = "all"
): { stats: MatchupCareerStat[]; seasonsCovered: number[] } {
  const allMatchups = getMatchups();
  const matchups = allMatchups.filter((m) =>
    filter === "all"
      ? true
      : filter === "regular"
        ? m.type === "regular"
        : m.type !== "regular"
  );

  const totals = new Map<
    ManagerId,
    { wins: number; losses: number; pointsFor: number; pointsAgainst: number }
  >();
  const seasonsCovered = new Set<number>();

  function get(id: ManagerId) {
    let t = totals.get(id);
    if (!t) {
      t = { wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0 };
      totals.set(id, t);
    }
    return t;
  }

  for (const m of matchups) {
    seasonsCovered.add(m.year);
    const home = get(m.home);
    const away = get(m.away);
    home.pointsFor += m.homeScore;
    home.pointsAgainst += m.awayScore;
    away.pointsFor += m.awayScore;
    away.pointsAgainst += m.homeScore;
    if (m.homeScore > m.awayScore) {
      home.wins += 1;
      away.losses += 1;
    } else {
      away.wins += 1;
      home.losses += 1;
    }
  }

  const stats: MatchupCareerStat[] = [...totals.entries()].map(
    ([managerId, t]) => {
      const games = t.wins + t.losses;
      return {
        managerId,
        wins: t.wins,
        losses: t.losses,
        games,
        winPct: games > 0 ? t.wins / games : 0,
        avgPointsFor: games > 0 ? t.pointsFor / games : 0,
        avgPointsAgainst: games > 0 ? t.pointsAgainst / games : 0,
      };
    }
  );
  stats.sort((a, b) => b.wins - a.wins);

  return { stats, seasonsCovered: [...seasonsCovered].sort((a, b) => a - b) };
}

/** Pythagorean-expectation exponent. Fantasy matchups run tighter/higher
 * scoring than real NFL games, so this is well above the standard NFL
 * value of ~2.37. */
const PYTHAG_EXPONENT = 5;

export interface MergedCareerStat {
  managerId: ManagerId;
  wins: number;
  losses: number;
  games: number;
  winPct: number;
  avgPointsFor: number;
  avgPointsAgainst: number;
  expectedWinPct: number;
  luckIndex: number;
  playoffApps: number;
  championshipApps: number;
  championships: number;
}

/**
 * Career records combining filter-responsive W/L/points (from
 * matchups.json) with static Playoffs/Finals/Titles appearance counts
 * (from seasons.json, unaffected by the regular/playoffs/all filter).
 */
export function getMergedCareerStats(
  filter: MatchupFilter = "all"
): { stats: MergedCareerStat[]; seasonsCovered: number[] } {
  const { stats: matchupStats, seasonsCovered } = getMatchupCareerStats(filter);
  const managers = getManagers();
  const seasons = getSeasons().filter((s) => s.complete);

  const appearances = new Map<
    ManagerId,
    { playoffApps: number; championshipApps: number; championships: number }
  >();
  for (const manager of managers) {
    let playoffApps = 0;
    let championshipApps = 0;
    let championships = 0;
    for (const season of seasons) {
      const standing = season.standings.find(
        (s) => s.managerId === manager.id
      );
      if (!standing) continue;
      if (standing.playoffs) playoffApps += 1;
      if (standing.championship) championshipApps += 1;
      if (season.champion === manager.id) championships += 1;
    }
    appearances.set(manager.id, {
      playoffApps,
      championshipApps,
      championships,
    });
  }

  const stats: MergedCareerStat[] = matchupStats.map((s) => {
    const pf = s.avgPointsFor ** PYTHAG_EXPONENT;
    const pa = s.avgPointsAgainst ** PYTHAG_EXPONENT;
    const expectedWinPct = pf + pa > 0 ? pf / (pf + pa) : 0;
    const apps = appearances.get(s.managerId) ?? {
      playoffApps: 0,
      championshipApps: 0,
      championships: 0,
    };
    return {
      ...s,
      expectedWinPct,
      luckIndex: s.winPct - expectedWinPct,
      ...apps,
    };
  });
  stats.sort((a, b) => b.wins - a.wins);

  return { stats, seasonsCovered };
}

export interface ScorePerformance {
  managerId: ManagerId;
  score: number;
  year: number;
  week: number;
  type: MatchupType;
  opponentId: ManagerId;
  opponentScore: number;
}

/** Best and worst single-week scores across all matchups (regular + playoffs). */
export function getExtremeScores(
  limit = 10
): { best: ScorePerformance[]; worst: ScorePerformance[] } {
  const matchups = getMatchups();
  const entries: ScorePerformance[] = [];

  for (const m of matchups) {
    entries.push({
      managerId: m.home,
      score: m.homeScore,
      year: m.year,
      week: m.week,
      type: m.type,
      opponentId: m.away,
      opponentScore: m.awayScore,
    });
    entries.push({
      managerId: m.away,
      score: m.awayScore,
      year: m.year,
      week: m.week,
      type: m.type,
      opponentId: m.home,
      opponentScore: m.homeScore,
    });
  }

  const best = [...entries].sort((a, b) => b.score - a.score).slice(0, limit);
  const worst = [...entries].sort((a, b) => a.score - b.score).slice(0, limit);

  return { best, worst };
}
