import { useEffect, useState } from 'react';
import { loadAllData, AppData } from './state';
import Header from './components/Header';
import Tabs from './components/Tabs';
import MarketRegime from './components/MarketRegime';
import WatchlistPanel from './components/WatchlistPanel';
import Footer from './components/Footer';

const TAB_ORDER = [
  'pre-earnings',
  'post-crash',
  'volatility',
  'crypto',
  'pair-trades',
  'macro-events',
] as const;

export type TabId = typeof TAB_ORDER[number];

const TAB_LABELS: Record<TabId, string> = {
  'pre-earnings': 'Pre-Earnings',
  'post-crash': 'Post-Crash',
  'volatility': 'Volatility',
  'crypto': 'Crypto',
  'pair-trades': 'Pair Trades',
  'macro-events': 'Macro Events',
};

export default function App() {
  const [data, setData] = useState<AppData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('pre-earnings');

  useEffect(() => {
    loadAllData()
      .then(setData)
      .catch((err: unknown) => {
        console.error('Failed to load data:', err);
        setError('Failed to load data. Please refresh the page.');
      });
  }, []);

  if (error) {
    return (
      <div className="container">
        <Header />
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container">
        <Header />
        <div className="loading">Loading</div>
      </div>
    );
  }

  return (
    <>
      <div className="container">
        <Header />
        <MarketRegime regime={data['market-regime']} />
        <Tabs
          tabs={TAB_ORDER}
          labels={TAB_LABELS}
          active={activeTab}
          onChange={setActiveTab}
        />
        {TAB_ORDER.map(tab => (
          <WatchlistPanel
            key={tab}
            tabId={tab}
            watchlistData={data[tab]}
            active={tab === activeTab}
          />
        ))}
      </div>
      <Footer />
    </>
  );
}
