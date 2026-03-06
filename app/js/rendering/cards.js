/**
 * Trade card rendering utilities
 */

import { formatNumber } from '../config.js';

/**
 * Normalize trade data from various formats
 * @param {Object} trade - Raw trade data
 * @returns {Object} Normalized trade data
 */
export function normalizeTradeData(trade) {
  const normalized = { ...trade };

  if (!normalized.ticker) {
    normalized.ticker = trade.symbol || trade.instrument || trade.long_ticker || 'N/A';
  }

  if (!normalized.company_name) {
    normalized.company_name = trade.company || trade.name || '';
  }

  return normalized;
}

/**
 * Get numeric confidence value for sorting
 * @param {Object} trade - Trade object
 * @returns {number} Confidence score
 */
export function getConfidenceForSorting(trade) {
  if (typeof trade.confidence === 'number') {
    return trade.confidence;
  }
  
  const conviction = (trade.conviction || trade.confidence_label || trade.confidence_string || '').toLowerCase();
  if (conviction.includes('high')) return 80;
  if (conviction.includes('moderate') || conviction.includes('medium')) return 60;
  if (conviction.includes('low')) return 40;
  
  return 0;
}

/**
 * Get display text for confidence
 * @param {Object} trade - Trade object
 * @returns {string} Display text
 */
export function getConfidenceDisplay(trade) {
  if (typeof trade.confidence === 'number') {
    return String(trade.confidence);
  }
  
  if (trade.confidence_label) return trade.confidence_label;
  if (trade.confidence_string) return trade.confidence_string;
  if (trade.conviction) return trade.conviction;
  
  return 'N/A';
}

/**
 * Get confidence badge CSS class
 * @param {Object} trade - Trade object
 * @returns {string} CSS class name
 */
export function getConfidenceBadgeClass(trade) {
  const sortValue = getConfidenceForSorting(trade);
  if (sortValue >= 75) return 'confidence-high';
  if (sortValue >= 50) return 'confidence-medium';
  return 'confidence-low';
}

/**
 * Render standard trade card (always expanded)
 * @param {Object} trade - Trade data
 * @returns {string} HTML
 */
export function renderTradeCard(trade) {
  const ticker = trade.ticker || 'N/A';
  const company = trade.company_name || '';
  const confidenceDisplay = getConfidenceDisplay(trade);
  const confidenceClass = getConfidenceBadgeClass(trade);
  const direction = trade.direction || 'LONG';
  const lastWeekPerf = trade.last_week_performance || null;

  let entry = trade.current_price || 0;
  if (trade.entry_zone) {
    const zoneParts = String(trade.entry_zone).split('-');
    if (zoneParts.length === 2) {
      entry = (parseFloat(zoneParts[0]) + parseFloat(zoneParts[1])) / 2;
    } else {
      entry = parseFloat(trade.entry_zone) || entry;
    }
  }

  const stopLoss = trade.stop_loss || 0;
  const target = trade.take_profit || 0;

  let riskRewardRatio = 'N/A';
  if (entry > 0 && stopLoss > 0 && target > 0) {
    const risk = Math.abs(entry - stopLoss);
    const reward = Math.abs(target - entry);
    riskRewardRatio = risk > 0 ? `1:${(reward / risk).toFixed(2)}` : 'N/A';
  }

  const timeframe = trade.expected_holding_days ? `${trade.expected_holding_days}d` : 'N/A';
  const earningsDate = trade.earnings_date || null;
  const positionSize = trade.position_size_usd ? trade.position_size_usd : null;

  return `
    <div class="trade-card">
      <div class="card-header-static">
        <div>
          <div class="card-title">${ticker}</div>
          <div class="card-ticker">${company}</div>
          ${lastWeekPerf ? `<div class="performance-badge">Last Week: ${lastWeekPerf}</div>` : ''}
        </div>
        <div class="confidence-badge ${confidenceClass}">${confidenceDisplay.toUpperCase()}</div>
      </div>

      <div class="card-summary">
        <div class="info-row">
          <span class="info-label">Direction</span>
          <span class="info-value" style="color: ${direction === 'LONG' ? 'var(--color-success)' : 'var(--color-danger)'}">
            ${direction}
          </span>
        </div>
        ${earningsDate ? `
        <div class="info-row">
          <span class="info-label">Earnings</span>
          <span class="info-value">${earningsDate}</span>
        </div>
        ` : ''}
        ${positionSize !== null ? `
        <div class="info-row">
          <span class="info-label">Position Size</span>
          <span class="info-value">$${formatNumber(positionSize, 2)}</span>
        </div>
        ` : ''}
      </div>

      <div class="card-metrics">
        <div class="metric">
          <div class="metric-label">Entry</div>
          <div class="metric-value">$${entry > 0 ? formatNumber(entry, 2) : 'N/A'}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Target</div>
          <div class="metric-value" style="color: var(--color-success)">$${target > 0 ? formatNumber(target, 2) : 'N/A'}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Stop Loss</div>
          <div class="metric-value" style="color: var(--color-danger)">$${stopLoss > 0 ? formatNumber(stopLoss, 2) : 'N/A'}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Risk:Reward</div>
          <div class="metric-value">${riskRewardRatio}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Timeframe</div>
          <div class="metric-value">${timeframe}</div>
        </div>
      </div>

      ${trade.rationale || trade.trade_setup || trade.entry_trigger || trade.crash_date ? `
      <div class="card-details-always-visible">
        ${trade.rationale ? `
        <div class="detail-section">
          <h4>Full Rationale</h4>
          <p>${trade.rationale}</p>
        </div>
        ` : ''}

        ${trade.trade_setup ? `
        <div class="detail-section">
          <h4>Trade Setup</h4>
          <p>${trade.trade_setup}</p>
        </div>
        ` : ''}

        ${trade.entry_trigger ? `
        <div class="detail-section">
          <h4>Entry Trigger</h4>
          <p>${trade.entry_trigger}</p>
        </div>
        ` : ''}

        ${trade.crash_date ? `
        <div class="detail-section">
          <h4>Crash Details</h4>
          <p>Date: ${trade.crash_date}<br>Drop: ${trade.drop_percent}%</p>
        </div>
        ` : ''}
      </div>
      ` : ''}
    </div>
  `;
}

