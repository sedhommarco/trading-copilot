# Trading A¡dvisor — Technical Documentation

**Repository:** `sedhommarco/trading-copilot`
**Live app:** https://sedhommarco.github.io/trading-copilot/
**Last updated:** 2026-03-11

---

## Overview

Trading A¡dvisor is a minimal, static SPA that surfaces current trading opportunities and strategy-level context. It is a **recommendation viewer / playbook**, not a trading platform or P&L engine.

The system is driven by two Perplexity Spaces:

| Space                           | Role                                                            | Instructions                                                |
| ------------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------- |
| **Trading Copilot**             | Execution — produce recommendations, watchlists, market context | [`docs/INSTRUCTIONS.TRADING.md`](./INSTRUCTIONS.TRADING.md) |
| **Trading Copilot Development** | Architecture, refactoring, product ownership                    | [`docs/INSTRUCTIONS.DEV.md`](./INSTRUCTIONS.DEV.md)         |

---

## Application Architecture

### Current stack

- **UI:** React 18 + TypeScript + Vite SPA (responsive — mobile-friendly with fixed bottom tab bar)
- **Hosting:** GitHub Pages (static)
- **Deployment:** GitHub Actions on push to `main` (`npm ci → tsc → vite build → deploy dist/`)
- **Data:** Static JSON files in `data/` (no backend, no database)

---

## Repository Structure

