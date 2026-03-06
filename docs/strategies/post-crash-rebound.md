# Post-Crash Rebound

**Strategy Type:** Mean-reversion swing trade  
**Typical Holding Period:** 2-7 days  
**Target Instruments:** US equities (large/mid-cap)  
**Platform:** Revolut (cash stocks or 5x CFDs for liquid names)

---

## Strategy Purpose

Capture oversold bounces in fundamentally sound stocks that dropped >8% in a single session due to news-driven panic. Enter when technical support is nearby and sentiment is excessively negative, targeting a 5-15% rebound.

---

## Entry Criteria

### Trigger

- **Single-session drop:** >8% decline in one day
- **News-driven:** Identifiable catalyst (earnings miss, guidance cut, sector rotation)
- **NOT structural:** No fraud, accounting issues, or existential business threats

### Confirmation

- **Technical support:** Stock near major support level (previous consolidation, 200-day MA, round number)
- **Volume spike:** High volume on drop signals capitulation
- **Short interest:** High short interest (>10% float) suggests potential squeeze

### Timing

- Enter **day after crash** or when price stabilizes (avoid catching falling knife)
- Wait for intraday reversal pattern (morning low, afternoon bounce)

---

## Exit Rules

1. **Partial profit:** Sell 50% at +5% rebound
2. **Trailing stop:** Move stop to +3% after +5% gain, trail for +10-15% target
3. **Max hold:** Exit within 7 days regardless of price action (avoid becoming long-term bag holder)
4. **Stop loss:** -5% from entry (exit if drop accelerates)

---

## Risk Profile

**Strategy-level confidence:** Moderate (high variance)

**Key risks:**
- **Value trap:** Drop may be justified; rebound may not materialize
- **Further deterioration:** News flow could worsen (more downgrades, guidance cuts)
- **Liquidity risk:** Wide spreads and slippage in illiquid names

**Typical drawdown:** 5-8% per trade if stop loss hit

---

## JSON Watchlist Schema

### File-level fields

```json
{
  "file_type": "watchlist",
  "strategy": "post_crash_rebound",
  "last_updated": "ISO 8601 timestamp",
  "week_start": "YYYY-MM-DD",
  "week_end": "YYYY-MM-DD",
  "opportunities": [ /* array of opportunity objects */ ],
  "previous_week_outcomes": []
}
```

### Opportunity object fields

**Required:**
- `ticker`, `company_name`, `current_price`, `entry_zone`, `stop_loss`, `take_profit`
- `position_size_usd`, `risk_percent`, `expected_holding_days`, `conviction`, `rationale`

**Strategy-specific (optional):**
- `drop_percent` (number): Single-session drop magnitude
- `catalyst` (string): News trigger (e.g. "earnings miss", "guidance cut")
- `support_level` (number): Key technical support price
- `short_interest_percent` (number): % of float shorted

---

## SPA UI Expectations

### Card Display

1. **Header:** Ticker + Company Name
2. **Drop badge:** "Dropped -12.5%" (red, prominent)
3. **Catalyst:** Short description of news trigger
4. **Support level:** "Near support at $150"
5. **Risk/Reward:** Stop, target, R:R ratio
6. **Conviction badge**
7. **Rationale:** Why bounce expected

### Tab Header

- **Strategy description:** "Trade oversold bounces after panic drops. Enter at support with tight risk control."
- **Strategy confidence:** "Moderate"
- **Key risks:** "Value trap, further deterioration, liquidity risk"

---

## Textbook Setup Example

**Ticker:** PYPL  
**Trigger:** Dropped 9.8% on earnings miss  
**Entry:** $58 (day after crash, near 200-day MA support at $56)  
**Stop loss:** $55 (-5.2%)  
**Take profit:** $67 (+15.5%)  
**Risk/Reward:** 1:3  
**Conviction:** Moderate  
**Rationale:** Earnings miss but guidance intact. High short interest (12% float). Price at major support. Volume spike signals capitulation.

**Exit plan:**
- Sell 50% at $61 (+5%)
- Trail remainder with stop at $59 (+1.7%), targeting $67

---

## Strategy Evolution Notes

- Track **rebound success rate**; if <50%, tighten support-level requirement
- Monitor **max hold duration**; if bounces take >7 days, consider longer time frame or different strategy
- Analyze **catalyst types**; some catalysts (earnings miss) may rebound better than others (guidance cut)
