/// <reference types="vite/client" />
/**
 * Live price API utilities.
 *
 * Crypto    → Coinlore (CORS-friendly, public) for live price
 *             CoinGecko public API (CORS-friendly, no key) for 7-day sparkline history
 * FX/Metals → fawazahmed0 via jsDelivr (CORS-friendly, public)
 * Equities  → Static JSON served from GitHub Pages (updated by scheduled GH Action)
 *             Fallback: no live price shown in SPA (graceful degradation)
 *
 * ─── fawazahmed0 API semantics (IMPORTANT) ───
 * The CDN returns data[code].usd = how many USD one unit of `code` is worth.
 * e.g. xau.usd ≈ 2900 means 1 troy oz gold = $2,900
 * e.g. eur.usd ≈ 1.08  means 1 EUR = $1.08
 * Therefore: price = data[code].usd directly — NO inversion needed.
 */

import { LivePriceData } from './types';

// ─── Crypto (Coinlore — live price) ──────────────────────────────────────────────────────

const coinloreIds: Record<string, string> = {
  BTC: '90',
  ETH: '80',
  SOL: '48543',
  ADA: '257',
  MATIC: '44870',
  DOT: '9295',
  AVAX: '44883',
  XRP: '58',
  LINK: '2751',
  BNB: '2710',
  TON: '54683',
  SUI: '93845',
};

/** Normalise BTC-USD → BTC, ETH-USD → ETH, etc. */
function normaliseCryptoTicker(ticker: string): string {
  return ticker.toUpperCase().replace(/-USD$/, '').replace(/USD$/, '');
}

export function isCryptoTicker(ticker: string): boolean {
  return Object.prototype.hasOwnProperty.call(coinloreIds, normaliseCryptoTicker(ticker));
}

const cryptoCache = new Map<string, { price: number; change24h: number; ts: number }>();
const CRYPTO_TTL = 60_000;

