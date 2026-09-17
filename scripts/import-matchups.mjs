#!/usr/bin/env node
// Import week-by-week matchups from a filled-in CSV template into
// data/matchups.json. Usage:
//   node scripts/import-matchups.mjs path/to/filled.csv
//
// CSV columns: Season,Week,GameType,HomeManager,HomeScore,AwayManager,AwayScore
// GameType: regular | quarterfinal | semifinal | championship | thirdPlace | consolation
// HomeManager/AwayManager: first name or full name from data/managers.json.
//
// Validates every row before writing anything. Merges with the existing
// data/matchups.json, skipping rows that already exist (same year/week/pair).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");

const VALID_TYPES = new Set([
  "regular",
  "quarterfinal",
  "semifinal",
  "championship",
  "thirdPlace",
  "consolation",
]);

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const header = splitCsvLine(lines[0]);
  return lines.slice(1).map((line, i) => {
    const cells = splitCsvLine(line);
    const row = {};
    header.forEach((key, idx) => (row[key.trim()] = (cells[idx] ?? "").trim()));
    row.__line = i + 2; // 1-indexed + header row
    return row;
  });
}

function splitCsvLine(line) {
  const cells = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        cur += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      cells.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  cells.push(cur);
  return cells;
}

function buildManagerLookup(managers) {
  const lookup = new Map();
  for (const m of managers) {
    lookup.set(m.fullName.toLowerCase(), m.id);
    lookup.set(m.fullName.split(" ")[0].toLowerCase(), m.id);
    lookup.set(m.id.toLowerCase(), m.id);
  }
  return lookup;
}

function main() {
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error("Usage: node scripts/import-matchups.mjs path/to/filled.csv");
    process.exit(1);
  }

  const managers = JSON.parse(
    fs.readFileSync(path.join(dataDir, "managers.json"), "utf-8")
  );
  const managerLookup = buildManagerLookup(managers);
  const existing = JSON.parse(
    fs.readFileSync(path.join(dataDir, "matchups.json"), "utf-8")
  );
  const existingKeys = new Set(
    existing.map((m) => matchupKey(m.year, m.week, m.home, m.away))
  );

  const rows = parseCsv(fs.readFileSync(csvPath, "utf-8"));
  const errors = [];
  const toAdd = [];
  const seenInFile = new Set();

  for (const row of rows) {
    const line = row.__line;
    const year = Number(row.Season);
    const week = Number(row.Week);
    const type = row.GameType;
    const homeId = managerLookup.get((row.HomeManager || "").toLowerCase());
    const awayId = managerLookup.get((row.AwayManager || "").toLowerCase());
    const homeScore = Number(row.HomeScore);
    const awayScore = Number(row.AwayScore);

    if (!Number.isInteger(year) || year < 2012) {
      errors.push(`Line ${line}: invalid Season "${row.Season}"`);
    }
    if (!Number.isInteger(week) || week < 1) {
      errors.push(`Line ${line}: invalid Week "${row.Week}"`);
    }
    if (!VALID_TYPES.has(type)) {
      errors.push(
        `Line ${line}: invalid GameType "${type}" (expected one of ${[...VALID_TYPES].join(", ")})`
      );
    }
    if (!homeId) {
      errors.push(`Line ${line}: unrecognized HomeManager "${row.HomeManager}"`);
    }
    if (!awayId) {
      errors.push(`Line ${line}: unrecognized AwayManager "${row.AwayManager}"`);
    }
    if (homeId && awayId && homeId === awayId) {
      errors.push(`Line ${line}: HomeManager and AwayManager are the same ("${row.HomeManager}")`);
    }
    if (!Number.isFinite(homeScore)) {
      errors.push(`Line ${line}: invalid HomeScore "${row.HomeScore}"`);
    }
    if (!Number.isFinite(awayScore)) {
      errors.push(`Line ${line}: invalid AwayScore "${row.AwayScore}"`);
    }

    if (errors.length > 0) continue;

    const key = matchupKey(year, week, homeId, awayId);
    if (existingKeys.has(key)) {
      console.warn(`Line ${line}: skipping, already in matchups.json (${year} wk${week} ${row.HomeManager} vs ${row.AwayManager})`);
      continue;
    }
    if (seenInFile.has(key)) {
      errors.push(`Line ${line}: duplicate row within this CSV (${year} wk${week} ${row.HomeManager} vs ${row.AwayManager})`);
      continue;
    }
    seenInFile.add(key);

    toAdd.push({ year, week, type, home: homeId, homeScore, away: awayId, awayScore });
  }

  if (errors.length > 0) {
    console.error(`Found ${errors.length} error(s), nothing was written:\n`);
    errors.forEach((e) => console.error("  " + e));
    process.exit(1);
  }

  if (toAdd.length === 0) {
    console.log("No new matchups to add.");
    return;
  }

  const merged = [...existing, ...toAdd].sort(
    (a, b) => a.year - b.year || a.week - b.week
  );
  fs.writeFileSync(
    path.join(dataDir, "matchups.json"),
    JSON.stringify(merged, null, 2) + "\n"
  );
  console.log(`Added ${toAdd.length} matchup(s). Total: ${merged.length}.`);
}

function matchupKey(year, week, a, b) {
  const pair = [a, b].sort().join("-");
  return `${year}-${week}-${pair}`;
}

main();
