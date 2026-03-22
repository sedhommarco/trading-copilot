# Pair Trades

**Strategy Type:** Market-neutral relative value
**Typical Holding Period:** 5-14 days
**Target Instruments:** US equities (stocks or CFDs)
**Platform:** Revolut (long stock cash + short CFD, or both CFDs)
**Watchlist file:** `data/watchlists/pair-trades.json`

---

## Strategy Purpose

Profit from relative performance divergence between two correlated stocks or assets. Go long the expected outperformer and short the expected underperformer, reducing market risk and focusing on stock-specific alpha.

---

## Entry Criteria

### Pair Selection

1. **Same sector or theme:** High correlation (e.g. NVDA/AMD, COST/WMT, XOM/CVX).
2. **Divergent fundamentals:** One facing tailwinds, the other headwinds (earnings, guidance, margins).
3. **Mean reversion or continuation:** Either trade convergence (spread too wide) or divergence (spread breaking out).

### Confirmation

- **Catalyst clarity:** Identifiable reason for relative outperformance (earnings, sector rotation, margin trends).
- **Spread behaviour:** Visual confirmation that the spread is at an extreme or breaking out.
- **Correlation check:** Ensure stocks typically move together (>0.6 correlation) outside the catalyst window.

### Timing

- Enter when the catalyst is clear but not yet fully priced (e.g. 2–3 days before earnings of one leg).
- Avoid entering when both stocks report earnings in the same week unless the thesis explicitly depends on that.

---

## Exit Rules

1. **Target hit:** Close both legs when the spread reaches target (typically 5–15% relative move).
2. **Convergence/divergence stalls:** If spread stops moving for 3+ days, exit.
3. **Catalyst resolved:** Exit after the key earnings/news event has played out.
4. **Max hold:** 14 days (pairs can stay mispriced for extended periods; avoid becoming a bag holder).
5. **Stop loss:** Roughly -5% on spread (close both legs if spread moves against you by 5%).

---

## JSON Watchlist Schema (SPA-aligned)

Pair trades use the **canonical Trading Copilot watchlist schema** with a `PairTrade` sub-type. The watchlist file contains only `last_updated` and an `opportunities` array.[^schema]

```json
{
  "last_updated": "ISO 8601 timestamp",
  "opportunities": [
    {
      "ticker": "LLY/NVO",
      "company_name": "Eli Lilly vs Novo Nordisk",
      "direction": "long",
      "conviction": "high | moderate | low",
      "current_price": 0,
      "entry_zone": "string or number",
      "stop_loss": 0,
      "take_profit": 0,
      "risk_percent": 2,
      "expected_holding_days": 7,
      "long_ticker": "LLY",
      "short_ticker": "NVO",
      "long_entry": 0,
      "short_entry": 0,
      "long_stop": 0,
      "short_stop": 0,
      "target_spread": "+10%",
      "rationale": "1-3 sentences: pair thesis and key risks."
    }
  ]
}
```

[^schema]: See `docs/INSTRUCTIONS.TRADING.md` and `app/src/types.ts` for the canonical `Trade`, `PairTrade`, and `WatchlistData` types.

### Field notes

- `ticker` and `company_name` describe the **pair as a whole** (e.g. `"LLY/NVO"`, "Eli Lilly vs Novo Nordisk").
- Core trade fields (`direction`, `conviction`, `current_price`, `entry_zone`, `stop_loss`, `take_profit`, `risk_percent`, `expected_holding_days`, `rationale`) follow the global schema and are used for the card header/body and R:R display.
- Pair-specific fields `long_ticker`, `short_ticker`, `long_entry`, `short_entry`, `long_stop`, `short_stop`, `target_spread` enrich the card but are optional in the type system — use them for all live pairs in practice.
- Do **not** include file-level keys like `file_type`, `strategy`, `week_start`, `week_end`, or `previous_week_outcomes` — these were v1 concepts and are ignored by the SPA.
- Do **not** use nested `long_leg` / `short_leg` objects or extra numeric fields such as `position_size_usd`, `units`, `spread_target`, or `spread_stop`; the SPA expects a **flat** object per pair as above.

---

## How the SPA renders Pair Trade cards

At runtime the SPA reads `data/watchlists/pair-trades.json` into `WatchlistData` and treats each item that has `long_ticker`/`short_ticker` as a `PairTrade`:[^schema]

- **Header:** "Long {long_ticker} / Short {short_ticker}" plus `company_name` subtitle and a `conviction` badge.
- **Spread row:** Uses `target_spread`, `entry_zone`, and current live prices to infer expected relative performance.
- **Leg detail rows:** Show approximate entry zones and stops for each leg based on `long_entry`, `short_entry`, `long_stop`, and `short_stop`.
- **Body:** `expected_holding_days`, `risk_percent` as "X% risk", and a concise `rationale` explaining why the long leg should outperform the short leg.

Any additional analytics (pair correlation, beta, sector breakdown) should be reflected in the written rationale rather than added as extra JSON fields.

---

## Textbook Setup Example

**Pair:** Long COST / Short WMT.
**Thesis:** Costco’s premium membership model and strong comp sales data suggest continued outperformance, while Walmart faces margin pressure from e-commerce and wage inflation.

**Flattened JSON shape:**

