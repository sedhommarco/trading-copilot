# Macro & Volatility Events

**Category:** Macro-driven & volatility event plays
**Trade Horizon:** Intraday to 5 days
**Best Market Regime:** High Volatility, Trending (any direction), Range-Bound
**Watchlist file:** `data/watchlists/macro-volatility.json`

---

## Why merged

Volatility Plays and Macro Events were describing the same thing from two angles:

- _Macro Events_ named the calendar trigger (NFP, CPI, ISM, earnings).
- _Volatility Plays_ named the instruments and setups triggered by those same events (US500, XAU/USD, USOIL, NAS100).

Every item in the old `volatility.json` was anchored to a specific macro event. Every item in the old `macro-events.json` specified tradeable instruments and setups. Keeping them separate forced duplication in every refresh and confused the SPA tab count. One family, one file.

---

## Purpose

Capture short-to-medium-term directional or volatility-expansion opportunities triggered by known macro calendar events (NFP, CPI, ISM, Fed, ECB) and geopolitical catalysts (oil supply shocks, safe-haven flows). Both pre-event positioning and post-event fade/breakout plays belong here.

**Core thesis:** High-impact macro events reliably move certain instruments by predictable amounts in predictable directions depending on the surprise direction. The edge is knowing _which_ instruments to watch, _when_ to enter (before, at, or after the event), and having a clear stop anchored to the pre-event level.

---

## Sub-types in this family

| Sub-type                  | Description                                            | `event_tag` values                            |
| ------------------------- | ------------------------------------------------------ | --------------------------------------------- |
| Calendar event plays      | Position around scheduled data releases                | `nfp`, `cpi`, `ism`, `adp_ism`, `fomc`, `ecb` |
| Earnings volatility       | Single-name or sector volatility around major earnings | `earnings`                                    |
| Geopolitical/commodity    | Oil, gold, FX driven by geopolitical headlines         | `geopolitical`, `oil`, `safe_haven`           |
| Post-event mean reversion | Fade the initial overreaction after a release          | any of the above                              |

---

## Typical Instruments

- **Equity indices (CFD):** US500, NAS100, DE40, EU50, UK100
- **Commodities (CFD):** XAU/USD (Gold), XAG/USD (Silver), USOIL, BRENT
- **FX (CFD/Spot):** EUR/USD, GBP/USD, USD/JPY
- **Single-name stocks:** Sector bellwethers around key events (e.g. AVGO/MRVL for AI earnings)

---

## Required JSON Schema Fields

All opportunities follow the **canonical Trading Copilot schema** (see `INSTRUCTIONS.TRADING.md`).

Macro calendar events use the `MacroEvent` sub-type; instrument/price plays use the `Trade` sub-type:

### Calendar event (`MacroEvent` fields used)

```json
{
  "ticker": "N/A",
  "company_name": "Event display name",
  "conviction": "high | moderate | low",
  "event_name": "Full event name",
  "date": "YYYY-MM-DD",
  "time": "HH:MM CET",
  "impact": "very high | high | medium | low",
  "event_tag": "nfp | cpi | ism | fomc | ecb | earnings | geopolitical",
  "tradeable_instruments": ["US500", "XAU/USD"],
  "trade_setup": "direction dependent | volatility spike | mean reversion",
  "recommended_action": "wait for data | reduce exposure | partial de-risk",
  "expected_holding_days": 1,
  "rationale": "string"
}
```

### Instrument/price play (`Trade` fields used)

```json
{
  "ticker": "XAU/USD",
  "company_name": "Gold",
  "direction": "long | short",
  "conviction": "high | moderate | low",
  "current_price": 0,
  "entry_zone": "string or number",
  "stop_loss": 0,
  "take_profit": 0,
  "risk_percent": 3,
  "expected_holding_days": 3,
  "event_tag": "geopolitical | nfp | cpi",
  "trade_setup": "string",
  "entry_trigger": "string",
  "rationale": "string"
}
```

---

## Sorting and display

Cards are sorted first by **conviction** (high → moderate → low), then by **impact** (very high → high → medium → low). Calendar events always display their `event_name`, `date`, `time`, and `tradeable_instruments`. Instrument plays display their `ticker`, `entry_zone`, `stop_loss`, `take_profit`, and a Confidence · Impact badge row.

---

## Regime guidance

