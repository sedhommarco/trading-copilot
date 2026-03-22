# Crypto Opportunities

**Strategy Type:** Range breakout / momentum swing
**Typical Holding Period:** 1-7 days
**Target Instruments:** BTC, ETH, SOL, XRP, ADA
**Platform:** Revolut X (lower fees, limit orders, API access)
**Watchlist file:** `data/watchlists/crypto.json`

---

## Strategy Purpose

Capture range breakouts and momentum plays in major cryptocurrencies with tight risk control. Use Revolut X for lower fees and better execution compared to Revolut standard crypto.

---

## Entry Criteria

### Setup Types

1. **Range breakout:** Price breaks above multi-day consolidation range on strong volume.
2. **Momentum continuation:** Crypto already trending; enter on pullback to key support.
3. **Macro catalyst:** Major news (ETF approvals, regulatory clarity, Bitcoin halving).

### Confirmation

- **Volume:** Breakout should be accompanied by ~2x average volume.
- **BTC correlation:** Check BTC trend; altcoins rarely rally if BTC is dumping.
- **Clean technical level:** Entry near clear support/resistance, not mid-range.

### Timing

- Avoid weekend entries (low liquidity, high spreads).
- Best entry: Monday–Thursday, 10:00–20:00 CET (high liquidity overlap).

---

## Exit Rules

1. **Partial profit:** Close part of the position around +10% gain.
2. **Trailing stop:** Move stop to breakeven after a clear move in favour; trail by ~5% for extended runs.
3. **Max hold:** Exit within 7 days if no momentum (crypto ranges can persist for weeks).
4. **Stop loss:** Typically -8% max (crypto volatility requires wider stops than equities).

---

## Risk Profile

**Strategy-level confidence:** Low to Moderate (extreme volatility).

**Key risks:**

- **Extreme volatility:** 10–20% intraday swings are common.
- **Leverage danger:** Maximum 3x leverage (Revolut X caps at 3x); higher leverage = wipeout risk.
- **Liquidity gaps:** Thin order books can cause slippage on market orders.
- **Weekend gaps:** Crypto trades 24/7; large gaps during low-liquidity periods.
- **Regulatory risk:** Sudden regulatory news can crash prices instantly.

**Typical drawdown:** 8–15% per trade (wide stops required).

---

## JSON Watchlist Schema (SPA-aligned)

The Crypto strategy uses the **canonical Trading Copilot watchlist schema**. Each opportunity is a standard `Trade` item; there are no extra file-level fields beyond `last_updated` and `opportunities`.[^schema]

```json
{
  "last_updated": "ISO 8601 timestamp",
  "opportunities": [
    {
      "ticker": "BTC",
      "company_name": "Bitcoin",
      "direction": "long",
      "conviction": "high | moderate | low",
      "current_price": 0,
      "entry_zone": "string or number",
      "stop_loss": 0,
      "take_profit": 0,
      "risk_percent": 2,
      "expected_holding_days": 4,
      "trade_setup": "support_bounce | range_breakout | momentum_continuation",
      "entry_trigger": "1-2 sentences: precise entry condition.",
      "rationale": "1-3 sentences: setup + catalyst + key risk."
    }
  ]
}
```

[^schema]: See `docs/INSTRUCTIONS.TRADING.md` and `app/src/types.ts` for the canonical `Trade` and `WatchlistData` types.

### Field notes

- Standard fields (`ticker`, `company_name`, `direction`, `conviction`, `current_price`, `entry_zone`, `stop_loss`, `take_profit`, `risk_percent`, `expected_holding_days`, `rationale`) follow the global schema.
- `trade_setup` and `entry_trigger` are optional text fields used heavily in this strategy to describe the breakout or pullback conditions.
- Do **not** use file-level fields like `file_type`, `strategy`, `week_start`, `week_end`, or `previous_week_outcomes` — the SPA and JSON schemas ignore them.
- Avoid adding per-trade fields such as `position_size_usd`, `market_cap_rank`, `btc_correlation`, `leverage`, or `setup_type` as JSON keys; keep these as narrative in the `rationale` or execution notes instead.

---

## How the SPA renders Crypto cards

At runtime the SPA reads `data/watchlists/crypto.json` into `WatchlistData` and treats each item as a `Trade`:[^schema]

- **Header:** `ticker` + `company_name` and a `conviction` badge (High / Moderate / Low).
- **Price row:** Live price and 24h change (from Coinlore API) plus static `current_price` as a reference anchor.
- **Setup row:** `trade_setup`, `entry_zone`, `stop_loss`, `take_profit`, and implied R:R calculated by the SPA.
- **Body:** `expected_holding_days`, `risk_percent` as "X% risk", and a short `rationale` that explains the setup and key risk.

BTC correlation, leverage, and product choice (Revolut vs Revolut X) are handled in documentation and execution overlays, not in the JSON.

---

## Textbook Setup Example

**Ticker:** ETH (Ethereum)
**Setup:** Range breakout after 2-week consolidation.
**Entry trigger:** Daily close above 4,200 with volume >2x average.
**Entry zone:** 4,210–4,260.
**Stop loss:** 3,900 (~-7.4%).
**Take profit:** 4,800 (~+14.0%).
**Risk/Reward:** ~1:1.9.
**Conviction:** Moderate.

**Rationale example:**

> ETH has consolidated between 3,900–4,200 for two weeks. A breakout and close above 4,200 on 2x average volume would signal a fresh leg higher toward the prior high near 4,800, provided BTC remains in an uptrend and macro risk does not spike.

