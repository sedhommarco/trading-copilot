# Cycles, Sessions & Events

**Strategy Type:** Seasonal/event-driven swing/position trade  
**Typical Holding Period:** 1-8 weeks (event-dependent)  
**Target Instruments:** Stocks, indices, commodities, forex, crypto (varies by event)  
**Platform:** Revolut, Revolut X

---

## Strategy Purpose

Capture predictable seasonal patterns, calendar-driven trends, and event-based opportunities around major holidays, sports events, and cultural moments (Christmas, Formula 1, Easter, Champions League, Super Bowl, etc.). Combine historical seasonality data with current market conditions to identify asymmetric plays.

---

## Entry Criteria

### Event Categories

1. **Major holidays:** Christmas, Easter, Thanksgiving, Black Friday, Chinese New Year
2. **Sports events:** Formula 1 races, Champions League finals, Super Bowl, World Cup, Olympics
3. **Cultural/political events:** Oscars, elections, product launches (Apple, Tesla)
4. **Seasonal cycles:** "Sell in May", Q4 rally, January effect, summer doldrums

### Pre-Event Setup (1-4 weeks before)

- **Identify beneficiaries:** Which stocks/sectors historically rally before event?
- **Entry timing:** Enter 2-4 weeks before event peak (avoid FOMO entries)
- **Confirmation:** Check if historical pattern is intact (not disrupted by macro headwinds)

### Post-Event Setup (1-4 weeks after)

- **Mean reversion:** Fade post-event exhaustion (e.g. retail stocks after Christmas)
- **Continuation:** Some events (product launches) have multi-week momentum
- **Short opportunities:** Sell post-event hype (e.g. crypto after halving, "buy the rumor, sell the news")

---

## Exit Rules

### Pre-Event Trades

1. **Close before event peak:** Exit 1-3 days before event (avoid "sell the news" risk)
2. **Partial profit:** Take 50% off at +10%, let remainder run into event
3. **Stop loss:** -8% (seasonal trades can take time to work; wider stops needed)

### Post-Event Trades

1. **Fade exhaustion:** Enter short 1-2 days after event peak; target -10-15% drop
2. **Quick exit:** Post-event fades are fast; exit within 5-10 days
3. **Stop loss:** -5% (tighter stops for mean-reversion plays)

---

## Risk Profile

**Strategy-level confidence:** Moderate (historical patterns are probabilistic, not deterministic)

**Key risks:**
- **Pattern failure:** Historical seasonality can break (macro environment, secular trends)
- **Timing risk:** Entering too early or too late reduces edge
- **Event cancellation/disruption:** Sports events, product launches can be delayed/cancelled
- **Overfitting:** Some patterns are noise, not signal (beware of cherry-picked data)

**Typical drawdown:** 5-10% per trade (wider stops due to longer holding periods)

---

## JSON Watchlist Schema

### File-level fields

```json
{
  "file_type": "watchlist",
  "strategy": "cycles_sessions_events",
  "last_updated": "ISO 8601 timestamp",
  "week_start": "YYYY-MM-DD",
  "week_end": "YYYY-MM-DD",
  "opportunities": [],
  "upcoming_events": [
    {
      "event_name": "Formula 1 Monaco Grand Prix",
      "event_date": "2026-05-24",
      "event_type": "sports",
      "pre_event_window": "2026-04-24 to 2026-05-22",
      "post_event_window": "2026-05-25 to 2026-06-07",
      "beneficiaries": ["Luxury goods (LVMH, Ferrari)", "Travel/hospitality (Booking.com)"],
      "historical_pattern": "Luxury stocks rally 3-5% in 4 weeks before Monaco GP"
    }
  ],
  "previous_week_outcomes": []
}
```

### Opportunity object fields

**Required:**
- Standard fields: `ticker`, `company_name`, `current_price`, `entry_zone`, `stop_loss`, `take_profit`, `position_size_usd`, `risk_percent`, `expected_holding_days`, `conviction`, `rationale`

