# Volatility Plays Strategy

**Category:** Mean reversion / Volatility trading  
**Trade Horizon:** 1-10 days  
**Typical Holding Period:** 3-7 days  
**Best Market Regime:** High volatility (VIX >20), uncertainty, event-driven spikes

---

## Purpose

Profit from extreme volatility by trading mean reversion in VIX, commodities (especially gold/silver), and high-beta instruments during periods of market stress or geopolitical uncertainty.

**Core thesis:** Volatility spikes are typically short-lived and mean-revert as:
- Panic subsides after initial shock
- Hedges are unwound
- VIX mean reverts from extremes (historical avg ~16-18)
- Flight-to-safety trades (gold, bonds) reverse when fear recedes

**Instruments:** VIX-related products, gold/silver CFDs, high-beta stocks during volatility compression.

---

## Typical Instruments

**Primary (Revolut CFDs):**
- **XAU:CFD** (Gold) - Flight-to-safety during geopolitical risk
- **XAG:CFD** (Silver) - More volatile than gold, industrial demand overlay
- **VIX** (if available as CFD) - Direct volatility trading
- **USDX** (Dollar Index) - Safe-haven currency during risk-off

**Secondary (Revolut X):**
- **High-Beta Tech**: TSLA, NVDA, AMD (compress/expand with VIX)
- **Sector ETFs**: XLE (energy), XLF (financials) - sensitive to volatility regime

**Leverage:** 20-50x for gold/silver (commodities handle leverage well), 5-10x for stocks

---

## Required JSON Schema Fields

### Core Fields

