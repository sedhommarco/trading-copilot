# Post-Crash Rebound Strategy

**Category:** Mean reversion / Recovery plays
**Trade Horizon:** 3-14 days (post-crash bounce)
**Typical Holding Period:** 5-10 days
**Best Market Regime:** Transitioning from panic to cautious bullish
**Watchlist file:** `data/watchlists/post-crash.json`

---

## Purpose

Capture the oversold bounce after sharp market crashes, corrections, or sector-specific selloffs. This strategy identifies stocks and indices that have been unjustifiably hammered and are poised for technical rebounds as panic subsides.

**Core thesis:** Markets overshoot to the downside during panic selloffs due to:

- Forced liquidations and margin calls
- Algorithmic selling cascades
- Emotional capitulation by retail investors
- Indiscriminate selling across quality names

**Technical setup:** Look for extreme oversold conditions (RSI <30, price -10%+ from recent highs) combined with emerging stabilization signals (volume exhaustion, bullish divergences, key support levels holding).

---

## Typical Instruments

**Primary (Revolut X / cash):**

- Quality US Mega Caps: AAPL, MSFT, GOOGL (sold off but fundamentally sound)
- Sector Leaders: JPM, UNH, XOM (oversold during broad panic)
- Growth Names: NVDA, TSLA, META (high-beta names that bounce hardest)

**Secondary (Revolut CFDs):**

- US500:CFD (S&P 500) for broad market rebounds
- NSDQ:CFD (Nasdaq 100) for tech-heavy recovery
- Individual sector CFDs if sector-specific crash

**Leverage:** 10-20x for indices (lower relative risk), 5-10x for individual stocks (used sparingly).

---

## JSON Watchlist Schema (SPA-aligned)

Post-Crash Rebounds uses the **canonical Trading Copilot watchlist schema** defined in `INSTRUCTIONS.TRADING.md` and `docs/index.md`. Each opportunity is a standard `Trade` item with a small number of rebound-specific fields.[^schema]

```json
{
  "last_updated": "ISO 8601 timestamp",
  "opportunities": [
    {
      "ticker": "BNTX",
      "company_name": "BioNTech SE",
      "direction": "long",
      "conviction": "high | moderate | low",
      "current_price": 0,
      "entry_zone": "string or number",
      "stop_loss": 0,
      "take_profit": 0,
      "risk_percent": 2,
      "expected_holding_days": 7,
      "crash_date": "YYYY-MM-DD",
      "drop_percent": -17.0,
      "rationale": "1-3 sentences: crash catalyst + rebound thesis + key risk."
    }
  ]
}
```

[^schema]: See `docs/INSTRUCTIONS.TRADING.md` and `app/src/types.ts` for the canonical `Trade` and `WatchlistData` types.

### Field notes

- `ticker`, `company_name`, `direction`, `conviction`, `current_price`, `entry_zone`, `stop_loss`, `take_profit`, `risk_percent`, `expected_holding_days`, `rationale` all follow the global schema.[^schema]
- `crash_date` and `drop_percent` are **strategy-specific optional fields** used to show when the shock occurred and how large the selloff was.
- Do **not** add file-level fields like `file_type`, `strategy`, `week_start`, `week_end`, or nested `crash_context` objects — the SPA ignores them and they break the JSON schemas.
- Do **not** add per-trade fields such as `setup_quality`, `position_size_pct`, `max_hold_days`, `tags`, `rsi`, `support_level`, etc. These were v1 concepts and are now handled via the textual `rationale` and external analysis tools.

---

## How the SPA renders Post-Shock cards

At runtime the SPA reads `data/watchlists/post-crash.json` into `WatchlistData` and treats each entry as a `Trade` with optional `crash_date` and `drop_percent`:[^schema]

- **Header:** `ticker` + `company_name` and a `conviction` badge (High / Moderate / Low).
- **Price & R:R row:** `current_price`, implied R:R from `entry_zone`, `stop_loss`, `take_profit`, and `risk_percent` as "X% risk".
- **Crash context:** If present, `drop_percent` is displayed as a "% from recent high" style badge; `crash_date` is used in the description.
- **Body:** `direction`, `expected_holding_days`, and the 1–3 sentence `rationale` summarising crash trigger, rebound thesis, and key risks.

