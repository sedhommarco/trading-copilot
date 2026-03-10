import { useMemo } from 'react';
import { TabId, WatchlistData, AnyTrade } from '../types';
import { getConfidenceScore, isPairTrade, isMacroEvent } from '../utils/trade';
import TradeCard from './TradeCard';
import PairTradeCard from './PairTradeCard';
import MacroEventCard from './MacroEventCard';

const STRATEGY_NAMES: Record<string, string> = {
  pre_earnings_momentum: 'Pre-Earnings Momentum',
  post_crash_rebound: 'Post-Crash Rebound',
  pair_trades: 'Pair Trading',
  macro_events: 'Macro Event Plays',
  volatility_plays: 'Volatility Plays',
  crypto_opportunities: 'Crypto Opportunities',
};

interface Props {
  tabId: TabId;
  watchlistData: WatchlistData | undefined;
  active: boolean;
}

export default function WatchlistPanel({ tabId: _tabId, watchlistData, active }: Props) {
  const trades = useMemo(() => {
    const raw: AnyTrade[] = [
      ...(watchlistData?.opportunities ?? []),
      ...(watchlistData?.events ?? []),
      ...(watchlistData?.candidates ?? []),
    ];
    return raw.slice().sort((a, b) => getConfidenceScore(b) - getConfidenceScore(a));
  }, [watchlistData]);

  if (!active) return null;

  return (
    <section className="watchlist-panel">
      <div className="cards-grid">
        {trades.map((trade, i) => {
          if (isPairTrade(trade)) {
            return <PairTradeCard key={i} trade={trade} />;
          }
          if (isMacroEvent(trade)) {
            return <MacroEventCard key={i} trade={trade} />;
          }
          return <TradeCard key={i} trade={trade} lastUpdated={watchlistData?.last_updated} />;
        })}
      </div>
    </section>
  );
}
