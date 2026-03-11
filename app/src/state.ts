import { createContext, useContext } from 'react';
import { CONFIG } from './config';
import { WatchlistData, MarketRegimeData, AppSettings, DEFAULT_SETTINGS } from './types';

export interface AppData {
  'macro-volatility': WatchlistData;
  'earnings-momentum': WatchlistData;
  'post-shock': WatchlistData;
  'crypto': WatchlistData;
  'pair-trades': WatchlistData;
  'market-regime': MarketRegimeData;
}

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  return res.json() as Promise<T>;
}

function dataUrl(path: string): string {
  return `${CONFIG.dataPath}${path}`;
}

export async function loadAllData(): Promise<AppData> {
  const [
    earningsM,
    postShock,
    macroVol,
    crypto,
    pairTrades,
    marketRegime,
  ] = await Promise.all([
    fetchJSON<WatchlistData>(dataUrl('watchlists/pre-earnings.json')),
    fetchJSON<WatchlistData>(dataUrl('watchlists/post-crash.json')),
    fetchJSON<WatchlistData>(dataUrl('watchlists/macro-volatility.json')),
    fetchJSON<WatchlistData>(dataUrl('watchlists/crypto.json')),
    fetchJSON<WatchlistData>(dataUrl('watchlists/pair-trades.json')),
    fetchJSON<MarketRegimeData>(dataUrl('context/market-regime.json')),
  ]);

  return {
    'macro-volatility': macroVol,
    'earnings-momentum': earningsM,
    'post-shock': postShock,
    'crypto': crypto,
    'pair-trades': pairTrades,
    'market-regime': marketRegime,
  };
}

// ─── Settings Context ────────────────────────────────────────────────────────────────────────────────

export interface SettingsContextValue {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
}

export const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  setSettings: () => undefined,
});

export function useSettings() {
  return useContext(SettingsContext);
}
