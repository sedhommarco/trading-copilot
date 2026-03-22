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
 * Symbols covered (Week of 2026-03-22):
 *   Pair Trades  : XOM, UAL, CVX, ALK, LLY, NVO, COST, WMT, LMT, CCL, SPY
 *   Post-Crash   : MDB, BNTX, DLTR, GLD
 *   Pre-Earnings : MU, CCL, LULU, PAYX, CTAS, ACN, CHWY
 *   Crypto       : BTC-USD, ETH-USD, SOL-USD
 *   Macro/Vol    : (index proxies via SPY, GLD, covered above)
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '..', 'app', 'public', 'prices');

// ── Symbol master list ───────────────────────────────────────────────────────
const EQUITY_SYMBOLS = [
  // Pair Trades – long legs
  'XOM',   // ExxonMobil
  'CVX',   // Chevron
  'LLY',   // Eli Lilly
  'COST',  // Costco
  'LMT',   // Lockheed Martin
  'SPY',   // S&P 500 ETF

  // Pair Trades – short legs (equity)
  'UAL',   // United Airlines
  'ALK',   // Alaska Air
  'NVO',   // Novo Nordisk
  'WMT',   // Walmart
  'CCL',   // Carnival Corp

  // Post-Crash Recovery
  'MDB',   // MongoDB
  'BNTX',  // BioNTech
  'DLTR',  // Dollar Tree
  'GLD',   // Gold ETF

  // Pre-Earnings
  'MU',    // Micron
  'LULU',  // lululemon
  'PAYX',  // Paychex
  'CTAS',  // Cintas
  'ACN',   // Accenture
  'CHWY',  // Chewy
];

const CRYPTO_SYMBOLS = [
  'BTC-USD',   // Bitcoin
  'ETH-USD',   // Ethereum
  'SOL-USD',   // Solana
];

const ALL_SYMBOLS = [...EQUITY_SYMBOLS, ...CRYPTO_SYMBOLS];

// ── Yahoo Finance v8 chart endpoint ─────────────────────────────────────────
const YF_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart';
const RANGE = '10d';   // fetch 10 calendar days to ensure 7 trading days
const INTERVAL = '1d';

async function fetchPrices(symbol) {
  const url = `${YF_BASE}/${encodeURIComponent(symbol)}?range=${RANGE}&interval=${INTERVAL}&includePrePost=false`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; TradingCopilot/1.0)',
      'Accept': 'application/json',
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
  const closes = result.indicators?.quote?.[0]?.close ?? [];
  const meta = result.meta ?? {};

  // Build array of { date, close } – drop nulls (trading halts, weekends)
  const history = timestamps
    .map((ts, i) => ({
      date: new Date(ts * 1000).toISOString().slice(0, 10),
      close: closes[i] != null ? parseFloat(closes[i].toFixed(4)) : null,
    }))
    .filter(d => d.close !== null)
    .slice(-7);  // keep only the last 7 trading days

  return {
    symbol,
    currency: meta.currency ?? 'USD',
    exchange: meta.exchangeName ?? 'UNKNOWN',
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

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  const results = { success: [], failed: [] };
  const CONCURRENCY = 5;   // respect Yahoo rate limits

  for (let i = 0; i < ALL_SYMBOLS.length; i += CONCURRENCY) {
    const batch = ALL_SYMBOLS.slice(i, i + CONCURRENCY);

    await Promise.all(
      batch.map(async symbol => {
        try {
          const data = await fetchPrices(symbol);
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
    total: ALL_SYMBOLS.length,
    success: results.success.length,
    failed: results.failed.length,
    symbols: results.success,
    errors: results.failed,
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
