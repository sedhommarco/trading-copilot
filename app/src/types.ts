// ─── Core Trade Types ──────────────────────────────────────────────────────────────────────────────────────

export interface BaseTrade {
  /** Trade direction: 'long' or 'short'. Required for Trade items; omit for MacroEvent. */
  direction?: string;
  /** Numeric confidence score (legacy, prefer `conviction` string). */
  confidence?: number;
  /** Canonical confidence level string. Maps to Confidence badge in the SPA. */
  conviction?: string;
  /** Expected hold duration in calendar days. Drives STALE badge. */
  expected_holding_days?: number;
  /** ISO 8601 date the opportunity was originally recommended (optional override for stale logic). */
  recommended_date?: string;
  /** ISO 8601 date the opportunity was created (fallback for stale logic). */
  created_date?: string;
  /** 1-3 sentences: catalyst + setup + key risk. */
  rationale?: string;
  /** Data sources consulted for this opportunity, e.g. ["TipRanks", "Yahoo Finance"]. */
  data_sources?: string[];
  /** Number of independent evidence points supporting the thesis. */
  evidence_count?: number;
  /** ISO 8601 timestamp when current_price was last verified against a live source. */
  price_checked_at?: string;
  /** YYYY-MM-DD date of the next catalyst that could materially affect this opportunity. */
  next_catalyst_date?: string;
}

export interface Trade extends BaseTrade {
  ticker?: string;
  /** Legacy field aliases — prefer `ticker` and `company_name`. */
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
  /**
   * Risk as a whole integer percentage of capital, e.g. 3 means "3% of capital".
   * Do NOT store as a decimal fraction (0.03). Rendered directly as "3% risk" in TradeCard.
   */
  risk_percent?: number;
  trade_setup?: string;
  entry_trigger?: string;
  crash_date?: string;
  drop_percent?: number;
  event_tag?: string;
  /** @deprecated Legacy confidence label strings — use `conviction` instead. */
  confidence_label?: string;
  /** @deprecated Legacy confidence label strings — use `conviction` instead. */
  confidence_string?: string;
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
  /** Impact level for the Impact badge. 'very high' | 'high' | 'medium' | 'low' */
  impact?: string;
  event_tag?: string;
}

export type AnyTrade = Trade | PairTrade | MacroEvent;

// ─── Watchlist ─────────────────────────────────────────────────────────────────────────────────────

export interface WatchlistData {
  strategy?: string;
  strategy_name?: string;
  description?: string;
  last_updated?: string;
  /**
   * All opportunities for this strategy family. Items are Trade, MacroEvent, or PairTrade.
   * Events and calendar overlays are NOT separate top-level arrays — they flow here.
   */
  opportunities?: AnyTrade[];
}

// ─── Market Regime ──────────────────────────────────────────────────────────────────────────────────

export interface MarketRegimeData {
  file_type?: string;
  current_regime?: string;
  vix?: number;
  trend?: string;
  sentiment?: string;
  notes?: string;
  sector_leaders?: string[];
  sector_laggards?: string[];
  next_major_catalyst?: string;
  fed_policy?: string;
  last_updated?: string;
  strategy_adjustments?: Record<string, string>;
}

// ─── Live Price ─────────────────────────────────────────────────────────────────────────────────────

export interface LivePriceData {
  price: number;
  change24h?: number;
  changePct?: number;
  change?: number;
  source:
    | 'coinlore'      // crypto live price (Coinlore)
    | 'fawazahmed0'   // FX/metals live price (fawazahmed0 CDN)
    | 'static-json'   // equities/indices/commodities from static JSON (GH Action)
    | 'yahoo'         // reserved for future direct Yahoo Finance integration
    | 'yfinance-proxy'; // reserved for future proxy
}

// ─── App Settings ────────────────────────────────────────────────────────────────────────────────

export interface AppSettings {
  showLivePrices: boolean;
  showPriceCharts: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  showLivePrices: true,
  showPriceCharts: true,
};

// ─── Navigation ──────────────────────────────────────────────────────────────────────────────────
// The 5 canonical strategy families — everything else is an overlay or sub-type.
export const TAB_ORDER = [
  'macro-volatility',
  'earnings-momentum',
  'post-shock',
  'crypto',
  'pair-trades',
] as const;

export type TabId = typeof TAB_ORDER[number];
