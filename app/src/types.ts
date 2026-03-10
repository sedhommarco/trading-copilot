// ─── Core Trade Types ────────────────────────────────────────────────────────

export interface BaseTrade {
  direction?: string;
  confidence?: number | string;
  confidence_label?: string;
  confidence_string?: string;
  conviction?: string;
  expected_holding_days?: number;
  recommended_date?: string;
  created_date?: string;
  rationale?: string;
}

export interface Trade extends BaseTrade {
  ticker?: string;
  symbol?: string;
  instrument?: string;
  company_name?: string;
  company?: string;
  name?: string;
  current_price?: number;
  entry_zone?: string | number;
  stop_loss?: number;
  take_profit?: number;
  earnings_date?: string;
  risk_pct?: number;
  risk_percent?: number;
  trade_setup?: string;
  entry_trigger?: string;
  crash_date?: string;
  drop_percent?: number;
}

export interface PairTrade extends BaseTrade {
  long_ticker?: string;
  short_ticker?: string;
  long_entry?: number;
  short_entry?: number;
  long_stop?: number;
  short_stop?: number;
  target_spread?: string | number;
}

export interface MacroEvent extends BaseTrade {
  event_name?: string;
  date?: string;
  time?: string;
  tradeable_instruments?: string[];
  trade_setup?: string;
  recommended_action?: string;
  impact?: string;
}

export type AnyTrade = Trade | PairTrade | MacroEvent;

// ─── Watchlist ──────────────────────────────────────────────────────────────

export interface WatchlistData {
  strategy?: string;
  strategy_name?: string;
  description?: string;
  last_updated?: string;
  opportunities?: AnyTrade[];
  events?: AnyTrade[];
  candidates?: AnyTrade[];
}

// ─── Market Regime ────────────────────────────────────────────────────────

export interface MarketRegimeData {
  current_regime?: string;
  vix?: string | number;
  trend?: string;
  sentiment?: string;
  notes?: string;
  sector_leaders?: string[];
  sector_laggards?: string[];
  next_major_catalyst?: string;
  fed_policy?: string;
  strategy_adjustments?: Record<string, string>;
}

// ─── Live Price ───────────────────────────────────────────────────────────

export interface LivePriceData {
  price: number;
  change24h?: number;
  changePct?: number;
  change?: number;
  source: 'coinlore' | 'fawazahmed0' | 'yahoo';
}

// ─── Navigation ──────────────────────────────────────────────────────────

export const TAB_ORDER = [
  'pre-earnings',
  'post-crash',
  'volatility',
  'crypto',
  'pair-trades',
  'macro-events',
] as const;

export type TabId = typeof TAB_ORDER[number];