```json
{
  "file_type": "watchlist",
  "strategy": "volatility_plays",
  "last_updated": "ISO 8601 timestamp",
  "volatility_context": {
    "current_vix": "number (e.g., 24.5)",
    "vix_trend": "rising | falling | stable",
    "regime": "low_vol | moderate_vol | high_vol | extreme_vol",
    "trigger": "string (e.g., geopolitical, Fed, earnings)"
  },
  "opportunities": [
    {
      "symbol": "string (e.g., XAU:CFD, TSLA)",
      "name": "string",
      "volatility_play_type": "mean_reversion | breakout | range_trade",
      "direction": "long | short",
      "entry_zone": "number",
      "target": "number",
      "stop_loss": "number",
      "conviction": "high | moderate | low",
      "setup_quality": "A+ | A | B+ | B | C",
      "implied_volatility": "number (optional, for options-like thinking)",
      "vix_level_at_entry": "number (VIX when trade entered)",
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

- `historical_vol`: number (realized volatility %)
- `vix_ma_deviation`: number (% deviation from VIX 20-day MA)
- `correlation_spy`: number (-1 to 1, for gold/VIX)
- `geopolitical_risk_score`: number (0-100)

---

## UI Expectations for SPA

### Strategy Header (Tab Level)
- **Volatility Context Box**:
  - "Current VIX: 24.5" with color (green <18, yellow 18-25, red >25)
  - "Trend: Rising/Falling/Stable" with arrow icon
  - "Regime: High Vol" with badge
  - "Trigger: Geopolitical Risk" (brief explanation)

### Card Header
- **Symbol** + **Name**
- **Play Type Badge**: "Mean Reversion" / "Breakout" / "Range Trade"
- **VIX at Entry**: Display VIX level when trade was entered (context for volatility state)

### Card Body
- **Direction**: LONG/SHORT with color
- **Entry zone** → **Target** (% gain)
- **Stop loss** (% risk)
- **Conviction** and **Setup quality** badges
- **VIX context**: "Entered at VIX 28 (extreme)"
- **Reasoning**: Why this volatility setup is attractive
- **Risks**: Volatility-specific risks (whipsaw, gap, continued spike)

### Card Footer
- **Position size**: X%
- **Max hold**: X days (volatility plays often short-term)
- **Tags**: gold, vix, mean-reversion, geopolitical, etc.

### Sorting
- **Primary**: By conviction
- **Secondary**: By vix_level_at_entry (highest VIX first = most extreme mean reversion setups)

---

## Textbook Setup Examples

### Example 1: Gold Mean Reversion (Short after spike)

**Setup:**
- **Symbol**: XAU:CFD (Gold)
- **Play Type**: Mean Reversion
- **Direction**: SHORT
- **Entry**: $2,680 (after spiking +$80 on Iran escalation fears)
- **Target**: $2,620 (-2.2%)
- **Stop Loss**: $2,700 (+0.7%)
- **Conviction**: High
- **Setup Quality**: A

**Volatility Context:**
- VIX: 26 (elevated, geopolitical risk premium)
- Trigger: Iran-Israel escalation headlines
- Gold spiked +3% in 24 hours (panic buying)

**Technical Setup:**
- Gold at resistance ($2,680 = Feb 2024 high)
- RSI: 78 (extremely overbought)
- Divergence: Price higher, momentum diverging
- Historical: Gold spikes on geopolitical fears usually fade within 3-5 days

**Reasoning:**
- Geopolitical fear spike is overdone (no actual military action yet)
- Gold at technical resistance with RSI >75 (overextended)
- VIX elevated but not extreme (no systemic risk)
- USD strength likely to cap gold upside
- Historical pattern: geopolitical gold spikes mean-revert 70% of the time

**Risks:**
- Geopolitical situation escalates (actual military conflict)
- Flight-to-safety intensifies (market crash, VIX >30)
- USD weakness extends gold rally
- Fed pivot expectations boost gold

**Position Size**: 8% of capital  
**Leverage**: 20x  
**Max Hold**: 5 days

---

### Example 2: High-Beta Stock Volatility Compression (Long)

**Setup:**
- **Symbol**: TSLA (Tesla)
- **Play Type**: Volatility Compression
- **Direction**: LONG
- **Entry**: $210 (after VIX spike to 28, TSLA compressed)
- **Target**: $225 (+7.1%)
- **Stop Loss**: $205 (-2.4%)
- **Conviction**: Moderate
- **Setup Quality**: B+

**Volatility Context:**
- VIX: 28 → 22 (falling from extreme spike)
- Trigger: VIX spiked on Fed fears, now subsiding
- TSLA beta: 2.0 (amplifies VIX moves)

**Technical Setup:**
- TSLA compressed from $230 to $210 (-8.7%) during VIX spike
- Fundamentals unchanged (no TSLA-specific news)
- VIX mean-reverting from 28 → 22 (volatility fading)
- High-beta names typically bounce 2x when VIX falls

**Reasoning:**
- TSLA sold off purely on VIX spike (no company news)
- VIX now mean-reverting from extreme levels
- High-beta stocks (TSLA, NVDA) snap back hardest when volatility fades
- Technical: TSLA found support at $208 (50-day MA)
- Risk-on sentiment returning (tech outperforming)

**Risks:**
- VIX re-spikes (geopolitical or Fed surprise)
- Broad market weakness resumes
- TSLA-specific negative news emerges
- High beta = high risk (can fall 10%+ quickly)

**Position Size**: 5% of capital  
**Leverage**: 5x  
**Max Hold**: 7 days

---

### Example 3: VIX Mean Reversion (Short VIX via proxies)

**Setup:**
- **Symbol**: VIX (or VIX-related instrument)
- **Play Type**: Mean Reversion
- **Direction**: SHORT (betting VIX will fall)
- **Entry**: VIX 32 (extreme spike)
- **Target**: VIX 22 (-31% move)
- **Stop Loss**: VIX 36 (+12.5%)
- **Conviction**: High
- **Setup Quality**: A+

**Volatility Context:**
- VIX spiked from 16 → 32 in 3 days (panic)
- Trigger: Fed hawkish surprise + geopolitical fears
- Historical: VIX >30 mean-reverts within 5-10 days 80% of the time

**Technical Setup:**
- VIX at 2-year highs (extreme panic)
- S&P 500 down only -6% (VIX overshooting fundamentals)
- Put/call ratio: 1.8 (extreme bearish sentiment)
- VIX term structure: steep contango (front month inflated)

**Reasoning:**
- VIX >30 is statistically extreme (99th percentile)
- No systemic crisis (just rate fears + headlines)
- Historical mean reversion to 16-18 range
- Contango structure bleeds VIX products daily
- Sentiment overly bearish (contrarian indicator)

**Risks:**
- Market crash accelerates (VIX → 40+)
- Systemic crisis emerges (banking, geopolitical)
- Fed continues hawkish surprises
- VIX can stay elevated longer than expected

**Position Size**: 6% of capital  
**Instrument**: Short VIX futures or inverse VIX ETFs (if available)  
**Max Hold**: 10 days

---

## Confidence Interpretation

### High Conviction
- **Criteria**:
  - VIX at extreme levels (>28 for shorts, <15 for longs)
  - Clear overextension (RSI >75 or <25)
  - Historical mean reversion pattern applies
  - Technical + sentiment alignment
- **Expected Hit Rate**: 70-75%
- **Position Sizing**: 6-10% of capital

### Moderate Conviction
- **Criteria**:
  - VIX moderately elevated (22-28) or compressed (15-18)
  - Some overextension signals
  - Less clear historical pattern
- **Expected Hit Rate**: 55-65%
- **Position Sizing**: 4-6% of capital

### Low Conviction
- **Criteria**:
  - VIX in normal range (18-22)
  - Mixed signals
  - Unclear catalyst or pattern
- **Expected Hit Rate**: 45-55%
- **Position Sizing**: 2-4% of capital (or skip)

---

## Risk Warnings

### Whipsaw Risk
- **Definition**: Volatility can spike higher before mean-reverting
- **Example**: You short gold at $2,680, it spikes to $2,720 before falling
- **Mitigation**: Use wider stops (2-3%), smaller position sizes, wait for clear exhaustion signals

### Gap Risk
- **Overnight Gaps**: Geopolitical events, Fed surprises can gap positions 5-10%
- **Leverage Amplification**: 20x leverage means 5% gap = 100% loss
- **Mitigation**: 
  - Reduce position size before major events (Fed, CPI, geopolitical escalation)
  - Use lower leverage (10x instead of 20x) for overnight holds
  - Consider closing positions before major announcements

### Extended Volatility Risk
- **Risk**: VIX stays elevated longer than expected (structural regime shift)
- **Signs**: VIX >25 for >4 weeks, sustained crisis mode
- **Mitigation**: 
  - Don't fight the tape if VIX refuses to mean-revert after 7-10 days
  - Cut positions and reassess regime
  - May need to switch from mean reversion to trend-following

### Correlation Risk
- **Risk**: Gold and VIX usually correlate with risk-off, but can decouple
- **Example**: VIX falls but gold stays elevated (inflation fears override risk-off)
- **Mitigation**: Trade each instrument based on its own technicals, not just VIX level

---

## Strategy-Level Performance Notes

**Best Market Conditions:**
- VIX spikes >25-30 (extreme mean reversion opportunities)
- Clear panic triggers (geopolitical, Fed) that fade quickly
- Overextended technical setups (RSI >75 or <25)

**Worst Market Conditions:**
- Sustained crises (VIX stays elevated for months)
- Structural volatility regime shifts (new normal)
- Low volatility grinding markets (VIX <15 for extended periods)

**Typical Drawdowns:**
- Individual position: -2% to -5% (whipsaw, gap)
- Strategy: Can lose 10-15% if VIX extends beyond expectations

**Expected Win Rate**: 65-70% (when trading extreme VIX levels)

---

## Related Strategies

- **Post-Crash Rebound**: Highly complementary - both trade panic extremes
- **Macro Events**: VIX spikes often tied to Fed, CPI, geopolitical catalysts
- **Pre-Earnings Momentum**: Inverse relationship - avoid earnings plays during high VIX
