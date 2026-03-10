/**
 * API utilities for data fetching
 */

import { CONFIG } from './config.js';

export function getDataUrl(path) {
  return `${CONFIG.dataPath}${path}`;
}

export async function fetchJSON(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return await response.json();
}

// ============================================================================
// CRYPTO PRICE API (Coinlore)
// ============================================================================

const coinloreIds = {
  'BTC': '90',
  'ETH': '80',
  'SOL': '48543',
  'ADA': '257',
  'MATIC': '44870',
  'DOT': '9295',
  'AVAX': '44883',
  'XRP': '58'
};

export function isCryptoTicker(ticker) {
  return ticker && Object.prototype.hasOwnProperty.call(coinloreIds, ticker.toUpperCase());
}

const cryptoPriceCache = {};
const CRYPTO_CACHE_TTL = 60 * 1000;

export async function fetchCryptoPrice(ticker) {
  const upperTicker = ticker.toUpperCase();
  const coinId = coinloreIds[upperTicker];
  if (!coinId) return null;

  const now = Date.now();
  if (cryptoPriceCache[upperTicker] && (now - cryptoPriceCache[upperTicker].timestamp < CRYPTO_CACHE_TTL)) {
    return { price: cryptoPriceCache[upperTicker].price, change24h: cryptoPriceCache[upperTicker].change24h };
  }

  try {
    const response = await fetch(`https://api.coinlore.net/api/ticker/?id=${coinId}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!data || !data[0]) throw new Error('Invalid API response');
    const price = parseFloat(data[0].price_usd);
    const change24h = parseFloat(data[0].percent_change_24h);
    if (isNaN(price) || isNaN(change24h)) throw new Error('Invalid price data');
    cryptoPriceCache[upperTicker] = { price, change24h, timestamp: now };
    return { price, change24h };
  } catch (error) {
    console.error(`Coinlore fetch failed for ${ticker}:`, error);
    return null;
  }
}

// ============================================================================
// FX & METALS PRICE API (fawazahmed0)
// ============================================================================

const fawazahmedSymbols = {
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
  'NZD/USD': 'nzd'
};

export function isFxMetalSymbol(symbol) {
  return symbol && Object.prototype.hasOwnProperty.call(fawazahmedSymbols, symbol.toUpperCase());
}

const fxMetalPriceCache = {};
const FX_CACHE_TTL = 5 * 60 * 1000;

export async function fetchFxMetalPrice(symbol) {
  const upperSymbol = symbol.toUpperCase();
  const currencyCode = fawazahmedSymbols[upperSymbol];
  if (!currencyCode) return null;

  const now = Date.now();
  if (fxMetalPriceCache[upperSymbol] && (now - fxMetalPriceCache[upperSymbol].timestamp < FX_CACHE_TTL)) {
    return { price: fxMetalPriceCache[upperSymbol].rate, timestamp: fxMetalPriceCache[upperSymbol].apiTimestamp };
  }

  try {
    const url = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${currencyCode}.json`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!data || !data[currencyCode] || !data[currencyCode].usd) throw new Error('Invalid API response structure');
    const rateVsUsd = parseFloat(data[currencyCode].usd);
    if (isNaN(rateVsUsd)) throw new Error('Invalid rate data');
    const isMetal = currencyCode.startsWith('x');
    const price = isMetal ? (1 / rateVsUsd) : rateVsUsd;
    fxMetalPriceCache[upperSymbol] = { rate: price, timestamp: now, apiTimestamp: data.date };
    return { price, timestamp: data.date };
  } catch (error) {
    console.error(`fawazahmed0 fetch failed for ${symbol}:`, error);
    return null;
  }
}

export async function fetchFxMetalHistory(symbol) {
  const upperSymbol = symbol.toUpperCase();
  const currencyCode = fawazahmedSymbols[upperSymbol];
  if (!currencyCode) return null;

  try {
    const today = new Date();
    const historical = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      try {
        const response = await fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${dateStr}/v1/currencies/${currencyCode}.json`);
        if (!response.ok) continue;
        const data = await response.json();
        if (!data || !data[currencyCode] || !data[currencyCode].usd) continue;
        const rateVsUsd = parseFloat(data[currencyCode].usd);
        if (isNaN(rateVsUsd)) continue;
        const isMetal = currencyCode.startsWith('x');
        historical.push({ date: dateStr, price: isMetal ? (1 / rateVsUsd) : rateVsUsd });
      } catch (err) {
        console.warn(`fawazahmed0 history fetch failed for ${dateStr}:`, err);
      }
    }
    return historical.length > 0 ? historical : null;
  } catch (error) {
    console.error(`fetchFxMetalHistory failed for ${symbol}:`, error);
    return null;
  }
}

// ============================================================================
// EQUITY PRICE API — DISABLED in vanilla SPA
// Yahoo Finance's chart endpoint blocks browser requests with CORS.
// This function is preserved for the React/Vite phase where calls will be
// proxied via a small backend or serverless function.
// ============================================================================

/**
 * @deprecated Do not call directly from browser — CORS blocked.
 * Re-enable in React/Vite phase via backend proxy.
 */
export async function fetchYahooPrice(_ticker) {
  // CORS-blocked on GitHub Pages; disabled until backend proxy is available.
  return null;
}

/**
 * Returns true if ticker is a known equity (not crypto, not FX/metal).
 * Kept for future use in React/Vite phase.
 */
export function isEquityTicker(ticker) {
  if (!ticker) return false;
  const upper = ticker.toUpperCase();
  return !isCryptoTicker(upper) && !isFxMetalSymbol(upper);
}

// ============================================================================
// UNIFIED LIVE PRICE DISPATCHER
// Crypto → Coinlore | FX/metals → fawazahmed0 | Equities → skipped (CORS)
// ============================================================================

export async function fetchLivePrice(tickerOrSymbol) {
  if (isCryptoTicker(tickerOrSymbol)) {
    const result = await fetchCryptoPrice(tickerOrSymbol);
    return result ? { ...result, source: 'coinlore' } : null;
  }
  if (isFxMetalSymbol(tickerOrSymbol)) {
    const result = await fetchFxMetalPrice(tickerOrSymbol);
    return result ? { ...result, source: 'fawazahmed0' } : null;
  }
  // Equities: no live price in vanilla SPA — silently return null.
  // Yahoo Finance will be re-wired via backend proxy in React/Vite phase.
  return null;
}
