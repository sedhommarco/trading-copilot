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
const priceCache = {};
const CACHE_TTL = 60 * 1000; // 60 seconds

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
  if (priceCache[upperTicker] && (now - priceCache[upperTicker].timestamp < CACHE_TTL)) {
    console.log(`Using cached price for ${upperTicker}`);
    return {
      price: priceCache[upperTicker].price,
      change24h: priceCache[upperTicker].change24h
    };
  }

  try {
    // Coinlore API endpoint - No API key needed, CORS-friendly
    const url = `https://api.coinlore.net/api/ticker/?id=${coinId}`;
    console.log(`Fetching live price for ${upperTicker} from Coinlore...`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    
    // Coinlore returns array with single object
    if (!data || data.length === 0 || !data[0]) {
      throw new Error('Invalid API response');
    }

    const coin = data[0];
    const price = parseFloat(coin.price_usd);
    const change24h = parseFloat(coin.percent_change_24h);

    if (isNaN(price) || isNaN(change24h)) {
      throw new Error('Invalid price data');
    }

    // Cache the result
    priceCache[upperTicker] = {
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
