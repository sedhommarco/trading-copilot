/**
 * Live price API utilities.
 *
 * Crypto  → Coinlore  (CORS-friendly, public)
 * FX/Metals → fawazahmed0 via jsDelivr (CORS-friendly, public)
 * Equities  → disabled in SPA; planned for backend proxy in future phase
 */

import { LivePriceData } from './types';

// ─── Crypto (Coinlore) ─────────────────────────────────────────────────────────────

const coinloreIds: Record<string, string> = {
  BTC: '90',
  ETH: '80',
  SOL: '48543',
  ADA: '257',
  MATIC: '44870',
  DOT: '9295',
  AVAX: '44883',
  XRP: '58',
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

// ─── FX & Metals (fawazahmed0 via jsDelivr) ────────────────────────────────────────────

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

async function fawazFetch(code: string, dateTag: string): Promise<number | null> {
  try {
    const url = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${dateTag}/v1/currencies/${code}.json`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json() as { [key: string]: Record<string, number> };
    const rateVsUsd = (data[code] as Record<string, number> | undefined)?.usd;
    if (!rateVsUsd || isNaN(rateVsUsd)) return null;
    return rateVsUsd;
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
    const rateVsUsd = await fawazFetch(code, 'latest');
    if (rateVsUsd === null) throw new Error('No rate from latest');
    const isMetal = code.startsWith('x');
    const price = isMetal ? 1 / rateVsUsd : rateVsUsd;
    fxCache.set(key, { rate: price, ts: Date.now(), apiDate: 'latest' });
    return { price, source: 'fawazahmed0' };
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
  const isMetal = code.startsWith('x');

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    // Try exact date first; fall back to 'latest' only for today (i === 0)
    let rateVsUsd = await fawazFetch(code, dateStr);
    if (rateVsUsd === null && i === 0) {
      rateVsUsd = await fawazFetch(code, 'latest');
    }
    if (rateVsUsd === null) continue;
    results.push({ date: dateStr, price: isMetal ? 1 / rateVsUsd : rateVsUsd });
  }

  return results.length > 0 ? results : null;
}

// ─── Equities ────────────────────────────────────────────────────────────────────────
// Disabled: Yahoo Finance blocks browser requests via CORS on GitHub Pages.
// Will be re-enabled in a future phase via a backend proxy / serverless function.

export function isEquityTicker(ticker: string): boolean {
  return !isCryptoTicker(ticker) && !isFxMetalSymbol(ticker);
}

// ─── Unified dispatcher ───────────────────────────────────────────────────────────────────

export async function fetchLivePrice(tickerOrSymbol: string): Promise<LivePriceData | null> {
  if (isCryptoTicker(tickerOrSymbol)) return fetchCryptoPrice(tickerOrSymbol);
  if (isFxMetalSymbol(tickerOrSymbol)) return fetchFxMetalPrice(tickerOrSymbol);
  // Equities: silently skip — no CORS-safe provider available in the SPA.
  return null;
}