| Regime             | Guidance                                                                                |
| ------------------ | --------------------------------------------------------------------------------------- |
| `high volatility`  | Prime window — most calendar events produce outsized moves. Widen stops or reduce size. |
| `trending bullish` | Fade bearish overreactions on strong data; ride momentum on risk-on surprises.          |
| `trending bearish` | Favour downside breaks on weak data; tight stops on any long counter-trend.             |
| `choppy`           | Reduce frequency; only trade the highest-impact events (NFP, CPI, FOMC).                |
| `low volatility`   | Pre-event positioning for IV expansion plays; smaller size.                             |
| `range bound`      | Fade extremes post-event; mean-reversion setups most reliable.                          |

---

## Execution overlays that apply

- **Revolut Tools (Intraday/Swing):** Use MACD and RSI on 15-min/1h charts for precise entry timing around event releases. See `revolut-tools-intraday-swing.md`.
- **Cycles / Sessions / Events:** Check session timing — avoid entering macro trades in low-liquidity Asian session. See `cycles-sessions-events.md`.

---

## AI Refresh Protocol

This section is consumed by the AI agent responsible for refreshing `data/watchlists/macro-volatility.json`. Follow every step in order. Do not skip steps. Do not invent data. Every claim must be traceable to one of the sources below.

---

### Data Gathering Checklist

Complete these steps sequentially. Each step must be finished before proceeding to the next.

**Step 1 — Economic Calendar (Investing.com)**
- URL: https://www.investing.com/economic-calendar/
- Time window: today through +7 calendar days.
- Filter: **High** and **Medium** impact only (3-bull and 2-bull icons).
- Extract for each event: `event_name`, `date` (YYYY-MM-DD), `time` (convert to **CET** — account for daylight saving; EU DST begins last Sunday of March, ends last Sunday of October), `consensus` (expected value), `prior` (previous value), `currency` affected.
- Flag any event where consensus is missing — mark as "consensus unavailable, monitor closer to release".

**Step 2 — Cross-reference ForexFactory**
- URL: https://www.forexfactory.com/calendar
- Same 7-day window.
- Filter: **red** (high impact) and **orange** (medium impact) icons.
- Purpose: confirm event list from Step 1 is complete. Add any events present in ForexFactory but missing from Investing.com.
- Resolve discrepancies: if impact ratings differ between sources, use the higher rating.
- If both sources list the event, record `source_agreement: true`. If only one source lists it, record `source_agreement: false` and note which source.

**Step 3 — Geopolitical Scan**
- Perform a web search: `"geopolitical risks affecting markets [YYYY-MM-DD]"` using the current date.
- Additional searches if relevant: `"oil supply disruption"`, `"trade war tariffs"`, `"central bank emergency"`, `"military conflict markets"`.
- Classify each identified risk into one of three categories:
  - **Ongoing (priced in):** Market has had >5 trading days to digest; VIX is not elevated because of this event specifically. Include for awareness but do not generate a trade card unless there is a new escalation.
  - **Escalating (new risk):** Developing in the last 1-3 days; market has not fully priced it. Generate a trade card if instruments are clearly affected.
  - **De-escalating (relief rally):** Previously elevated risk now receding; look for mean-reversion or risk-on setups.
- Record: risk description, classification, affected instruments, estimated duration.

**Step 4 — Commodity and Safe-Haven Prices**
- Collect current prices and key metrics for the following instruments:
  - **WTI Crude Oil** — ticker: CL=F (or USOIL CFD equivalent). Record: current price, 5-day % change, 20-day % change, distance from 52-week high (%), distance from 52-week low (%).
  - **Gold** — ticker: XAU/USD (use fawazahmed0 API or equivalent reliable source). Record: same metrics as above.
  - **EUR/USD** — spot rate. Record: same metrics as above.
- For each instrument, note whether price is near a significant round number or historical S/R level.

**Step 5 — Volatility Check**
- **VIX level:** Record current VIX value. Classify: <12 = suppressed, 12-15 = low, 15-20 = normal, 20-30 = elevated, 30-40 = high, >40 = extreme.
- **VIX term structure:** Compare VIX (spot) vs VIX3M (3-month). If VIX > VIX3M = **backwardation** (fear, near-term stress). If VIX < VIX3M = **contango** (normal, complacent).
- **S&P 500 vs moving averages:** Record S&P 500 current price, 50-day MA, 200-day MA. Note: above both (bullish), between (transitional), below both (bearish). Check for recent golden cross or death cross.

