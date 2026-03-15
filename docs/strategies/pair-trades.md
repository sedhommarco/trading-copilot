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
