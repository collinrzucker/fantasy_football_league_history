# League history data

Source of truth for the dashboard. Flat JSON files, hand-editable. All
manager references use the lowercase `id` from `managers.json`, not names,
so renames don't cascade.

## Files

- **managers.json** — roster. `id`, `fullName`, `active` (still in the
  league or not).
- **seasons.json** — one entry per year. `standings` is ordered by final
  playoff finish (rank 1 = champion), each with `wins`/`losses` from the
  regular season, plus `playoffs` and `championship` booleans per manager.
  `champion`/`runnerUp` are `managerId`s. All of `wins`/`losses`/`playoffs`/
  `championship`/`champion`/`runnerUp` are `null` for a season still in
  progress (`complete: false`). Career win/loss totals are derived by
  summing this file, not stored separately — it's the only source of truth
  for W/L after the original two summary tables in the old spreadsheet
  turned out to disagree with the season-by-season data (which was
  confirmed correct). Playoff cutoff was top 4 in 2012, top 6 every season
  since.
- **keepers.json** — one entry per draft year (2021+, when the keeper
  format started). Each keeper: `managerId`, `player`, `roundLost` (the
  draft round given up to keep them).
- **draftOrder.json** — one entry per draft year (2017+, earliest known).
  `order` is pick 1 → pick N.
- **matchups.json** — week-by-week matchup results (`year`, `week`, `type`,
  `home`/`away` managerIds, `homeScore`/`awayScore`). `type` is one of
  `regular`, `firstround`, `semifinal`, `championship` — the league doesn't
  track consolation/3rd-place games historically, so those aren't modeled.
  Empty until filled in — see "Adding matchup history" below. Powers the
  Head-to-Head tab once populated.

## Known gaps / not yet included

- **Week-by-week matchups** — partial (`matchups.json` currently covers
  2024–2026 only; older seasons not backfilled yet). Fill in via
  `data/matchups-template.csv` (see below).
- **Team names** — intentionally omitted; they changed too often to be
  meaningful. Dashboard uses manager names throughout.
- **Pre-2017 draft order** — not currently available.
- **Trophies / punishments / rivalries / league rules** — not tracked yet.
- **2026 season** — `complete: false`, standings fill in week by week as
  results come in (rank order isn't a real ranking until the season ends).

## Planned: consolidate Career Records onto matchups.json

Once `matchups.json` covers full history (all seasons, not just 2024+),
merge the homepage's two Career Records tables into one: W / L / Win% /
Avg For / Avg Against all computed from `matchups.json` and responsive to
the regular-season/playoffs/all filter, while Playoffs / Finals / Titles
stay static (they're appearance/count metrics, not something that splits
by game type). At that point `seasons.json`'s per-manager `wins`/`losses`/
`playoffs`/`championship` fields — and possibly `champion`/`runnerUp`
themselves — become derivable from `matchups.json` instead of
hand-maintained, which removes the two-source duplication for good.
Not worth doing until the backfill is much further along.

## Adding matchup history

Yahoo doesn't offer a bulk export, so this is manual: for a season, open
its "Matchup" or "Schedule" page on Yahoo (league → past seasons →
Matchup by week) and copy each week's scores into a copy of
`data/matchups-template.csv` (delete the two example rows first). Columns:

```
Season,Week,GameType,HomeManager,HomeScore,AwayManager,AwayScore
```

- `GameType`: `regular`, `firstround`, `semifinal`, or `championship`. For
  the 2012 bracket (4 playoff teams, no bye round), use `semifinal` for
  the opening round and `championship` for the final — there's no
  `firstround` game that year since the bracket only has two rounds.
- `HomeManager`/`AwayManager`: first name or full name from
  `managers.json` — the import script resolves either.

Then run:

```bash
npm run import:matchups path/to/your-filled.csv
```

It validates every row (unknown manager names, bad game types, non-numeric
scores, duplicate rows) and writes nothing if anything's wrong — errors are
printed with line numbers so you can fix and re-run. Already-imported
matchups (same year/week/pair) are skipped automatically, so it's safe to
re-run with a CSV that has some overlap with what's already in
`matchups.json`. You can do this incrementally, season by season — no need
to fill in all 14 years at once.

## Adding a new season

Append an entry to `seasons.json` with `complete: false` and no
wins/losses until the season starts, then fill in as it progresses. Set
`complete: true` and add `champion`/`runnerUp` once the playoffs finish.

## Adding new data types

New JSON file, keyed by `managerId` and/or `year` like the others. No
existing file needs to change shape to support this.
