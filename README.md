# Game of (Red) Zones — League History

Interactive dashboard for our fantasy football league's history: records,
championships, draft history, and season-by-season standings since 2012.

Built with Next.js (App Router), TypeScript, and Tailwind CSS. League data
lives in flat JSON files in `data/` — see `data/README.md` for the schema
and how to add a new season.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run lint       # ESLint
npx tsc --noEmit   # typecheck
npm run build      # production build
```
