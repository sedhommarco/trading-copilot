/**
 * Market regime rendering
 */

import { currentData, uiConfig } from '../state.js';

/**
 * Toggle market regime details visibility
 */
export function toggleMarketRegime() {
  const details = document.getElementById('regimeDetails');
  const toggle = document.getElementById('regimeToggle');
  if (details.classList.contains('expanded')) {
    details.classList.remove('expanded');
    toggle.textContent = '▼';
  } else {
    details.classList.add('expanded');
    toggle.textContent = '▲';
  }
}

/**
 * Render market regime section
 */
export function renderMarketRegime() {
  const regime = currentData['market-regime'];
  if (!regime) return;

  const currentRegime = regime.current_regime || 'N/A';
  const vix = regime.vix || 'N/A';
  const trend = regime.trend || 'N/A';
  const sentiment = regime.sentiment || 'N/A';
  const notes = regime.notes || '';
  const sectorLeaders = regime.sector_leaders || [];
  const sectorLaggards = regime.sector_laggards || [];
  const nextCatalyst = regime.next_major_catalyst || 'N/A';
  const fedPolicy = regime.fed_policy || 'N/A';
  const strategyAdj = regime.strategy_adjustments || {};

  let regimeColor, regimeBg;
  if (currentRegime.toLowerCase().includes('bull')) {
    regimeColor = '#22c55e';
    regimeBg = 'rgba(34, 197, 94, 0.1)';
  } else if (currentRegime.toLowerCase().includes('bear')) {
    regimeColor = '#ef4444';
    regimeBg = 'rgba(239, 68, 68, 0.1)';
  } else {
    regimeColor = '#f59e0b';
    regimeBg = 'rgba(245, 158, 11, 0.1)';
  }

  let sectorsHtml = '';
  if (sectorLeaders.length > 0 || sectorLaggards.length > 0) {
    sectorsHtml = `
      <div class="sectors-section">
        <div class="sectors-grid">
          ${sectorLeaders.length > 0 ? `
          <div class="sector-box" style="border-left: 3px solid var(--color-success);">
            <h4 style="color: var(--color-success);">📈 Sector Leaders</h4>
            <div class="sector-list">${sectorLeaders.join(' • ')}</div>
          </div>
          ` : ''}
          ${sectorLaggards.length > 0 ? `
          <div class="sector-box" style="border-left: 3px solid var(--color-danger);">
            <h4 style="color: var(--color-danger);">📉 Sector Laggards</h4>
            <div class="sector-list">${sectorLaggards.join(' • ')}</div>
          </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  let adjustmentsHtml = '';
  if (Object.keys(strategyAdj).length > 0) {
    const adjustmentItems = Object.entries(strategyAdj)
      .map(([key, value]) => {
        const strategyName = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        return `
        <div class="adjustment-item">
          <div class="adjustment-strategy">${strategyName}</div>
          <div class="adjustment-text">${value}</div>
        </div>
      `;
      })
      .join('');

    adjustmentsHtml = `
      <div class="strategy-adjustments">
        <h3>⚙️ Strategy Adjustments</h3>
        ${adjustmentItems}
      </div>
    `;
  }

  const expandedClass = uiConfig.market_regime_collapsed_by_default ? '' : 'expanded';
  const toggleIcon = uiConfig.market_regime_collapsed_by_default ? '▼' : '▲';

  const html = `
    <div class="market-regime" style="background: ${regimeBg}; border-color: ${regimeColor};">
      <div class="regime-header" id="regimeHeaderClickable">
        <div class="regime-summary">
          <h2 style="color: ${regimeColor};">🌍 Market Regime</h2>
          <div class="regime-status" style="color: ${regimeColor};">${currentRegime.toUpperCase()}</div>
          <div class="regime-quick-stats">
            <span>VIX: ${vix}</span>
            <span>•</span>
            <span>Sentiment: ${sentiment}</span>
          </div>
        </div>
        <div class="regime-toggle" id="regimeToggle">${toggleIcon}</div>
      </div>

      <div class="regime-details ${expandedClass}" id="regimeDetails">
        <div class="regime-grid">
          <div class="regime-item" style="border-left-color: ${regimeColor};">
            <div class="regime-label">VIX Level</div>
            <div class="regime-value">${vix}</div>
          </div>
          <div class="regime-item" style="border-left-color: ${regimeColor};">
            <div class="regime-label">Trend</div>
            <div class="regime-value">${trend}</div>
          </div>
          <div class="regime-item" style="border-left-color: ${regimeColor};">
            <div class="regime-label">Sentiment</div>
            <div class="regime-value">${sentiment}</div>
          </div>
          <div class="regime-item" style="border-left-color: ${regimeColor};">
            <div class="regime-label">Fed Policy</div>
            <div class="regime-value">${fedPolicy}</div>
          </div>
          <div class="regime-item" style="border-left-color: ${regimeColor};">
            <div class="regime-label">Next Catalyst</div>
            <div class="regime-value" style="font-size: 0.9rem;">${nextCatalyst}</div>
          </div>
        </div>

        ${sectorsHtml}
        ${adjustmentsHtml}

        ${notes ? `
        <p style="margin-top: 1rem; color: var(--color-text-secondary); font-size: 0.875rem;">
          ${notes}
        </p>
        ` : ''}
      </div>
    </div>
  `;
  
  document.getElementById('marketRegimeSection').innerHTML = html;
  
  // Attach click handler
  document.getElementById('regimeHeaderClickable')?.addEventListener('click', toggleMarketRegime);
}
