# Volatility Plays

**Strategy Type:** Macro-driven swing/position trade  
**Typical Holding Period:** 2-10 days  
**Target Instruments:** CFDs on gold (XAU/USD), indices (US500, NAS100, DE40), commodities (USOIL)  
**Platform:** Revolut (CFDs with 10-20x leverage)

---

## Strategy Purpose

Trade breakouts, mean-reversions, and macro event reactions in volatile instruments like gold, indices, and commodities. Focus on asymmetric setups where risk is well-defined and catalysts are clear.

---

## Entry Criteria

### Setup Types

1. **Macro breakout:** Price breaks key resistance on major data release (NFP, CPI, FOMC)
2. **Mean reversion:** Fade overreaction to news event; enter when price reclaims pre-event level
3. **Volatility swing:** Trade in direction of momentum after VIX spike or major sentiment shift
4. **Geopolitical play:** Enter on geopolitical risk premium (e.g. Iran tensions → oil/gold up)

### Confirmation

- **Trigger:** Clear entry trigger (e.g. "4h close above 5320", "fade if NFP spike reverses")
- **Risk-defined:** Stop loss within 3-5% of entry for indices, 5-8% for commodities
- **Catalyst clarity:** Identifiable macro event or technical level

---

## Exit Rules

1. **Partial profit:** Close 50% at first target (typically +5-10%)
2. **Trailing stop:** Move stop to breakeven after +5%, trail for extended target
3. **Event exit:** Close before next major data release if hold extends >5 days
4. **Stop loss:** Strict adherence; do not widen stops

---

## Risk Profile

**Strategy-level confidence:** Moderate (high dependency on macro timing)

**Key risks:**
- **Gap risk:** Overnight/weekend gaps in CFDs (especially gold, oil)
- **Leverage risk:** 10-20x leverage amplifies losses; strict stop discipline required
- **Event risk:** Macro data can swing prices violently and unpredictably
- **Liquidity risk:** Wide spreads during low-liquidity hours (Asian session, weekends)

**Typical drawdown:** 3-8% per trade (leverage-adjusted)

---

## JSON Watchlist Schema

### File-level fields

```json
{
  "file_type": "watchlist",
  "strategy": "volatility_plays",
  "last_updated": "ISO 8601 timestamp",
  "week_start": "YYYY-MM-DD",
  "week_end": "YYYY-MM-DD",
  "opportunities": [],
  "previous_week_outcomes": []
}
```

### Opportunity object fields

**Required:**
- Standard fields: `ticker`, `company_name`, `current_price`, `entry_zone`, `stop_loss`, `take_profit`, `position_size_usd`, `risk_percent`, `expected_holding_days`, `conviction`, `rationale`

**Strategy-specific:**
- `type` (string): "precious_metal", "equity_index", "commodity"
- `trade_setup` (string): "macro breakout", "nfp mean reversion", "volatility swing", "geopolitical breakout", "cpi reaction"
- `entry_trigger` (string): Exact entry condition (e.g. "4h close above 5320 after major data")
- `units` (number): CFD units (not shares)

---

## SPA UI Expectations

### Card Display

1. **Header:** Ticker + Name (e.g. "XAU/USD - Gold")
2. **Setup type badge:** "Macro Breakout" or "Mean Reversion" (colored)
3. **Entry trigger:** Displayed prominently (e.g. "Enter on 4h close > 5320")
4. **Current price & entry zone**
5. **Risk/Reward:** Stop, target, R:R ratio
6. **Leverage warning:** "20x leverage - strict stop required" (red text)
7. **Conviction badge**
8. **Units:** Show CFD units, not shares

### Tab Header

- **Strategy description:** "Trade macro-driven moves in gold, indices, and commodities with tight risk control and high leverage."
- **Strategy confidence:** "Moderate"
- **Key risks:** "Gap risk, leverage amplification, event risk, liquidity risk"

---

## Textbook Setup Example

**Ticker:** XAU/USD (Gold)  
**Setup:** Macro breakout on Iran risk escalation  
**Entry trigger:** 4h close above 5320 after major geopolitical headline or CPI data  
**Entry:** 5325  
**Stop loss:** 5160 (-3.1%)  
**Take profit:** 5700 (+7.0%)  
**Risk/Reward:** 1:2.3  
**Conviction:** Moderate  
**Leverage:** 20x CFD  
**Position size:** $1000 (0.19 units gold CFD)  
**Rationale:** Gold near recent highs; breakout above resistance on strong risk-off flows offers asymmetric upside. Iran risk premium supports continuation.

**Exit plan:**
- Sell 50% at 5500 (+3.3%)
- Trail remainder with stop at 5400, targeting 5700

---

## Instruments and Revolut Specifics

### Gold (XAU/USD)
- **Leverage:** 20x max on Revolut CFDs
- **Typical spread:** $2-5 (tight during London/NY overlap)
- **Best trading hours:** 8:00-17:00 CET (London session)

### Indices (US500, NAS100, DE40)
- **Leverage:** 10x max
- **Typical spread:** 0.5-2 points
- **Best trading hours:** 15:30-22:00 CET (US session)

### Commodities (USOIL)
- **Leverage:** 10x max
- **Typical spread:** $0.03-0.10
- **Best trading hours:** 15:00-22:00 CET (US session overlap)

---

## Strategy Evolution Notes

- Track **setup type win rates**; some setups (macro breakouts) may outperform others (mean reversions)
- Monitor **leverage impact**; if stop losses hit frequently, reduce leverage from 20x → 10x
- Analyze **event timing**; some macro events (FOMC) may be more tradeable than others (PMI)
