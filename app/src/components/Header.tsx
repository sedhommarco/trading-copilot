import { useState, useRef, useEffect, useContext } from 'react';
import { SettingsContext } from '../state';

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
      <h1>📊 Trading Copilot</h1>
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
              Live Prices
            </label>
            <label className="settings-toggle">
              <input
                type="checkbox"
                checked={settings.showPriceCharts}
                onChange={e => setSettings(s => ({ ...s, showPriceCharts: e.target.checked }))}
              />
              Sparklines
            </label>
          </div>
        )}
      </div>
    </header>
  );
}
