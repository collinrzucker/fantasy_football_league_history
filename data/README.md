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

## Known gaps / not yet included

- **Team names** — intentionally omitted; they changed too often to be
  meaningful. Dashboard uses manager names throughout.
- **Pre-2017 draft order** — not currently available.
- **Trophies / punishments / rivalries / league rules** — not tracked yet.
- **2026 season** — `complete: false`, standings list managers with no
  W/L yet (order in the source sheet for an in-progress season isn't a
  real rank).

## Adding a new season

Append an entry to `seasons.json` with `complete: false` and no
wins/losses until the season starts, then fill in as it progresses. Set
`complete: true` and add `champion`/`runnerUp` once the playoffs finish.

## Adding new data types

New JSON file, keyed by `managerId` and/or `year` like the others. No
existing file needs to change shape to support this.