Any richer analytics (RSI, volume exhaustion, support level, etc.) inform how you write the `rationale` and where you set `entry_zone`/`stop_loss`, but are **not** stored as separate JSON fields.

---

## Textbook Setup Examples

### Example 1: Index Rebound After Fed Shock (Long)

**Setup:**

- **Ticker**: US500 (S&P 500 index CFD)
- **Crash Trigger**: Fed unexpectedly hawkish, rate hike fears
- **Crash Date**: 2026-02-28
- **Entry Zone**: 4,850 (after ~-8% decline from 5,270 high)
- **Target**: 5,050 (+4.1% rebound)
- **Stop Loss**: 4,750 (-2.1%)
- **Conviction**: High

**Technical Indicators (for analysis, not stored):**

- RSI: 28 (extremely oversold)
- Volume: Selling exhaustion (declining volume on down days)
- Support: Holding 200-day MA at 4,840
- Divergence: RSI making higher lows while price makes lower lows

**Rationale example:**

> Fed commentary triggered an overreaction with no immediate policy change; quality mega caps sold off indiscriminately and VIX spiked near panic levels. With price holding the 200-day MA and oversold momentum starting to stabilise, a mean-reversion bounce toward 5,050 is likely if data does not further deteriorate.

**Risk focus:**

- Fed doubles down with more hawkish rhetoric
- Inflation or jobs data surprises negatively
- Geopolitical escalation compounds selling

---

### Example 2: Quality Mega Cap Oversold (Long)

**Setup:**

- **Ticker**: AAPL (Apple Inc.)
- **Crash Trigger**: Broad tech selloff on rate fears
- **Crash Date**: 2026-02-10
- **Entry Zone**: 165 (down ~-11% from 185 recent high)
- **Target**: 175 (+6.1%)
- **Stop Loss**: 160 (-3.0%)
- **Conviction**: Moderate

**Analysis (not stored as fields):**

- RSI: ~31 (oversold)
- Price: Testing 50-day MA support
- Fundamentals: Strong (recent earnings beat, growing services revenue)

**Rationale example:**

> Apple sold off with the broader tech complex despite solid fundamentals and no company-specific negative news. Price is testing the 50-day moving average after an ~11% drawdown; with earnings momentum intact, a bounce toward prior resistance around 175 is likely if index-level selling eases.

---

## Confidence Interpretation (conceptual)

The **`conviction`** field should be set using the same logic across all strategies:

- **High conviction**: Deeply oversold (RSI <30, drop >10%), clear panic trigger, strong fundamentals, stabilisation at support.
- **Moderate conviction**: Oversold but not extreme, mixed signals, decent fundamentals.
- **Low conviction**: Mild oversold, structural concerns, or messy tape — often better skipped.

Specific hit rates or position sizes (e.g., "10–15% of capital") are execution guidance, **not JSON fields**. The SPA simply renders the conviction label and risk percentage you provide.

---

## Risk Warnings (strategy-level)

- **False bottom risk (knife-catching):** Enter too early while selling continues. Mitigate by waiting for at least 1–2 days of price stabilisation and respecting tight stops.
- **Structural vs cyclical crashes:** Focus on cyclical, panic-driven crashes with intact fundamentals; avoid structurally impaired stories.
- **Leverage risk:** Indices with 10–20x leverage and stocks with 5–10x mean small price moves can translate into large P&L swings — position sizing and stops matter more than usual.
- **Regime shift:** If the market transitions into a sustained bear phase (VIX elevated for weeks, repeated support breaks), post-crash rebounds lose edge quickly and should be scaled back.

---

## Related Strategies

- **Macro & Volatility Events:** Crashes are often triggered by macro events (Fed, CPI, geopolitics); always cross-check the macro calendar.
- **Earnings Momentum & Gaps:** Avoid stacking pre-earnings momentum plays on top of fresh crash rebounds in the same name.
- **Crypto & Pairs:** In very high-volatility regimes, consider reducing single-name rebound exposure in favour of BTC-only crypto and relative-value pair trades.
