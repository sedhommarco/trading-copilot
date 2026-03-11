import { useMemo } from 'react';
import { TabId, WatchlistData, AnyTrade, AppSettings } from '../types';
import { getConfidenceScore, getImpactScore, isPairTrade, isMacroEvent } from '../utils/trade';
import TradeCard from './TradeCard';
import PairTradeCard from './PairTradeCard';
import MacroEventCard from './MacroEventCard';

interface Props {
  tabId: TabId;
  watchlistData: WatchlistData | undefined;
  active: boolean;
  settings: AppSettings;
}

export default function WatchlistPanel({ tabId: _tabId, watchlistData, active, settings }: Props) {
  const trades = useMemo(() => {
    // All items — Trade, MacroEvent, PairTrade — arrive via opportunities[].
    // Events and calendar overlays are NOT separate top-level arrays.
    const raw: AnyTrade[] = [
      ...(watchlistData?.opportunities ?? []),
    ];
    return raw.slice().sort((a, b) => {
      const confDiff = getConfidenceScore(b) - getConfidenceScore(a);
      if (confDiff !== 0) return confDiff;
      return getImpactScore(b) - getImpactScore(a);
    });
  }, [watchlistData]);

  if (!active) return null;

  return (
    <section className="watchlist-panel">
      <div className="cards-grid">
        {trades.map((trade, i) => {
          if (isPairTrade(trade)) {
            return (
              <PairTradeCard
                key={i}
                trade={trade}
                lastUpdated={watchlistData?.last_updated}
                settings={settings}
              />
            );
          }
          if (isMacroEvent(trade)) {
            return (
              <MacroEventCard
                key={i}
                trade={trade}
                lastUpdated={watchlistData?.last_updated}
                settings={settings}
              />
            );
          }
          return (
            <TradeCard
              key={i}
              trade={trade}
              lastUpdated={watchlistData?.last_updated}
              settings={settings}
            />
          );
        })}
      </div>
    </section>
  );
}
