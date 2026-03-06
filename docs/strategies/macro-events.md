# Macro Events

**Strategy Type:** Event-driven volatility trade  
**Typical Holding Period:** 1-3 days  
**Target Instruments:** Indices (US500, NAS100), forex (EUR/USD, USD/JPY), commodities (USOIL, gold)  
**Platform:** Revolut CFDs (10-20x leverage)

---

## Strategy Purpose

Capture sharp moves around major macroeconomic data releases (FOMC, NFP, CPI, PMI). Focus on post-event reactions, volatility spikes, or staying flat (avoiding risk before high-impact events).

---

## Entry Criteria

### Event Types

1. **FOMC (Federal Reserve meetings):** Interest rate decisions and Powell press conferences
2. **NFP (Non-Farm Payrolls):** Monthly US jobs report (first Friday of month)
3. **CPI (Consumer Price Index):** US and Eurozone inflation data
4. **PMI (Purchasing Managers Index):** Manufacturing and services surveys
5. **GDP, retail sales, consumer sentiment:** Secondary macro data

### Setup Types

1. **Pre-event reduction:** Reduce exposure 1-2 days before high-impact events (risk-off)
2. **Post-event breakout:** Trade in direction of post-data move (confirmation required)
3. **Mean reversion:** Fade extreme overreactions (e.g. NFP spike that reverses)
4. **Volatility spike play:** Buy/sell volatility (VIX) or volatility-sensitive instruments

### Confirmation

- **Data surprise:** Trade only if data significantly beats/misses expectations (>0.3% CPI surprise, >100K NFP miss)
- **Price action confirmation:** Wait for 15-30 min after data release to confirm direction
- **No pre-positioning:** Do NOT take directional bets before data release (risk too high)

---

## Exit Rules

1. **Partial profit:** Close 50% within 4-8 hours of data release (post-event moves often reverse)
2. **Same-day close:** Exit remainder by end of session (avoid overnight risk)
3. **Stop loss:** -3% max (tight stops required due to leverage)
4. **Event cluster risk:** If multiple events same week, reduce position size or skip

---

## Risk Profile

**Strategy-level confidence:** Low to Moderate (high variance, timing-dependent)

**Key risks:**
- **Gap risk:** Extreme data surprises can gap price through stops
- **Whipsaw risk:** Initial move often reverses within 1-2 hours (false breakouts)
- **Leverage risk:** 10-20x leverage amplifies losses; strict stop discipline required
- **Event clustering:** Multiple events same week increases unpredictability

**Typical drawdown:** 3-5% per trade (tight stops mitigate leverage risk)

---

## JSON Watchlist Schema

### File-level fields

```json
{
  "file_type": "watchlist",
  "strategy": "macro_events",
  "last_updated": "ISO 8601 timestamp",
  "week_start": "YYYY-MM-DD",
  "week_end": "YYYY-MM-DD",
  "opportunities": [],
  "upcoming_events": [
    {
      "event_name": "US Non-Farm Payrolls",
      "event_date": "2026-03-07",
      "event_time": "14:30 CET",
      "impact": "high",
      "consensus": "200K jobs",
      "strategy_note": "Reduce exposure before data; trade post-release if surprise >100K"
    }
  ],
  "previous_week_outcomes": []
}
```

### Opportunity object fields

**Required:**
- Standard fields: `ticker`, `company_name`, `current_price`, `entry_zone`, `stop_loss`, `take_profit`, `position_size_usd`, `risk_percent`, `expected_holding_days`, `conviction`, `rationale`

**Strategy-specific:**
- `event_trigger` (string): "NFP", "FOMC", "CPI", "PMI", "GDP"
- `event_date` (string): "YYYY-MM-DD"
- `event_time` (string): "HH:MM CET"
- `pre_event_action` (string): "reduce", "stay_flat", "hedge"
- `post_event_setup` (string): "breakout", "mean_reversion", "volatility_spike"
- `data_consensus` (string): Expected data value (e.g. "3.2% CPI")
- `surprise_threshold` (string): Trigger condition (e.g. "CPI >3.5% or <2.9%")

---

## SPA UI Expectations

### Card Display

1. **Header:** Ticker + Event (e.g. "US500 - NFP Play")
2. **Event details:** "NFP: Mar 7, 14:30 CET" (countdown timer if <24h)
3. **Pre-event action badge:** "Reduce Exposure" or "Stay Flat" (red/yellow)
4. **Post-event setup:** "Breakout Long if NFP >250K"
5. **Entry trigger:** Exact condition to enter (e.g. "Enter long if US500 breaks 6900 after data")
6. **Risk/Reward:** Stop, target, R:R ratio
7. **Conviction badge** (typically "low" before event)
8. **Leverage warning:** "10x leverage - tight stop required"

### Tab Header

- **Strategy description:** "Trade major macro events. Reduce exposure before high-impact data. Trade post-event moves with tight risk control."
- **Strategy confidence:** "Low to Moderate"
- **Key risks:** "Gap risk, whipsaw risk, leverage amplification, event clustering"

### Upcoming Events Section

Show a **separate panel** at top of Macro Events tab:

**Upcoming Events This Week:**
- **Mar 7, 14:30 CET:** US Non-Farm Payrolls (High Impact) - "Reduce exposure before data"
- **Mar 8, 20:00 CET:** FOMC Minutes (Moderate Impact) - "Trade post-release if hawkish surprise"

---

## Textbook Setup Example

**Event:** US CPI (Mar 10, 14:30 CET)  
**Consensus:** 3.0% YoY  
**Surprise threshold:** >3.3% (hot) or <2.7% (cool)  

**Pre-event action:** Reduce exposure; close 50% of long positions 1 day before CPI  

**Post-event setup:**
- **If CPI >3.3% (hot inflation):**  
  - Short US500 on breakout below 6800  
  - Stop: 6870 (-1.0%)  
  - Target: 6650 (-2.2%)  
  - Rationale: Hot CPI → Fed stays hawkish → risk-off in equities

- **If CPI <2.7% (cool inflation):**  
  - Long US500 on breakout above 6950  
  - Stop: 6880 (-1.0%)  
  - Target: 7100 (+2.2%)  
  - Rationale: Cool CPI → Fed dovish pivot → risk-on in equities

**Exit plan:**
- Close 50% within 4 hours of data release
- Exit remainder by end of session (no overnight hold)

---

## Event Calendar Integration

**Weekly refresh should populate `upcoming_events` array with:**
- All high-impact and moderate-impact macro events for the week
- Event date, time (CET), consensus, and strategy notes
- Pre-event action recommendations (reduce, stay flat, hedge)

**Data sources:**
- Investing.com Economic Calendar
- Forex Factory
- TradingView Economic Calendar

---

## Strategy Evolution Notes

- Track **post-event success rate**; if <50%, skip trading entirely and only use for risk reduction
- Monitor **whipsaw frequency**; if initial moves reverse >70% of time, wait longer (30-60 min) before entry
- Analyze **event impact by type**; some events (FOMC) may be more tradeable than others (PMI)