**Step 6 — Cross-Reference with Market Regime**
- Read `data/market-regime.json`.
- Verify that the regime classification (bullish/bearish/choppy/range-bound/high-vol/low-vol) is consistent with the data gathered in Steps 4-5.
- If inconsistent: flag the inconsistency explicitly in the refresh output. Do not silently override the regime file. Either update the regime file with justification or note the discrepancy in the rationale of affected trade cards.

**Step 7 — Staleness Audit**
- Compare every `date` field in the existing `macro-volatility.json` against the current date.
- **Remove** any calendar event whose date has already passed.
- **Remove** any instrument/price play whose `current_price` was last verified more than 48 hours ago (for intraday setups) or more than 5 days ago (for swing setups), unless you can re-verify the price now.
- **Remove** any instrument play whose entry zone has been breached by more than 1.5% of instrument price (price has moved through and past the zone).
- Log every removal with reason.

---

### Signal Scoring Matrix

Every opportunity must be scored into one of four tiers before inclusion in the watchlist. Apply the criteria strictly — when in doubt, downgrade.

**HIGH conviction**
- Event type: Tier-1 scheduled release (FOMC rate decision, NFP, CPI, ECB rate decision) OR a confirmed geopolitical escalation with direct market impact.
- Volatility condition: VIX > 20 OR VIX term structure in backwardation.
- Consensus/surprise: Clear consensus exists AND there is a plausible reason to expect a deviation (leading indicators, whisper numbers, prior revisions).
- Technical confirmation: Setup confirmed on 4H chart — price at or near identified S/R level, with at least one momentum indicator (MACD, RSI) supporting the direction.
- All four conditions must be met for HIGH.

**MODERATE conviction**
- Event type: Tier-1 or Tier-2 event (ISM, ADP, PPI, retail sales, PMIs, BoE/BoJ decisions, major earnings).
- Volatility condition: VIX between 15 and 25.
- Consensus/surprise: Consensus exists but deviation expectation is uncertain or based on weaker evidence.
- Technical confirmation: Strong technical setup exists (clear S/R, clean trend, indicator alignment) even if fundamental catalyst is less certain.
- At least three of the four conditions must be met for MODERATE.

**LOW conviction**
- Event type: Tier-2 or Tier-3 event (housing data, consumer confidence, regional Fed surveys, secondary earnings).
- Volatility condition: VIX < 15 (too quiet, moves may be muted) OR VIX > 35 (too chaotic, wide stops required).
- Consensus/surprise: Consensus missing or unreliable; limited basis for directional expectation.
- Technical: Speculative setup — S/R levels are ambiguous or price is mid-range with no clear structure.
- Include only if the opportunity has exceptional R:R (>1:3) or fills a diversification gap in the watchlist.

**DISQUALIFIED — Do NOT include**
- Event date has already passed.
- Price data is stale: >48 hours old for intraday setups, >5 days for swing.
- Trade direction contradicts the current market regime (from `market-regime.json`) without an explicit, written justification for the override.
- Binary event with no post-event plan defined (e.g., "long before CPI" with no plan for what to do if CPI is hot vs. cold).
- Risk-to-reward ratio < 1:1.5.
- Stop loss is not anchored to a technical level (round-number stops or arbitrary pip distances are not acceptable).
- Entry zone width exceeds 2% of instrument price.

---

### Entry/Exit Precision Rules

These rules are mandatory for every instrument/price play card in the watchlist.

**1. Entry Zone Calculation**
- Identify the nearest support/resistance level relevant to the trade direction (support for longs, resistance for shorts).
- Identify the nearest EMA/SMA cluster (e.g., 20 EMA, 50 SMA, 200 SMA on the relevant timeframe).
- The entry zone is the **overlap region** between the S/R level and the EMA/SMA cluster.
- Maximum entry zone width: **2% of the instrument's current price**. If the overlap region is wider than 2%, narrow it to the tightest cluster or discard the setup.
- Express entry zone as a range: `"entry_zone": "3,280 – 3,310"`.

**2. Stop Loss Placement**
- **Swing trades (holding >1 day):** Stop = 1.5 x ATR(14) on the daily chart, measured from the entry zone midpoint. The stop must also be placed **beyond** the nearest structural level (below support for longs, above resistance for shorts). Use whichever is wider — ATR-based or structural.
- **Intraday trades (holding <1 day):** Stop = 1.0 x ATR(14) on the 1H chart, same structural requirement.
- Never place a stop at an arbitrary round number or a fixed pip/point distance. The stop must have a technical reason.