/**
 * Render pair trade card (always expanded)
 * @param {Object} trade - Pair trade data
 * @returns {string} HTML
 */
export function renderPairTradeCard(trade) {
  const longTicker = trade.long_ticker || 'N/A';
  const shortTicker = trade.short_ticker || 'N/A';
  const longEntry = trade.long_entry || 0;
  const shortEntry = trade.short_entry || 0;
  const spreadTarget = trade.target_spread || 'N/A';
  const allocationPerLeg = trade.position_size_usd_each || trade.position_size_usd || 0;
  const timeframe = trade.expected_holding_days ? `${trade.expected_holding_days}d` : 'N/A';
  const confidenceDisplay = getConfidenceDisplay(trade);
  const confidenceClass = getConfidenceBadgeClass(trade);

  return `
    <div class="trade-card">
      <div class="card-header-static">
        <div>
          <div class="card-title">${longTicker} / ${shortTicker}</div>
          <div class="card-ticker">Pair Trade</div>
        </div>
        <div class="confidence-badge ${confidenceClass}">${confidenceDisplay.toUpperCase()}</div>
      </div>

      <div class="card-summary">
        <div class="info-row">
          <span class="info-label">Long</span>
          <span class="info-value" style="color: var(--color-success)">${longTicker} @ $${longEntry > 0 ? formatNumber(longEntry, 2) : 'N/A'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Short</span>
          <span class="info-value" style="color: var(--color-danger)">${shortTicker} @ $${shortEntry > 0 ? formatNumber(shortEntry, 2) : 'N/A'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Spread Target</span>
          <span class="info-value">${spreadTarget}</span>
        </div>
      </div>

      <div class="card-metrics">
        <div class="metric">
          <div class="metric-label">Allocation Per Leg</div>
          <div class="metric-value">$${allocationPerLeg > 0 ? formatNumber(allocationPerLeg, 2) : 'N/A'}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Timeframe</div>
          <div class="metric-value">${timeframe}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Long Stop</div>
          <div class="metric-value">$${trade.long_stop ? formatNumber(trade.long_stop, 2) : 'N/A'}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Short Stop</div>
          <div class="metric-value">$${trade.short_stop ? formatNumber(trade.short_stop, 2) : 'N/A'}</div>
        </div>
      </div>

      ${trade.rationale ? `
      <div class="card-details-always-visible">
        <div class="detail-section">
          <h4>Rationale</h4>
          <p>${trade.rationale}</p>
        </div>
      </div>
      ` : ''}
    </div>
  `;
}

/**
 * Render macro event card (always expanded)
 * @param {Object} trade - Macro event data
 * @returns {string} HTML
 */
export function renderMacroEventCard(trade) {
  const eventName = trade.event_name || 'Macro Event';
  const eventDate = trade.date || 'N/A';
  const eventTime = trade.time || '';
  const instruments = trade.tradeable_instruments || [];
  const setup = trade.trade_setup || 'N/A';
  const action = trade.recommended_action || 'monitor';
  const rationale = trade.rationale || '';

  const impact = trade.impact || 'medium';
  const impactClass = (impact === 'high' || impact === 'very high') ? 'confidence-high' : 'confidence-medium';

  const confidenceDisplay = getConfidenceDisplay(trade);
  const confidenceClass = getConfidenceBadgeClass(trade);

  return `
    <div class="trade-card">
      <div class="card-header-static">
        <div>
          <div class="card-title">${eventName}</div>
          <div class="card-ticker">${eventDate} ${eventTime}</div>
        </div>
        <div class="confidence-badge ${confidenceClass}">${confidenceDisplay.toUpperCase()}</div>
      </div>

      <div class="card-summary">
        <div class="info-row">
          <span class="info-label">Impact</span>
          <span class="info-value confidence-badge ${impactClass}">${impact.toUpperCase()}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Trade Setup</span>
          <span class="info-value">${setup}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Action</span>
          <span class="info-value">${action.replace(/_/g, ' ')}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Instruments</span>
          <span class="info-value">${instruments.join(', ')}</span>
        </div>
      </div>

      ${rationale ? `
      <div class="card-details-always-visible">
        <div class="detail-section">
          <h4>Event Analysis</h4>
          <p>${rationale}</p>
        </div>
      </div>
      ` : ''}
    </div>
  `;
}
