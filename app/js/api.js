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
  'AVAX': '44883'
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
// EQUITY PRICE API (Yahoo Finance)
// Uses the unofficial chart endpoint — no API key, CORS-friendly from browser
// Swap interface: replace fetchYahooPrice with any other provider without
// touching the unified fetchLivePrice dispatcher below.
// ============================================================================

/**
 * Non-equity, non-FX tickers that should NOT go to Yahoo Finance.
 * Equity indices and commodities traded as CFDs (US500, NAS100, USOIL, DE40)
 * have no Yahoo Finance listing — skip live price for these.
 */
const YAHOO_UNSUPPORTED = new Set([
  'US500', 'NAS100', 'DE40', 'USOIL',
  'BTC-USD', 'SOL-USD' // pair-trade legs expressed as Yahoo symbols — handled by Coinlore instead
]);

const equityPriceCache = {};
const EQUITY_CACHE_TTL = 5 * 60 * 1000;

/**
 * Returns true if ticker should be routed to Yahoo Finance.
 * Residual: not crypto, not FX/metal, not a known CFD index/commodity.
 */
export function isEquityTicker(ticker) {
  if (!ticker) return false;
  const upper = ticker.toUpperCase();
  return !isCryptoTicker(upper) && !isFxMetalSymbol(upper) && !YAHOO_UNSUPPORTED.has(upper);
}

/**
 * Fetch live equity price from Yahoo Finance chart API.
 * Returns { price, change, changePct, currency } or null on failure.
 * @param {string} ticker - Standard equity ticker (e.g. "AAPL", "AVGO", "NVO")
 */
export async function fetchYahooPrice(ticker) {
  const upperTicker = ticker.toUpperCase();

  const now = Date.now();
  if (equityPriceCache[upperTicker] && (now - equityPriceCache[upperTicker].timestamp < EQUITY_CACHE_TTL)) {
    return equityPriceCache[upperTicker].data;
  }

  try {
    // Yahoo Finance unofficial chart endpoint — returns JSON, CORS-allowed from browsers
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1d`;
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const json = await response.json();
    const result = json?.chart?.result?.[0];
    if (!result) throw new Error('No result in Yahoo Finance response');

    const meta = result.meta;
    const price = meta.regularMarketPrice ?? meta.previousClose;
    const prevClose = meta.chartPreviousClose ?? meta.previousClose;
    const currency = meta.currency ?? 'USD';

    if (price == null || isNaN(price)) throw new Error('Invalid price in Yahoo Finance response');

    const change = prevClose ? price - prevClose : null;
    const changePct = prevClose ? ((price - prevClose) / prevClose) * 100 : null;

    const data = { price, change, changePct, currency, source: 'yahoo' };
    equityPriceCache[upperTicker] = { data, timestamp: now };
    return data;
  } catch (error) {
    console.error(`Yahoo Finance fetch failed for ${ticker}:`, error);
    return null;
  }
}

// ============================================================================
// UNIFIED LIVE PRICE DISPATCHER
// ============================================================================

/**
 * Fetch live price for any ticker/symbol.
 * Routes: crypto → Coinlore | FX/metals → fawazahmed0 | equity → Yahoo Finance
 * Returns null (not thrown) for unsupported or failed tickers.
 */
export async function fetchLivePrice(tickerOrSymbol) {
  if (isCryptoTicker(tickerOrSymbol)) {
    const result = await fetchCryptoPrice(tickerOrSymbol);
    return result ? { ...result, source: 'coinlore' } : null;
  }
  if (isFxMetalSymbol(tickerOrSymbol)) {
    const result = await fetchFxMetalPrice(tickerOrSymbol);
    return result ? { ...result, source: 'fawazahmed0' } : null;
  }
  if (isEquityTicker(tickerOrSymbol)) {
    return await fetchYahooPrice(tickerOrSymbol); // already includes source: 'yahoo'
  }
  console.warn(`fetchLivePrice: unsupported ticker/symbol — ${tickerOrSymbol}`);
  return null;
}
