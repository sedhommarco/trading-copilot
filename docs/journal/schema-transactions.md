# Transaction Schema

**Purpose:** Append-only log of all trade executions (entries, exits, partial closes).  
**File:** `data/journal/transactions.json`  
**Status:** New format (to be implemented alongside legacy `trade-history.json`)

---

## Design Philosophy

### No Recompute Rule

All monetary values (P&L, margin, exposure, fees) are **provided by you from Revolut** and must **never be recalculated** by the SPA or AI. The journal is a record of truth, not a calculation engine.

### Append-Only Log

Transactions are never deleted or modified (only appended). This preserves complete trade history for analysis and learning.

### Commentary-First

Every transaction should include:
- **Notes:** Your observations at time of trade
- **Recommendations:** AI recommendations for future similar setups

These fields are the **primary value** of the journal for learning and iteration.

---

## JSON Structure

### File-level schema

```json
{
  "file_type": "transactions_log",
  "last_updated": "ISO 8601 timestamp",
  "transactions": [
    /* array of transaction objects */
  ]
}
```

### Transaction object fields

#### Core identification

**Required:**
- `id` (string): Unique transaction ID (e.g. `"TX001"`, `"TX002"`)
- `type` (string): `"transaction"`
- `datetime` (string): ISO 8601 timestamp of execution (e.g. `"2026-03-02T21:14:00Z"`)
- `short_description` (string): Human-readable summary (e.g. `"Sell 2 XAU:CFD +$1,285.00"`)

#### Instrument and direction

**Required:**
- `instrument` (string): Ticker or symbol (e.g. `"XAU/USD"`, `"AAPL"`, `"US500"`, `"BTC"`)
- `side` (string): `"buy"` or `"sell"`
- `units` (number): Quantity traded (shares for stocks, oz for gold, contracts for CFDs)
- `price` (number): Execution price per unit

**Optional:**
- `instrument_type` (string): `"stock"`, `"cfd"`, `"crypto"`, `"forex"`
- `currency` (string): `"USD"`, `"EUR"`, etc. (defaults to USD)

#### Financial details

**Required:**
- `exposure` (number): Total exposure in USD (units × price)
- `margin` (number): Margin required/used for this transaction (for CFDs/leveraged trades)
- `fees` (number): Trading fees paid (0 for most Revolut trades)

**Optional:**
- `leverage` (string or number): `"20x"`, `"5x"`, `"1x"` (no leverage)
- `commission` (number): Separate commission if applicable

#### Trade context

**Optional:**
- `strategy` (string): Strategy name (e.g. `"volatility_plays"`, `"pre_earnings_momentum"`)
- `related_position_id` (string): Link to position this transaction opened/closed (e.g. `"POS001"`)
- `tags` (array of strings): Custom tags (e.g. `["partial_close", "stop_loss_hit", "earnings_play"]`)

#### Commentary (PRIMARY VALUE)

**Required:**
- `notes` (string): Your observations, emotions, context at time of trade
- `recommendations` (string): AI-generated recommendations for future similar setups

---

## Complete Example

```json
{
  "file_type": "transactions_log",
  "last_updated": "2026-03-02T22:30:00Z",
  "transactions": [
    {
      "id": "TX001",
      "type": "transaction",
      "datetime": "2026-03-02T21:14:00Z",
      "short_description": "Sell 2 XAU:CFD +$1,285.00",
      "instrument": "XAU/USD",
      "instrument_type": "cfd",
      "side": "sell",
      "units": 2.0,
      "price": 5140.0,
      "exposure": 10280.0,
      "margin": 514.0,
      "fees": 0.0,
      "leverage": "20x",
      "currency": "USD",
      "strategy": "volatility_plays",
      "related_position_id": "POS001",
      "tags": ["partial_close", "profit_taking"],
      "notes": "Partial close on gold position. Price hit first target at 5140. Took profit on 2 units to lock in gains. Holding remaining 2 units with trailing stop.",
      "recommendations": "Good execution. Consider tightening stop on remaining position to 5100 to protect gains. Monitor Iran news and USD strength for exit timing."
    },
    {
      "id": "TX002",
      "type": "transaction",
      "datetime": "2026-03-03T15:45:00Z",
      "short_description": "Buy 10 AAPL +$1,750.00",
      "instrument": "AAPL",
      "instrument_type": "stock",
      "side": "buy",
      "units": 10.0,
      "price": 175.0,
      "exposure": 1750.0,
      "margin": 1750.0,
      "fees": 0.0,
      "leverage": "1x",
      "currency": "USD",
      "strategy": "pre_earnings_momentum",
      "related_position_id": "POS002",
      "tags": ["earnings_play", "entry"],
      "notes": "Entered AAPL 3 days before earnings. Strong analyst upgrades and RSI at 58. Entry at $175 within planned zone ($173-177).",
      "recommendations": "Plan to sell 50% day before earnings (Mar 6). Set alert for $185 (take profit). Stop loss at $168 (-4%)."
    },
    {
      "id": "TX003",
      "type": "transaction",
      "datetime": "2026-03-04T10:22:00Z",
      "short_description": "Sell 5 AAPL +$900.00",
      "instrument": "AAPL",
      "instrument_type": "stock",
      "side": "sell",
      "units": 5.0,
      "price": 180.0,
      "exposure": 900.0,
      "margin": 0.0,
      "fees": 0.0,
      "leverage": "1x",
      "currency": "USD",
      "strategy": "pre_earnings_momentum",
      "related_position_id": "POS002",
      "tags": ["partial_close", "earnings_play"],
      "notes": "Partial close on AAPL. Price hit $180 (+2.9% from entry). Selling 50% as planned before earnings. Realized P&L: +$25 (5 units × $5 gain).",
      "recommendations": "Good discipline. Hold remaining 5 units through earnings with stop at $175 (breakeven). Target $185-190 post-earnings."
    }
  ]
}
```

