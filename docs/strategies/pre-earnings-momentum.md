# Pre-Earnings Momentum Strategy

**Category:** Event-driven momentum  
**Trade Horizon:** 1-7 days (pre-earnings run-up)  
**Typical Holding Period:** 3-5 days  
**Best Market Regime:** Bullish, Neutral

---

## Purpose

Capture momentum plays in stocks with strong pre-earnings run-ups. This strategy identifies stocks with positive earnings expectations, strong technical setups, and institutional buying ahead of quarterly earnings reports.

**Core thesis:** Stocks with strong fundamentals and positive sentiment often experience buying pressure in the 1-2 weeks before earnings as:
- Institutional investors position ahead of expected beats
- Retail momentum follows technical breakouts
- Options activity drives gamma squeezes
- Analysts upgrade ahead of results

**Exit strategy:** Typically close 1-3 days before earnings to avoid binary event risk, or hold through if conviction is extremely high.

---

## Typical Instruments

**Primary (Revolut X):**
- US Large Cap Tech: AAPL, MSFT, GOOGL, AMZN, META, NVDA, TSLA
- US Growth Stocks: CRM, ADBE, NOW, SNOW, PLTR
- Sector Leaders: JPM, GS, UNH, LLY (healthcare), XOM, CVX (energy)

**Secondary (Revolut CFDs):**
- US500:CFD (S&P 500) for broad tech momentum
- NSDQ:CFD (Nasdaq 100) for tech-heavy plays

**Leverage:** Typically 5-10x for individual stocks, 10-20x for indices

---

## Required JSON Schema Fields

### Core Fields

```json
{
  "file_type": "watchlist",
  "strategy": "pre_earnings_momentum",
  "last_updated": "ISO 8601 timestamp",
  "opportunities": [
    {
      "symbol": "string (e.g., AAPL)",
      "name": "string (e.g., Apple Inc.)",
      "earnings_date": "YYYY-MM-DD",
      "days_to_earnings": "number (positive integer)",
      "direction": "long | short",
      "entry_zone": "number (price)",
      "target": "number (price)",
      "stop_loss": "number (price)",
      "conviction": "high | moderate | low",
      "setup_quality": "A+ | A | B+ | B | C",
      "momentum_score": "number (0-100, optional)",
      "reasoning": "string (1-3 sentences)",
      "risks": "string (key risks)",
      "position_size_pct": "number (% of capital, e.g., 5)",
      "max_hold_days": "number (typically 3-7)",
      "tags": ["array of strings, e.g., tech, growth, breakout"]
    }
  ]
}
```

### Optional Enhancement Fields

- `analyst_upgrades`: number (count of recent upgrades)
- `earnings_surprise_history`: string (e.g., "4/4 beats")
- `options_flow`: string (e.g., "heavy call buying")
- `relative_strength`: number (vs SPY, 0-100)
- `volume_surge`: boolean (true if volume > 2x average)

---

## UI Expectations for SPA

### Card Header
- **Symbol** (large, bold) + **Name** (smaller)
- **Earnings date** badge (e.g., "📅 Earnings: Mar 15")
- **Days to earnings** (e.g., "T-5 days" with urgency color: green >7 days, yellow 4-7, red <4)

### Card Body
- **Direction**: LONG/SHORT with color coding (green/red)
- **Entry zone** → **Target** (with % gain calculation)
- **Stop loss** (with % risk calculation)
- **Conviction badge**: High (green), Moderate (yellow), Low (gray)
- **Setup quality**: A+/A/B+/B/C as colored badge
- **Reasoning**: 1-3 sentence summary
- **Risks**: Brief bullet points

### Card Footer
- **Position size**: X% of capital
- **Max hold**: X days
- **Tags**: Small pill badges (tech, growth, breakout, etc.)

### Sorting
- **Primary**: By conviction (high → moderate → low)
- **Secondary**: By days_to_earnings (ascending - most urgent first)

---

## Textbook Setup Examples

### Example 1: Classic Pre-Earnings Run-Up (Long)

**Setup:**
- **Symbol**: NVDA (NVIDIA)
- **Earnings Date**: 2026-03-18 (T-8 days)
- **Entry**: $920 (current price after consolidation)
- **Target**: $960 (+4.3%)
- **Stop Loss**: $895 (-2.7%)
- **Conviction**: High
- **Setup Quality**: A+

