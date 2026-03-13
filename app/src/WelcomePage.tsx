import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAuth } from './auth';
import DiceIcon     from './assets/icons/dice.svg?react';
import ForecastIcon from './assets/icons/forecast.svg?react';
import WatchlistIcon from './assets/icons/watchlist.svg?react';
import LiveIcon     from './assets/icons/live.svg?react';
import ChartIcon    from './assets/icons/chart.svg?react';

const FEATURES = [
  { Icon: ForecastIcon,  label: 'Trade Forecasts', desc: 'Strategy-driven opportunities across 5 asset families.' },
  { Icon: WatchlistIcon, label: 'Watchlists',       desc: 'Curated long/short setups with entry, stop and target levels.' },
  { Icon: DiceIcon,      label: 'Macro Events',     desc: 'Volatility events and economic calendar catalysts.' },
  { Icon: LiveIcon,      label: 'Live Prices',      desc: 'Real-time prices for crypto and FX / metals.' },
  { Icon: ChartIcon,     label: 'Price Charts',     desc: 'Inline sparklines for visual momentum confirmation.' },
];

export default function WelcomePage() {
  const { user, handleGoogleSuccess } = useAuth();
  const navigate = useNavigate();

  // If already signed in, redirect straight to the app
  useEffect(() => {
    if (user) navigate('/app', { replace: true });
  }, [user, navigate]);

  function onSuccess(response: CredentialResponse) {
    handleGoogleSuccess(response);
  }

  return (
    <div className="welcome-page">
      {/* Hero */}
      <section className="welcome-hero">
        <h1 className="welcome-title">Trading A¡dvisor</h1>
        <p className="welcome-tagline">
          A minimal, no-noise SPA for surfacing current trading opportunities
          and strategy-level market context.
        </p>
        <div className="welcome-cta-row">
          <GoogleLogin
            onSuccess={onSuccess}
            onError={() => console.error('Google Sign-In failed')}
            useOneTap={false}
            theme="filled_blue"
            size="large"
            shape="rectangular"
            logo_alignment="left"
          />
        </div>
      </section>

      {/* Features */}
      <section className="welcome-features">
        <h2 className="welcome-section-title">What's inside</h2>
        <ul className="features-list">
          {FEATURES.map((f) => (
            <li key={f.label} className="feature-item">
              <f.Icon className="feature-icon-svg" aria-hidden="true" />
              <div>
                <strong>{f.label}</strong>
                <p>{f.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Footer */}
      <footer className="welcome-footer">
        <p>
          <a
            href="https://github.com/sedhommarco/trading-copilot/releases.atom"
            target="_blank"
            rel="noopener noreferrer"
          >
            Subscribe to major releases (RSS/Atom)
          </a>
          {' · '}
          <a
            href="https://github.com/sedhommarco/trading-copilot"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </p>
        <p className="welcome-disclaimer">
          Trading involves substantial risk of loss. This tool does not provide financial advice.
        </p>
      </footer>
    </div>
  );
}
