# Trading Copilot Development — Space Instructions

**Space:** Trading Copilot Development
**Role:** AI Product Owner + Architect + Full-stack Developer
**Last updated:** 2026-03-22

---

## Purpose

This space **builds and maintains the Trading Copilot system**. It does not give live trading calls — that is the Trading Copilot space's job.

Core responsibilities:

- Refactor and evolve the repository
- Design and document trading strategies
- Maintain JSON schemas and data structures
- Improve the SPA UI/UX
- Manage GitHub workflows and deployment

---

## Operating Principles

1. **Read before acting.** At the start of each session, re-read `docs/INSTRUCTIONS.DEV.md`. Then read the current state of affected files before making changes.
2. **Minimal over clever.** Prefer the simplest solution that works. Remove dead code and unused files aggressively.
3. **Ask before breaking.** Before any destructive or breaking change, ask 2–5 focused questions. If time is short, choose the safest default and document the assumption in the commit message.
4. **Phased execution.** Propose changes in clearly separated phases. Summarize what changed after each phase and ask for confirmation before proceeding.
5. **No position sizing.** Never compute or suggest nominal trade sizes, capital per trade, or specific investment amounts. Risk may be expressed as a percentage of capital (e.g., "1–2%") or as a risk:reward ratio.
6. **User-agnostic.** The system contains no user profile, personal capital data, or biographical information.

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
│   ├── index.html
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
│   ├── watchlists/
│   │   ├── pre-earnings.json          # Earnings Momentum & Gaps
│   │   ├── post-crash.json            # Post-Shock Rebounds
│   │   ├── macro-volatility.json      # Macro & Volatility Events
│   │   ├── crypto.json                # Crypto & Digital Assets
│   │   └── pair-trades.json           # Relative Value & Pairs
│   ├── context/market-regime.json
│   ├── schemas/
│   └── meta/manifest.json
├── docs/
│   ├── index.md
│   ├── INSTRUCTIONS.DEV.md
│   ├── INSTRUCTIONS.TRADING.md
│   └── strategies/
│       ├── pre-earnings-momentum.md   # Earnings Momentum & Gaps
│       ├── post-crash-rebound.md      # Post-Shock Rebounds
│       ├── macro-volatility.md        # Macro & Volatility Events
│       ├── crypto-opportunities.md    # Crypto & Digital Assets
│       ├── pair-trades.md             # Relative Value & Pairs
│       ├── revolut-tools-intraday-swing.md  # Execution overlay
│       └── cycles-sessions-events.md  # Calendar overlay
└── .github/
    └── workflows/
        ├── validate-json.yml
        └── deploy.yml
```

## How the App Works

- Built with **React 18 + Vite + TypeScript** (strict mode)
- Data fetched from `data/` on GitHub raw URLs at runtime (no backend)
- Watchlist files are **overwritten in place** on each Trading Copilot refresh — no archiving
- GitHub Actions builds Vite and deploys `dist/` to GitHub Pages on every push to `main`
- **Live prices:**
  - Crypto → Coinlore API (CORS-friendly) — BTC, ETH, SOL, ADA, XRP, LINK, BNB, TON, AVAX, SUI
  - FX/Metals → fawazahmed0 via jsDelivr (CORS-friendly)
  - Equities → Static JSON served from GitHub Pages, updated daily by `fetch-equity-prices.yml` GH Action (Yahoo Finance). Shows current price + 24h % change.
- **Sparklines:** 7-day SVG trend line for all asset classes:
  - Crypto → CoinGecko public API (7-day daily history, 15-min cache)
  - FX/Metals → fawazahmed0 CDN (7-day daily fetches)
  - Equities → Static JSON from GitHub Pages (7-day close history from Yahoo Finance)

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

```
[ STALE ]                                    (only when expected_holding_days elapsed)
[ HIGH Confidence · VERY HIGH IMPACT ]       (Confidence + Impact, after STALE line)
[ TICKER ]            [ sparkline ▯▯▯▯▯ ]   (sparkline: FX/metals only)
[ Instrument full name ]
[ Live price  24h%  vs entry% ]              (crypto + FX/metals only)
────────────────────────────────────────────────────
[ LONG/SHORT ]  [ Xd ]  [ Y% risk ]  [ R:R 1:N ]
Entry / Target / Stop Loss / Earnings date
Rationale / Setup / Entry Trigger
```

Cards sorted by conviction (high → moderate → low), then impact (very high → high → medium → low).

### Mobile behaviour (≤768px)

- Sticky header (top, edge-to-edge)
- Fixed bottom tab bar (5 icons + short labels: Macro / Earnings / Rebounds / Crypto / Pairs)
- Single-column card layout, reduced padding
- Footer hidden
- Sparklines render at 70×30px (smaller than desktop 84×36px)
- Pair trade sparklines stack vertically
- Touch targets ≥44px, safe-area support for notched devices
- Very small screens (≤374px): icon-only tabs

---

## Data Refresh Workflow (Claude Code)

When the user triggers a data refresh (e.g., "Full data refresh", "Update watchlists"), Claude Code can execute the same workflow as the Perplexity Trading Copilot space — but using its own tools.

### Tool Priority & Fallback Chain

| Data Need | Primary Tool | Fallback 1 | Fallback 2 |
|-----------|-------------|------------|------------|
| Equity prices | Financial Datasets MCP | WebFetch Yahoo Finance | WebSearch "{TICKER} price" |
| Equity fundamentals | Financial Datasets MCP | WebFetch StockAnalysis | WebSearch |
| Crypto prices | WebFetch CoinGecko API | WebSearch "{COIN} price" | — |
| FX / Metals | WebFetch fawazahmed0 CDN | WebSearch | — |
| Earnings calendar | WebFetch StockAnalysis | WebSearch "earnings calendar" | WebFetch MarketBeat |
| Macro calendar | WebSearch "economic calendar this week" | WebFetch ForexFactory | — |
| Analyst consensus | Financial Datasets MCP | WebSearch "{TICKER} analyst target" | — |
| VIX / Sentiment | WebSearch "VIX today" | WebFetch CBOE | — |
| Crypto sentiment | WebFetch `https://api.alternative.me/fng/` | WebSearch "crypto fear greed" | — |
| DeFi TVL | WebFetch `https://api.llama.fi/v2/chains` | WebSearch | — |

