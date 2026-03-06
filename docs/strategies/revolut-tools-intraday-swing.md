# Revolut Tools (Intraday/Swing)

**Strategy Type:** Technical indicator-based swing/intraday trade  
**Typical Holding Period:** 2 hours to 10 days  
**Target Instruments:** Stocks, indices, commodities, forex (any liquid instrument available on Revolut)  
**Platform:** Revolut and Revolut X (leverage up to 5-10x on CFDs)

---

## Strategy Purpose

Leverage Revolut's built-in chart tools and technical indicators (MACD, oscillators, trendlines, support/resistance) to identify high-probability intraday and swing setups. Focus on clean technical signals with tight risk control.

---

## Entry Criteria

### Indicator-Based Signals

1. **MACD crossover:**
   - **Bullish:** MACD line crosses above signal line, histogram turns positive
   - **Bearish:** MACD line crosses below signal line, histogram turns negative
   - Confirmation: Price above/below key moving average (20-day or 50-day)

2. **Oscillator extremes (RSI, Stochastic):**
   - **Oversold bounce:** RSI <30, stochastic <20, with bullish divergence
   - **Overbought fade:** RSI >70, stochastic >80, with bearish divergence
   - Entry on reversal candle (hammer, engulfing)

3. **Trendline/channel breakout:**
   - **Breakout setup:** Price breaks above resistance trendline on strong volume
   - **Breakdown setup:** Price breaks below support trendline on strong volume
   - Confirmation: Retest of broken level (former resistance becomes support, or vice versa)

4. **Support/resistance bounces:**
   - **Long at support:** Price tests major support level (previous low, round number, moving average)
   - **Short at resistance:** Price tests major resistance level (previous high, psychological level)
   - Entry on rejection candle (pin bar, doji)

### Session and Timeframe

- **Intraday (2-8 hours):** Use 15-min or 1-hour charts; trade during high-liquidity sessions (London, NY)
- **Swing (2-10 days):** Use 4-hour or daily charts; hold through multiple sessions

---

## Exit Rules

### Intraday Exits

1. **Partial profit:** Close 50% at first target (typically +2-5%)
2. **End-of-session:** Close all positions by end of trading day (avoid overnight risk)
3. **Stop loss:** -1.5% to -3% max (tight stops for intraday)

### Swing Exits

1. **Partial profit:** Close 50% at +5-8%
2. **Trailing stop:** Move stop to breakeven after +3%, trail by -3%
3. **Max hold:** 10 days (if setup not working, exit)
4. **Stop loss:** -5% max

---

## Risk Profile

**Strategy-level confidence:** Moderate (depends heavily on setup quality and market conditions)

**Key risks:**
- **False signals:** Technical indicators lag; many signals result in whipsaws
- **Overtrading risk:** Easy to overtrade with access to intraday charts; discipline required
- **Leverage risk:** 5-10x CFD leverage amplifies losses; strict stop discipline required
- **Low-liquidity sessions:** Avoid trading during Asian session or market holidays (wide spreads)

**Typical drawdown:** 2-5% per trade (intraday tighter stops, swing wider stops)

---

## JSON Watchlist Schema

### File-level fields

