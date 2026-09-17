#!/usr/bin/env node
// Resolves the full season-by-season history of a Yahoo fantasy league by
// walking its "renew"/"renewed" chain, since Yahoo assigns a new numeric
// league_id each season even for the same persistent league.
//
// Usage: node scripts/yahoo-league-chain.mjs
// Requires .env.local with YAHOO_ACCESS_TOKEN (run yahoo-auth.mjs first)
// and YAHOO_LEAGUE_ID set.
//
// Writes data/yahoo-league-chain.json (gitignored-safe to share) with
// { season: league_key } for every season it can find, and prints a
// summary table.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");
const outPath = path.join(__dirname, "..", "yahoo-league-chain.json");

function loadEnv() {
  const env = {};
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) env[m[1]] = m[2];
  }
  return env;
}

async function yahooGet(url, token) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}: ${text.slice(0, 500)}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    console.error("Non-JSON response, saving raw text to yahoo-debug-raw.txt");
    fs.writeFileSync(
      path.join(__dirname, "..", "yahoo-debug-raw.txt"),
      text
    );
    throw new Error("Could not parse response as JSON");
  }
}

async function main() {
  const env = loadEnv();
  if (!env.YAHOO_ACCESS_TOKEN) {
    console.error("No YAHOO_ACCESS_TOKEN in .env.local — run yahoo-auth.mjs first.");
    process.exit(1);
  }

  const gameData = await yahooGet(
    "https://fantasysports.yahooapis.com/fantasy/v2/game/nfl?format=json",
    env.YAHOO_ACCESS_TOKEN
  );
  fs.writeFileSync(
    path.join(__dirname, "..", "yahoo-debug-game.json"),
    JSON.stringify(gameData, null, 2)
  );
  console.log("Saved raw game response to yahoo-debug-game.json for inspection.");

  const currentGameKey = gameData?.fantasy_content?.game?.[0]?.game_key;
  if (!currentGameKey) {
    console.error(
      "Could not find game_key in response — see yahoo-debug-game.json and send it to Claude."
    );
    process.exit(1);
  }
  console.log("Current NFL game_key:", currentGameKey);

  const chain = {};
  let leagueKey = `${currentGameKey}.l.${env.YAHOO_LEAGUE_ID}`;
  let hops = 0;

  while (leagueKey && hops < 20) {
    hops++;
    let leagueData;
    try {
      leagueData = await yahooGet(
        `https://fantasysports.yahooapis.com/fantasy/v2/league/${leagueKey}?format=json`,
        env.YAHOO_ACCESS_TOKEN
      );
    } catch (e) {
      console.error(`Failed fetching ${leagueKey}:`, e.message);
      break;
    }

    if (hops === 1) {
      fs.writeFileSync(
        path.join(__dirname, "..", "yahoo-debug-league.json"),
        JSON.stringify(leagueData, null, 2)
      );
      console.log("Saved raw league response to yahoo-debug-league.json for inspection.");
    }

    const league = leagueData?.fantasy_content?.league?.[0];
    if (!league) {
      console.error(`Unexpected shape for ${leagueKey} — check yahoo-debug-league.json`);
      break;
    }

    chain[league.season] = leagueKey;
    console.log(`${league.season}: ${leagueKey} ("${league.name}")`);

    if (!league.renew) break;
    // renew format observed historically as "{prevGameId}_l_{prevLeagueId}"
    const [prevGameId, , prevLeagueId] = league.renew.split("_");
    leagueKey = `${prevGameId}.l.${prevLeagueId}`;
  }

  fs.writeFileSync(outPath, JSON.stringify(chain, null, 2));
  console.log(`\nWrote ${Object.keys(chain).length} season(s) to yahoo-league-chain.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
