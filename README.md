# 📈 Trading Copilot

AI-powered trading system with automated watchlist generation, trade journaling, and position sizing for systematic swing trading strategies.

> ⚠️ **HIGH RISK WARNING**: This system targets aggressive returns (100K from $1K in <5 years). You risk losing 100% of allocated capital. CFDs with leverage can amplify losses. Only risk money you can afford to lose.

---

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/sedhommarco/trading-copilot.git
cd trading-copilot
```

### 2. Open the SPA

**Option A - GitHub Pages (Recommended):**

1. Go to repo Settings → Pages
2. Set Source to "main" branch, "/" root
3. Visit: `https://sedhommarco.github.io/trading-copilot/app/`

**Option B - Local:**

```bash
# Simply open app/index.html in your browser
open app/index.html  # macOS
start app/index.html  # Windows
xdg-open app/index.html  # Linux
```

### 3. Weekly Refresh via Perplexity

Every Sunday at 8:00 PM CET, run this command in Perplexity Trading Copilot Space:

```
Execute Weekly Refresh - Sunday [DATE]

Load all JSON files from GitHub, compare predictions vs outcomes, generate new watchlists, and commit updates using GitHub MCP tools.

Week: [MONDAY] to [SUNDAY]
```

---

## 📂 Repository Structure

```
trading-copilot/
├── data/                          # All trading data (JSON files)
│   ├── watchlists/                # 6 strategy watchlists
│   │   ├── pre-earnings.json
│   │   ├── post-crash.json
│   │   ├── volatility.json
│   │   ├── crypto.json
│   │   ├── pair-trades.json
│   │   └── macro-events.json
│   ├── context/
│   │   └── market-regime.json     # Current market assessment
│   ├── journal/
│   │   └── trade-history.json     # All closed trades
│   └── meta/
│       ├── manifest.json          # Data freshness tracker
│       └── schema.json            # JSON validation schema
├── archive/                       # Weekly snapshots (auto-archived)
│   └── 2026/
│       └── week-10/
├── docs/
│   └── INSTRUCTIONS.md            # Full instructions for Perplexity
├── app/
│   └── index.html                 # Single-page application (HTML + Vanilla JS)
└── README.md                      # This file
```

---

## 🎯 Trading Strategies

### 1. Pre-Earnings Momentum

**Target**: Stocks 2-5 days before earnings with strong analyst upgrades and bullish momentum.

**Entry Criteria**:

- Estimate revisions +10% in past 2 weeks
- Price above 20-day MA, RSI 55-70
- Options IV rising but not extreme

**Exit**: Close 50% day before earnings, exit remainder on gap (>5% up or >3% down).

---

### 2. Post-Crash Rebound

**Target**: Liquid large/mid-caps that dropped >8% in single session but fundamentals intact.

**Entry Criteria**:

- News-driven drop (not fraud/structural issues)
- Technical support level nearby
- High short interest (potential squeeze)

**Exit**: 50% at +5% rebound, trail remainder at +3% for +10-15% target.

---

### 3. Volatility Plays

**Target**: Gold, silver, indices, commodities around macro events or breakouts.

**Instruments**: XAU/USD, US500, NAS100, DE40, USOIL

**Setup**: Breakout triggers, mean-reversion fades, macro event reactions.

---

### 4. Crypto Opportunities

**Target**: BTC, ETH, SOL, XRP, ADA range breakouts with tight risk control.

**Leverage**: Maximum 3x (extreme volatility).

**Platform**: Revolut X (lower fees, limit orders, API access).

---

### 5. Pair Trades

**Target**: Long/short pairs where one name expected to outperform (earnings, sector rotation, quality vs distressed).

**Example**: Long NVDA / Short AMD into earnings, Long COST / Short WMT on consumer trends.

---

### 6. Macro Events

**Target**: FOMC, NFP, CPI, PMI reactions. Setups include volatility spikes, directional breakouts, or staying flat.

**Action**: Reduce exposure before high-impact events, trade post-data moves.

---

## 💰 Risk Management

### Position Sizing (Based on $1000 Capital)

| Risk Level       | Max Loss | Use Case                |
| ---------------- | -------- | ----------------------- |
| **Conservative** | 2% ($20) | Uncertain setups        |
| **Moderate**     | 3% ($30) | Default high-conviction |
| **Aggressive**   | 5% ($50) | Exceptional edge only   |

**Daily Limit**: 10% of capital ($100) across all trades.

**Monthly Limit**: 20% drawdown ($200) triggers mandatory pause.

### Leverage Guidelines

- **CFDs (stocks)**: 5x leverage
- **CFDs (indices/commodities)**: Up to 10x
- **Cash stocks**: 1x (no leverage)
- **Crypto**: Maximum 3x