---

## Field Guidelines

### `short_description`

Format: `"[Side] [Quantity] [Instrument] [+/- Exposure USD]"`

Examples:
- `"Buy 10 AAPL +$1,750.00"`
- `"Sell 2 XAU:CFD +$1,285.00"`
- `"Short 5.6 AMD CFD -$1,000.00"`

### `units`

- **Stocks:** Number of shares (e.g. `10.0`)
- **Gold CFDs:** Troy ounces (e.g. `2.0`)
- **Index CFDs:** Contracts (e.g. `0.15` for US500)
- **Crypto:** Coins (e.g. `0.5` BTC)

### `leverage`

Format: String with "x" suffix (e.g. `"20x"`, `"5x"`, `"1x"`)

- `"1x"` = No leverage (cash stocks, crypto on Revolut X)
- `"5x"` = Typical stock CFD leverage on Revolut
- `"10x"` = Index/commodity CFD leverage
- `"20x"` = Gold CFD max leverage

### `margin`

- **Cash trades (1x leverage):** `margin` = `exposure` (full capital required)
- **Leveraged trades:** `margin` = `exposure / leverage` (e.g. $10,000 exposure ÷ 20x = $500 margin)
- **Closing trades:** `margin` = 0 (capital released)

### `notes` vs `recommendations`

**Notes (your voice):**
- What you observed at time of trade
- Your thought process
- Emotions (fear, FOMO, confidence)
- Deviations from plan

**Recommendations (AI voice):**
- Suggested next actions
- Risk adjustments
- What to monitor
- Lessons learned

---

## SPA Display Guidelines

### Recent Transactions Section

Show most recent 10-20 transactions in reverse chronological order (newest first).

**Card format:**
1. **Header:** `short_description` (bold)
2. **Datetime:** Relative time (e.g. "2 hours ago", "Yesterday 15:45")
3. **Instrument badge:** Ticker + instrument type
4. **Financial summary:** Exposure, margin, leverage (condensed)
5. **Strategy tag:** Small badge
6. **Notes & Recommendations:** Expandable section (collapsed by default, expand on click)

### Filters

- Filter by strategy
- Filter by instrument type
- Filter by date range
- Filter by tags

---

## Migration from `trade-history.json`

### Backwards Compatibility

SPA should support **both** formats:

1. **If `transactions.json` exists:** Use it as primary source
2. **If only `trade-history.json` exists:** Parse legacy format (see `schema-migration.md`)
3. **Graceful fallback:** If both exist, prefer `transactions.json`

### Manual Migration Steps

No automatic migration tool needed. Suggested approach:

1. **Keep `trade-history.json` as-is** for historical reference
2. **Start logging new trades** to `transactions.json` (from now forward)
3. **Optionally backfill** recent trades from `trade-history.json` into `transactions.json` (manual copy-paste with field mapping)

### Field Mapping

Legacy `trade-history.json` → New `transactions.json`:

| Legacy Field | New Field | Notes |
|--------------|-----------|-------|
| `trade_id` | `id` | Rename prefix (e.g. `T001` → `TX001`) |
| `date_open` | `datetime` | For entry transactions |
| `ticker` | `instrument` | Direct mapping |
| `entry_price` | `price` | For entry transactions |
| `position_size_oz_original` | `units` | Direct mapping |
| `leverage` | `leverage` | Convert to string with "x" suffix |
| `margin_used_original` | `margin` | Direct mapping |
| `notes` | `notes` | Direct mapping |

**Partial closes:** Create separate transaction entry for each partial close.

---

## Validation Rules

### Required Field Checks

- `id`, `type`, `datetime`, `short_description`, `instrument`, `side`, `units`, `price`, `exposure`, `margin`, `fees`, `notes`, `recommendations` must all be present

### Business Logic Checks

- `exposure` should approximately equal `units × price` (allow 1% tolerance for rounding)
- `margin` ≤ `exposure` (margin cannot exceed exposure)
- `leverage` should be consistent with `margin / exposure` ratio
- `datetime` must be valid ISO 8601 format
- `side` must be "buy" or "sell"

### Optional GitHub Actions Validation

Future enhancement: `.github/workflows/validate-journal.yml` to check:
- JSON syntax validity
- Required fields present
- Business logic constraints

---

## Strategy Evolution

### Analytics from Transactions

Use transaction log to calculate:

1. **Win rate by strategy:** % of profitable closes per strategy
2. **Average R:R by strategy:** (Avg win size) / (Avg loss size)
3. **Holding time distribution:** How long positions typically held
4. **Leverage usage:** Correlation between leverage and outcomes
5. **Timing patterns:** Best entry times (day of week, time of day)

### Learning from Notes

Periodically review `notes` and `recommendations` to identify:

- Repeated mistakes (FOMO entries, widening stops, revenge trading)
- Successful patterns (patience, partial closes, stop discipline)
- Emotional triggers (fear, greed, overconfidence)

---

## Future Enhancements

### Possible additions to schema:

- `platform` (string): "Revolut", "Revolut X", "Other"
- `order_type` (string): "market", "limit", "stop"
- `slippage` (number): Difference between intended and actual fill price
- `pnl_realized` (number): Realized P&L for this transaction (if closing trade)
- `related_transaction_ids` (array): Links to related transactions (e.g. entry → partial close → final close)

### AI-Generated Insights

Future: AI analyzes transaction patterns and surfaces:

- "You tend to exit winners too early (avg +3% vs targets of +8%)"
- "Your best strategy is volatility_plays (65% win rate vs 52% overall)"
- "Friday entries underperform (48% win rate vs 58% Mon-Thu)"
