@AGENTS.md

# Game of (Red) Zones — League History Dashboard

Fantasy football league history dashboard for a 10-team (originally
8-team) league running since 2012. Next.js 16 (App Router) + TypeScript +
Tailwind 4, data-driven from flat JSON in `data/`, deployed on Vercel.

**Read `data/README.md` first** — it documents the data schema, known
gaps, and two tracked "planned" items in detail. This file is the
higher-level orientation; `data/README.md` is the source of truth for
data specifics.

## Git workflow (already set up, just follow it)

- I (Claude) commit to `claude/fantasy-football-dashboard-7aj4cx` — that's
  fixed by this environment's config, not a choice.
- `main` is what Vercel deploys (auto-detected via GitHub integration,
  configured in Vercel's Environments settings — the Settings → Git page
  does NOT have a "Production Branch" field in the current Vercel UI,
  despite that being the classic location).
- We merge the feature branch into `main` at checkpoints, when the user
  asks ("let's merge to main" / "I want to see the dashboard update") —
  not automatically after every commit. Always confirm before merging
  unless already asked.
- Commit after each logical chunk of work (one matchup-data import, one
  feature, one data fix), not batched at the end of a session. Typecheck
  (`npx tsc --noEmit`), lint (`npm run lint`), and build (`npm run build`)
  before every commit.
- This environment's container gets reclaimed between sessions —
  `node_modules` will be gone at the start of a new session. Run
  `npm install` first thing. Also re-check `npm audit` occasionally;
  we already had to bump Next.js once mid-project for a critical CVE.

## Current data status (as of 2026-09-20)

`data/matchups.json` — **fully backfilled, 2012–2026** (regular season +
playoffs for every completed season, validated manager-by-manager against
`data/seasons.json`; 2026 has Week 1 only so far, add weekly as results
come in). Powers the Head-to-Head tab and homepage Career Records table.

`data/draftOrder.json`: complete, 2012–2025.

`data/seasons.json` and `data/keepers.json`: complete for all seasons
already (2012–2026), these were filled in earlier in the project from
the original Google Sheet, independent of the matchups backfill effort.

## How we backfill a season's matchup data (the established process)

The user pulls up each manager's Yahoo schedule page (Team → Schedule)
and sends a screenshot per manager, one at a time, plus the team-name →
manager mapping and (if available) that year's draft order at the start
of a new season. For each screenshot:

1. Transcribe every row into `Season,Week,GameType,HomeManager,HomeScore,AwayManager,AwayScore`
   CSV rows (arbitrary which side is "home" — it's not tracked meaningfully).
2. **Cross-check every game that overlaps with an already-entered
   manager's schedule** — the same game appears in two managers'
   screenshots, so scores must match exactly. Report the cross-check
   count; it's the main correctness signal.
3. Compute that manager's implied win-loss from the screenshot and
   compare against `data/seasons.json`'s confirmed standings for that
   manager/year. Must match exactly before accepting the data.
4. Append validated new rows (skip already-covered pairs/weeks) to a
   running CSV in the scratchpad directory.
5. After each manager, run a quick Python check across the whole running
   CSV: which week/pair combinations are still missing, so you know
   what's left before asking for the next screenshot.
6. Once a season's regular season is fully covered (all weeks × all
   pairs), run the full validation (every manager's W-L against
   confirmed standings) one more time, then
   `npm run import:matchups <csv>`, typecheck, build, commit, push.
7. Playoffs are usually sent as a short text list (not screenshots) —
   `firstround`/`semifinal`/`championship` game types (see
   `data/README.md` for the 2012 4-team-bracket exception). Cross-check
   the champion/runnerUp against `data/seasons.json` before importing.

This process is slow but has caught zero data errors across ~400
matchups so far — trust it, don't skip the cross-checks to go faster.

## Known planned work

Running backlog of dashboard UI/data feature requests, tracked ad hoc as
the user adds them (not in priority order — ask before starting on one if
unclear which is next):

All 9 items from the 2026-09-20 backlog are done:
Career Records consolidation + Pythagorean win%/Luck Index, Season
History win%-sort for in-progress seasons, Draft Order footnote removal +
click-to-highlight + table/chart toggle, Keepers inline-text removal,
Head-to-Head subtitle + totals column.

Next up (not started yet, added 2026-09-20):

1. New "Championship History" tab — chronological table of championship
   game scores, most recent first.
2. Re-order the nav tabs to: Career Records, Season History, Championship
   History, Head to Head, Draft Order, Keepers.

## Design system

Dashboard styling follows the `dataviz` skill's method (validated
palette, sequential/diverging color rules, accessibility-first — e.g. we
deliberately chose blue/red over the user's originally-requested
green/red for the margin-of-victory heatmap due to colorblind
accessibility, confirmed with the user first). Re-load that skill before
adding new charts or visual components.
