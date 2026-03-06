# Pair Trades

**Strategy Type:** Market-neutral relative value  
**Typical Holding Period:** 5-14 days  
**Target Instruments:** US equities (stocks or CFDs)  
**Platform:** Revolut (long stock cash + short CFD, or both CFDs)

---

## Strategy Purpose

Profit from relative performance divergence between two correlated stocks or assets. Go long the expected outperformer and short the expected underperformer, reducing market risk and focusing on stock-specific alpha.

---

## Entry Criteria

### Pair Selection

1. **Same sector:** High correlation (e.g. NVDA/AMD, COST/WMT, XOM/CVX)
2. **Divergent fundamentals:** One facing headwinds, other facing tailwinds (earnings, guidance, margins)
3. **Mean reversion or continuation:** Either trade convergence (spread too wide) or divergence (spread breaking out)

### Confirmation

- **Catalyst clarity:** Identifiable reason for relative outperformance (earnings, sector rotation, margin trends)
- **Spread chart:** Visual confirmation that spread is extreme or breaking out
- **Correlation check:** Ensure stocks typically move together (>0.6 correlation)

### Timing

- Enter when catalyst is clear but not yet fully priced (e.g. 2-3 days before earnings of one leg)
- Avoid entering when both stocks reporting earnings same week (too much noise)

---

## Exit Rules

1. **Target hit:** Close both legs when spread reaches target (typically 5-15% relative move)
2. **Convergence/divergence stalls:** If spread stops moving for 3+ days, exit
3. **Catalyst resolved:** Exit after earnings/news event that was the trade thesis
4. **Max hold:** 14 days (pairs can stay mis-priced for extended periods; don't become a bag holder)
5. **Stop loss:** -5% on spread (close both legs if spread moves against you by 5%)

---

## Risk Profile

**Strategy-level confidence:** Moderate to High (depends on catalyst clarity)

**Key risks:**
- **Beta risk:** If market moves sharply, both legs may move in same direction (pair "breaks")
- **Execution risk:** Hard to execute both legs simultaneously; slippage and timing mismatch
- **Shorting constraints:** Revolut may not always have shares available to short via CFDs
- **Correlation breakdown:** Stocks may de-correlate during trade, invalidating thesis

**Typical drawdown:** 3-5% on spread (market-neutral reduces overall portfolio volatility)

---

## JSON Watchlist Schema

### File-level fields

```json
{
  "file_type": "watchlist",
  "strategy": "pair_trades",
  "last_updated": "ISO 8601 timestamp",
  "week_start": "YYYY-MM-DD",
  "week_end": "YYYY-MM-DD",
  "opportunities": [],
  "previous_week_outcomes": []
}
```

### Opportunity object fields

**Pair-specific structure:** Each opportunity represents **one pair** (not individual legs)

```json
{
  "pair_id": "NVDA_AMD_earnings",
  "long_leg": {
    "ticker": "NVDA",
    "company_name": "NVIDIA Corp.",
    "current_price": 950.0,
    "entry_zone": "945-955",
    "position_size_usd": 1000,
    "shares": 1.05
  },
  "short_leg": {
    "ticker": "AMD",
    "company_name": "Advanced Micro Devices",
    "current_price": 180.0,
    "entry_zone": "178-182",
    "position_size_usd": 1000,
    "units": 5.6
  },
  "spread_target": 15.0,
  "spread_stop": -5.0,
  "expected_holding_days": 7,
  "conviction": "high",
  "rationale": "NVDA earnings expected to beat on AI data center strength; AMD facing margin pressure. Pair spread has room to widen by 10-15%.",
  "catalyst": "NVDA earnings Mar 5, AMD earnings Mar 12",
  "correlation": 0.75,
  "pair_type": "earnings_divergence"
}
```

**Pair types:**
- `earnings_divergence`: One leg beats, other misses
- `sector_rotation`: One subsector outperforms (e.g. semis vs hardware)
- `quality_vs_distressed`: High-quality name vs lower-quality peer
- `mean_reversion`: Spread extremely wide, expecting convergence

---

## SPA UI Expectations

### Card Display (Pair Format)

1. **Header:** "Long NVDA / Short AMD" (both tickers, bold)
2. **Spread chart (optional):** Visual of spread over time (if feasible)
3. **Long leg details:** Ticker, price, entry, position size
4. **Short leg details:** Ticker, price, entry, position size
5. **Spread metrics:** Target spread, stop spread, current spread
6. **Catalyst:** "NVDA earnings Mar 5 vs AMD Mar 12"
7. **Conviction badge**
8. **Rationale:** Why this pair will diverge/converge
9. **Risk note:** "Market-neutral; focus on relative performance"

### Tab Header

- **Strategy description:** "Long/short pairs to profit from relative value. Reduces market risk, focuses on stock-specific alpha."
- **Strategy confidence:** "Moderate to High"
- **Key risks:** "Beta risk, execution risk, shorting constraints, correlation breakdown"

---

## Textbook Setup Example

**Pair:** Long COST / Short WMT  
**Thesis:** Costco's premium membership model and strong comp sales data suggest Q2 beat. Walmart facing margin pressure from e-commerce investments and wage inflation.  
**Long leg:** COST @ $1010, entry $1005-1015, size $1000 (1.0 shares)  
**Short leg:** WMT @ $89, entry $88-90, size $1000 CFD (11.2 units)  
**Spread target:** +12% relative outperformance (COST +6%, WMT -6%)  
**Spread stop:** -5% (exit if WMT outperforms COST by 5%)  
**Catalyst:** COST earnings Mar 7, WMT earnings Mar 14  
**Expected hold:** 7-10 days  
**Conviction:** High  

**Exit plan:**
- Close both legs when spread hits +12%
- If COST earnings disappoints, exit immediately (thesis invalid)
- Max hold 14 days

---

## Execution on Revolut

### Long Leg

- Use **Revolut cash account** (no leverage) for long leg
- Buy limit order to avoid slippage

### Short Leg

- Use **Revolut CFD** (short position)
- Check if stock is available to short (not all stocks supported)
- Use limit order to short at desired price

### Timing

- Execute both legs **within same session** to minimize beta exposure
- If one leg fails to fill, cancel the other

---

## Strategy Evolution Notes

- Track **spread accuracy**; if spreads consistently miss targets, tighten entry criteria or reduce position size
- Monitor **execution slippage**; if average slippage >1%, switch to limit orders only
- Analyze **beta risk events**; if pairs break during market crashes, consider reducing size during high VIX periods
