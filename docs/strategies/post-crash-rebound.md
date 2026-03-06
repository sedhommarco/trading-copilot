# Post-Crash Rebound Strategy

**Category:** Mean reversion / Recovery plays  
**Trade Horizon:** 3-14 days (post-crash bounce)  
**Typical Holding Period:** 5-10 days  
**Best Market Regime:** Transitioning from panic to cautious bullish

---

## Purpose

Capture the oversold bounce after sharp market crashes, corrections, or sector-specific selloffs. This strategy identifies stocks and indices that have been unjustifiably hammered and are poised for technical rebounds as panic subsides.

**Core thesis:** Markets overshoot to the downside during panic selloffs due to:
- Forced liquidations and margin calls
- Algorithmic selling cascades
- Emotional capitulation by retail investors
- Indiscriminate selling across quality names

**Technical setup:** Look for extreme oversold conditions (RSI <30, price -10%+ from recent highs) combined with emerging stabilization signals (volume exhaustion, bullish divergences, key support levels holding).

---

## Typical Instruments

**Primary (Revolut X):**
- Quality US Mega Caps: AAPL, MSFT, GOOGL (sold off but fundamentally sound)
- Sector Leaders: JPM, UNH, XOM (oversold during broad panic)
- Growth Names: NVDA, TSLA, META (high-beta names that bounce hardest)

**Secondary (Revolut CFDs):**
- US500:CFD (S&P 500) for broad market rebounds
- NSDQ:CFD (Nasdaq 100) for tech-heavy recovery
- Individual sector CFDs if sector-specific crash

**Leverage:** 10-20x for indices (lower risk), 5-10x for individual stocks

---

## Required JSON Schema Fields

### Core Fields

```json
{
  "file_type": "watchlist",
  "strategy": "post_crash_rebound",
  "last_updated": "ISO 8601 timestamp",
  "crash_context": {
    "crash_date": "YYYY-MM-DD",
    "trigger": "string (e.g., Fed hawkish surprise, geopolitical shock)",
    "severity": "minor | moderate | severe",
    "market_phase": "panic | stabilizing | recovering"
  },
  "opportunities": [
    {
      "symbol": "string",
      "name": "string",
      "direction": "long",
      "entry_zone": "number (price)",
      "target": "number (price)",
      "stop_loss": "number (price)",
      "conviction": "high | moderate | low",
      "setup_quality": "A+ | A | B+ | B | C",
      "decline_from_high": "number (% decline, e.g., -12.5)",
      "rsi": "number (0-100)",
      "support_level": "number (key technical support price)",
      "reasoning": "string",
      "risks": "string",
      "position_size_pct": "number",
      "max_hold_days": "number",
      "tags": ["array of strings"]
    }
  ]
}
```

### Optional Enhancement Fields

- `volume_exhaustion`: boolean (true if selling volume declining)
- `bullish_divergence`: boolean (price lower, RSI/MACD higher)
- `institutional_buying`: boolean (signs of smart money accumulation)
- `days_since_low`: number (0 = just bottomed, 3 = bouncing)

---

## UI Expectations for SPA

### Strategy Header (Tab Level)
- **Crash Context Box** (if crash active):
  - "Market Crash: [Trigger]" (e.g., "Fed Hawkish Surprise")
  - "Severity: [Minor/Moderate/Severe]" with color coding
  - "Phase: [Panic/Stabilizing/Recovering]" with icon
  - "Days Since Low: X"

### Card Header
- **Symbol** + **Name**
- **Decline badge**: "-12.5% from high" in red
- **Phase indicator**: "🔴 Panic" / "🟡 Stabilizing" / "🟢 Recovering"

### Card Body
- **Direction**: LONG (green - this strategy is almost always long)
- **Entry zone** → **Target** (with rebound % calculation)
- **Stop loss** (with % risk)
- **RSI**: Display current RSI with color (green if <30 = extremely oversold)
- **Support level**: Key technical level being tested
- **Conviction** and **Setup quality** badges
- **Reasoning**: Why this is a good rebound candidate
- **Risks**: What could prevent the bounce

### Card Footer
- **Decline from high**: -X% (visual severity indicator)
- **Position size**: X% of capital
- **Max hold**: X days
- **Tags**: recovery, oversold, quality, etc.

### Sorting
- **Primary**: By conviction (high → moderate → low)
- **Secondary**: By decline_from_high (most oversold first)

---

## Textbook Setup Examples

### Example 1: Index Rebound After Fed Shock (Long)

**Setup:**
- **Symbol**: US500:CFD (S&P 500)
- **Crash Trigger**: Fed unexpectedly hawkish, rate hike fears
- **Entry**: 4,850 (after -8% decline from 5,270 high)
- **Target**: 5,050 (+4.1% rebound)
- **Stop Loss**: 4,750 (-2.1%)
- **Conviction**: High
- **Setup Quality**: A+

**Technical Indicators:**
- RSI: 28 (extremely oversold)
- Volume: Selling exhaustion (declining volume on down days)
- Support: Holding 200-day MA at 4,840
- Divergence: RSI making higher lows while price makes lower lows