**Reasoning:**
- NVIDIA consolidating after strong rally
- Analyst consensus upgrades ahead of AI data center earnings
- Heavy call option buying (3:1 call/put ratio)
- Technical: holding above 50-day MA, RSI neutral at 55
- Sector strength: semiconductors outperforming

**Risks:**
- Broad market pullback could drag stock down despite fundamentals
- High valuation (P/E 45x) sensitive to rate concerns
- Crowded trade - many investors positioned for beat

**Position Size**: 8% of capital  
**Max Hold**: 5 days (close 3 days before earnings)

---

### Example 2: Earnings Downgrade Short (Short)

**Setup:**
- **Symbol**: NFLX (Netflix)
- **Earnings Date**: 2026-03-20 (T-6 days)
- **Entry**: $485 (short at current resistance)
- **Target**: $460 (-5.2%)
- **Stop Loss**: $495 (+2.1%)
- **Conviction**: Moderate
- **Setup Quality**: B+

**Reasoning:**
- Multiple analyst downgrades this week (3 cuts)
- Subscriber growth concerns after weak Q4
- Technical: failed breakout at $490, now rejecting resistance
- Options flow: increasing put buying
- Sector weakness: streaming stocks underperforming

**Risks:**
- Company could surprise with strong guidance
- Streaming sector highly volatile - headlines can reverse sentiment
- Short squeeze risk if unexpected positive news

**Position Size**: 4% of capital (smaller size for short)  
**Max Hold**: 4 days (close 2 days before earnings)

---

## Confidence Interpretation

### High Conviction
- **Criteria**: 
  - Strong technical setup (A/A+ quality)
  - Multiple confirming signals (upgrades, options flow, sector strength)
  - Clear catalyst (earnings beat expected)
  - Low headline risk
- **Expected Hit Rate**: 65-70%
- **Position Sizing**: 6-10% of capital

### Moderate Conviction
- **Criteria**:
  - Decent technical setup (B+/A quality)
  - Some confirming signals
  - Less certain earnings outcome
  - Moderate headline risk
- **Expected Hit Rate**: 50-60%
- **Position Sizing**: 3-6% of capital

### Low Conviction
- **Criteria**:
  - Marginal technical setup (B/C quality)
  - Mixed signals
  - High uncertainty
  - Significant headline risk
- **Expected Hit Rate**: 40-50%
- **Position Sizing**: 1-3% of capital (or skip)

---

## Risk Warnings

### Binary Event Risk
- **Gap Risk**: Earnings reports can cause 5-15% overnight gaps that blow through stop losses
- **Mitigation**: Exit 1-3 days before earnings unless conviction is extremely high
- **Never hold through earnings** with leveraged positions (5x+)

### Momentum Reversal Risk
- **Crowded Trades**: Popular pre-earnings plays can reverse violently if sentiment shifts
- **Mitigation**: Tighten stops if position moves against you quickly
- **Watch for:** Sudden analyst downgrades, sector rotation, broad market weakness

### Leverage Risk
- **5-10x leverage** amplifies both gains and losses
- A 2% adverse move = 10-20% portfolio loss at max leverage
- **Mitigation**: Use smaller position sizes with higher leverage, strict stop losses

### Headline Risk
- **Macro Events**: Fed announcements, geopolitical events can override earnings momentum
- **Sector Rotation**: Sudden shift out of growth/tech can kill momentum plays
- **Mitigation**: Monitor VIX and broad market sentiment daily, cut positions if regime shifts

---

## Strategy-Level Performance Notes

**Best Market Conditions:**
- Bull markets with low VIX (<18)
- Strong sector momentum (tech, growth outperforming)
- Positive earnings season sentiment (high beat rates)

**Worst Market Conditions:**
- High volatility (VIX >25)
- Bear markets or correction phases
- Earnings recession (companies missing estimates)

**Typical Drawdowns:**
- Individual position: -2% to -5% (stop loss hits)
- Strategy monthly: -5% to -10% during rough earnings seasons

**Expected Win Rate**: 55-65% (varies by market regime)

---

## Related Strategies

- **Volatility Plays**: Can overlap with pre-earnings setups when IV is elevated
- **Macro Events**: Coordinate with Fed/CPI events that may impact earnings sentiment
- **Post-Crash Rebound**: Avoid pre-earnings momentum during post-crash periods (wait for stabilization)
