# Macro & Volatility Events

**Replaces:** `volatility-plays.md` + `macro-events.md` (both deprecated as standalone docs)
**Category:** Macro-driven & volatility event plays
**Trade Horizon:** Intraday to 5 days
**Best Market Regime:** High Volatility, Trending (any direction), Range-Bound
**Watchlist file:** `data/watchlists/macro-volatility.json`

---

## Why merged

Volatility Plays and Macro Events were describing the same thing from two angles:
- *Macro Events* named the calendar trigger (NFP, CPI, ISM, earnings).
- *Volatility Plays* named the instruments and setups triggered by those same events (US500, XAU/USD, USOIL, NAS100).

Every item in the old `volatility.json` was anchored to a specific macro event. Every item in the old `macro-events.json` specified tradeable instruments and setups. Keeping them separate forced duplication in every refresh and confused the SPA tab count. One family, one file.

---

## Purpose

Capture short-to-medium-term directional or volatility-expansion opportunities triggered by known macro calendar events (NFP, CPI, ISM, Fed, ECB) and geopolitical catalysts (oil supply shocks, safe-haven flows). Both pre-event positioning and post-event fade/breakout plays belong here.

**Core thesis:** High-impact macro events reliably move certain instruments by predictable amounts in predictable directions depending on the surprise direction. The edge is knowing *which* instruments to watch, *when* to enter (before, at, or after the event), and having a clear stop anchored to the pre-event level.

---

## Sub-types in this family

| Sub-type | Description | `event_tag` values |
|---|---|---|
| Calendar event plays | Position around scheduled data releases | `nfp`, `cpi`, `ism`, `adp_ism`, `fomc`, `ecb` |
| Earnings volatility | Single-name or sector volatility around major earnings | `earnings` |
| Geopolitical/commodity | Oil, gold, FX driven by geopolitical headlines | `geopolitical`, `oil`, `safe_haven` |
| Post-event mean reversion | Fade the initial overreaction after a release | any of the above |

---

## Typical Instruments

- **Equity indices (CFD):** US500, NAS100, DE40, EU50, UK100
- **Commodities (CFD):** XAU/USD (Gold), XAG/USD (Silver), USOIL, BRENT
- **FX (CFD/Spot):** EUR/USD, GBP/USD, USD/JPY
- **Single-name stocks:** Sector bellwethers around key events (e.g. AVGO/MRVL for AI earnings)

---

## Required JSON Schema Fields

All opportunities follow the **canonical Trading Copilot schema** (see `INSTRUCTIONS.TRADING.md`).

Macro calendar events use the `MacroEvent` sub-type; instrument/price plays use the `Trade` sub-type:

### Calendar event (`MacroEvent` fields used)
```json
{
  "ticker": "N/A",
  "company_name": "Event display name",
  "conviction": "high | moderate | low",
  "event_name": "Full event name",
  "date": "YYYY-MM-DD",
  "time": "HH:MM CET",
  "impact": "very high | high | medium | low",
  "event_tag": "nfp | cpi | ism | fomc | ecb | earnings | geopolitical",
  "tradeable_instruments": ["US500", "XAU/USD"],
  "trade_setup": "direction dependent | volatility spike | mean reversion",
  "recommended_action": "wait for data | reduce exposure | partial de-risk",
  "expected_holding_days": 1,
  "rationale": "string"
}
```

### Instrument/price play (`Trade` fields used)
```json
{
  "ticker": "XAU/USD",
  "company_name": "Gold",
  "direction": "long | short",
  "conviction": "high | moderate | low",
  "current_price": 0,
  "entry_zone": "string or number",
  "stop_loss": 0,
  "take_profit": 0,
  "risk_percent": 3,
  "expected_holding_days": 3,
  "event_tag": "geopolitical | nfp | cpi",
  "trade_setup": "string",
  "entry_trigger": "string",
  "rationale": "string"
}
```

---

## Sorting and display

Cards are sorted first by **conviction** (high → moderate → low), then by **impact** (very high → high → medium → low). Calendar events always display their `event_name`, `date`, `time`, and `tradeable_instruments`. Instrument plays display their `ticker`, `entry_zone`, `stop_loss`, `take_profit`, and a Confidence · Impact badge row.

---

## Regime guidance

| Regime | Guidance |
|---|---|
| `high_volatility` | Prime window — most calendar events produce outsized moves. Widen stops or reduce size. |
| `trending_bullish` | Fade bearish overreactions on strong data; ride momentum on risk-on surprises. |
| `trending_bearish` | Favour downside breaks on weak data; tight stops on any long counter-trend. |
| `choppy` | Reduce frequency; only trade the highest-impact events (NFP, CPI, FOMC). |
| `low_volatility` | Pre-event positioning for IV expansion plays; smaller size. |
| `range_bound` | Fade extremes post-event; mean-reversion setups most reliable. |

---

## Execution overlays that apply

- **Revolut Tools (Intraday/Swing):** Use MACD and RSI on 15-min/1h charts for precise entry timing around event releases. See `revolut-tools-intraday-swing.md`.
- **Cycles / Sessions / Events:** Check session timing — avoid entering macro trades in low-liquidity Asian session. See `cycles-sessions-events.md`.
