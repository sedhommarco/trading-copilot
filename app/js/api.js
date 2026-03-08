/**
 * API clients for data fetching
 */

import { CONFIG } from './config.js';

/**
 * Get the URL for a data file
 * @param {string} file - Filename
 * @returns {string} Full URL
 */
export function getDataUrl(file) {
  return `${CONFIG.dataPath}${file}`;
}

/**
 * Fetch JSON from URL
 * @param {string} url - URL to fetch from
 * @returns {Promise<Object>} Parsed JSON data
 */
export async function fetchJSON(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

/**
 * Live price cache
 */
const livePriceCache = {
  data: {},
  lastFetch: {},
  CACHE_DURATION: 60000 // 60 seconds
};

/**
 * Fetch live crypto price from CoinGecko (keyless public API)
 * @param {string} ticker - Crypto ticker (e.g., 'BTC', 'ETH', 'SOL')
 * @returns {Promise<Object|null>} { price, change24h } or null if unavailable
 */
export async function fetchCryptoPrice(ticker) {
  const now = Date.now();
  const cacheKey = ticker.toUpperCase();

  // Return cached if fresh
  if (livePriceCache.data[cacheKey] && 
      (now - livePriceCache.lastFetch[cacheKey]) < livePriceCache.CACHE_DURATION) {
    return livePriceCache.data[cacheKey];
  }

  // Map common tickers to CoinGecko IDs
  const coinGeckoIds = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'SOL': 'solana',
    'ADA': 'cardano',
    'MATIC': 'matic-network',
    'DOT': 'polkadot',
    'AVAX': 'avalanche-2'
  };

  const coinId = coinGeckoIds[cacheKey];
  if (!coinId) {
    console.warn(`No CoinGecko mapping for ${ticker}`);
    return null;
  }

  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`CoinGecko API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    if (!data[coinId]) {
      return null;
    }

    const result = {
      price: data[coinId].usd,
      change24h: data[coinId].usd_24h_change || 0
    };

    // Cache result
    livePriceCache.data[cacheKey] = result;
    livePriceCache.lastFetch[cacheKey] = now;

    return result;
  } catch (error) {
    console.error(`Failed to fetch price for ${ticker}:`, error);
    return null;
  }
}

/**
 * Check if a ticker is a crypto asset (simple heuristic)
 * @param {string} ticker - Asset ticker
 * @returns {boolean} True if likely crypto
 */
export function isCryptoTicker(ticker) {
  const cryptoTickers = ['BTC', 'ETH', 'SOL', 'ADA', 'MATIC', 'DOT', 'AVAX', 'LINK', 'UNI', 'AAVE'];
  return cryptoTickers.includes(ticker.toUpperCase());
}