**Strategy-specific:**
- `event_name` (string): "Christmas shopping season", "Formula 1 Monaco GP", "Champions League Final"
- `event_date` (string): "YYYY-MM-DD"
- `event_type` (string): "holiday", "sports", "product_launch", "seasonal_cycle"
- `play_type` (string): "pre_event_rally", "post_event_fade", "event_winner", "event_loser"
- `seasonality_pattern` (string): Historical pattern description (e.g. "Retail stocks +8% avg in Nov-Dec")
- `entry_window` (string): "2026-11-01 to 2026-11-15" (ideal entry range)
- `exit_window` (string): "2026-12-20 to 2026-12-24" (ideal exit range)
- `historical_win_rate` (number): % of years pattern worked (e.g. 75%)
- `key_risks` (string): Event-specific risks (e.g. "Warm winter could hurt ski resort stocks")

---

## SPA UI Expectations

### Card Display

1. **Header:** Ticker + Event (e.g. "LVMH - Monaco GP Play")
2. **Event badge:** "Formula 1 Monaco GP - May 24" (with countdown timer)
3. **Play type badge:** "Pre-Event Rally" (green) or "Post-Event Fade" (red)
4. **Seasonality note:** "Historical pattern: Luxury stocks +3-5% in 4 weeks before Monaco GP"
5. **Entry & exit windows:** "Enter: Apr 24-May 22" / "Exit: Before May 24"
6. **Current position in cycle:** "T-10 days to event" or "Event +3 days"
7. **Historical win rate:** "Pattern worked 8 out of 10 years (80%)"
8. **Risk/Reward:** Stop, target, R:R ratio
9. **Conviction badge**
10. **Key risks:** "Risk: Macro headwinds could override seasonal pattern"

### Tab Header

- **Strategy description:** "Trade seasonal patterns and event-driven opportunities. Enter pre-event rallies or fade post-event exhaustion."
- **Strategy confidence:** "Moderate"
- **Key risks:** "Pattern failure, timing risk, event disruption, overfitting"

### Upcoming Events Calendar

Show a **separate panel** at top of tab listing next 4-8 weeks of events:

**Upcoming Events:**
- **Mar 15-Apr 1:** Easter shopping season (Retail stocks pre-rally)
- **May 24:** Formula 1 Monaco GP (Luxury goods, travel)
- **Jun 1:** Champions League Final (Sports brands, betting stocks)
- **Dec 1-25:** Christmas season (Retail, e-commerce, logistics)

---

## Textbook Setup Examples

### Example 1: Christmas Shopping Season (Pre-Event Rally)

**Event:** Christmas 2026 (Dec 25)  
**Play type:** Pre-event rally  
**Entry window:** Nov 1-15  
**Exit window:** Dec 20-24  

**Ticker:** AMZN (Amazon)  
**Entry:** $185 (Nov 5)  
**Stop loss:** $170 (-8.1%)  
**Take profit:** $210 (+13.5%)  
**Risk/Reward:** 1:1.7  
**Conviction:** High  
**Expected holding:** 45 days  
**Seasonality pattern:** E-commerce stocks rally avg +12% from early Nov to mid-Dec (7 out of 10 years)  
**Rationale:** Amazon benefits from Black Friday, Cyber Monday, and holiday shopping surge. Historical pattern shows Nov-Dec outperformance. Enter early Nov, exit before Christmas.

**Exit plan:**
- Sell 50% at $198 (+7%) in early Dec
- Close remainder Dec 20-22 (before Christmas)

---

### Example 2: Formula 1 Monaco Grand Prix (Pre-Event Play)

**Event:** Monaco Grand Prix (May 24, 2026)  
**Play type:** Pre-event rally  
**Entry window:** Apr 24-May 5  
**Exit window:** May 20-23  

**Ticker:** LVMH (Luxury goods)  
**Entry:** €680 (Apr 28)  
**Stop loss:** €650 (-4.4%)  
**Take profit:** €710 (+4.4%)  
**Risk/Reward:** 1:1  
**Conviction:** Moderate  
**Expected holding:** 25 days  
**Seasonality pattern:** Luxury stocks (LVMH, Ferrari) rally 3-5% in 4 weeks before Monaco GP (6 out of 8 years)  
**Rationale:** Monaco GP is peak luxury/wealth event. LVMH benefits from high-net-worth individuals spending on fashion, champagne, etc. Historical pattern shows pre-event rally.

