# Earnings Momentum & Gaps

**Category:** Event-driven momentum
**Trade Horizon:** 1–10 days
**Best Market Regime:** Bullish, Neutral
**Watchlist file:** `data/watchlists/pre-earnings.json`

> **Scope broadened from v1:** Originally "Pre-Earnings" only. Now also includes post-earnings gap follow-throughs (continuation of a large gap in the direction of the surprise) and strong analyst revision plays triggered by earnings catalysts.

---

## Purpose

Capture momentum in stocks where a known earnings catalyst creates a high-probability directional setup — either in the run-up (1–7 days before) or as a gap follow-through (1–3 days after a decisive print). The edge is the presence of a clear catalyst with institutional positioning behind it.

**Core sub-types:**

| Sub-type                    | Entry timing                     | Exit timing                         |
| --------------------------- | -------------------------------- | ----------------------------------- |
| Pre-earnings run-up         | 1–7 days before earnings         | 1–3 days before (avoid binary risk) |
| Earnings gap follow-through | Day after earnings print         | 1–3 days post-gap                   |
| Analyst revision momentum   | After upgrade/downgrade catalyst | 3–7 days                            |

---

## Typical Instruments

- **Equities (Revolut X):** Large-cap tech, growth, sector leaders with imminent earnings
- **Sector ETFs:** SOXX, XLK, XLV when broad earnings season themes are dominant
- **Index CFDs:** NAS100, US500 for sector-wide earnings momentum

---

## Canonical JSON Schema

All fields follow the **canonical Trading Copilot schema**. Key fields for this strategy:

```json
{
  "ticker": "AAPL",
  "company_name": "Apple Inc.",
  "direction": "long",
  "conviction": "high | moderate | low",
  "current_price": 0,
  "entry_zone": "string or number",
  "stop_loss": 0,
  "take_profit": 0,
  "risk_percent": 3,
  "expected_holding_days": 5,
  "earnings_date": "YYYY-MM-DD",
  "rationale": "string (1-3 sentences: catalyst + setup + risk)"
}
```

**Optional enrichment fields** (include when available, omit when not):

- `trade_setup` — e.g. `"pre-earnings run-up"`, `"gap follow-through"`
- `entry_trigger` — specific price/condition to enter
- `crash_date` — for post-shock earnings sub-type setups that belong here

**Do not include:** `setup_quality`, `momentum_score`, `position_size_pct`, `file_type`, `strategy` (these were in v1 docs but are unused by the SPA and increase refresh complexity).

---

## Regime guidance

| Regime             | Guidance                                                     |
| ------------------ | ------------------------------------------------------------ |
| `trending bullish` | Highest edge window — widen targets, favour long setups      |
| `trending bearish` | Skip unless strong sector-specific catalyst overrides market |
| `choppy`           | Reduce size; require strong options flow or upgrade signal   |
| `high volatility`  | Avoid; binary event risk compounds with market vol           |
| `low volatility`   | Reliable breakout setups; tighter spreads                    |

---

## Key risks

- **Binary event risk:** Never hold through earnings with leveraged positions
- **Crowded trade:** Popular pre-earnings setups can reverse if sentiment shifts intraday
- **Macro override:** Fed/geopolitical events can override company-level momentum

---

## Execution overlays that apply

- **Revolut Tools:** Use 4h/daily MACD for entry timing on pre-earnings run-ups. See `revolut-tools-intraday-swing.md`.
- **Macro & Volatility:** Cross-check macro event calendar — avoid opening new positions 24–48h before high-impact releases. See `macro-volatility.md`.

---

## AI Refresh Protocol

### Data Gathering Checklist

1. **Earnings calendar:** MarketBeat (marketbeat.com/earnings/), StockAnalysis (stockanalysis.com/actions/earnings/) — next 10 days. Filter: market cap >$5B, ≥5 analyst estimates.
2. **Earnings history:** StockAnalysis or MarketBeat — last 4 quarters beat/miss, magnitude of surprise, stock price reaction.
3. **Analyst revisions:** TipRanks (tipranks.com/stocks/{TICKER}/forecast), StockAnalysis — consensus rating, price target, 30-day revision trend.
4. **Implied move:** search "{TICKER} earnings implied move" or check Yahoo Finance options chain — at-the-money straddle / stock price. Compare to historical avg move.
5. **Whisper numbers:** search "{TICKER} earnings whisper", check Estimize if available.
6. **Technical setup:** TradingView daily — RSI(14), MACD, price vs 50d/200d MA.
7. **Macro cross-check:** any high-impact macro event within 24h of earnings? If yes, reduce conviction or specify "flat before both events."

### Signal Scoring Matrix

- **HIGH:** beat 3/4 quarters + EPS revised up 30d + implied move ≤1.2× historical + RSI 35-65 above 50d MA + no macro within 24h
- **MODERATE:** 3-4 of 5 conditions
- **LOW:** 2 of 5 conditions with clear qualitative catalyst
- **DISQUALIFIED:** same-day FOMC/NFP/CPI, <5 analysts, missed 3/4 quarters, entry >5% from current price, implied move >2× historical, market cap <$5B

### Entry/Exit Precision Rules

**Pre-earnings run-up:** Enter 5-7d before (HIGH), 3-5d (MOD). Zone between 20d EMA and current price, width ≤3%. Stop below recent swing low or 1.5× ATR. EXIT BEFORE EARNINGS — never hold through print. If stock rallies >5%, partial profit + trail to breakeven.

**Post-earnings gap follow-through:** Enter AFTER print only. Enter Day 1 last 30min or Day 2 on pullback holding above 50% of gap. Stop below gap fill level. Volume must be ≥1.5× 20d avg.

**Analyst revision momentum:** Enter within 3 trading days of revision. Zone between pre-revision close and post-revision high. Stop below pre-revision close. Hold 5-10d max.

R:R minimums: run-up 1:2, gap 1:2.5, revision 1:3.

### Cross-Validation Requirements

1. Earnings history + revision direction must agree (if beat 4/4 but revisions down, conflicted → MOD max)
2. Implied move sanity (if implied >2× historical, explain or mark LOW)
3. Sector peers: if 3+ peers missed, sector headwind → reduce conviction
4. Regime alignment: high-vol/bearish → require extra condition (defensive sector or 4/4 beat history)
5. No duplicate: if ticker in macro-volatility or post-crash, don't duplicate here

### Common Mistakes to Avoid

1. Holding through earnings on run-up trades
2. Confusing "beat EPS" with "stock went up" — check both
3. Omitting implied move analysis
4. Too many MODERATE trades (max 3 per conviction level)
5. Stale earnings dates — verify at every refresh
6. Macro overlay ignored — same-day FOMC → auto-reduce conviction one tier
7. Entry zones too wide — max 3-5% of stock price
8. Missing exit deadline — every pre-earnings trade must state last exit date/time
