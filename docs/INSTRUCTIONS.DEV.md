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

## Repository Structure (target state)

```
trading-copilot/
├── README.md
├── app/
│   ├── index.html                 # Vanilla SPA (current); Vite/React/TS (future)
│   └── favicon.ico
├── data/
│   ├── watchlists/*.json          # Per-strategy opportunities (overwritten on refresh)
│   ├── context/market-regime.json # Market regime + strategy adjustments
│   ├── schemas/                   # JSON Schema definitions
│   └── meta/manifest.json         # Tab order, file registry
├── docs/
│   ├── index.md                   # Main technical documentation
│   ├── INSTRUCTIONS.DEV.md        # This file
│   ├── INSTRUCTIONS.TRADING.md    # Trading Space instructions
│   ├── setup/
│   │   ├── spaces-setup.md
│   │   └── github-setup.md
│   └── strategies/
│       └── *.md
└── .github/
    └── workflows/
        ├── validate-json.yml
        └── deploy.yml
```

**Permanently removed:**
- `archive/` — no weekly snapshots, no archive index
- `data/journal/` — no trade journal
- `docs/journal/` — no journal schema docs
- `docs/setup/capital-and-user-profile.md` — no user profiling
- `schemas/` root-level directory (migrated to `data/schemas/`)
- `tools/` — archive scripts removed

---

## How the App Works

- The SPA loads JSON from `data/` at runtime (no backend)
- On each Trading Copilot refresh, watchlist files are **overwritten in place** — no archival
- The app renders opportunity cards per strategy tab
- The user refreshes the browser to get the latest data
- **Live prices (vanilla SPA):** crypto via Coinlore, FX/metals via fawazahmed0. Equities have no live price in the vanilla app — Yahoo Finance blocks browser requests via CORS. Equity live prices will be added in the React/Vite phase via a backend proxy.

---

## SPA Card Layout (target)

Each opportunity card renders:

```
[ STALE badge ]                      (only when data is outdated)
[ TICKER ]                           (large, bold)
[ Full instrument name ]             (muted, smaller)
[ Live price · 24h% · vs entry% ]   (crypto + FX/metals only in vanilla)
─────────────────────────────────
[ LONG/SHORT ] [ Xd ] [ Y% risk ] [ R:R 1:N ]
Entry / Target / Stop Loss / Earnings date
Rationale / Setup / Entry Trigger
```

**Not in cards:** strategy description line, week range, trade counts, favourites/stars, position sizes.

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
- [x] Phase 4: Live prices wired — crypto (Coinlore) + FX/metals (fawazahmed0) working; equities deferred (CORS)
- [x] Phase 4b: Polish — removed header meta line, minimal footer, new card layout, disabled Yahoo CORS errors, added XRP to Coinlore map

### Next (Phase 5 — React + Vite migration)

- Scaffold Vite + React + TypeScript
- Port all 6 rendering modules as React components
- Preserve dark theme via CSS variables (unchanged color palette)
- Wire `api.js` as a plain utility module (no rewrite needed)
- Re-enable equity live prices via backend proxy or serverless function
- Add sparklines / mini charts for all asset classes
- ESLint + Prettier
- TypeScript strict mode
- Minimal smoke tests for critical render paths

---

## Related Docs

- `docs/index.md` — main technical reference
- `docs/INSTRUCTIONS.TRADING.md` — Trading Space behaviour
- `docs/setup/spaces-setup.md` — Perplexity Spaces configuration
- `docs/setup/github-setup.md` — GitHub Actions and Pages
