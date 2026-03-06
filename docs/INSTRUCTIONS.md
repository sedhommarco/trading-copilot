# Trading Copilot Instructions (Meta-File)

**Last Updated:** 2026-03-06  
**Purpose:** Navigation hub for the two Trading Copilot Perplexity Spaces

---

## Two Perplexity Spaces

The Trading Copilot system uses **two distinct Perplexity Spaces**:

### 1. Trading Copilot (Execution Space)

**Purpose:** Live trading analysis, forecasts, watchlist generation, and trading consultancy.

**Instruction File:** [`docs/INSTRUCTIONS.TRADING.md`](./INSTRUCTIONS.TRADING.md)

**Key Responsibilities:**
- Generate and update weekly watchlists for all strategies
- Analyze market regime and adjust recommendations
- Provide trade entry/exit guidance and risk analysis
- Update trading journal with notes and recommendations
- Respond to ad-hoc trading questions

**Weekly Command:** Sunday 19:00 CET
```
Trading Copilot — Weekly Refresh [START_DATE to END_DATE]
```

---

### 2. Trading Copilot Development (Development Space)

**Purpose:** Product ownership, architecture, refactoring, strategy design, and documentation.

**Instruction File:** [`docs/INSTRUCTIONS.DEV.md`](./INSTRUCTIONS.DEV.md)

**Key Responsibilities:**
- Refactor and evolve repository structure
- Design and document trading strategies
- Maintain JSON schemas and data formats
- Improve SPA UI/UX
- Manage archive system and historical analysis
- Create development branches and PRs
- Update documentation

**Weekly Command:** Sunday 19:00 CET (after Trading Copilot refresh)
```
Trading Copilot Development — Weekly Review [START_DATE to END_DATE]
```

---

## Quick Links

### Setup Guides

- [Perplexity Spaces Configuration](./setup/spaces-setup.md) — Complete A-Z setup for both spaces
- [GitHub Integration](./setup/github-setup.md) — MCP configuration, repository access, hosting
- [Capital and User Profile](./setup/capital-and-user-profile.md) — Trading capital, risk constraints, platforms

### Strategy Documentation

- [Pre-Earnings Momentum](./strategies/pre-earnings-momentum.md)
- [Post-Crash Rebound](./strategies/post-crash-rebound.md)
- [Volatility Plays](./strategies/volatility-plays.md)
- [Crypto Opportunities](./strategies/crypto-opportunities.md)
- [Pair Trades](./strategies/pair-trades.md)
- [Macro Events](./strategies/macro-events.md)
- [Revolut Tools (Intraday/Swing)](./strategies/revolut-tools-intraday-swing.md)
- [Cycles/Sessions/Events](./strategies/cycles-sessions-events.md)

### Journal Documentation

- [Transaction Schema](./journal/schema-transactions.md)
- [Position Schema](./journal/schema-positions.md)

---

## Repository Structure

```
trading-copilot/
├── README.md                      # Project overview
├── app/
│   ├── index.html                 # Single-page application
│   └── favicon.ico
├── data/
│   ├── watchlists/                # Strategy opportunities
│   ├── context/                   # Market regime
│   ├── journal/                   # Transactions and positions
│   └── meta/                      # Manifest and UI config
├── docs/
│   ├── INSTRUCTIONS.md            # This file (meta)
│   ├── INSTRUCTIONS.TRADING.md    # Trading space instructions
│   ├── INSTRUCTIONS.DEV.md        # Dev space instructions
│   ├── setup/                     # Configuration guides
│   ├── strategies/                # Per-strategy docs
│   └── journal/                   # Journal schemas
└── archive/
    ├── index.json                 # Archive catalog
    └── 2026/week-XX/              # Weekly snapshots
```

---

## Getting Started

### For Trading (Execution)

1. Read [`docs/INSTRUCTIONS.TRADING.md`](./INSTRUCTIONS.TRADING.md)
2. Configure Trading Copilot space per [`docs/setup/spaces-setup.md`](./setup/spaces-setup.md)
3. Run weekly refresh command every Sunday 19:00 CET

### For Development (Architecture & Refactoring)

1. Read [`docs/INSTRUCTIONS.DEV.md`](./INSTRUCTIONS.DEV.md)
2. Configure Trading Copilot Development space per [`docs/setup/spaces-setup.md`](./setup/spaces-setup.md)
3. Run weekly review command every Sunday 19:00 CET (after trading refresh)

---

## Risk Disclaimer

Trading involves substantial risk of loss. This system targets aggressive returns, which requires aggressive risk-taking. You could lose 100% of allocated capital. Past performance does not guarantee future results. Full disclaimer visible in SPA footer.

---

## Support

For questions about:
- **Trading logic and strategy execution:** See `docs/INSTRUCTIONS.TRADING.md`
- **Repository structure and development:** See `docs/INSTRUCTIONS.DEV.md`
- **Space configuration:** See `docs/setup/spaces-setup.md`
- **GitHub integration:** See `docs/setup/github-setup.md`