```json
{
  "ticker": "COST/WMT",
  "company_name": "Costco vs Walmart",
  "direction": "long",
  "conviction": "high",
  "current_price": 0,
  "entry_zone": "long 1005-1015 / short 88-90",
  "stop_loss": 0,
  "take_profit": 0,
  "risk_percent": 2,
  "expected_holding_days": 7,
  "long_ticker": "COST",
  "short_ticker": "WMT",
  "long_entry": 1010,
  "short_entry": 89,
  "long_stop": 970,
  "short_stop": 94,
  "target_spread": "+12%",
  "rationale": "COST is benefiting from premium membership growth and stronger comps, while WMT faces margin pressure. Expect COST to outperform WMT by ~12% over the next 7–10 days around their earnings window."
}
```

The SPA shows this as a single pair card; it does **not** model separate long/short positions in the JSON.

---

## Execution on Revolut

### Long Leg

- Use **Revolut cash account** (no leverage) for the long leg where possible.
- Prefer limit orders near the specified `long_entry` to reduce slippage.

### Short Leg

- Use **Revolut CFD** for the short leg.
- Check availability to short; not all stocks are borrowable.
- Use limit orders near the specified `short_entry`.

### Timing

- Execute both legs **within the same session** to minimise beta exposure.
- If one leg fails to fill within the planned range, cancel or re-evaluate the other.

---

## Strategy Evolution Notes

- Track **spread accuracy**; if spreads consistently miss targets, tighten entry criteria or reduce `target_spread`.
- Monitor **execution slippage**; if average slippage >1%, favour limit orders and narrower entry zones.
- Analyse **beta risk events**; if pairs regularly break during macro shocks (e.g. FOMC, war headlines), reduce size or avoid opening new pairs into such events.

---

## AI Refresh Protocol

### Data Gathering Checklist

1. **Sector rankings:** Finviz ([finviz.com/groups.php?g=sector&v=110&o=-perf1w](https://finviz.com/groups.php?g=sector&v=110&o=-perf1w)) — 1w/1m/3m performance for 11 GICS sectors.
2. **Candidate pairs:** From diverging sectors, identify top 3 stocks in the winning sector + bottom 3 in the losing sector.
3. **Correlation verification:** PortfolioVisualizer ([portfoliovisualizer.com/asset-correlations](https://www.portfoliovisualizer.com/asset-correlations)) — 1Y and 3Y correlation for each pair. Intra-sector minimum 0.6, cross-sector 0.3-0.6.
4. **Spread Z-score:** TradingView custom ratio chart (`{TICKER1}/{TICKER2}`) — visual or calculated Z-score vs 60-90 day mean. Z>2 or Z<-2 = mean reversion candidate.
5. **Fundamental divergence:** StockAnalysis financials, TipRanks forecast — build comparison table (forward P/E, revenue growth, last EPS surprise, analyst consensus, recent upgrades/downgrades). Long leg must win >=3 of 6 metrics.
6. **Event calendar:** Check if either leg has earnings within 14 days.
7. **Short availability:** Verify short leg available as Revolut CFD.

### Pair Archetypes

| Archetype | Long Profile | Short Profile | Regime |
|-----------|-------------|---------------|--------|
| Energy vs Airlines | Oil producer benefiting from spike | Airline with high fuel exposure | Oil shock |
| Quality vs Reset | Executing with margin expansion | Same-sector peer with guidance cut | Any |
| Defensive vs Cyclical | Staple/utility/gold miner | High-beta cruise/discretionary | Risk-off |
| Safe Haven vs Index | GLD, TLT | SPY, QQQ | Stagflation |
| BTC Dominance | BTC | High-beta altcoin | Risk-off crypto |
| Sector Rotation | Gaining relative strength | Losing relative strength | Regime transition |

### Signal Scoring Matrix

- **HIGH (all 4):** Active macro catalyst directly benefiting one leg, hurting other + fundamental divergence >=4/6 metrics + spread Z>2 or clear catalyst within 7d + no conflicting earnings for either leg.
- **MODERATE (2-3 of 4):** Catalyst present but gradual, Z 1-2, divergence >=3/6.
- **LOW:** Catalyst timing uncertain, spread near fair value, binary event upcoming.
- **DISQUALIFIED:** Both legs report earnings same week, correlation <0.3 intra-sector, short leg not on Revolut CFD, >2 pairs with same stock in one leg, target spread <5%, both legs same direction vs market.

### Entry/Exit Precision

- **Long leg entry:** Nearest support to support +1.5%.
- **Short leg entry:** Nearest resistance to resistance -1.5%.
- Both legs same session. If one doesn't fill, don't leave other open.
- **Spread stop:** Exit both when spread moves against by half the target.
- **Time stop:** If spread hasn't moved 25% of target in 3 days, exit.
- **Catalyst exit:** Within 1 trading day of key event completing.

### Target Spread Calculation

Target spread = long leg expected gain + short leg expected gain. Must be achievable based on pair's 20-day average daily spread movement x expected_holding_days. Target <= 1.5x this figure.

### Cross-Validation

1. **Concentration:** No stock in >2 active pairs (currently CCL in 3 — fix this).
2. **Directional neutrality:** Sum net dollar exposure across all pairs ~ zero.
3. **Regime:** High-vol -> tighten spread stop to -3% instead of -5%.
4. **Correlation with other strategies:** If a leg appears in another file, note correlated exposure.
5. **Price freshness:** Both legs' current_price within 2% of actual.

### Common Mistakes

1. Same stock in too many pairs (CCL in 3 pairs).
2. Stock long in one strategy, short in another (CCL long in post-crash, short in pairs).
3. Same-thesis pairs counted separately (XOM/UAL, XOM/ALK, CVX/DAL all = "oil up, airlines down").
4. Round-number target spreads — derive from technical levels.
5. Beta mismatch unaddressed — note if legs have very different betas.
6. Missing spread stop — every pair must specify spread stop condition.