**3. Take Profit Targets**
- Minimum risk-to-reward ratios by conviction:
  - **HIGH conviction:** R:R >= 1:2
  - **MODERATE conviction:** R:R >= 1:2.5
  - **LOW conviction:** R:R >= 1:3
- Take-profit level must align with a technical target: next S/R zone, Fibonacci extension, measured move, or prior swing high/low.
- If no technical target exists at the required R:R distance, the setup does not qualify — downgrade or discard.

**4. "Wait for Data" vs. Directional Pre-Event Trades**
- If a scheduled data release occurs **within 24 hours**, the corresponding calendar event card must set `"recommended_action": "wait for data"`.
- **No directional pre-event trades** on the instrument affected by the release, unless the trade is explicitly structured as a **volatility expansion play** (e.g., straddle-equivalent with stops on both sides, or a breakout entry that triggers only post-release).
- **Post-event trades** (entered after the data prints) must reference the **actual data value** vs. consensus in their rationale. Do not copy the pre-event rationale — rewrite it based on the actual surprise direction and magnitude.

---

### Cross-Validation Requirements

Before finalizing the watchlist, run these five checks. All must pass; any failure requires correction before publishing.

1. **Source agreement:** At least 2 of 3 sources (Investing.com, ForexFactory, web search) must agree on the event's importance and timing. If only one source reports the event, demote its impact by one level or add a disclaimer.
2. **Technical-fundamental alignment:** The technical setup direction (long/short) must be consistent with the fundamental thesis (e.g., bearish CPI surprise should not be paired with a long US500 setup). If they conflict, do not include the trade.
3. **Regime consistency:** The trade direction must be consistent with `market-regime.json`, OR the card must contain an explicit `"regime_override_justification"` field explaining why this trade is valid against the prevailing regime.
4. **No internal contradictions:** If a calendar event card says `"recommended_action": "wait for data"`, there must be **no** instrument/price play card with a directional pre-event entry on the same instrument within the same time window. Audit every pair.
5. **Price freshness:** Every `current_price` field must have been verified within 4 hours (intraday setups) or 24 hours (swing setups) of the refresh timestamp. Record the verification timestamp in the rationale or a metadata field.

---

### Common Mistakes to Avoid

These are recurring errors observed in past refreshes. Check for each one explicitly before publishing.

1. **Pre-positioning before binary data releases.** Rule: if a scheduled release (NFP, CPI, FOMC, etc.) is within 24 hours, the calendar card must say `"wait for data"`. No directional instrument trade on the affected pair/index is allowed pre-event, unless it is explicitly a volatility play with defined exits for both outcome directions.

2. **Time zone confusion.** All times in the watchlist must be in **CET** (Central European Time). During EU summer time (last Sunday of March through last Sunday of October), CET becomes CEST (UTC+2). During winter, CET is UTC+1. Always check the current DST status before converting. Common trap: US events are listed in ET — remember ET is CET-6 in winter, CET-6 in summer (both regions shift, but on different dates — there is a ~2 week gap in March and November where the offset is CET-5).

3. **Reporting events that have already occurred.** Before publishing, compare every event `date` against the current date (provided in system context). Remove any event whose date is in the past. If the event occurred today but the time has passed, also remove it.

4. **Stale entry zones.** If the instrument's current price has moved more than 1.5% past the edge of the entry zone (i.e., the zone is no longer reachable without a significant reversal), the entry zone is stale. Either recalculate the zone based on current price action or remove the card entirely.

5. **Ignoring VIX regime changes.** Every trade rationale must include the current VIX level and its classification (suppressed/low/normal/elevated/high/extreme). If VIX has moved more than 3 points since the last refresh, reassess all stop distances and position sizes. Elevated VIX = wider stops = smaller position sizes.

6. **Over-populating the watchlist.** Maximum **10 items** total in `macro-volatility.json`. Prioritize calendar events (they are time-sensitive). Limit instrument/price play cards to **3-5 of the best setups**. If more than 10 candidates exist, cut the lowest-conviction ones first, then the ones with the worst R:R.

7. **Contradictory concurrent trades.** If an event card says `"recommended_action": "wait for data"` for, say, NFP, and there is also a US500 instrument card with a pre-event long entry, that is a contradiction. The instrument card must either be removed, converted to a post-event conditional plan, or restructured as a non-directional volatility play. Audit every calendar-instrument pair for this conflict.