```
trading-copilot/
├── README.md
├── app/
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
│   ├── watchlists/
│   │   ├── pre-earnings.json          # Earnings Momentum & Gaps
│   │   ├── post-crash.json            # Post-Shock Rebounds
│   │   ├── macro-volatility.json      # Macro & Volatility Events
│   │   ├── crypto.json                # Crypto & Digital Assets
│   │   └── pair-trades.json           # Relative Value & Pairs
│   ├── context/
│   │   └── market-regime.json
│   ├── schemas/
│   └── meta/
│       └── manifest.json
├── docs/
│   ├── index.md                       # This file
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

---

## Data Layer

### Watchlists (`data/watchlists/*.json`)

One JSON file per strategy family. Each file contains an array of opportunity objects. The Trading Copilot space **overwrites** these files on each refresh — no weekly snapshots.

**Target opportunities per file:** 5–10 (enforced by refresh guidelines in `INSTRUCTIONS.TRADING.md`).

Canonical opportunity shape (full field reference in `INSTRUCTIONS.TRADING.md`):

```json
{
  "ticker": "AAPL",
  "company_name": "Apple Inc.",
  "direction": "long",
  "conviction": "high",
  "current_price": 175.0,
  "entry_zone": "173-177",
  "stop_loss": 168.0,
  "take_profit": 190.0,
  "risk_percent": 2,
  "expected_holding_days": 5,
  "rationale": "1-3 sentences."
}
```

> **`risk_percent` semantics:** always a **whole integer** representing percentage of capital. `2` means 2%, not 0.02. The SPA renders it directly as `"2% risk"`.

> **Execution and calendar overlays** (`revolut-tools-intraday-swing.md`, `cycles-sessions-events.md`) are narrative guidance only. They produce **no separate JSON files and no additional arrays**. All actionable items they inform flow through the standard `opportunities` array of the relevant strategy family.

### Market Regime (`data/context/market-regime.json`)

Contains the current market regime and per-strategy adjustments. The `strategy_adjustments` keys **must exactly match** the 5 tab IDs: `macro-volatility`, `earnings-momentum`, `post-shock`, `crypto`, `pair-trades`.

### Manifest (`data/meta/manifest.json`)

Controls tab order and file registry. Version `3.0.0` reflects the 5-family taxonomy.

### Schemas (`data/schemas/`)

JSON Schema files used by the validation workflow. One schema per data type:

- `watchlist.schema.json` — validates all 5 watchlist files
- `market-regime.schema.json` — validates `data/context/market-regime.json`
- `manifest.schema.json` — validates `data/meta/manifest.json`

---

## UI Behaviour

### Layout

- **Header:** App title (left) + user avatar / settings icon (right)
- **Market regime bar:** current regime, VIX, per-strategy adjustments (collapsed by default)
- **Tabs:** 5 strategy family tabs
- **Cards:** opportunity cards within each tab
- **Footer:** risk disclaimer (centered, small text)

### Mobile layout (≤768px)

- **Sticky header** at top (edge-to-edge, compact title + avatar)
- **Fixed bottom tab bar** with 5 strategy tabs (icon + short label, e.g. "Macro", "Earnings", "Rebounds", "Crypto", "Pairs")
- **Content scrolls** between header and bottom bar
- **Cards:** single-column, reduced padding
- **Footer:** hidden (bottom tab bar replaces it)
- **Very small screens (≤374px):** icon-only tabs, no labels
- **Touch targets:** minimum 44px (avatar 44px, tab buttons 56px height)
- **Safe area:** supports iPhone notch/home indicator via `env(safe-area-inset-bottom)`

### Card layout

```
[ STALE ]                                    (only when expected_holding_days elapsed)
[ HIGH Confidence · VERY HIGH IMPACT ]       (Confidence + Impact on same line, after STALE)
[ TICKER ]            [ sparkline ▯▯▯▯▯ ]   (sparkline: FX/metals only, in grid right)
[ Instrument full name ]
[ Live price  24h%  vs entry% ]              (crypto + FX/metals only)
────────────────────────────────────────────────────
[ LONG/SHORT ]  [ Xd ]  [ Y% risk ]  [ R:R 1:N ]
Entry / Target / Stop Loss / Earnings date
Rationale / Setup / Entry Trigger
```

Cards are sorted by **conviction** (high → moderate → low), then by **impact** (very high → high → medium → low, if present).

### Settings menu (user avatar, top right)

- Toggle: Live Prices (on/off)
- Toggle: Sparklines (on/off)
- To be wired to `AppSettings` state in a future phase

---

## Live Prices

| Asset class        | Source                                     | Status                                                        |
| ------------------ | ------------------------------------------ | ------------------------------------------------------------- |
| Crypto             | Coinlore API (live) + CoinGecko (sparkline)| ✅ Live — BTC, ETH, SOL, ADA, XRP, LINK, BNB, TON, AVAX, SUI |
| FX / Metals        | fawazahmed0 via jsDelivr                   | ✅ Live                                                       |
| Equities / Indices | Static JSON via GH Action (Yahoo Finance)  | ✅ Daily snapshots — sparkline + price + 24h %                |

---

## The 5 Strategy Families

| #   | Family                    | Tab ID              | JSON file                          | Strategy doc                          |
| --- | ------------------------- | ------------------- | ---------------------------------- | ------------------------------------- |
| 1   | Macro & Volatility Events | `macro-volatility`  | `watchlists/macro-volatility.json` | `strategies/macro-volatility.md`      |
| 2   | Earnings Momentum & Gaps  | `earnings-momentum` | `watchlists/pre-earnings.json`     | `strategies/pre-earnings-momentum.md` |
| 3   | Post-Shock Rebounds       | `post-shock`        | `watchlists/post-crash.json`       | `strategies/post-crash-rebound.md`    |
| 4   | Crypto & Digital Assets   | `crypto`            | `watchlists/crypto.json`           | `strategies/crypto-opportunities.md`  |
| 5   | Relative Value & Pairs    | `pair-trades`       | `watchlists/pair-trades.json`      | `strategies/pair-trades.md`           |

**Execution overlays** (no SPA tab — reference docs only):

- `strategies/revolut-tools-intraday-swing.md` — platform execution techniques
- `strategies/cycles-sessions-events.md` — seasonal and calendar timing

---

## GitHub Actions

| Workflow            | Trigger        | Purpose                                                    |
| ------------------- | -------------- | ---------------------------------------------------------- |
| `validate-json.yml` | PR to `main`   | Validate all JSON in `data/` against schemas               |
| `deploy.yml`        | Push to `main` | `npm ci → tsc → vite build → deploy dist/` to GitHub Pages |

---

## Risk

Trading involves risk of loss. Full disclaimer in SPA footer.