export async function fetchCryptoPrice(ticker: string): Promise<LivePriceData | null> {
  const key = normaliseCryptoTicker(ticker);
  const coinId = coinloreIds[key];
  if (!coinId) return null;

  const cached = cryptoCache.get(key);
  if (cached && Date.now() - cached.ts < CRYPTO_TTL) {
    return { price: cached.price, change24h: cached.change24h, source: 'coinlore' };
  }

  try {
    const res = await fetch(`https://api.coinlore.net/api/ticker/?id=${coinId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json() as Array<{ price_usd: string; percent_change_24h: string }>;
    if (!data?.[0]) throw new Error('Empty response');
    const price = parseFloat(data[0].price_usd);
    const change24h = parseFloat(data[0].percent_change_24h);
    if (isNaN(price)) throw new Error('Invalid price');
    cryptoCache.set(key, { price, change24h, ts: Date.now() });
    return { price, change24h, source: 'coinlore' };
  } catch (err) {
    console.error(`Coinlore fetch failed for ${ticker}:`, err);
    return null;
  }
}

// ─── Crypto (CoinGecko — 7-day sparkline history) ────────────────────────────────────────

const coingeckoIds: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  ADA: 'cardano',
  MATIC: 'matic-network',
  DOT: 'polkadot',
  AVAX: 'avalanche-2',
  XRP: 'ripple',
  LINK: 'chainlink',
  BNB: 'binancecoin',
  TON: 'the-open-network',
  SUI: 'sui',
};

const cryptoHistoryCache = new Map<string, { data: Array<{ date: string; price: number }>; ts: number }>();
const CRYPTO_HISTORY_TTL = 15 * 60_000; // 15 minutes

export async function fetchCryptoHistory(
  ticker: string,
): Promise<Array<{ date: string; price: number }> | null> {
  const key = normaliseCryptoTicker(ticker);
  const geckoId = coingeckoIds[key];
  if (!geckoId) return null;

  const cached = cryptoHistoryCache.get(key);
  if (cached && Date.now() - cached.ts < CRYPTO_HISTORY_TTL) {
    return cached.data;
  }

  try {
    const url = `https://api.coingecko.com/api/v3/coins/${geckoId}/market_chart?vs_currency=usd&days=7&interval=daily`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json() as { prices: Array<[number, number]> };
    if (!json?.prices?.length) throw new Error('No price data');
    // CoinGecko returns [timestamp_ms, price] pairs
    const data = json.prices.map(([ts, price]) => ({
      date: new Date(ts).toISOString().split('T')[0],
      price,
    }));
    cryptoHistoryCache.set(key, { data, ts: Date.now() });
    return data;
  } catch (err) {
    console.error(`CoinGecko history fetch failed for ${ticker}:`, err);
    return null;
  }
}

// ─── FX & Metals (fawazahmed0 via jsDelivr) ───────────────────────────────────────────────

const fawazSymbols: Record<string, string> = {
  'XAU/USD': 'xau',
  'XAG/USD': 'xag',
  'XPT/USD': 'xpt',
  'XPD/USD': 'xpd',
  'EUR/USD': 'eur',
  'GBP/USD': 'gbp',
  'JPY/USD': 'jpy',
  'CHF/USD': 'chf',
  'CAD/USD': 'cad',
  'AUD/USD': 'aud',
  'NZD/USD': 'nzd',
  };


export function isFxMetalSymbol(symbol: string): boolean {
  return Object.prototype.hasOwnProperty.call(fawazSymbols, symbol.toUpperCase());
}

const fxCache = new Map<string, { rate: number; ts: number; apiDate: string }>();
const FX_TTL = 5 * 60_000;

/**
 * Fetch from fawazahmed0 CDN.
 * Returns data[code].usd directly — which IS the price in USD per unit of code.
 * No inversion: the API already returns USD-denominated values for all symbols
 * including precious metals (xau.usd = gold price in USD per troy oz).
 */
async function fawazFetch(code: string, dateTag: string): Promise<number | null> {
  try {
    const url = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${dateTag}/v1/currencies/${code}.json`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json() as { [key: string]: Record<string, number> };
    const priceUsd = (data[code] as Record<string, number> | undefined)?.usd;
    if (priceUsd === undefined || isNaN(priceUsd)) return null;
    return priceUsd;
  } catch {
    return null;
  }
}

export async function fetchFxMetalPrice(symbol: string): Promise<LivePriceData | null> {
  const key = symbol.toUpperCase();
  const code = fawazSymbols[key];
  if (!code) return null;

  const cached = fxCache.get(key);
  if (cached && Date.now() - cached.ts < FX_TTL) {
    return { price: cached.rate, source: 'fawazahmed0' };
  }

  try {
    const priceUsd = await fawazFetch(code, 'latest');
    if (priceUsd === null) throw new Error('No rate from latest');
    // priceUsd is already the correct USD price (no inversion needed)
    fxCache.set(key, { rate: priceUsd, ts: Date.now(), apiDate: 'latest' });
    return { price: priceUsd, source: 'fawazahmed0' };
  } catch (err) {
    console.error(`fawazahmed0 fetch failed for ${symbol}:`, err);
    return null;
  }
}

export async function fetchFxMetalHistory(
  symbol: string,
): Promise<Array<{ date: string; price: number }> | null> {
  const key = symbol.toUpperCase();
  const code = fawazSymbols[key];
  if (!code) return null;

  const today = new Date();
  const results: Array<{ date: string; price: number }> = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    // Try exact date first; fall back to 'latest' only for today (i === 0)
    let priceUsd = await fawazFetch(code, dateStr);
    if (priceUsd === null && i === 0) {
      priceUsd = await fawazFetch(code, 'latest');
    }
    if (priceUsd === null) continue;
    // priceUsd is already correct USD price — no inversion
    results.push({ date: dateStr, price: priceUsd });
  }

  return results.length > 0 ? results : null;
}

// ─── Equities (static JSON from GitHub Pages, updated by scheduled GH Action) ─────────────

/** Fetches pre-built equity price snapshot served from GitHub Pages. */
const equityHistoryCache = new Map<string, { data: Array<{ date: string; price: number }>; ts: number }>();
const EQUITY_HISTORY_TTL = 30 * 60_000; // 30 minutes (data updated ~daily by GH Action)

export async function fetchEquityHistory(
  ticker: string,
): Promise<Array<{ date: string; price: number }> | null> {
  const key = ticker.toUpperCase();
  const cached = equityHistoryCache.get(key);
  if (cached && Date.now() - cached.ts < EQUITY_HISTORY_TTL) return cached.data;

  try {
    const base = import.meta.env.BASE_URL ?? '/';
    const url = `${base}prices/${key}.json`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const raw = await res.json();

    // The GH Action script writes { symbol, history: [{ date, close }] }
    // Normalise both the new format and the legacy flat-array format.
    let data: Array<{ date: string; price: number }>;
    if (raw && Array.isArray(raw.history)) {
      data = raw.history
        .filter((d: { close?: number }) => d.close != null)
        .map((d: { date: string; close: number }) => ({ date: d.date, price: d.close }));
    } else if (Array.isArray(raw)) {
      data = raw;
    } else {
      return null;
    }

    if (data.length === 0) return null;
    equityHistoryCache.set(key, { data, ts: Date.now() });
    return data;
  } catch {
    return null;
  }
}

/** Latest equity price from pre-built JSON (last data point or current_price). */
const equityPriceCache = new Map<string, { price: number; change24h?: number; ts: number }>();

export async function fetchEquityPrice(ticker: string): Promise<LivePriceData | null> {
  const key = ticker.toUpperCase();
  const cached = equityPriceCache.get(key);
  if (cached && Date.now() - cached.ts < EQUITY_HISTORY_TTL) {
    return { price: cached.price, change24h: cached.change24h, source: 'static-json' };
  }

  // Try fetching the raw JSON directly first (contains current_price + prev_close for 24h %)
  try {
    const base = import.meta.env.BASE_URL ?? '/';
    const url = `${base}prices/${key}.json`;
    const res = await fetch(url);
    if (res.ok) {
      const raw = await res.json();
      if (raw && typeof raw.current_price === 'number') {
        let change24h: number | undefined;
        if (typeof raw.prev_close === 'number' && raw.prev_close > 0) {
          change24h = ((raw.current_price - raw.prev_close) / raw.prev_close) * 100;
        }
        equityPriceCache.set(key, { price: raw.current_price, change24h, ts: Date.now() });
        return { price: raw.current_price, change24h, source: 'static-json' };
      }
    }
  } catch { /* fall through to history-based approach */ }

  const history = await fetchEquityHistory(key);
  if (!history || history.length === 0) return null;
  const price = history[history.length - 1].price;
  equityPriceCache.set(key, { price, ts: Date.now() });
  return { price, source: 'static-json' };
}

export function isEquityTicker(ticker: string): boolean {
  return !isCryptoTicker(ticker) && !isFxMetalSymbol(ticker);
}

// ─── Unified dispatcher ──────────────────────────────────────────────────────────────────────

export async function fetchLivePrice(tickerOrSymbol: string): Promise<LivePriceData | null> {
  if (isCryptoTicker(tickerOrSymbol)) return fetchCryptoPrice(tickerOrSymbol);
  if (isFxMetalSymbol(tickerOrSymbol)) return fetchFxMetalPrice(tickerOrSymbol);
  // Equities: try static JSON (served from GitHub Pages, updated daily by GH Action)
  return fetchEquityPrice(tickerOrSymbol);
}

/** Unified history fetcher for sparklines. */
export async function fetchPriceHistory(
  tickerOrSymbol: string,
): Promise<Array<{ date: string; price: number }> | null> {
  if (isCryptoTicker(tickerOrSymbol)) return fetchCryptoHistory(tickerOrSymbol);
  if (isFxMetalSymbol(tickerOrSymbol)) return fetchFxMetalHistory(tickerOrSymbol);
  return fetchEquityHistory(tickerOrSymbol);
}