```json
{
  "file_type": "watchlist",
  "strategy": "revolut_tools_intraday_swing",
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
- `signal_type` (string): "macd_crossover", "rsi_oversold", "trendline_breakout", "support_bounce", "resistance_rejection"
- `timeframe` (string): "15min", "1h", "4h", "1d"
- `session` (string): "intraday" or "swing"
- `indicator_readings` (object): Current indicator values
  ```json
  {
    "rsi": 28,
    "macd": -1.2,
    "macd_signal": -0.8,
    "stochastic": 18
  }
  ```
- `setup_quality` (string): "A+", "A", "B" (quality score based on confluence of signals)
- `entry_trigger` (string): Exact condition to enter (e.g. "Enter long on 15-min close above 150.50")
- `leverage` (number): 1-10x (Revolut CFD leverage)

---

## SPA UI Expectations

### Card Display

1. **Header:** Ticker + Name
2. **Signal badge:** "MACD Crossover" or "RSI Oversold" (color-coded: green=bullish, red=bearish)
3. **Timeframe & session:** "4h chart, Swing trade" or "15min chart, Intraday"
4. **Setup quality badge:** "A+" (green), "A" (yellow), "B" (gray)
5. **Indicator stack:** Small panel showing RSI, MACD, Stochastic readings
6. **Entry trigger:** "Enter long on close > $150.50"
7. **Risk/Reward:** Stop, target, R:R ratio
8. **Leverage note:** "5x CFD" (if leveraged)
9. **Conviction badge**
10. **Session note:** "High liquidity: London session 9:00-17:00 CET" or "Avoid Asian session"

### Tab Header

- **Strategy description:** "Trade technical setups using Revolut's MACD, RSI, trendlines, and support/resistance. Intraday and swing timeframes."
- **Strategy confidence:** "Moderate"
- **Key risks:** "False signals, overtrading, leverage risk, low-liquidity sessions"

---

## Textbook Setup Examples

### Example 1: MACD Crossover (Swing)

**Ticker:** AAPL  
**Timeframe:** 4-hour chart  
**Signal:** MACD line crossed above signal line; histogram turned positive  
**Confirmation:** Price broke above 50-day MA ($175) on strong volume  
**Entry:** $176.50 (4h close above $176)  
**Stop loss:** $172 (-2.5%)  
**Take profit:** $186 (+5.4%)  
**Risk/Reward:** 1:2.1  
**Conviction:** High  
**Setup quality:** A+  
**Indicator readings:** RSI 58, MACD 0.8 (signal 0.3), Stochastic 62  
**Rationale:** MACD bullish crossover confirmed by break above 50-day MA. Momentum turning positive. Target recent high at $186.

**Exit plan:**
- Sell 50% at $182 (+3.1%)
- Trail remainder with stop at $178, targeting $186

---

### Example 2: RSI Oversold Bounce (Intraday)

**Ticker:** US500 (S&P 500 Index CFD)  
**Timeframe:** 15-minute chart  
**Signal:** RSI dropped to 22 (oversold), bullish divergence (price making lower lows, RSI making higher lows)  
**Confirmation:** Hammer candle at support ($6850)  
**Entry:** $6860 (15-min close above hammer high)  
**Stop loss:** $6830 (-0.4%)  
**Take profit:** $6920 (+0.9%)  
**Risk/Reward:** 1:2  
**Conviction:** Moderate  
**Setup quality:** A  
**Leverage:** 10x CFD  
**Indicator readings:** RSI 28, MACD -12 (signal -15), Stochastic 15  
**Rationale:** Sharp intraday dip into support with extreme RSI oversold reading. Bullish divergence suggests bounce. Target intraday VWAP at $6920.

**Exit plan:**
- Close 50% at $6890 (+0.4%)
- Close remainder at $6920 or by end of session (whichever first)

---

### Example 3: Trendline Breakout (Swing)

**Ticker:** XAU/USD (Gold CFD)  
**Timeframe:** Daily chart  
**Signal:** Price broke above descending resistance trendline on strong volume  
**Confirmation:** Retest of broken trendline (now support) at $5250  
**Entry:** $5270 (daily close above retest)  
**Stop loss:** $5180 (-1.7%)  
**Take profit:** $5450 (+3.4%)  
**Risk/Reward:** 1:2  
**Conviction:** High  
**Setup quality:** A+  
**Leverage:** 20x CFD  
**Indicator readings:** RSI 62, MACD 18 (signal 12), Stochastic 68  
**Rationale:** Descending trendline broken after 3-week consolidation. Retest of breakout confirmed. Momentum indicators supportive. Target next resistance at $5450.

**Exit plan:**
- Sell 50% at $5350 (+1.5%)
- Trail remainder with stop at $5300, targeting $5450

---

## Revolut Chart Tools Reference

### Available Indicators

- **MACD:** Trend-following momentum indicator; best for swing trades
- **RSI (Relative Strength Index):** Overbought/oversold oscillator; good for reversals
- **Stochastic:** Momentum oscillator; useful for oversold/overbought extremes
- **Moving Averages:** 20-day, 50-day, 200-day; trend filters
- **Bollinger Bands:** Volatility bands; useful for breakouts and mean reversions

### Drawing Tools

- **Trendlines:** Connect swing highs/lows to identify trend direction
- **Horizontal lines:** Mark support/resistance levels
- **Channels:** Parallel trendlines for range-bound trading

### Best Practices

1. **Confluence:** Look for 2-3 signals confirming same direction (e.g. MACD + RSI + trendline break)
2. **Volume confirmation:** Strong moves should be accompanied by above-average volume
3. **Session timing:** Trade during high-liquidity sessions (London 9:00-17:00 CET, NY 15:30-22:00 CET)
4. **Avoid overtrading:** Max 2-3 intraday setups per day; quality over quantity

---

## Strategy Evolution Notes

- Track **signal type win rates**; some signals (MACD crossovers) may outperform others (RSI oversold)
- Monitor **timeframe performance**; intraday may have lower win rate but faster feedback vs swing
- Analyze **setup quality correlation**; if "A+" setups don't outperform "B" setups, recalibrate scoring
- Test **leverage impact**; if stops hit frequently, reduce leverage or widen stops
