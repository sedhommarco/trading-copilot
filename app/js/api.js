/**
 * API utilities for data fetching
 */

import { CONFIG } from './config.js';

/**
 * Get full URL for a data file
 * @param {string} path - Relative path from data directory
 * @returns {string} Full URL
 */
export function getDataUrl(path) {
  return `${CONFIG.dataPath}${path}`;
}

/**
 * Fetch JSON with error handling
 * @param {string} url - URL to fetch
 * @returns {Promise<Object>} Parsed JSON data
 */
export async function fetchJSON(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

// ============================================================================
// CRYPTO PRICE API (Coinlore)
// ============================================================================

/**
 * Mapping of ticker symbols to Coinlore API IDs
 * Coinlore uses numeric IDs instead of ticker symbols
 * API Docs: https://www.coinlore.com/cryptocurrency-data-api
 */
const coinloreIds = {
  'BTC': '90',       // Bitcoin
  'ETH': '80',       // Ethereum
  'SOL': '48543',    // Solana
  'ADA': '257',      // Cardano
  'MATIC': '44870',  // Polygon
  'DOT': '9295',     // Polkadot
  'AVAX': '44883'    // Avalanche
};

/**
 * Check if ticker is a supported cryptocurrency
 * @param {string} ticker - Ticker symbol
 * @returns {boolean}
 */
export function isCryptoTicker(ticker) {
  return ticker && coinloreIds.hasOwnProperty(ticker.toUpperCase());
}

/**
 * In-memory cache for crypto prices
 * Structure: { ticker: { price, change24h, timestamp } }
 */
const cryptoPriceCache = {};
const CRYPTO_CACHE_TTL = 60 * 1000; // 60 seconds

/**
 * Fetch live cryptocurrency price from Coinlore API (CORS-friendly)
 * @param {string} ticker - Crypto ticker (BTC, ETH, SOL, etc.)
 * @returns {Promise<{price: number, change24h: number}|null>}
 */
export async function fetchCryptoPrice(ticker) {
  const upperTicker = ticker.toUpperCase();
  const coinId = coinloreIds[upperTicker];
  
  if (!coinId) {
    console.warn(`Ticker ${ticker} not supported for live prices`);
    return null;
  }

  // Check cache
  const now = Date.now();
  if (cryptoPriceCache[upperTicker] && (now - cryptoPriceCache[upperTicker].timestamp < CRYPTO_CACHE_TTL)) {
    console.log(`Using cached price for ${upperTicker}`);
    return {
      price: cryptoPriceCache[upperTicker].price,
      change24h: cryptoPriceCache[upperTicker].change24h
    };
  }

  try {
    const url = `https://api.coinlore.net/api/ticker/?id=${coinId}`;
    console.log(`Fetching live price for ${upperTicker} from Coinlore...`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || data.length === 0 || !data[0]) {
      throw new Error('Invalid API response');
    }

    const coin = data[0];
    const price = parseFloat(coin.price_usd);
    const change24h = parseFloat(coin.percent_change_24h);

    if (isNaN(price) || isNaN(change24h)) {
      throw new Error('Invalid price data');
    }

    cryptoPriceCache[upperTicker] = {
      price,
      change24h,
      timestamp: now
    };

    return { price, change24h };
  } catch (error) {
    console.error(`Failed to fetch price for ${ticker}:`, error);
    return null;
  }
}

// ============================================================================
// FX & METALS PRICE API (fawazahmed0)
// ============================================================================

/**
 * Supported FX and metals pairs via fawazahmed0 Currency API
 * API Docs: https://github.com/fawazahmed0/exchange-api
 * CDN: https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/
 */
const fawazahmedSymbols = {
  // Precious Metals (per troy ounce)
  'XAU/USD': 'xau',    // Gold
  'XAG/USD': 'xag',    // Silver
  'XPT/USD': 'xpt',    // Platinum
  'XPD/USD': 'xpd',    // Palladium
  
  // Major FX pairs (vs USD)
  'EUR/USD': 'eur',
  'GBP/USD': 'gbp',
  'JPY/USD': 'jpy',
  'CHF/USD': 'chf',
  'CAD/USD': 'cad',
  'AUD/USD': 'aud',
  'NZD/USD': 'nzd'
};

/**
 * Check if symbol is a supported FX or metal pair
 * @param {string} symbol - Trading pair (e.g., "XAU/USD", "EUR/USD")
 * @returns {boolean}
 */
export function isFxMetalSymbol(symbol) {
  return symbol && fawazahmedSymbols.hasOwnProperty(symbol.toUpperCase());
}

/**
 * In-memory cache for FX/metals prices
 * Structure: { symbol: { rate, timestamp, historical } }
 */
const fxMetalPriceCache = {};
const FX_CACHE_TTL = 5 * 60 * 1000; // 5 minutes (FX updates are daily, longer cache OK)

/**
 * Fetch live FX or metal price from fawazahmed0 API (CORS-friendly, no key)
 * @param {string} symbol - Trading pair (e.g., "XAU/USD", "EUR/USD")
 * @returns {Promise<{price: number, timestamp: string}|null>}
 */
export async function fetchFxMetalPrice(symbol) {
  const upperSymbol = symbol.toUpperCase();
  const currencyCode = fawazahmedSymbols[upperSymbol];
  
  if (!currencyCode) {
    console.warn(`Symbol ${symbol} not supported for FX/metals live prices`);
    return null;
  }

  // Check cache
  const now = Date.now();
  if (fxMetalPriceCache[upperSymbol] && (now - fxMetalPriceCache[upperSymbol].timestamp < FX_CACHE_TTL)) {
    console.log(`Using cached price for ${upperSymbol}`);
    return {
      price: fxMetalPriceCache[upperSymbol].rate,
      timestamp: fxMetalPriceCache[upperSymbol].apiTimestamp
    };
  }

  try {
    // fawazahmed0 API endpoint via CDN
    const url = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${currencyCode}.json`;
    console.log(`Fetching live price for ${upperSymbol} from fawazahmed0...`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || !data[currencyCode] || !data[currencyCode].usd) {
      throw new Error('Invalid API response structure');
    }

    const rateVsUsd = parseFloat(data[currencyCode].usd);
    const apiDate = data.date; // YYYY-MM-DD format

    if (isNaN(rateVsUsd)) {
      throw new Error('Invalid rate data');
    }

    // For metals (XAU, XAG), the rate is USD per unit, so invert it
    // For currencies (EUR, GBP), the rate is already currency per USD
    const isMetal = currencyCode.startsWith('x'); // xau, xag, xpt, xpd
    const price = isMetal ? (1 / rateVsUsd) : rateVsUsd;

    // Cache the result
    fxMetalPriceCache[upperSymbol] = {
      rate: price,
      timestamp: now,
      apiTimestamp: apiDate
    };

    return { price, timestamp: apiDate };
  } catch (error) {
    console.error(`Failed to fetch FX/metal price for ${symbol}:`, error);
    return null;
  }
}

/**
 * Fetch 7-day historical data for sparkline charts
 * @param {string} symbol - Trading pair (e.g., "XAU/USD", "EUR/USD")
 * @returns {Promise<Array<{date: string, price: number}>|null>}
 */
export async function fetchFxMetalHistory(symbol) {
  const upperSymbol = symbol.toUpperCase();
  const currencyCode = fawazahmedSymbols[upperSymbol];
  
  if (!currencyCode) {
    console.warn(`Symbol ${symbol} not supported for historical data`);
    return null;
  }

  try {
    // Fetch last 7 days
    const today = new Date();
    const historical = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
      
      const url = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${dateStr}/v1/currencies/${currencyCode}.json`;
      
      try {
        const response = await fetch(url);
        if (!response.ok) continue;
        
        const data = await response.json();
        if (!data || !data[currencyCode] || !data[currencyCode].usd) continue;
        
        const rateVsUsd = parseFloat(data[currencyCode].usd);
        if (isNaN(rateVsUsd)) continue;
        
        const isMetal = currencyCode.startsWith('x');
        const price = isMetal ? (1 / rateVsUsd) : rateVsUsd;
        
        historical.push({ date: dateStr, price });
      } catch (err) {
        console.warn(`Failed to fetch data for ${dateStr}:`, err);
      }
    }
    
    return historical.length > 0 ? historical : null;
  } catch (error) {
    console.error(`Failed to fetch historical data for ${symbol}:`, error);
    return null;
  }
}

// ============================================================================
// UNIFIED LIVE PRICE API
// ============================================================================

/**
 * Fetch live price for any supported ticker/symbol
 * Auto-detects crypto vs FX/metals and routes to appropriate API
 * @param {string} tickerOrSymbol - Ticker (BTC) or symbol (XAU/USD)
 * @returns {Promise<{price: number, change24h?: number, timestamp?: string, source: string}|null>}
 */
export async function fetchLivePrice(tickerOrSymbol) {
  if (isCryptoTicker(tickerOrSymbol)) {
    const result = await fetchCryptoPrice(tickerOrSymbol);
    return result ? { ...result, source: 'coinlore' } : null;
  } else if (isFxMetalSymbol(tickerOrSymbol)) {
    const result = await fetchFxMetalPrice(tickerOrSymbol);
    return result ? { ...result, source: 'fawazahmed0' } : null;
  } else {
    console.warn(`Ticker/symbol ${tickerOrSymbol} not supported for live prices`);
    return null;
  }
}