---

## 📊 Data Access for SPA

### GitHub Raw URLs

The SPA fetches JSON data from:

```
https://raw.githubusercontent.com/sedhommarco/trading-copilot/main/data/watchlists/pre-earnings.json
```

### Local Fallback

If GitHub is unreachable, the SPA falls back to local `./data/` folder (when HTML opened from filesystem).

### Data Freshness

Check `data/meta/manifest.json` for last update timestamps. Data older than 10 days is considered stale.

---

## 🔄 Weekly Workflow

### Sunday 8:00 PM CET - Weekly Refresh

1. **Perplexity Command**: Run "Execute Weekly Refresh" in Trading Copilot Space
2. **Perplexity Actions**:
   - Loads all JSON files from GitHub
   - Compares predictions vs actual outcomes
   - Generates new watchlists for upcoming week
   - Uses GitHub MCP tools to commit updates directly
3. **You Review**: Check GitHub commit history for changes
4. **SPA Auto-Updates**: Refresh button in app pulls latest data

### Daily Workflow (Optional)

**Morning Scan (8:00 AM CET)**: EU session pre-market check.

**Pre-US Open (3:00 PM CET)**: US futures, pre-market movers, earnings checks.

**Trade Execution**: Via Revolut app (stocks, CFDs, crypto via Revolut X).

**Evening Journal**: Log closed trades using Perplexity command to update `trade-history.json`.

---

## 🛠️ Technical Details

### SPA Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Data**: Fetched from GitHub raw URLs via `fetch()` API
- **Offline Support**: Falls back to local `./data/` folder
- **No Dependencies**: Zero npm packages, runs anywhere

### GitHub Integration

**Perplexity uses GitHub MCP tools to update files**:

- `create_or_update_file`: Updates single JSON file
- `push_files`: Batch updates multiple files
- `get_file_contents`: Reads current data

**No manual copy-paste required!**

### Hosting Options

**Option 1 - GitHub Pages (Free, Public):**

```bash
# Enable in repo Settings → Pages → Source: main branch, / root
# Access at: https://sedhommarco.github.io/trading-copilot/app/
```

**Option 2 - Local (Offline):**

```bash
# Just open app/index.html in browser
# Works on PC and smartphone (save to local folder)
```

---

## 📱 Mobile Usage

### Android/iOS

1. **GitHub Pages**: Bookmark `https://sedhommarco.github.io/trading-copilot/app/` in mobile browser
2. **Local**: Save repo to phone, open `app/index.html` in Chrome/Safari
3. **Add to Home Screen**: Create app-like shortcut

### Features

- ✅ Responsive design (works on all screen sizes)
- ✅ Manual refresh button
- ✅ Auto-refresh toggle (optional)
- ✅ Offline fallback to local data

---

## 🔒 Security & Privacy

### Public Repository Considerations

- **Data Visible**: Anyone can see your watchlists and trade history
- **No Sensitive Info**: JSON files contain only tickers, not account numbers or personal data
- **Trade Execution**: Done externally via Revolut (not connected to this repo)

### If You Prefer Privacy

Make repository **private** (free on GitHub):

```bash
# Settings → Danger Zone → Change visibility → Make private
```

GitHub Pages still works with private repos (but requires authentication).

---

## 🤝 Contributing

This is a personal trading system, but if you want to fork and adapt:

1. Fork the repository
2. Modify strategies in `docs/INSTRUCTIONS.md`
3. Adjust JSON schemas in `data/meta/schema.json`
4. Customize SPA in `app/index.html`

---

## 📜 License

MIT License - Use at your own risk. No warranties or guarantees.

---

## 📞 Support

**Issues with Perplexity Integration?**

- Check `docs/INSTRUCTIONS.md` for full instructions
- Verify GitHub MCP tools are enabled in Perplexity Space settings

**Issues with SPA?**

- Check browser console for fetch errors
- Verify GitHub raw URL is correct
- Test local fallback by opening `app/index.html` directly

---

## 🎯 Path to $100K Goal

**Starting Capital**: $1,000
**Target**: $100,000 in <5 years
**Required Annual Return**: ~100% compounded

**Realistic Probability**: <5% (most retail traders fail)

**Success Requirements**:

- 70-75% win rate with 2:1 risk/reward
- Zero catastrophic losses (no single trade >20% loss)
- 250+ trades over 5 years
- Survive multiple 20-30% drawdowns
- Discipline to follow system (no revenge trading, FOMO)

**Early Warning Triggers**:

- 3 consecutive losses → Reduce position size to 1%
- 10% monthly drawdown → Pause new trades
- Win rate <50% for 20 trades → System may be broken

---

**Built with ❤️ for systematic swing trading. Trade smart, manage risk, survive.**