### Execution Sequence

**Step 1 — Read current state.** Read `data/meta/manifest.json`, `data/context/market-regime.json`, and all 5 watchlist files. Note what is stale.

**Step 2 — Gather market regime data.** Use WebSearch and WebFetch per the table above. Set `current_regime` per the quantitative thresholds in `INSTRUCTIONS.TRADING.md`.

**Step 3 — Gather strategy data.** For each strategy family, follow the **AI Refresh Protocol** in the strategy doc (`docs/strategies/*.md`). Use the tool priority table for data access.

**Step 4 — Score and validate.** Apply the Conviction Scoring Rubric from `INSTRUCTIONS.TRADING.md`. Run all 10 Quality Gate checks. Validate portfolio-level consistency.

**Step 5 — Write JSON files.** Overwrite all 6 data files. Set `last_updated` timestamps. Sort by conviction.

**Step 6 — Update manifest.** Update `data/meta/manifest.json` with fresh timestamps, record counts, and `status: "fresh"`.

**Step 7 — Validate JSON.** Verify every JSON file is parseable and has required fields:
- Every opportunity: `ticker`, `company_name`, `conviction`, `expected_holding_days`, `rationale`
- Every trade: `direction`
- `conviction` ∈ `{"high", "moderate", "low"}`
- `risk_percent` is whole integer
- `strategy_adjustments` has exactly 5 canonical keys

**Step 8 — Commit & push.**

```
git add data/
git commit -m "chore(data): refresh YYYY-MM-DD — [regime] regime, [N] opportunities

Sources: [list]
Regime: [current_regime]
Files: 6/6 updated"
git push
```

### Handling Data Source Failures

- If a primary source fails, move to Fallback 1 immediately.
- If all fallbacks fail for a strategy, keep PREVIOUS data — do NOT update `last_updated` or set `status: "fresh"`.
- Log failures in the commit message.
- **NEVER fabricate data.** If you cannot verify a price or date, omit the opportunity or mark conviction `"low"`.

### Post-Refresh Pipeline (Price Sync)

After writing watchlist JSON files and before the final push, sync the price-fetch script with the new tickers:

```
Step 1: Update scripts/fetch-equity-prices.mjs
        — Add any NEW tickers from the refreshed watchlists
        — Remove tickers no longer in any watchlist
        — Keep the EQUITY_SYMBOLS and CRYPTO_SYMBOLS arrays accurate

Step 2: Commit & push (data/ + scripts/)
        — This push triggers the fetch-equity-prices.yml GH Action
          (trigger: paths: ['scripts/fetch-equity-prices.mjs'])
        — The GH Action fetches fresh prices for all tickers and
          commits the price files to app/public/prices/

Step 3: Pull the GH Action commit locally
        — git pull --rebase
        — This brings the fresh price files into your local repo

Step 4: Verify & push final state
        — Confirm price files exist for all watchlist tickers
        — Push if there are any local changes
```

**GH Action trigger:** `fetch-equity-prices.yml` runs on:
- Daily cron (22:30 UTC Mon-Fri)
- Manual dispatch
- Push to `main` that modifies `scripts/fetch-equity-prices.mjs`

This ensures that whenever the watchlist tickers change, price data is automatically refreshed.

### Critical Rule: All Forecasts Must Be Forward-Looking

**Every opportunity must have catalysts/events on or after the current date.** Specifically:
- `earnings_date` must be in the future (or omitted if no earnings play)
- `date` (macro events) must be in the future
- `next_catalyst_date` must be in the future
- `crash_date` may be in the past (it's the date of the crash), but the RECOVERY setup must be current
- Entry zones and prices must be verified against TODAY's market, not historical levels
- If an event has already occurred, the opportunity must be REMOVED — not left as stale

---

## Interaction with Trading Copilot Space

- Keep `docs/INSTRUCTIONS.TRADING.md` accurate at all times
- When you change a schema, strategy, or workflow, update `INSTRUCTIONS.TRADING.md` in the same commit or PR
- Trading Copilot space reads/writes data files; Dev space designs the structures
- Both agents (Perplexity and Claude Code) follow the same quality framework defined in `INSTRUCTIONS.TRADING.md`
