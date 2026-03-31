/**
 * fetch-equity-prices.mjs
 *
 * Fetches 7-day closing price history for all equity and crypto symbols
 * used in the Trading Copilot SPA and writes them as static JSON files to
 * app/public/prices/<TICKER>.json
 *
 * Called by the GitHub Actions workflow .github/workflows/fetch-equity-prices.yml
 * No npm dependencies needed - uses Node.js built-in fetch (Node 18+).
 *
 * Symbols covered (Week of 2026-03-31):
 *   Pair Trades    : XOM, CVX, LLY, COST, SPY, ALK, NVO, WMT
 *   Post-Crash     : DLTR, GLD
 *   Pre-Earnings   : ACN, JNJ, PEP, PG, KO
 *   Crypto         : BTC-USD, ETH-USD, SOL-USD
 *   Macro/Vol      : (index proxies via SPY, GLD, covered above)
 *
 * Removed this week (2026-03-31):
 *   UAL  - XOM/UAL pair removed (UAL short stop $96.50 hit Mar 23)
 *   LMT  - LMT/CCL pair removed (LMT long stop $608 breached Mar 30)
 *   CCL  - LMT/CCL pair removed (CCL short stop $27 breached)
 *   MDB  - post-crash removed (stop $248 breached, close $234.83 Mar 30)
 *   BNTX - post-crash removed (stale >1.5x holding window)
 *   MU   - pre-earnings removed (stop $385 breached, low $318.40 Mar 30)
 *   LULU - pre-earnings removed (earnings already passed Mar 21)
 *   PAYX - pre-earnings removed (earnings passed Mar 25 BMO)
 *   CTAS - pre-earnings removed (earnings passed Mar 25 BMO)
 *   CHWY - pre-earnings removed (earnings passed Mar 25 BMO)
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '..', 'app', 'public', 'prices');

// ── Symbol master list ────────────────────────────────────────────────────────────────────────────────
const EQUITY_SYMBOLS = [
  // Pair Trades – long legs
  'XOM',   // ExxonMobil  (CVX/ALK, XOM/SPY)
  'CVX',   // Chevron     (CVX/ALK)
  'LLY',   // Eli Lilly   (LLY/NVO)
  'COST',  // Costco      (COST/WMT)
  'SPY',   // S&P 500 ETF (XOM/SPY)

  // Pair Trades – short legs (equity)
  'ALK',   // Alaska Air  (CVX/ALK)
  'NVO',   // Novo Nordisk (LLY/NVO)
  'WMT',   // Walmart     (COST/WMT)

  // Post-Crash Recovery
  'DLTR',  // Dollar Tree
  'GLD',   // Gold ETF

  // Pre-Earnings (active April reporters + post-gap)
  'ACN',   // Accenture   (post-gap follow-through)
  'JNJ',   // Johnson & Johnson (Apr 14)
  'PEP',   // PepsiCo     (Apr 16)
  'PG',    // Procter & Gamble (Apr 24)
  'KO',    // Coca-Cola   (Apr 28)
];

const CRYPTO_SYMBOLS = [
  'BTC-USD', // Bitcoin
  'ETH-USD', // Ethereum
  'SOL-USD', // Solana
];

const ALL_SYMBOLS = [...EQUITY_SYMBOLS, ...CRYPTO_SYMBOLS];

// ── Yahoo Finance v8 chart endpoint ────────────────────────────────────────────────────────────
const YF_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart';
const RANGE    = '10d'; // fetch 10 calendar days to ensure 7 trading days
const INTERVAL = '1d';

async function fetchPrices(symbol) {
  const url = `${YF_BASE}/${encodeURIComponent(symbol)}?range=${RANGE}&interval=${INTERVAL}&includePrePost=false`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; TradingCopilot/1.0)',
      'Accept':     'application/json',
    },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${symbol}`);
  }
  const json = await res.json();
  const result = json?.chart?.result?.[0];
  if (!result) {
    throw new Error(`No chart result for ${symbol}`);
  }

  const timestamps = result.timestamp ?? [];
  const closes     = result.indicators?.quote?.[0]?.close ?? [];
  const meta       = result.meta ?? {};

  // Build array of { date, close } – drop nulls (trading halts, weekends)
  const history = timestamps
    .map((ts, i) => ({
      date:  new Date(ts * 1000).toISOString().slice(0, 10),
      close: closes[i] != null ? parseFloat(closes[i].toFixed(4)) : null,
    }))
    .filter(d => d.close !== null)
    .slice(-7); // keep only the last 7 trading days

  return {
    symbol,
    currency:      meta.currency      ?? 'USD',
    exchange:      meta.exchangeName  ?? 'UNKNOWN',
    current_price: meta.regularMarketPrice
      ? parseFloat(meta.regularMarketPrice.toFixed(4))
      : (history.at(-1)?.close ?? null),
    prev_close: meta.chartPreviousClose
      ? parseFloat(meta.chartPreviousClose.toFixed(4))
      : null,
    fetched_at: new Date().toISOString(),
    history,
  };
}

// ── Main ─────────────────────────────────────────────────────────────────────────────────────
async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  const results = { success: [], failed: [] };
  const CONCURRENCY = 5; // respect Yahoo rate limits

  for (let i = 0; i < ALL_SYMBOLS.length; i += CONCURRENCY) {
    const batch = ALL_SYMBOLS.slice(i, i + CONCURRENCY);
    await Promise.all(
      batch.map(async symbol => {
        try {
          const data     = await fetchPrices(symbol);
          const filename = join(OUTPUT_DIR, `${symbol}.json`);
          writeFileSync(filename, JSON.stringify(data, null, 2));
          console.log(`[OK]   ${symbol.padEnd(10)} price=${data.current_price}`);
          results.success.push(symbol);
        } catch (err) {
          console.error(`[FAIL] ${symbol.padEnd(10)} ${err.message}`);
          results.failed.push({ symbol, error: err.message });
        }
      })
    );
    // Short pause between batches to avoid 429 rate limiting
    if (i + CONCURRENCY < ALL_SYMBOLS.length) {
      await new Promise(r => setTimeout(r, 600));
    }
  }

  // Write a manifest so the SPA knows which price files are available
  const manifest = {
    generated_at: new Date().toISOString(),
    total:        ALL_SYMBOLS.length,
    success:      results.success.length,
    failed:       results.failed.length,
    symbols:      results.success,
    errors:       results.failed,
  };
  writeFileSync(join(OUTPUT_DIR, '_manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`\nDone: ${results.success.length}/${ALL_SYMBOLS.length} symbols fetched.`);
  if (results.failed.length > 0) {
    console.error('Failed symbols:', results.failed.map(f => f.symbol).join(', '));
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
