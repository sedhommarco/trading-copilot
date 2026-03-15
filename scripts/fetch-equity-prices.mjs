/**
 * fetch-equity-prices.mjs
 *
 * Fetches 7-day closing price history for all equity symbols used in the
 * Trading Copilot SPA and writes them as static JSON files to
 * app/public/prices/<TICKER>.json
 *
 * Called by the GitHub Actions workflow .github/workflows/fetch-equity-prices.yml
 * No npm dependencies needed - uses Node.js built-in fetch (Node 18+).
 *
 * Yahoo Finance v8 chart API (server-side, no CORS issue).
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// All equity/index/commodity tickers tracked in the SPA opportunities
// Yahoo Finance symbol mapping (some indices need a ^ prefix or different symbol)
const TICKERS = {
  // Equities (single-name stocks)
  AVGO: 'AVGO',
  MRVL: 'MRVL',
  COST: 'COST',
  CRWV: 'CRWV',
  NVO: 'NVO',
  WMT: 'WMT',
  SOXX: 'SOXX',
  APO: 'APO',
  RUN: 'RUN',
  LLY: 'LLY',
  CRWD: 'CRWD',
  QQQ: 'QQQ',
  ORCL: 'ORCL',
  XOM: 'XOM',
  ALK: 'ALK',
  SE: 'SE',
  MDB: 'MDB',
  BLK: 'BLK',
  WSM: 'WSM',
  BNTX: 'BNTX',
  AMZN: 'AMZN',
  MSFT: 'MSFT',
  UAL: 'UAL',
  MU: 'MU',
  BABA: 'BABA',
  ACN: 'ACN',
  DKS: 'DKS',
  LEN: 'LEN',
  DG: 'DG',

  // Indices (Yahoo Finance uses ^ prefix)
  US500: '^GSPC',
  NAS100: '^NDX',
  DE40: '^GDAXI',
  EU50: '^STOXX50E',

  // Commodities (Yahoo Finance futures for reference / static charts)
  USOIL: 'CL=F',
};

const OUTPUT_DIR = join(__dirname, '..', 'app', 'public', 'prices');

function formatDate(ts) {
  return new Date(ts * 1000).toISOString().split('T')[0];
}

async function fetchHistory(yahooSymbol) {
  const end = Math.floor(Date.now() / 1000);
  const start = end - 8 * 24 * 60 * 60; // 8 days back to ensure 7 trading days
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}`
    + `?interval=1d&period1=${start}&period2=${end}&events=history`;
  const headers = {
    'User-Agent': 'Mozilla/5.0 (compatible; trading-copilot-bot/1.0)',
    'Accept': 'application/json',
  };
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${yahooSymbol}`);
  const json = await res.json();
  const result = json?.chart?.result?.[0];
  if (!result) throw new Error(`No result for ${yahooSymbol}`);
  const timestamps = result.timestamp ?? [];
  const closes = result.indicators?.quote?.[0]?.close ?? [];
  const data = timestamps
    .map((ts, i) => ({
      date: formatDate(ts),
      price: closes[i],
    }))
    .filter(d => d.price != null && !isNaN(d.price))
    // Keep last 7 data points
    .slice(-7);
  return data;
}

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  const results = { ok: [], failed: [] };

  for (const [ticker, yahooSymbol] of Object.entries(TICKERS)) {
    try {
      const data = await fetchHistory(yahooSymbol);
      if (data.length === 0) throw new Error('No data points');
      const outPath = join(OUTPUT_DIR, `${ticker}.json`);
      writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf8');
      console.log(`+ ${ticker} (${yahooSymbol}): ${data.length} data points, latest=${data.at(-1)?.price?.toFixed(2)}`);
      results.ok.push(ticker);
    } catch (err) {
      console.warn(`! ${ticker} (${yahooSymbol}): ${err.message}`);
      results.failed.push(ticker);
      // Write empty-but-valid JSON so the SPA returns null gracefully
      const outPath = join(OUTPUT_DIR, `${ticker}.json`);
      writeFileSync(outPath, '[]', 'utf8');
    }
    // Rate-limit: small delay between requests
    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\nDone: ${results.ok.length} succeeded, ${results.failed.length} failed.`);
  if (results.failed.length) {
    console.log('Failed:', results.failed.join(', '));
  }
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
