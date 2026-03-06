# Legacy Journal Archive

**Date Archived:** 2026-03-06  
**Reason:** Deprecated in favor of new journal format (`transactions.json` and `positions.json`)

---

## What's Here

This folder contains the original `trade-history.json` file from when the Trading Copilot journal system used a single-file format with a `trades` array.

**File:** `trade-history.json`  
**Last Updated:** 2026-03-01  
**Content:** 1 trade (XAUUSD partial close from volatility_plays strategy)

---

## Why Deprecated?

The legacy journal format mixed completed trades and open positions in a single array, making it difficult to:
- Track real-time open positions separately from closed transactions
- Provide per-position recommendations and notes
- Maintain a clean transaction log for historical analysis

**New format (March 2026):**
- `data/journal/transactions.json` — append-only transaction log
- `data/journal/positions.json` — current open positions snapshot

Full schemas: `docs/journal/schema-transactions.md` and `docs/journal/schema-positions.md`

---

## Historical Trade Preserved

**Trade T001 (XAUUSD):**
- Entry: 2026-03-02 00:32 UTC @ 5372.99
- Partial close: 2026-03-02 00:47 UTC @ 5391.9 (1 oz closed, +$18.91 realized)
- Remaining: 2 oz open with TP @ 5450
- Strategy: Volatility plays (20x leverage)

This trade was migrated to the new journal format and subsequently closed. This archive preserves the original structure for reference.

---

## Do Not Modify

This folder is read-only. All new journal entries must go into `data/journal/transactions.json` and `data/journal/positions.json`.
