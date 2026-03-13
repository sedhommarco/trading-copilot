import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAuth } from './auth';

const FEATURES = [
  { icon: '📈', label: 'Trade Forecasts', desc: 'Strategy-driven opportunities across 5 asset families.' },
  { icon: '📄', label: 'Watchlists', desc: 'Curated long/short setups with entry, stop and target levels.' },
  { icon: '🌍', label: 'Macro Events', desc: 'Volatility events and economic calendar catalysts.' },
  { icon: '⚡', label: 'Live Prices', desc: 'Real-time prices for crypto and FX / metals.' },
  { icon: '📉', label: 'Price Charts', desc: 'Inline sparklines for visual momentum confirmation.' },
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
              <span className="feature-icon">{f.icon}</span>
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
