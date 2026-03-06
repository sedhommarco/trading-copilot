/**
 * Watchlist rendering
 */

import { formatNumber } from '../config.js';
import { currentData } from '../state.js';
import { normalizeTradeData, getConfidenceForSorting, renderTradeCard, renderPairTradeCard, renderMacroEventCard } from './cards.js';

const STRATEGY_NAMES = {
  pre_earnings_momentum: 'Pre-Earnings Momentum',
  post_crash_rebound: 'Post-Crash Rebound',
  pair_trades: 'Pair Trading',
  macro_events: 'Macro Event Plays',
  volatility_plays: 'Volatility Plays',
  crypto_opportunities: 'Crypto Opportunities'
};

/**
 * Render previous week outcomes
 * @param {Array} previousOutcomes - Array of outcome objects
 * @returns {string} HTML
 */
function renderPreviousOutcomes(previousOutcomes) {
  if (!previousOutcomes || previousOutcomes.length === 0) return '';

  const outcomesHtml = previousOutcomes
    .map(outcome => {
      const ticker = outcome.ticker || 'N/A';
      const predicted = outcome.predicted_direction || outcome.predicted || 'N/A';
      const actual = outcome.actual_outcome || outcome.actual || 'N/A';
      const hitTarget = outcome.hit_target !== undefined ? outcome.hit_target : null;
      const accuracy = outcome.accuracy || '';

      const outcomeClass = (hitTarget === true || accuracy.toLowerCase().includes('hit')) ? 'outcome-hit' : 'outcome-miss';

      return `
        <div class="outcome-item ${outcomeClass}">
          <div style="font-weight: 600; margin-bottom: 0.25rem;">${ticker}</div>
          <div style="font-size: 0.8125rem; color: var(--color-text-muted);">
            Predicted: ${predicted}<br>
            Actual: ${actual}
            ${accuracy ? `<br><strong style="color: var(--color-text-primary);">${accuracy}</strong>` : ''}
          </div>
        </div>
      `;
    })
    .join('');

  return `
    <div class="previous-outcomes">
      <h3>📊 Previous Week Outcomes</h3>
      <div class="outcomes-grid">
        ${outcomesHtml}
      </div>
    </div>
  `;
}

/**
 * Render a watchlist tab
 * @param {string} name - Watchlist identifier
 * @param {Object} data - Watchlist data
 */
export function renderWatchlist(name, data) {
  const container = document.getElementById(name);
  let trades = data.opportunities || data.events || data.candidates || [];
  const previousOutcomes = data.previous_week_outcomes || [];

  // Sort by confidence (descending)
  trades = trades.slice().sort((a, b) => {
    const confA = getConfidenceForSorting(a);
    const confB = getConfidenceForSorting(b);
    return confB - confA;
  });

  const strategyCode = data.strategy || data.strategy_name || data.strategyName || '';
  const strategyName = STRATEGY_NAMES[strategyCode] || strategyCode || 'Trading Strategy';
  const description = data.description || `Strategy: ${strategyCode}`;
  const weekStart = data.week_start || data.weekStart || 'N/A';
  const weekEnd = data.week_end || data.weekEnd || 'N/A';
  const riskPerTrade = data.risk_per_trade || data.riskPerTrade || 0.02;
  const strategyConfidence = data.strategy_confidence || 'N/A';
  const strategyRisks = data.strategy_risks || 'Standard market risks apply';

  let strategyInfoHtml = '';
  if (data.strategy_description || strategyConfidence !== 'N/A' || strategyRisks) {
    strategyInfoHtml = `
      <div class="strategy-info">
        <h4>Strategy Overview</h4>
        ${data.strategy_description ? `<p>${data.strategy_description}</p>` : ''}
        <div class="strategy-info-grid">
          ${strategyConfidence !== 'N/A' ? `
          <div>
            <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-bottom: 0.25rem;">Strategy Confidence</div>
            <div style="font-weight: 600;">${strategyConfidence}</div>
          </div>
          ` : ''}
          <div>
            <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-bottom: 0.25rem;">Key Risks</div>
            <div>${strategyRisks}</div>
          </div>
        </div>
      </div>
    `;
  }

  const header = `
    <div class="watchlist-header">
      <h2>${strategyName}</h2>
      <p style="color: var(--color-text-secondary);">${description}</p>
      <div class="watchlist-meta">
        <span>📅 Week: ${weekStart} to ${weekEnd}</span>
        <span>🎯 Trades: ${trades.length}</span>
        <span>📊 Capital per trade: $${formatNumber(1000 * riskPerTrade, 2)}</span>
      </div>
      ${strategyInfoHtml}
    </div>
    ${renderPreviousOutcomes(previousOutcomes)}
  `;

  const cards = trades
    .map(trade => {
      const normalizedTrade = normalizeTradeData(trade);

      if (normalizedTrade.long_ticker && normalizedTrade.short_ticker) {
        return renderPairTradeCard(normalizedTrade);
      } else if (normalizedTrade.event_name) {
        return renderMacroEventCard(normalizedTrade);
      } else {
        return renderTradeCard(normalizedTrade);
      }
    })
    .join('');

  container.innerHTML = header + `<div class="cards-grid">${cards}</div>`;
  
  // No event listeners needed - cards are always expanded
}

/**
 * Render all watchlists
 */
export function renderAllWatchlists() {
  const watchlists = ['pre-earnings', 'post-crash', 'volatility', 'crypto', 'pair-trades', 'macro-events'];
  watchlists.forEach(name => {
    if (currentData[name]) {
      renderWatchlist(name, currentData[name]);
    }
  });
}