**Reasoning:**
- Market overreacted to Fed comments (no actual policy change yet)
- Quality mega caps down indiscriminately (AAPL, MSFT, GOOGL all -7-9%)
- VIX spiked to 28 (panic peak, usually mean reverts)
- Historical pattern: Fed-driven selloffs often bounce within 3-5 days
- Smart money (institutional) likely accumulating at these levels

**Risks:**
- Fed doubles down with more hawkish rhetoric
- Economic data surprise (inflation spike, weak jobs)
- Geopolitical escalation compounds selling

**Position Size**: 10% of capital  
**Leverage**: 20x (on index CFD)  
**Max Hold**: 7 days

---

### Example 2: Quality Mega Cap Oversold (Long)

**Setup:**
- **Symbol**: AAPL (Apple)
- **Crash Trigger**: Broad tech selloff on rate fears
- **Entry**: $165 (down -11% from $185 recent high)
- **Target**: $175 (+6.1%)
- **Stop Loss**: $160 (-3.0%)
- **Conviction**: Moderate
- **Setup Quality**: A

**Technical Indicators:**
- RSI: 31 (oversold)
- Price: Testing 50-day MA at $163
- Volume: High volume selling (capitulation signal)
- Fundamentals: Strong (beat earnings, growing services revenue)

**Reasoning:**
- Apple sold off indiscriminately despite strong fundamentals
- No company-specific negative news
- Trading at support (50-day MA)
- Institutional ownership stable (no forced selling)
- iPhone 16 cycle positive (strong China demand)

**Risks:**
- Broader market continues lower, dragging AAPL down
- Tech sector rotation accelerates
- Unexpected company-specific negative headline

**Position Size**: 6% of capital  
**Leverage**: 5x  
**Max Hold**: 10 days

---

## Confidence Interpretation

### High Conviction
- **Criteria**:
  - Extremely oversold (RSI <30, decline >10%)
  - Clear panic trigger (not structural problem)
  - Strong fundamentals (quality names)
  - Volume exhaustion + bullish divergence
  - Key support holding
- **Expected Hit Rate**: 70-75%
- **Position Sizing**: 8-12% of capital

### Moderate Conviction
- **Criteria**:
  - Oversold but not extreme (RSI 30-35, decline 7-10%)
  - Less clear panic trigger
  - Decent fundamentals
  - Some technical signals
- **Expected Hit Rate**: 60-65%
- **Position Sizing**: 4-7% of capital

### Low Conviction
- **Criteria**:
  - Mild oversold (RSI 35-40, decline 5-7%)
  - Structural concerns (not just panic)
  - Weak fundamentals
  - Mixed technical signals
- **Expected Hit Rate**: 45-55%
- **Position Sizing**: 2-4% of capital (or skip)

---

## Risk Warnings

### False Bottom Risk (Knife-Catching)
- **Definition**: Entering too early while selling continues
- **Signs**: Price breaks below support, RSI continues falling, volume increasing on down days
- **Mitigation**: 
  - Wait for 1-2 days of stabilization before entering
  - Use smaller position sizes if entering during panic phase
  - Strict stop losses (2-3% max)

### Structural vs Cyclical Risk
- **Cyclical Crash**: Panic-driven, emotional, mean reverts quickly (tradeable)
- **Structural Crash**: Fundamental problems, sustained downtrend (avoid)
- **How to Distinguish**:
  - Cyclical: Sudden trigger, indiscriminate selling, VIX spike >30
  - Structural: Gradual deterioration, sector-specific, rising spreads
- **Mitigation**: Only trade cyclical crashes with clear panic triggers

### Leverage Risk
- **High leverage (10-20x)** means 2-3% adverse move = 20-60% loss
- **Mitigation**: 
  - Use tighter stops (2-3% max)
  - Smaller position sizes despite high conviction
  - Consider reducing leverage if position moves against you

### Regime Shift Risk
- **Risk**: Market enters sustained bear market, no bounce materializes
- **Signs**: VIX stays elevated >30 for weeks, breadth terrible, support levels breaking
- **Mitigation**: 
  - Cut positions quickly if bounce fails within 3-5 days
  - Don't average down into falling knife
  - Reassess regime (may need to switch to short strategies)

---

## Strategy-Level Performance Notes

**Best Market Conditions:**
- Clear panic trigger (Fed, geopolitical) with no structural damage
- VIX spike >25-30 (panic peak)
- Market phase: Stabilizing → Recovering
- Quality names oversold indiscriminately

**Worst Market Conditions:**
- Structural bear market (fundamentals deteriorating)
- No clear panic trigger (slow grind lower)
- Sustained high VIX (crisis mode)
- Weak fundamentals (earnings recession)

**Typical Drawdowns:**
- Individual position: -3% to -5% (stop loss hits)
- Strategy: Can lose 10-15% if mistiming regime shift

**Expected Win Rate**: 65-70% (high when conditions are right)

---

## Related Strategies

- **Volatility Plays**: Highly complementary - VIX spikes during crashes create opportunities
- **Macro Events**: Watch for Fed, CPI, geopolitical catalysts that trigger crashes
- **Pre-Earnings Momentum**: Avoid during crash periods (wait for stabilization first)
