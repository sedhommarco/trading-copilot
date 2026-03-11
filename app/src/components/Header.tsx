import { useState, useRef, useEffect, useContext } from 'react';
import { SettingsContext } from '../state';

// GitHub Actions workflow name — must match the workflow `name:` field in deploy.yml
const CI_BADGE_URL =
  'https://github.com/sedhommarco/trading-copilot/actions/workflows/deploy.yml/badge.svg';
const CI_ACTIONS_URL =
  'https://github.com/sedhommarco/trading-copilot/actions/workflows/deploy.yml';

export default function Header() {
  const { settings, setSettings } = useContext(SettingsContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  return (
    <header className="header">
      <div className="header-left">
        <h1>📈 Trading Copilot</h1>
        <a
          href={CI_ACTIONS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="ci-badge-link"
          title="Deploy workflow status"
        >
          <img src={CI_BADGE_URL} alt="Deploy status" className="ci-badge" />
        </a>
      </div>
      <div className="header-actions" ref={menuRef}>
        <button
          className="avatar-btn"
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Settings"
          title="Settings"
        >
          👤
        </button>
        {menuOpen && (
          <div className="settings-menu">
            <div className="settings-menu-title">Settings</div>
            <label className="settings-toggle">
              <input
                type="checkbox"
                checked={settings.showLivePrices}
                onChange={e => setSettings(s => ({ ...s, showLivePrices: e.target.checked }))}
              />
              Live prices
            </label>
            <label className="settings-toggle">
              <input
                type="checkbox"
                checked={settings.showPriceCharts}
                onChange={e => setSettings(s => ({ ...s, showPriceCharts: e.target.checked }))}
              />
              Price charts
            </label>
          </div>
        )}
      </div>
    </header>
  );
}
