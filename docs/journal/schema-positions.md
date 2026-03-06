# Position Schema

**Purpose:** Current state snapshot of all open positions.  
**File:** `data/journal/positions.json`  
**Status:** New format (to be implemented alongside legacy `trade-history.json`)

---

## Design Philosophy

### No Recompute Rule

All monetary values (unrealised P&L, margin, exposure, current price) are **provided by you from Revolut** and must **never be recalculated** by the SPA or AI. The positions file is a snapshot of truth from your trading platform.

### Current State Snapshot

This file represents **right now**, not history. It should be updated:

- **Manually:** When you check Revolut and see material price changes
- **Via AI:** During weekly refresh or when you ask for position updates
- **After transactions:** When you open, add to, or close positions

### Risk-First Display

The primary purpose is **risk management**. Positions should prominently display:

1. Unrealised P&L (how much you're up/down)
2. Margin at risk (how much capital tied up)
3. Exposure (total market value)
4. Exit strategy (take profit, stop loss)

---

## JSON Structure

### File-level schema

```json
{
  "file_type": "positions_snapshot",
  "last_updated": "ISO 8601 timestamp",
  "total_unrealised_pnl": 0.0,
  "total_margin_used": 0.0,
  "total_exposure": 0.0,
  "positions": [
    /* array of position objects */
  ]
}
```

### Position object fields

#### Core identification

**Required:**
- `id` (string): Unique position ID (e.g. `"POS001"`, `"POS002"`)
- `type` (string): `"position"`
- `short_description` (string): Human-readable summary (e.g. `"XAU:CFD Buy"`)

#### Instrument and direction

**Required:**
- `instrument` (string): Ticker or symbol (e.g. `"XAU/USD"`, `"AAPL"`, `"US500"`)
- `side` (string): `"long"` or `"short"`
- `units` (number): Current quantity held

**Optional:**
- `instrument_type` (string): `"stock"`, `"cfd"`, `"crypto"`, `"forex"`
- `currency` (string): `"USD"`, `"EUR"`, etc.

#### Entry details

**Required:**
- `entry_price` (number): Average entry price (if multiple entries, use weighted average)
- `entry_datetime` (string): ISO 8601 timestamp of initial entry

**Optional:**
- `entry_transaction_ids` (array): Links to transaction IDs that opened this position (e.g. `["TX001", "TX005"]`)
- `leverage` (string): `"20x"`, `"5x"`, `"1x"`

#### Current state

**Required:**
- `current_price` (number): Latest price from Revolut
- `current_price_datetime` (string): ISO 8601 timestamp of price snapshot
- `unrealised_pnl` (number): Unrealised P&L in USD (positive or negative)
- `margin` (number): Margin currently used for this position
- `exposure` (number): Total market exposure (units × current_price)

**Optional:**
- `pnl_percent` (number): P&L as % of entry exposure (e.g. `+5.2`, `-3.1`)

#### Exit strategy

**Required:**
- `exit_strategy` (object): Take profit and stop loss levels
  ```json
  {
    "take_profit": 5400.0,
    "stop_loss": 5160.0
  }
  ```

**Optional:**
- `exit_strategy.trailing_stop` (number): Trailing stop distance (e.g. `50.0` = trail by $50)
- `exit_strategy.time_stop` (string): "Close by YYYY-MM-DD" (calendar-based exit)
- `alerts` (array): Price levels to set alerts
  ```json
  [
    {"level": 5300.0, "type": "price_alert", "note": "Consider partial close"},
    {"level": 5450.0, "type": "take_profit_alert", "note": "Hit target"}
  ]
  ```

#### Trade context

**Optional:**
- `strategy` (string): Strategy name (e.g. `"volatility_plays"`)
- `holding_days` (number): Days since entry (auto-calculated or manual)
- `tags` (array of strings): Custom tags (e.g. `["high_leverage", "earnings_play", "partial_closed"]`)

#### Commentary (PRIMARY VALUE)

**Required:**
- `notes` (string): Your current thinking on this position
- `recommendations` (string): AI recommendations for managing this position

---

## Complete Example

```json
{
  "file_type": "positions_snapshot",
  "last_updated": "2026-03-02T22:05:00Z",
  "total_unrealised_pnl": -547.44,
  "total_margin_used": 510.17,
  "total_exposure": 10193.0,
  "positions": [
    {
      "id": "POS001",
      "type": "position",
      "short_description": "XAU:CFD Buy",
      "instrument": "XAU/USD",
      "instrument_type": "cfd",
      "side": "long",
      "units": 2.0,
      "entry_price": 5372.99,
      "entry_datetime": "2026-03-02T00:32:00Z",
      "entry_transaction_ids": ["TX001"],
      "leverage": "20x",
      "currency": "USD",
      "current_price": 5099.77,
      "current_price_datetime": "2026-03-02T22:05:00Z",
      "unrealised_pnl": -546.44,
      "pnl_percent": -5.08,
      "margin": 510.17,
      "exposure": 10199.54,
      "exit_strategy": {
        "take_profit": 5400.0,
        "stop_loss": 5160.0,
        "trailing_stop": null
      },
      "alerts": [
        {"level": 5300.0, "type": "price_alert", "note": "Consider tightening stop"},
        {"level": 5160.0, "type": "stop_loss_alert", "note": "Exit immediately"}
      ],
      "strategy": "volatility_plays",
      "holding_days": 0,
      "tags": ["high_leverage", "macro_play", "partial_closed"],
      "notes": "Gold position under pressure. Closed 1 unit at 5391 for small profit. Holding 2 units with stop at 5160. Current drawdown -$546. Iran tensions easing, USD strengthening. Risk/reward deteriorating.",
      "recommendations": "Consider closing entire position if price breaks below 5120. Risk/reward no longer favorable. Alternatively, tighten stop to 5180 to reduce max loss. Do not add to position. Monitor USD and geopolitical news closely."
    },
    {
      "id": "POS002",
      "type": "position",
      "short_description": "AAPL Long",
      "instrument": "AAPL",
      "instrument_type": "stock",
      "side": "long",
      "units": 10.0,
      "entry_price": 175.0,
      "entry_datetime": "2026-03-03T15:45:00Z",
      "entry_transaction_ids": ["TX002"],
      "leverage": "1x",
      "currency": "USD",
      "current_price": 178.5,
      "current_price_datetime": "2026-03-04T20:00:00Z",
      "unrealised_pnl": 35.0,
      "pnl_percent": 2.0,
      "margin": 1750.0,
      "exposure": 1785.0,
      "exit_strategy": {
        "take_profit": 185.0,
        "stop_loss": 168.0,
        "time_stop": "2026-03-06"
      },
      "alerts": [
        {"level": 182.0, "type": "price_alert", "note": "Close 50% (day before earnings)"},
        {"level": 185.0, "type": "take_profit_alert", "note": "Hit target"}
      ],
      "strategy": "pre_earnings_momentum",
      "holding_days": 1,
      "tags": ["earnings_play", "no_leverage"],
      "notes": "AAPL up 2% since entry. Earnings tomorrow. Plan to close 50% today at $180, hold remainder through earnings with stop at $175 (breakeven).",
      "recommendations": "Stick to plan: close 50% today at $180 or better. Hold remaining 5 shares through earnings with tight stop at $175. Target $185-190 post-earnings. If price gaps down >3% on earnings, exit immediately."
    },
    {
      "id": "POS003",
      "type": "position",
      "short_description": "BTC Long",
      "instrument": "BTC",
      "instrument_type": "crypto",
      "side": "long",
      "units": 0.25,
      "entry_price": 68000.0,
      "entry_datetime": "2026-03-01T12:30:00Z",
      "entry_transaction_ids": ["TX010"],
      "leverage": "2x",
      "currency": "USD",
      "current_price": 69500.0,
      "current_price_datetime": "2026-03-04T19:00:00Z",
      "unrealised_pnl": 375.0,
      "pnl_percent": 2.21,
      "margin": 8500.0,
      "exposure": 17375.0,
      "exit_strategy": {
        "take_profit": 72000.0,
        "stop_loss": 66000.0,
        "trailing_stop": 1000.0
      },
      "alerts": [
        {"level": 70000.0, "type": "price_alert", "note": "Consider partial close"},
        {"level": 72000.0, "type": "take_profit_alert", "note": "Target hit"}
      ],
      "strategy": "crypto_opportunities",
      "holding_days": 3,
      "tags": ["crypto", "moderate_leverage", "swing_trade"],
      "notes": "BTC breakout from $66K-68K range. Up 2.2% so far. Trailing stop at -$1000 below peak. Target $72K (previous high).",
      "recommendations": "Consider taking 50% profit at $70K. Move stop to $68K (breakeven) once price hits $70K. Crypto can reverse quickly. Don't get greedy."
    }
  ]
}
```

---

## Field Guidelines

### `short_description`

Format: `"[Instrument] [Side]"`

Examples:
- `"XAU:CFD Buy"`
- `"AAPL Long"`
- `"US500 Short"`
- `"BTC Long"`

### `unrealised_pnl`

Direct from Revolut. Never calculate yourself.

- **Positive:** Green in UI, you're profitable
- **Negative:** Red in UI, you're in drawdown
- **Zero:** Breakeven

### `pnl_percent` (optional convenience field)

If provided: `(current_price - entry_price) / entry_price × 100`

But still trust the **absolute USD P&L** as the source of truth.

### `exit_strategy`

**Take profit:**
- Price level where you plan to close (fully or partially)
- Should be based on technical resistance, round numbers, or R:R targets

**Stop loss:**
- Price level where you **must** exit to cap losses
- Should be based on technical support, % drawdown limit, or risk tolerance
- **Critical:** Never widen stops once set (only tighten)

**Trailing stop:**
- Distance below peak price (for longs) or above low price (for shorts)
- Example: "Trail by $50" means if gold peaks at 5400, stop moves to 5350

**Time stop:**
- Calendar-based exit (e.g. "Close by Mar 6" for earnings trades)
- Useful for event-driven strategies where holding past event is undesirable

---

## SPA Display Guidelines

### Open Positions Section

Show all positions in **risk-prioritized order:**

1. **Largest unrealised loss** (most at-risk positions first)
2. **Then by holding time** (oldest positions)
3. **Then by strategy**

**Card format (expanded):**

1. **Header:** `short_description` + P&L badge (e.g. "XAU:CFD Buy" + "-$546.44 (-5.1%)")
2. **Current state:** Current price, entry price, units
3. **Risk metrics (prominent):**
   - Unrealised P&L (large, color-coded)
   - Margin used (with % of total capital)
   - Exposure (with leverage note if >1x)
4. **Exit strategy block:**
   - Take profit level (green line)
   - Stop loss level (red line)
   - Trailing stop status (if active)
5. **Holding info:** Days held, strategy badge
6. **Notes & Recommendations:** Expandable section
7. **Action buttons:** "Update Price", "Close Position", "Adjust Stops"

### Summary Panel (top of Journal tab)

**Aggregate metrics:**
- **Total Unrealised P&L:** Sum of all positions (color-coded)
- **Total Margin Used:** % of capital tied up
- **Total Exposure:** Gross market exposure across all positions
- **Position Count:** Number of open positions
- **Risk status:** "Low" (<10% capital at risk), "Moderate" (10-20%), "High" (>20%)

---

## Migration from `trade-history.json`

### Extracting Open Positions

From legacy `trade-history.json`, identify trades with:

- `outcome: "open"` or `outcome: "open partial"`

For each open trade:

1. Create a position entry in `positions.json`
2. Map fields:
   - `trade_id` → `id` (e.g. `T001` → `POS001`)
   - `ticker` → `instrument`
   - `entry_price` → `entry_price`
   - `remaining_quantity` → `units`
   - `margin_remaining` → `margin`
   - `take_profit` → `exit_strategy.take_profit`
   - `stop_loss` → `exit_strategy.stop_loss`
   - `notes` → `notes`
3. Add missing fields manually:
   - `current_price` (fetch from Revolut)
   - `current_price_datetime` (now)
   - `unrealised_pnl` (from Revolut)
   - `recommendations` (generate via AI)

---

## Validation Rules

### Required Field Checks

- `id`, `type`, `short_description`, `instrument`, `side`, `units`, `entry_price`, `entry_datetime`, `current_price`, `current_price_datetime`, `unrealised_pnl`, `margin`, `exposure`, `exit_strategy`, `notes`, `recommendations` must all be present

### Business Logic Checks

- `exposure` should approximately equal `units × current_price`
- `unrealised_pnl` should approximately match `(current_price - entry_price) × units` for long positions (allow 2% tolerance)
- `margin` ≤ `exposure`
- `current_price_datetime` should be recent (<24 hours old)
- `exit_strategy.take_profit` should be above `current_price` for longs, below for shorts
- `exit_strategy.stop_loss` should be below `current_price` for longs, above for shorts

---

## Update Frequency

### Manual Updates

- **When opening position:** Create new position entry
- **When closing position:** Remove from `positions.json`, log transaction in `transactions.json`
- **Daily check:** Update `current_price`, `unrealised_pnl`, `margin` from Revolut
- **After major moves:** Update immediately if position P&L changes >5%

### AI-Driven Updates

- **Weekly refresh (Sunday 19:00):** AI updates all positions with latest prices and regenerates recommendations
- **Ad-hoc queries:** When you ask "How are my positions doing?", AI fetches latest data and updates file

---

## Strategy Evolution

### Analytics from Positions

Track over time:

1. **Average holding period:** How long positions typically held before exit
2. **Win rate by holding period:** Do positions held longer perform better?
3. **Leverage impact:** Correlation between leverage and unrealised P&L volatility
4. **Stop discipline:** How often stops hit vs manual exits
5. **Strategy diversification:** % of capital allocated to each strategy

### Risk Monitoring

Alert if:

- Total margin used >80% of capital (overexposed)
- Single position >30% of capital (concentration risk)
- Unrealised losses >20% of capital (drawdown threshold)
- Position held >14 days with no profit (dead capital)

---

## Future Enhancements

### Possible additions:

- `platform` (string): "Revolut", "Revolut X"
- `last_price_check_method` (string): "manual", "api", "ai_refresh"
- `max_loss_limit` (number): Absolute max loss you're willing to take on this position
- `profit_target_hit_count` (number): How many times price touched take profit but you didn't close
- `stop_adjustments` (array): History of stop loss adjustments
  ```json
  [
    {"datetime": "2026-03-02T10:00:00Z", "old_stop": 5100.0, "new_stop": 5160.0, "reason": "Tightened after partial close"}
  ]
  ```

### AI-Generated Insights

- "Your XAU position has been in drawdown for 3 days. Consider tightening stop."
- "AAPL position up 5% but you planned to close 50% yesterday. Execute plan or adjust?"
- "Total exposure 150% of capital. Reduce leverage or close a position."
