/**
 * Watchlist rendering
 */

import { currentData } from '../state.js';
import {
  normalizeTradeData,
  getConfidenceForSorting,
  renderTradeCard,
  renderPairTradeCard,
  renderMacroEventCard,
  loadLivePrices,
  loadSparklines
} from './cards.js';

const STRATEGY_NAMES = {
  pre_earnings_momentum: 'Pre-Earnings Momentum',
  post_crash_rebound: 'Post-Crash Rebound',
  pair_trades: 'Pair Trading',
  macro_events: 'Macro Event Plays',
  volatility_plays: 'Volatility Plays',
  crypto_opportunities: 'Crypto Opportunities'
};

export function renderWatchlist(name, data) {
  const container = document.getElementById(name);
  let trades = data.opportunities || data.events || data.candidates || [];

  // Sort by confidence descending
  trades = trades.slice().sort((a, b) => getConfidenceForSorting(b) - getConfidenceForSorting(a));

  const strategyCode = data.strategy || data.strategy_name || '';
  const strategyName = STRATEGY_NAMES[strategyCode] || strategyCode || 'Trading Strategy';
  const description = data.description || '';
  const lastUpdated = data.last_updated || 'N/A';

  let strategyInfoHtml = '';
  if (data.strategy_description || data.strategy_confidence || data.strategy_risks) {
    strategyInfoHtml = `
      <div class="strategy-info">
        <h4>Strategy Overview</h4>
        ${data.strategy_description ? `<p>${data.strategy_description}</p>` : ''}
        <div class="strategy-info-grid">
          ${data.strategy_confidence ? `
          <div>
            <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-bottom: 0.25rem;">Strategy Confidence</div>
            <div style="font-weight: 600;">${data.strategy_confidence}</div>
          </div>` : ''}
          ${data.strategy_risks ? `
          <div>
            <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-bottom: 0.25rem;">Key Risks</div>
            <div>${data.strategy_risks}</div>
          </div>` : ''}
        </div>
      </div>
    `;
  }

  const header = `
    <div class="watchlist-header">
      <h2>${strategyName}</h2>
      ${description ? `<p style="color: var(--color-text-secondary);">${description}</p>` : ''}
      <div class="watchlist-meta">
        <span>📅 Last updated: ${lastUpdated}</span>
        <span>🎯 Trades: ${trades.length}</span>
      </div>
      ${strategyInfoHtml}
    </div>
  `;

  const watchlistMetadata = { last_updated: data.last_updated };

  const cards = trades
    .map(trade => {
      const t = normalizeTradeData(trade);
      if (t.long_ticker && t.short_ticker) return renderPairTradeCard(t, watchlistMetadata);
      if (t.event_name) return renderMacroEventCard(t, watchlistMetadata);
      return renderTradeCard(t, watchlistMetadata);
    })
    .join('');

  container.innerHTML = header + `<div class="cards-grid">${cards}</div>`;

  if (!container.dataset.livePricesLoaded) {
    container.dataset.livePricesLoaded = 'true';
    Promise.all([loadLivePrices(), loadSparklines()]).catch(err =>
      console.error('Failed to load live data:', err)
    );
  }
}

export function renderAllWatchlists() {
  const watchlists = ['pre-earnings', 'post-crash', 'volatility', 'crypto', 'pair-trades', 'macro-events'];
  watchlists.forEach(name => {
    if (currentData[name]) renderWatchlist(name, currentData[name]);
  });
}
