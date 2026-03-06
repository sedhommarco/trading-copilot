# Pre-Earnings Momentum

**Strategy Type:** Event-driven swing trade  
**Typical Holding Period:** 2-5 days  
**Target Instruments:** US equities (stocks, not CFDs)  
**Platform:** Revolut (cash stocks, no leverage)

---

## Strategy Purpose

Capture momentum in stocks with strong analyst revisions and bullish technical setup ahead of quarterly earnings announcements. Enter 2-5 days before the earnings date and exit before or shortly after the report to avoid overnight gap risk.

---

## Entry Criteria

### Fundamental

- **Analyst estimate revisions:** +10% or more in past 2 weeks
- **Earnings sentiment:** Majority of recent analyst notes bullish
- **No major red flags:** No pending lawsuits, regulatory issues, or management changes

### Technical

- **Price action:** Above 20-day moving average
- **RSI:** 55-70 range (momentum without overbought extremes)
- **Options IV:** Rising but not extreme (avoid setups where IV is already priced in)

### Timing

- Entry window: 2-5 days before earnings date
- Avoid entry <24 hours before earnings (gap risk too high)

---

## Exit Rules

1. **Partial profit:** Close 50% of position the day before earnings
2. **Gap exit:** 
   - If stock gaps >5% up: close remainder immediately
   - If stock gaps >3% down: close remainder immediately
3. **Max hold:** Do not hold through earnings unless explicitly planned (rare)

---

## Risk Profile

**Strategy-level confidence:** Moderate to High (depends on setup quality)

**Key risks:**
- **Gap risk:** Stock can gap sharply on unexpected earnings results or guidance
- **IV crush:** Options-related momentum can reverse quickly if IV collapses
- **Estimate risk:** Analyst revisions may be wrong or already priced in

**Typical drawdown:** 5-10% per trade if stop loss hit

---

## JSON Watchlist Schema

### File-level fields

```json
{
  "file_type": "watchlist",
  "strategy": "pre_earnings_momentum",
  "last_updated": "ISO 8601 timestamp",
  "week_start": "YYYY-MM-DD",
  "week_end": "YYYY-MM-DD",
  "opportunities": [ /* array of opportunity objects */ ],
  "previous_week_outcomes": [ /* optional: outcomes from last week */ ]
}
```

### Opportunity object fields

**Required:**
- `ticker` (string): Stock ticker symbol
- `company_name` (string): Full company name
- `current_price` (number): Latest price in USD
- `entry_zone` (string): Recommended entry range (e.g. "318-322")
- `stop_loss` (number): Stop loss level
- `take_profit` (number): Take profit target
- `position_size_usd` (number): Suggested position size in USD
- `risk_percent` (number): Risk as % of capital (2-5%)
- `expected_holding_days` (number): Typical hold duration
- `conviction` (string): "high", "moderate", or "low"
- `rationale` (string): Trade thesis
- `earnings_date` (string): "YYYY-MM-DD" format

**Optional:**
- `last_week_performance` (string or null): Outcome if this was a carry-over
- `shares` (number): Number of shares for position sizing

---

## SPA UI Expectations

### Card Display

Each opportunity card should show:

1. **Header:** Ticker + Company Name (bold)
2. **Price & Entry:** Current price, entry zone (highlighted)
3. **Risk/Reward:** Stop loss, take profit, R:R ratio
4. **Conviction badge:** Color-coded (high=green, moderate=yellow, low=gray)
5. **Earnings date:** Prominent countdown or date label (e.g. "Earnings: Mar 5, 3 days")
6. **Rationale:** Short description (1-2 sentences max)
7. **Position size:** USD and suggested shares

### Tab Header

Show at the top of the Pre-Earnings Momentum tab:

- **Strategy description:** "Capture pre-earnings momentum with tight risk control. Enter 2-5 days before earnings, exit before or shortly after report."
- **Strategy confidence:** "Moderate to High"
- **Key risks:** "Gap risk, IV crush, estimate risk"

---

## Textbook Setup Example

**Ticker:** NVDA  
**Setup date:** 3 days before earnings  
**Entry:** $875 (current price)  
**Entry zone:** $870-880  
**Stop loss:** $850 (-2.9%)  
**Take profit:** $920 (+5.1%)  
**Risk/Reward:** 1:1.8  
**Conviction:** High  
**Rationale:** Strong data center demand, analyst upgrades, RSI 62, above 20-day MA, options IV rising moderately. Earnings expected to beat on AI chip sales.

**Exit plan:**
- Sell 50% at $900 (day before earnings)
- Close remainder on earnings gap (up or down)

---

## Strategy Evolution Notes

- Monitor **win rate** over 20+ trades; if <60%, tighten entry criteria
- Track **IV crush impact**; if consistent drag, reduce position size or exit earlier
- Compare **analyst revision accuracy**; fade setups where revisions consistently wrong
