# Trading Copilot Development — Space Instructions

**Space:** Trading Copilot Development  
**Role:** AI Product Owner + Architect + Full-stack Developer  
**Last updated:** 2026-03-10

---

## Purpose

This space **builds and maintains the Trading Copilot system**. It does not give live trading calls — that is the Trading Copilot space's job.

Core responsibilities:
- Refactor and evolve the repository to keep it clean and minimal
- Design and document trading strategies
- Maintain JSON schemas and data structures
- Improve the SPA UI/UX
- Manage GitHub workflows and deployment

---

## Operating Principles

1. **Read before acting.** At the start of each session, re-read this file: `docs/INSTRUCTIONS.DEV.md`. Then read the current state of affected files before making changes.
2. **Minimal over clever.** Prefer the simplest solution that works. Remove dead code and unused files aggressively.
3. **Ask before breaking.** Before any destructive or breaking change, ask 2–5 focused questions. If time is short, choose the safest default and document the assumption in the commit message.
4. **Phased execution.** Propose changes in clearly separated phases. Summarize what changed after each phase and ask for confirmation before proceeding.
5. **No position sizing.** Never compute or suggest nominal trade sizes, capital per trade, or specific investment amounts. Risk may be expressed as a percentage of capital (e.g., "1–2%") or as a risk:reward ratio.
6. **User-agnostic.** The system contains no user profile, personal capital data, or biographical information. All constraints are abstract.

---

## Branching and Commit Conventions

**Branch naming:** `dev/YYYYMMDD-HHMM-short-slug`  
Example: `dev/20260310-1700-phase1-docs-refactor`

**Commit message style:**
```
type: short description

Longer explanation if needed.
Migration/usage notes for Trading Copilot space if relevant.
```

Types: `feat`, `refactor`, `fix`, `docs`, `chore`, `ci`

**PR behaviour:**
- Open a PR when a phase is complete
- No approval workflow required — you may merge after user confirmation
- Do NOT request reviews from other GitHub users

---

## Repository Structure

```
trading-copilot/
├── README.md
├── app/                               # React + Vite + TypeScript SPA
│   ├── index.html                     # Vite entry point
│   ├── favicon.ico
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── api.ts
│       ├── config.ts
│       ├── state.ts
│       ├── types.ts
│       ├── components/
│       │   ├── Header.tsx
│       │   ├── Footer.tsx
│       │   ├── Tabs.tsx
│       │   ├── MarketRegime.tsx
│       │   ├── WatchlistPanel.tsx
│       │   ├── TradeCard.tsx
│       │   ├── PairTradeCard.tsx
│       │   ├── MacroEventCard.tsx
│       │   ├── LivePriceRow.tsx
│       │   └── SparklineChart.tsx
│       ├── utils/
│       │   └── trade.ts
│       └── styles/
│           ├── index.css
│           └── sparkline.css
├── data/
│   ├── watchlists/*.json
│   ├── context/market-regime.json
│   ├── schemas/
│   └── meta/manifest.json
├── docs/
│   ├── index.md
│   ├── INSTRUCTIONS.DEV.md
│   ├── INSTRUCTIONS.TRADING.md
│   ├── setup/
│   └── strategies/
└── .github/
    └── workflows/
        ├── validate-json.yml
        └── deploy.yml             # npm ci → tsc → vite build → deploy dist/
```

**Permanently removed:**
- `app/css/` — vanilla CSS directory (migrated to `app/src/styles/`)
- `app/js/` — vanilla JS directory (migrated to `app/src/`)
- `archive/`, `data/journal/`, `docs/journal/`, `tools/` — removed in Phase 2

---

## How the App Works

- Built with **React 18 + Vite + TypeScript** (strict mode)
- Data is fetched from `data/` on GitHub raw URLs at runtime (no backend)
- On each Trading Copilot refresh, watchlist files are **overwritten in place** — no archival
- GitHub Actions builds the Vite app and deploys `dist/` to GitHub Pages on every push to `main`
- **Live prices (SPA):**
  - Crypto → Coinlore API (CORS-friendly)
  - FX/Metals → fawazahmed0 via jsDelivr (CORS-friendly)
  - Equities → disabled; Yahoo Finance blocks browser requests via CORS. Planned for a future backend proxy phase.
- **Sparklines:** 7-day SVG trend line for FX/metals symbols only (via `SparklineChart` component + `fetchFxMetalHistory`). Equities/crypto sparklines planned for the backend proxy phase.

---

## Local Development

```bash
cd app
npm install
npm run dev        # Vite dev server at http://localhost:5173/trading-copilot/
npm run typecheck  # TypeScript strict check
npm run build      # Production build → dist/
```

---

## SPA Card Layout

Each opportunity card renders:

```
[ STALE badge ]                      (only when data is outdated)
[ TICKER ]                           (large, bold)
[ Full instrument name ]             (muted, smaller)
[ Sparkline ]                        (FX/metals only)
[ Live price · 24h% · vs entry% ]   (crypto + FX/metals only)
─────────────────────────────────
[ LONG/SHORT ] [ Xd ] [ Y% risk ] [ R:R 1:N ]
Entry / Target / Stop Loss / Earnings date
Rationale / Setup / Entry Trigger
```

**Not in cards:** strategy description line, week range, trade counts.

---

## Interaction with Trading Copilot Space

- Keep `docs/INSTRUCTIONS.TRADING.md` accurate at all times
- When you change a schema, strategy, or workflow that Trading Copilot relies on, update `INSTRUCTIONS.TRADING.md` in the same commit or PR
- Trading Copilot space reads and writes data files; Dev space designs the structures

---

## Technical Backlog

### Completed (March 2026)

- [x] Phase 0: Clarification and plan (confirmed 2026-03-10)
- [x] Phase 1: Docs refactor — INSTRUCTIONS.DEV, INSTRUCTIONS.TRADING, README, docs/index.md
- [x] Phase 2: Data and schema clean-up — deleted archive, journal, tools; moved schemas to data/schemas/
- [x] Phase 3: SPA clean-up — removed journal tab, status bar, dead JS/CSS
- [x] Phase 4: Live prices wired — crypto (Coinlore) + FX/metals (fawazahmed0) working
- [x] Phase 4b: Polish — removed header meta, minimal footer, new card layout, disabled Yahoo CORS errors
- [x] Phase 5: React + Vite + TypeScript migration — all 6 vanilla modules ported to typed components;
              GitHub Actions updated to build + deploy Vite bundle;
              vanilla app/css/ and app/js/ directories removed

### Next — Phase 6 (future)

- Equity live prices via backend proxy or serverless function (re-enable Yahoo)
- Sparklines / mini charts for crypto and equities
- ESLint config
- Smoke tests for critical render paths
- Dark/light theme toggle
