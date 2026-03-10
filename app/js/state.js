/**
 * Application state management
 */

import { getDataUrl, fetchJSON } from './api.js';

export let currentData = {};

export let uiConfig = {
  tab_order: ['pre-earnings', 'post-crash', 'volatility', 'crypto', 'pair-trades', 'macro-events'],
  market_regime_collapsed_by_default: true
};

export async function loadAllData() {
  const [
    manifest,
    preEarnings,
    postCrash,
    volatility,
    crypto,
    pairTrades,
    macroEvents,
    marketRegime
  ] = await Promise.all([
    fetchJSON(getDataUrl('meta/manifest.json')),
    fetchJSON(getDataUrl('watchlists/pre-earnings.json')),
    fetchJSON(getDataUrl('watchlists/post-crash.json')),
    fetchJSON(getDataUrl('watchlists/volatility.json')),
    fetchJSON(getDataUrl('watchlists/crypto.json')),
    fetchJSON(getDataUrl('watchlists/pair-trades.json')),
    fetchJSON(getDataUrl('watchlists/macro-events.json')),
    fetchJSON(getDataUrl('context/market-regime.json'))
  ]);

  if (manifest?.ui) {
    uiConfig = { ...uiConfig, ...manifest.ui };
  }

  currentData = {
    manifest,
    'pre-earnings': preEarnings,
    'post-crash': postCrash,
    volatility,
    crypto,
    'pair-trades': pairTrades,
    'macro-events': macroEvents,
    'market-regime': marketRegime
  };
}