**Exit plan:**
- Sell 50% at €695 (+2.2%) 10 days before GP
- Close remainder May 20-22 (before race weekend)

---

### Example 3: Champions League Final (Event Winner Play)

**Event:** Champions League Final (Jun 1, 2026)  
**Play type:** Event winner (team-specific stocks)  
**Entry window:** May 20-28 (after semi-finals, before final)  
**Exit window:** Jun 2-5 (post-event fade)

**Ticker:** Adidas (if German team in final)  
**Entry:** €220 (May 25)  
**Stop loss:** €210 (-4.5%)  
**Take profit:** €235 (+6.8%)  
**Risk/Reward:** 1:1.5  
**Conviction:** Moderate  
**Expected holding:** 7 days  
**Seasonality pattern:** Sports brands rally 3-7% when "home country" team reaches major final  
**Rationale:** If Bayern Munich or Borussia Dortmund reaches final, Adidas (German brand) benefits from national excitement and merchandise sales. Enter after semi-finals, exit within 3 days of final.

**Exit plan:**
- Sell 50% at €230 (+4.5%) day after final
- Close remainder within 3 days (post-event fade risk)

---

### Example 4: Post-Crypto-Halving Fade (Post-Event Short)

**Event:** Bitcoin Halving (Apr 2028)  
**Play type:** Post-event fade ("sell the news")  
**Entry window:** 1-3 days after halving  
**Exit window:** 10-20 days after halving  

**Ticker:** BTC (Bitcoin)  
**Entry (short):** $72,000 (2 days post-halving)  
**Stop loss:** $76,000 (+5.6%)  
**Take profit:** $62,000 (-13.9%)  
**Risk/Reward:** 1:2.5  
**Conviction:** Moderate  
**Expected holding:** 15 days  
**Seasonality pattern:** Bitcoin often rallies into halving, then corrects -10-20% in 2-4 weeks after (3 out of 4 halvings)  
**Rationale:** "Buy the rumor, sell the news." BTC halvings are hyped months in advance. Post-halving, profit-taking and reality-check lead to correction.

**Exit plan:**
- Cover 50% at $66,000 (-8.3%)
- Cover remainder at $62,000 or after 20 days (whichever first)

---

## Event Calendar Maintenance

**Weekly refresh should populate `upcoming_events` array with:**

1. **Next 4-8 weeks of relevant events** from:
   - Holiday calendar (Christmas, Easter, Thanksgiving, Chinese New Year)
   - Sports calendar (Formula 1 races, Champions League, Super Bowl, Olympics)
   - Product launch calendar (Apple events, Tesla Battery Day, Google I/O)
   - Earnings calendar for "event-like" catalysts (NVIDIA earnings = AI event)

2. **Historical pattern data:**
   - % change in previous years
   - Win rate (how often pattern worked)
   - Key beneficiary stocks/sectors

3. **Dynamic candidate generation:**
   - Each week, propose 2-3 new event-based setups
   - Remove expired events (past exit window)
   - Update countdown timers for active events

**Data sources:**
- Formula 1 calendar: formula1.com
- Champions League calendar: uefa.com
- US holidays: federalreserve.gov/aboutthefed/k8.htm
- Retail seasonality: NRF (National Retail Federation) data
- Sports betting calendars: oddschecker.com, betting.com

---

## Strategy Evolution Notes

- Track **event type win rates**; some events (Christmas retail) may be more reliable than others (F1 Monaco)
- Monitor **entry/exit timing**; if consistently entering too early, shift entry window closer to event
- Analyze **pattern decay**; some historical patterns may weaken over time (e.g. "Sell in May" less reliable post-2008)
- Test **sector rotation**; some events benefit different sectors in different years (e.g. luxury vs discount retail)
