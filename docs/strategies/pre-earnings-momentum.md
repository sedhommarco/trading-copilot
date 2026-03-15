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
