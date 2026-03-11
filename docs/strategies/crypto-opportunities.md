# Crypto Opportunities

**Strategy Type:** Range breakout / momentum swing
**Typical Holding Period:** 1-7 days
**Target Instruments:** BTC, ETH, SOL, XRP, ADA
**Platform:** Revolut X (lower fees, limit orders, API access)

---

## Strategy Purpose

Capture range breakouts and momentum plays in major cryptocurrencies with tight risk control. Use Revolut X for lower fees and better execution compared to Revolut standard crypto.

---

## Entry Criteria

### Setup Types

1. **Range breakout:** Price breaks above multi-day consolidation range on strong volume
2. **Momentum continuation:** Crypto already trending; enter on pullback to key support
3. **Macro catalyst:** Major news (ETF approvals, regulatory clarity, Bitcoin halving)

### Confirmation

- **Volume:** Breakout must be accompanied by 2x average volume
- **BTC correlation:** Check BTC trend; altcoins rarely rally if BTC is dumping
- **Clean technical level:** Entry near clear support/resistance, not mid-range

### Timing

- Avoid weekend entries (low liquidity, high spreads)
- Best entry: Monday-Thursday, 10:00-20:00 CET (high liquidity overlap)

---

## Exit Rules

1. **Partial profit:** Close 50% at +10% gain
2. **Trailing stop:** Move stop to breakeven after +5%, trail by -5% for extended runs
3. **Max hold:** Exit within 7 days if no momentum (crypto ranges can persist for weeks)
4. **Stop loss:** -8% max (crypto volatility requires wider stops than equities)

---

## Risk Profile

**Strategy-level confidence:** Low to Moderate (extreme volatility)

**Key risks:**

- **Extreme volatility:** 10-20% intraday swings are common
- **Leverage danger:** Maximum 3x leverage (Revolut X caps at 3x); higher leverage = wipeout risk
- **Liquidity gaps:** Thin order books can cause slippage on market orders
- **Weekend gaps:** Crypto trades 24/7; large gaps during low-liquidity periods
- **Regulatory risk:** Sudden regulatory news can crash prices instantly

**Typical drawdown:** 8-15% per trade (wide stops required)

---

## JSON Watchlist Schema

### File-level fields

```json
{
  "file_type": "watchlist",
  "strategy": "crypto_opportunities",
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

- `crypto_type` (string): "layer1", "defi", "meme", "payment"
- `market_cap_rank` (number): CoinGecko/CoinMarketCap rank
- `btc_correlation` (string): "high", "moderate", "low"
- `leverage` (number): 1-3x (Revolut X max)
- `setup_type` (string): "range_breakout", "momentum_continuation", "macro_catalyst"

---

## SPA UI Expectations

### Card Display

1. **Header:** Ticker + Name (e.g. "BTC - Bitcoin")
2. **Price & % change (24h):** Show high volatility context
3. **Setup type badge:** "Range Breakout" or "Momentum Play"
4. **Entry zone & trigger**
5. **Risk/Reward:** Stop, target, R:R ratio
6. **Leverage warning:** "Max 3x leverage" (if leveraged position suggested)
7. **BTC correlation note:** "Follows BTC closely" or "Low BTC correlation"
8. **Conviction badge**

### Tab Header

- **Strategy description:** "Trade crypto breakouts with extreme risk control. Max 3x leverage. Avoid weekend entries."
- **Strategy confidence:** "Low to Moderate"
- **Key risks:** "Extreme volatility, leverage danger, liquidity gaps, regulatory risk"

---

## Textbook Setup Example

**Ticker:** ETH (Ethereum)
**Setup:** Range breakout after 2-week consolidation
**Entry trigger:** Daily close above $4200 with volume >2x average
**Entry:** $4210
**Stop loss:** $3900 (-7.4%)
**Take profit:** $4800 (+14.0%)
**Risk/Reward:** 1:1.9
**Conviction:** Moderate
**Leverage:** 2x (Revolut X)
**Position size:** $600 (0.14 ETH with 2x leverage = $1200 exposure)
**Rationale:** ETH consolidating in $3900-4200 range for 2 weeks. Breakout above resistance on strong volume suggests continuation to $4800 (previous high). BTC trending up (supportive backdrop).

**Exit plan:**

- Sell 50% at $4500 (+6.9%)
- Trail remainder with stop at $4300, targeting $4800

---

## Platform: Revolut X vs Revolut Standard

### Why Revolut X?

- **Lower fees:** 0.2% vs 1.5% on Revolut standard
- **Limit orders:** Avoid slippage with limit orders
- **API access:** (Future) programmatic trading
- **Better liquidity:** Deeper order books

### Revolut X Constraints

- **Max leverage:** 3x (hard cap)
- **Margin requirements:** Higher collateral needed vs CFDs
- **Crypto-only:** Can't trade stocks/commodities on Revolut X

---

## Strategy Evolution Notes

- Track **BTC correlation impact**; if altcoins consistently fail when BTC dips, focus more on BTC trades
- Monitor **weekend performance**; if weekend entries underperform, enforce strict Mon-Thu entry rule
- Analyze **leverage outcomes**; if leveraged trades hit stops more often, reduce to 1x (no leverage)
