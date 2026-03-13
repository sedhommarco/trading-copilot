import { useState } from 'react';
import { MarketRegimeData } from '../types';
import GlobeIcon from '../assets/icons/globe.svg?react';

interface Props {
  regime: MarketRegimeData | undefined;
}

function regimeColors(name: string): { color: string; bg: string } {
  const n = name.toLowerCase();
  if (n.includes('bull')) return { color: '#22c55e', bg: 'rgba(34,197,94,0.1)' };
  if (n.includes('bear')) return { color: '#ef4444', bg: 'rgba(239,68,68,0.1)' };
  return { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' };
}

export default function MarketRegime({ regime }: Props) {
  const [expanded, setExpanded] = useState(false);
  if (!regime) return null;
  const name = regime.current_regime ?? 'N/A';
  const { color, bg } = regimeColors(name);
  const adj = regime.strategy_adjustments ?? {};
  return (
    <div className="market-regime" style={{ background: bg, borderColor: color }}>
      <div className="regime-header" onClick={() => setExpanded(e => !e)}>
        <div className="regime-summary">
          <h2 style={{ color }}>
            <GlobeIcon className="regime-icon" aria-hidden="true" />
            Market Regime
          </h2>
          <div className="regime-status" style={{ color }}>{name.toUpperCase()}</div>
          <div className="regime-quick-stats">
            <span>VIX: {regime.vix ?? 'N/A'}</span>
            <span>•</span>
            <span>Sentiment: {regime.sentiment ?? 'N/A'}</span>
          </div>
        </div>
        <div className="regime-toggle">{expanded ? '▲' : '▼'}</div>
      </div>
      {expanded && (
        <div className="regime-details">
          <div className="regime-grid">
            {([
              ['VIX Level', regime.vix],
              ['Trend', regime.trend],
              ['Sentiment', regime.sentiment],
              ['Fed Policy', regime.fed_policy],
              ['Next Catalyst', regime.next_major_catalyst],
            ] as [string, string | number | undefined][]).map(([label, val]) => (
              <div key={label} className="regime-item" style={{ borderLeftColor: color }}>
                <div className="regime-label">{label}</div>
                <div className="regime-value">{val ?? 'N/A'}</div>
              </div>
            ))}
          </div>
          {(regime.sector_leaders?.length || regime.sector_laggards?.length) ? (
            <div className="sectors-section">
              <div className="sectors-grid">
                {regime.sector_leaders?.length ? (
                  <div className="sector-box" style={{ borderLeft: '3px solid var(--color-success)' }}>
                    <h4 style={{ color: 'var(--color-success)' }}>📈 Sector Leaders</h4>
                    <div className="sector-list">{regime.sector_leaders.join(' • ')}</div>
                  </div>
                ) : null}
                {regime.sector_laggards?.length ? (
                  <div className="sector-box" style={{ borderLeft: '3px solid var(--color-danger)' }}>
                    <h4 style={{ color: 'var(--color-danger)' }}>📉 Sector Laggards</h4>
                    <div className="sector-list">{regime.sector_laggards.join(' • ')}</div>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
          {Object.keys(adj).length > 0 && (
            <div className="strategy-adjustments">
              <h3>⚙️ Strategy Adjustments</h3>
              {Object.entries(adj).map(([k, v]) => (
                <div key={k} className="adjustment-item">
                  <div className="adjustment-strategy">
                    {k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                  <div className="adjustment-text">{v}</div>
                </div>
              ))}
            </div>
          )}
          {regime.notes && (
            <p style={{ marginTop: '1rem', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
              {regime.notes}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
