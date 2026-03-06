/**
 * Application state management
 */

import { getDataUrl, fetchJSON } from './api.js';

// Global application state
export let currentData = {};

export let uiConfig = {
  tab_order: ['journal', 'pre-earnings', 'post-crash', 'volatility', 'crypto', 'pair-trades', 'macro-events'],
  favorite_tabs: [],
  market_regime_collapsed_by_default: true
};

export let autoRefreshTimer = null;

/**
 * Load all data from GitHub/local sources
 * @returns {Promise<void>}
 */
export async function loadAllData() {
  try {
    const [
      manifest,
      preEarnings,
      postCrash,
      volatility,
      crypto,
      pairTrades,
      macroEvents,
      marketRegime,
      transactions,
      positions
    ] = await Promise.all([
      fetchJSON(getDataUrl('meta/manifest.json')),
      fetchJSON(getDataUrl('watchlists/pre-earnings.json')),
      fetchJSON(getDataUrl('watchlists/post-crash.json')),
      fetchJSON(getDataUrl('watchlists/volatility.json')),
      fetchJSON(getDataUrl('watchlists/crypto.json')),
      fetchJSON(getDataUrl('watchlists/pair-trades.json')),
      fetchJSON(getDataUrl('watchlists/macro-events.json')),
      fetchJSON(getDataUrl('context/market-regime.json')),
      fetchJSON(getDataUrl('journal/transactions.json')),
      fetchJSON(getDataUrl('journal/positions.json'))
    ]);

    // Update UI config from manifest
    if (manifest && manifest.ui) {
      uiConfig = { ...uiConfig, ...manifest.ui };
    }

    // Store all data
    currentData = {
      manifest,
      'pre-earnings': preEarnings,
      'post-crash': postCrash,
      volatility: volatility,
      crypto: crypto,
      'pair-trades': pairTrades,
      'macro-events': macroEvents,
      'market-regime': marketRegime,
      journal: {
        transactions,
        positions
      }
    };

    return { manifest, success: true };
  } catch (error) {
    console.error('Failed to load data:', error);
    throw error;
  }
}

/**
 * Set auto-refresh timer
 * @param {number|null} timerId - Timer ID or null to clear
 */
export function setAutoRefreshTimer(timerId) {
  autoRefreshTimer = timerId;
}