---

## Platform: Revolut X vs Revolut Standard

### Why Revolut X?

- **Lower fees:** Roughly 0.2% vs ~1.5% on Revolut standard.
- **Limit orders:** Avoid slippage with limit orders.
- **Better liquidity:** Deeper order books.
- **Future-proof:** API access for potential automation.

### Revolut X Constraints

- **Max leverage:** 3x (hard cap).
- **Margin requirements:** Higher collateral needed vs CFDs.
- **Crypto-only:** Stocks/commodities are not available on Revolut X.

---

## Strategy Evolution Notes

- Track **BTC correlation impact**; if altcoins consistently fail when BTC dips, focus more heavily on BTC-only setups.
- Monitor **weekend performance**; if weekend entries underperform, enforce a strict Mon–Thu entry rule.
- Analyse **leverage outcomes**; if leveraged trades hit stops more often than spot positions, scale back to 1x (no leverage) for most setups.

---

## AI Refresh Protocol

### Data Gathering Checklist

1. **BTC price/trend/dominance:** CoinGecko ([coingecko.com/en/coins/bitcoin](https://www.coingecko.com/en/coins/bitcoin) + [/en/global-charts](https://www.coingecko.com/en/global-charts)). Extract: price, 24h vol, 7d/30d%, market cap, BTC dominance %.
2. **Spot ETF flows:** Farside Investors ([farside.co.uk/btc/](https://farside.co.uk/btc/)) or SoSoValue. Extract: daily + weekly net inflow/outflow.
3. **On-chain:** [blockchain.com/explorer/charts](https://www.blockchain.com/explorer/charts) (hash rate, active addresses, exchange flows), Glassnode free tier (MVRV, NUPL), [lookintobitcoin.com](https://www.lookintobitcoin.com/) (Pi Cycle, 200w MA heatmap).
4. **Fear & Greed:** [alternative.me/crypto/fear-and-greed-index/](https://alternative.me/crypto/fear-and-greed-index/) — current value 0-100. Interpretation: 0-25 contrarian bullish BTC-only, 26-45 cautious accumulation, 46-55 neutral, 56-75 tighten stops, 76-100 disqualify new longs.
5. **Regulatory news:** web search "crypto regulation news this week", [coindesk.com/policy/](https://www.coindesk.com/policy/), [cointelegraph.com/tags/regulation](https://cointelegraph.com/tags/regulation).
6. **Altcoin relative performance:** CoinGecko for each (ETH, SOL, XRP, LINK, AVAX, BNB, TON, ADA, SUI) — 7d% minus BTC 7d%. TradingView ratio charts (ETH/BTC, SOL/BTC).
7. **Technical:** TradingView daily — RSI(14), 50d/200d MA position, Bollinger Bands, key S/R.
8. **Funding rates:** Coinglass ([coinglass.com/FundingRate](https://www.coinglass.com/FundingRate)) — BTC+ETH perpetual funding. >0.05% crowded long, <-0.02% crowded short.

### Signal Scoring Matrix

- **HIGH (all 5):** BTC above 200d MA + ETF weekly inflows >$200M + Fear/Greed 30-65 + RSI 35-65 + clear 7-day catalyst. Altcoins additionally: BTC in uptrend AND altcoin outperforming BTC 7d.
- **MODERATE (3+ of 5):** BTC at least sideways + no regulatory headwind + volume >=1.2x 20d avg + price near technical level within 3%.
- **LOW (<3 criteria but defined thesis):** Not purely speculative, specific catalyst exists, BTC not in crash mode (not down >10% 7d).
- **DISQUALIFIED:** Altcoin HIGH during BTC downtrend (below 50d MA), any coin during Extreme Greed (>75) for longs, active SEC enforcement, <$500M daily volume, >3 altcoins simultaneously, entry zone wider than 5%.

### BTC-First Gate Rule

BTC is evaluated first. If BTC < MODERATE, no altcoin can be HIGH. If BTC < LOW, publish empty array.

### Regime-Based Position Caps

| Regime | Max positions | Altcoin rule |
|---|---|---|
| Trending bullish | 7 | All qualify |
| Choppy | 3 | BTC range plays only |
| High volatility | 3 | BTC only above LOW |
| Trending bearish | 2 | BTC only |

### Entry/Exit Precision

- **Entry zone:** nearest support + 2% (BTC) or +3% (alts). Max width 4% BTC, 5% alts.
- **Stop:** next support below entry -1-2%. BTC 5-10% from entry, alts 8-15%.
- **Take profit:** next resistance -1%. R:R minimum 1:1.5.
- **Partial exit:** +50% to TP close 1/3, +75% close 1/3, trail rest at breakeven.

### Cross-Validation

1. Regime consistency — high-vol: altcoins capped LOW.
2. BTC-first gate.
3. No duplicate with pair-trades crypto pairs.
4. Ticker format: plain (BTC, ETH) in crypto.json; BTC-USD format only in pair-trades.
5. Weekend filter: no positions with expected_holding_days < 3 on Fri-Sun refresh.

### Common Mistakes

1. Altcoins in risk-off — enforce BTC-first gate.
2. Wide entry zones — max 4-5% width.
3. False conviction from narrative — user base / partnership announcements aren't trading signals without price confirmation.
4. Missing BTC correlation check for every altcoin.
5. Ticker format inconsistency.
6. Ignoring on-chain top signals (Pi Cycle, MVRV >7).
7. Too many positions (10 positions in high-vol is excessive — cap at 3).
