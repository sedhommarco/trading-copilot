import React, { useEffect, useState } from 'react';
import { loadAllData, AppData, SettingsContext } from './state';
import { TAB_ORDER, TabId, AppSettings, DEFAULT_SETTINGS } from './types';
import Header from './components/Header';
import Tabs from './components/Tabs';
import MarketRegime from './components/MarketRegime';
import WatchlistPanel from './components/WatchlistPanel';
import Footer from './components/Footer';
import DiceIcon from './assets/icons/dice.svg?react';
import EarningIcon from './assets/icons/earning.svg?react';
import ReboundIcon from './assets/icons/rebound.svg?react';
import CryptoIcon from './assets/icons/crypto.svg?react';
import PairtradeIcon from './assets/icons/pairtrade.svg?react';

const TAB_LABELS: Record<TabId, React.ReactNode> = {
  'macro-volatility':  <><DiceIcon    className="tab-icon" aria-hidden="true" /> Macro & Volatility</>,
  'earnings-momentum': <><EarningIcon  className="tab-icon" aria-hidden="true" /> Earnings Momentum</>,
  'post-shock':        <><ReboundIcon  className="tab-icon" aria-hidden="true" /> Post-Shock Rebounds</>,
  'crypto':            <><CryptoIcon   className="tab-icon" aria-hidden="true" /> Crypto</>,
  'pair-trades':       <><PairtradeIcon className="tab-icon" aria-hidden="true" /> Pair Trades</>,
};

export default function App() {
  const [data, setData] = useState<AppData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('macro-volatility');
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

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
      <SettingsContext.Provider value={{ settings, setSettings }}>
        <div className="container">
          <Header />
          <div className="error-message">{error}</div>
        </div>
      </SettingsContext.Provider>
    );
  }

  if (!data) {
    return (
      <SettingsContext.Provider value={{ settings, setSettings }}>
        <div className="container">
          <Header />
          <div className="loading">Loading</div>
        </div>
      </SettingsContext.Provider>
    );
  }

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
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
            settings={settings}
          />
        ))}
      </div>
      <Footer />
    </SettingsContext.Provider>
  );
}
