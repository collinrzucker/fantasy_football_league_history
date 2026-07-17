export type ManagerId = string;

export interface Manager {
  id: ManagerId;
  fullName: string;
  active: boolean;
}

export interface SeasonStanding {
  rank: number;
  managerId: ManagerId;
  wins: number | null;
  losses: number | null;
  playoffs: boolean | null;
  championship: boolean | null;
}

export interface Season {
  year: number;
  complete: boolean;
  champion: ManagerId | null;
  runnerUp: ManagerId | null;
  standings: SeasonStanding[];
}

export interface Keeper {
  managerId: ManagerId;
  player: string;
  roundLost: number;
}

export interface KeeperYear {
  year: number;
  keepers: Keeper[];
}

export interface DraftPick {
  managerId: ManagerId;
  pick: number;
}

export interface DraftYear {
  year: number;
  order: DraftPick[];
}

export interface KeeperWithStreak extends Keeper {
  /** consecutive years (including this one) this manager has kept this player */
  streak: number;
}

export interface DraftAverage {
  managerId: ManagerId;
  allTime: number;
  last3: number | null;
  last5: number | null;
}

export interface CareerRecord {
  managerId: ManagerId;
  wins: number;
  losses: number;
  games: number;
  winPct: number;
  playoffApps: number;
  championshipApps: number;
  championships: number;
}
