# 📈 Trading Copilot

AI-powered trading system with automated watchlist generation, trade journaling, and systematic strategy execution across multiple timeframes and instruments.

> ⚠️ **Trading involves substantial risk of loss.** This system targets aggressive returns, which requires aggressive risk-taking. You could lose 100% of allocated capital. See full disclaimer in SPA footer.

---

## 🚀 Quick Start

### View the Dashboard

**GitHub Pages (Recommended):**
- Visit: [`https://sedhommarco.github.io/trading-copilot/app/`](https://sedhommarco.github.io/trading-copilot/app/)

**Local:**
```bash
# Clone and open
git clone https://github.com/sedhommarco/trading-copilot.git
cd trading-copilot
open app/index.html  # macOS/Linux: xdg-open / Windows: start
```

### Configure Perplexity Spaces

See complete setup guide: [`docs/setup/spaces-setup.md`](docs/setup/spaces-setup.md)

**Two spaces required:**
1. **Trading Copilot** (execution): Uses [`docs/INSTRUCTIONS.TRADING.md`](docs/INSTRUCTIONS.TRADING.md)
2. **Trading Copilot Development** (architecture): Uses [`docs/INSTRUCTIONS.DEV.md`](docs/INSTRUCTIONS.DEV.md)

---

## 📂 Repository Structure

```
trading-copilot/
├── app/
│   └── index.html                 # Single-page dashboard (HTML + JS + CSS)
├── data/
│   ├── watchlists/                # Strategy opportunities (6 strategies)
│   ├── context/                   # Market regime analysis
│   ├── journal/                   # Transaction log & open positions
│   └── meta/                      # Manifest, UI config, schemas
├── archive/
│   ├── index.json                 # Archive catalog
│   └── 2026/week-XX/              # Weekly data snapshots
├── docs/
│   ├── INSTRUCTIONS.TRADING.md    # Trading space instructions
│   ├── INSTRUCTIONS.DEV.md        # Development space instructions
│   ├── INSTRUCTIONS.md            # Meta-file (navigation hub)
│   ├── setup/                     # Configuration guides
│   │   ├── spaces-setup.md
│   │   ├── github-setup.md
│   │   └── capital-and-user-profile.md
│   ├── strategies/                # Per-strategy documentation
│   └── journal/                   # Journal schema docs
└── README.md                      # This file
```

---

## 🎯 Trading Strategies

Six core strategies with dedicated watchlists:

1. **Pre-Earnings Momentum** — High-conviction plays 2-5 days before earnings
2. **Post-Crash Rebound** — Oversold bounces after news-driven drops
3. **Volatility Plays** — XAU, indices, commodities on macro events
4. **Crypto Opportunities** — BTC, ETH, SOL breakouts with tight risk
5. **Pair Trades** — Long/short pairs exploiting relative value
6. **Macro Events** — FOMC, CPI, NFP reactions

**Plus two new strategies in development:**
7. **Revolut Tools (Intraday/Swing)** — Indicator-based setups using MACD, oscillators
8. **Cycles/Sessions/Events** — Seasonal plays around Christmas, F1, sports finals

Full strategy documentation: [`docs/strategies/`](docs/strategies/)

---

## 📊 How It Works

### Weekly Workflow (Sunday 19:00 CET)

1. **Trading Copilot Space**: Run weekly refresh command
   - Analyzes market regime
   - Generates/updates watchlists for all strategies
   - Updates journal with notes and recommendations
   - Commits changes via GitHub MCP tools

2. **Trading Copilot Development Space**: Run weekly review command
   - Compares predictions vs outcomes from archive
   - Refactors code, schemas, and strategies
   - Updates documentation
   - Creates development branches and PRs

3. **SPA Auto-Refreshes**: Dashboard pulls latest data from GitHub

### Daily Usage

- Open SPA dashboard to view current opportunities
- Execute trades via Revolut/Revolut X
- Ask Trading Copilot ad-hoc questions about setups
- Log completed trades (Perplexity updates journal JSON)

---

## 🛠️ Technical Details

### SPA Technology

- **Stack**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Data Source**: GitHub raw URLs via `fetch()` API
- **Offline Support**: Falls back to local `./data/` folder
- **Zero Dependencies**: No npm packages, runs anywhere

### GitHub Integration

Perplexity spaces use GitHub MCP tools to read/write repository files directly:
- `get_file_contents`: Read current data
- `create_or_update_file`: Update single file
- `push_files`: Batch update multiple files

No manual copy-paste required.

### Hosting

**GitHub Pages** (free, public):
- Enable in repo Settings → Pages → Source: `main` branch, `/` root
- Access at: `https://sedhommarco.github.io/trading-copilot/app/`

**Local**: Simply open `app/index.html` in any browser

---

## 📚 Documentation

### Essential Reading

- **[INSTRUCTIONS.TRADING.md](docs/INSTRUCTIONS.TRADING.md)** — Full instructions for Trading Copilot space
- **[INSTRUCTIONS.DEV.md](docs/INSTRUCTIONS.DEV.md)** — Full instructions for Development space
- **[Spaces Setup Guide](docs/setup/spaces-setup.md)** — Complete A-Z configuration
- **[Capital & Risk Profile](docs/setup/capital-and-user-profile.md)** — Trading constraints and platforms

### Strategy Details

Each strategy has dedicated documentation in [`docs/strategies/`](docs/strategies/) covering:
- Purpose & trade horizon
- Required JSON fields
- SPA UI expectations
- Confidence levels and risks
- Textbook setup examples

### Journal System

- **[Transaction Schema](docs/journal/schema-transactions.md)** — Per-trade log format
- **[Position Schema](docs/journal/schema-positions.md)** — Open positions snapshot format

---

## 💰 Risk Management

**Starting Capital**: $1,000  
**Position Sizing**: 2-5% risk per trade ($20-$50)  
**Daily Limit**: 10% capital ($100)  
**Monthly Drawdown Pause**: 20% ($200)

**Leverage Guidelines**:
- CFDs (stocks): 5x max
- CFDs (indices/commodities): 10x max
- Crypto: 3x max
- Cash stocks: 1x (no leverage)

Full risk framework: [`docs/setup/capital-and-user-profile.md`](docs/setup/capital-and-user-profile.md)

---

## 📱 Mobile Usage

1. Bookmark GitHub Pages URL in mobile browser
2. Or save repo locally and open `app/index.html`
3. Add to home screen for app-like experience

✅ Responsive design  
✅ Manual & auto-refresh  
✅ Offline fallback

---

## 🔒 Privacy

**Public repository** = Anyone can see watchlists and trade history.

To make private:
- Settings → Danger Zone → Change visibility → Make private
- GitHub Pages still works (requires authentication)

No sensitive data (account numbers, passwords) is stored in JSON files.

---

## 🤝 Contributing

This is a personal trading system. To adapt for your use:

1. Fork the repository
2. Modify strategies in `docs/strategies/`
3. Adjust JSON schemas
4. Customize SPA UI

See [`docs/INSTRUCTIONS.DEV.md`](docs/INSTRUCTIONS.DEV.md) for development guidelines.

---

## 📜 License

MIT License — Use at your own risk. No warranties or guarantees.

---

## 📞 Support

**Questions about:**
- Trading logic: [`docs/INSTRUCTIONS.TRADING.md`](docs/INSTRUCTIONS.TRADING.md)
- Development: [`docs/INSTRUCTIONS.DEV.md`](docs/INSTRUCTIONS.DEV.md)
- Setup: [`docs/setup/spaces-setup.md`](docs/setup/spaces-setup.md)
- GitHub integration: [`docs/setup/github-setup.md`](docs/setup/github-setup.md)

---

**Built for systematic swing trading. Trade smart, manage risk, survive.**
