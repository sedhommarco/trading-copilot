# Trading Copilot — Technical Documentation

**Repository:** `sedhommarco/trading-copilot`  
**Live app:** GitHub Pages (see README for URL)  
**Last updated:** 2026-03-10

---

## Overview

Trading Copilot is a minimal, static SPA that surfaces current trading opportunities and strategy-level context. It is a **recommendation viewer / playbook**, not a trading platform or P&L engine.

The system is driven by two Perplexity Spaces:

| Space | Role | Instructions |
|---|---|---|
| **Trading Copilot** | Execution — produce recommendations, watchlists, market context | [`docs/INSTRUCTIONS.TRADING.md`](./INSTRUCTIONS.TRADING.md) |
| **Trading Copilot Development** | Architecture, refactoring, product ownership | [`docs/INSTRUCTIONS.DEV.md`](./INSTRUCTIONS.DEV.md) |

---

## Application Architecture

### Current stack

- **UI:** Vanilla HTML + CSS + JavaScript SPA (`app/index.html`)
- **Hosting:** GitHub Pages (static)
- **Deployment:** GitHub Actions on push to `main`
- **Data:** Static JSON files in `data/` (no backend, no database)

### Planned migration (future phase)

- React + TypeScript + Vite
- Dark theme, preserved from current design
- Yahoo Finance for live prices (pluggable abstraction)

---

## Repository Structure

```
trading-copilot/
├── README.md                          # Short project description and run instructions
├── app/
│   ├── index.html                     # SPA (single file, vanilla JS)
│   └── favicon.ico
├── data/
│   ├── watchlists/                    # Per-strategy opportunity lists (JSON)
│   ├── context/
│   │   └── market-regime.json         # Current market regime and strategy adjustments
│   ├── schemas/                       # JSON Schema definitions for data validation
│   └── meta/
│       └── manifest.json              # Tab order, file registry
├── docs/
│   ├── index.md                       # This file — main technical reference
│   ├── INSTRUCTIONS.DEV.md            # Dev Space behaviour definition
│   ├── INSTRUCTIONS.TRADING.md        # Trading Space behaviour definition
│   ├── setup/
│   │   ├── spaces-setup.md            # Perplexity Spaces configuration
│   │   └── github-setup.md            # GitHub Actions, MCP, Pages setup
│   └── strategies/                    # Per-strategy documentation
│       ├── pre-earnings-momentum.md
│       ├── post-crash-rebound.md
│       ├── volatility-plays.md
│       ├── crypto-opportunities.md
│       ├── pair-trades.md
│       ├── macro-events.md
│       ├── revolut-tools-intraday-swing.md
│       └── cycles-sessions-events.md
├── schemas/                           # (legacy — migrate to data/schemas/ in Phase 2)
└── .github/
    └── workflows/
        ├── validate-json.yml          # JSON schema validation on PR
        └── deploy.yml                 # Build + deploy to GitHub Pages
```

---

## Data Layer

### Watchlists (`data/watchlists/*.json`)

One JSON file per strategy. Each file contains an array of opportunity objects. The Trading Copilot space **overwrites** these files on each refresh — no weekly snapshots.

Minimal opportunity shape:

```json
{
  "ticker": "AAPL",
  "name": "Apple Inc.",
  "direction": "long",
  "timeframe": "swing",
  "confidence": "high",
  "risk_pct": "1-2%",
  "risk_reward": "1:3",
  "catalyst": "Earnings beat expected",
  "notes": "..."
}
```

**Not included:** position sizes, nominal amounts, capital allocations, user-specific constraints.

### Market Regime (`data/context/market-regime.json`)

Contains the current market regime classification and per-strategy adjustments. Shape:

```json
{
  "regime": "trending_bullish",
  "vix": "14-16",
  "sentiment": "cautiously optimistic",
  "updated": "2026-03-10",
  "strategy_adjustments": {
    "pre-earnings-momentum": "Favour long setups. Widen profit targets in low-vol.",
    "volatility-plays": "Avoid long vol. Consider short vol on spikes above 20."
  }
}
```

### Manifest (`data/meta/manifest.json`)

Controls tab order and file registry.

```json
{
  "ui": {
    "tab_order": ["pre-earnings", "post-crash", "volatility", "crypto", "pair-trades", "macro-events"]
  },
  "watchlists": [
    { "id": "pre-earnings", "file": "data/watchlists/pre-earnings.json", "label": "Pre-Earnings" }
  ]
}
```

### Schemas (`data/schemas/`)

JSON Schema files used by the validation workflow. One schema per data type.

---

## UI Behaviour

### Layout

- **Header:** `📊 Trading A¡dvisor` (left) + settings icon (right, stubbed)
- **Body:** Strategy tabs, each containing opportunity cards
- **Footer:** Risk disclaimer + copyright (centered, small text)

### Card layout (per opportunity)

```
[ STALE ]                          ← badge, only when stale
[ TICKER ]         [ sparkline □ ] ← sparkline in bordered rectangle with grid
[ Instrument full name ]
[ Live price — e.g. 178.25 USD ]
────────────────────────────────
Direction: Long
Timeframe: Swing (5–10 days)
Confidence: High
Risk: 1–2% of capital
R:R: 1:3
Catalyst: ...
```

### Removed from UI

- Trade journal (tab, view, all data)
- Archive references
- Status bar (last refreshed, next expected)
- Manual/auto refresh controls
- Favourites / star badges
- "Trades: N" counts
- "Week: YYYY-MM-DD to YYYY-MM-DD" label
- Position sizes and nominal amounts

---

## Live Prices

- Provider: **Yahoo Finance** (unofficial, no API key required)
- Abstraction: a simple fetcher module with a documented swap interface
- Fallback: display `Live price unavailable` when fetch fails
- Configuration: no env vars needed for Yahoo Finance; documented in `docs/setup/github-setup.md`

---

## Strategies

See `docs/strategies/` for per-strategy documentation.

Active strategies:
1. Pre-Earnings Momentum
2. Post-Crash Rebound
3. Volatility Plays
4. Crypto Opportunities
5. Pair Trades
6. Macro Events
7. Revolut Tools (Intraday/Swing)
8. Cycles / Sessions / Events

---

## GitHub Actions

| Workflow | Trigger | Purpose |
|---|---|---|
| `validate-json.yml` | PR to `main` | Validate all JSON in `data/` against schemas in `data/schemas/` |
| `deploy.yml` | Push to `main` | Build (or copy) `app/` to GitHub Pages |

---

## Setup Guides

- [Perplexity Spaces setup](./setup/spaces-setup.md) — configure both spaces
- [GitHub setup](./setup/github-setup.md) — Actions, MCP, Pages, API keys

---

## Risk

Trading involves risk of loss. Full disclaimer in SPA footer.
