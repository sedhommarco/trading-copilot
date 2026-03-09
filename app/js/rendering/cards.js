/**
 * Trade card rendering utilities
 */

import { formatNumber } from '../config.js';
import { fetchLivePrice, isCryptoTicker, isFxMetalSymbol } from '../api.js';
import { renderSparkline } from './sparkline.js';

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
 * Calculate trade age and determine if stale
 * @param {Object} trade - Trade object
 * @param {Object} watchlistData - Watchlist metadata for fallback dates
 * @returns {Object} { daysOld, isStale, staleBadge }
 */
export function calculateTradeAge(trade, watchlistData = {}) {
  const now = new Date();
  let referenceDate = null;

  if (trade.recommended_date) {
    referenceDate = new Date(trade.recommended_date);
  } else if (trade.created_date) {
    referenceDate = new Date(trade.created_date);
  } else if (watchlistData.last_updated) {
    referenceDate = new Date(watchlistData.last_updated);
  } else if (watchlistData.week_start) {
    referenceDate = new Date(watchlistData.week_start);
  }

  if (!referenceDate || isNaN(referenceDate.getTime())) {
    return { daysOld: null, isStale: false, staleBadge: '' };
  }

  const daysOld = Math.floor((now - referenceDate) / (1000 * 60 * 60 * 24));
  const expectedHoldingDays = trade.expected_holding_days || 7;
  const isStale = daysOld > expectedHoldingDays;

  const staleBadge = isStale 
    ? `<span class="stale-badge">⏰ ${daysOld}d old (expected ${expectedHoldingDays}d)</span>`
    : '';

  return { daysOld, isStale, staleBadge };
}

/**
 * Check if ticker/symbol supports live prices
 * @param {string} tickerOrSymbol - Ticker or symbol
 * @returns {boolean}
 */
function supportsLivePrice(tickerOrSymbol) {
  return isCryptoTicker(tickerOrSymbol) || isFxMetalSymbol(tickerOrSymbol);
}

/**
 * Generate live price HTML placeholder with data attributes for async loading
 * @param {string} ticker - Ticker symbol
 * @param {number} entryPrice - Entry price for comparison
 * @param {string} direction - Trade direction (LONG/SHORT)
 * @returns {string} HTML with placeholder
 */
function generateLivePriceRow(ticker, entryPrice, direction) {
  if (!supportsLivePrice(ticker)) {
    return '';
  }

  return `
    <div class="info-row live-price-row" 
         data-ticker="${ticker}" 
         data-entry="${entryPrice}" 
         data-direction="${direction}">
      <span class="info-label">Live Price</span>
      <span class="info-value live-price-value">
        <span class="live-price-loading">⌛ Loading...</span>
      </span>
    </div>
  `;
}

/**
 * Generate sparkline placeholder for async rendering
 * @param {string} ticker - Ticker/symbol
 * @returns {string} HTML with placeholder container
 */
function generateSparklinePlaceholder(ticker) {
  if (!isFxMetalSymbol(ticker)) {
    return '';
  }

  return `
    <div class="sparkline-container" data-symbol="${ticker}">
      <span class="info-label">7d Trend:</span>
      <span class="sparkline-placeholder"></span>
    </div>
  `;
}

/**
 * Render standard trade card (always expanded)
 * @param {Object} trade - Trade data
 * @param {Object} watchlistData - Watchlist metadata (optional)
 * @returns {string} HTML
 */
export function renderTradeCard(trade, watchlistData = {}) {
  const ticker = trade.ticker || 'N/A';
  const company = trade.company_name || '';
  const confidenceDisplay = getConfidenceDisplay(trade);
  const confidenceClass = getConfidenceBadgeClass(trade);
  const direction = trade.direction || 'LONG';
  const lastWeekPerf = trade.last_week_performance || null;
  const { isStale, staleBadge } = calculateTradeAge(trade, watchlistData);

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

  const staleClass = isStale ? 'trade-card-stale' : '';

  return `
    <div class="trade-card ${staleClass}">
      <div class="card-header-static">
        <div>
          <div class="card-title">
            ${ticker}
            ${generateSparklinePlaceholder(ticker)}
          </div>
          <div class="card-ticker">${company}</div>
          ${lastWeekPerf ? `<div class="performance-badge">Last Week: ${lastWeekPerf}</div>` : ''}
          ${staleBadge}
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
        ${generateLivePriceRow(ticker, entry, direction)}
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
 * @param {Object} watchlistData - Watchlist metadata (optional)
 * @returns {string} HTML
 */
export function renderPairTradeCard(trade, watchlistData = {}) {
  const longTicker = trade.long_ticker || 'N/A';
  const shortTicker = trade.short_ticker || 'N/A';
  const longEntry = trade.long_entry || 0;
  const shortEntry = trade.short_entry || 0;
  const spreadTarget = trade.target_spread || 'N/A';
  const allocationPerLeg = trade.position_size_usd_each || trade.position_size_usd || 0;
  const timeframe = trade.expected_holding_days ? `${trade.expected_holding_days}d` : 'N/A';
  const confidenceDisplay = getConfidenceDisplay(trade);
  const confidenceClass = getConfidenceBadgeClass(trade);
  const { isStale, staleBadge } = calculateTradeAge(trade, watchlistData);

  const staleClass = isStale ? 'trade-card-stale' : '';

  return `
    <div class="trade-card ${staleClass}">
      <div class="card-header-static">
        <div>
          <div class="card-title">${longTicker} / ${shortTicker}</div>
          <div class="card-ticker">Pair Trade</div>
          ${staleBadge}
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
 * @param {Object} watchlistData - Watchlist metadata (optional)
 * @returns {string} HTML
 */
export function renderMacroEventCard(trade, watchlistData = {}) {
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
  
  let isPast = false;
  let pastBadge = '';
  if (eventDate !== 'N/A') {
    const evtDate = new Date(eventDate);
    const now = new Date();
    isPast = evtDate < now;
    if (isPast) {
      const daysAgo = Math.floor((now - evtDate) / (1000 * 60 * 60 * 24));
      pastBadge = `<span class="stale-badge">✓ Occurred ${daysAgo}d ago</span>`;
    }
  }

  const staleClass = isPast ? 'trade-card-stale' : '';

  return `
    <div class="trade-card ${staleClass}">
      <div class="card-header-static">
        <div>
          <div class="card-title">${eventName}</div>
          <div class="card-ticker">${eventDate} ${eventTime}</div>
          ${pastBadge}
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

/**
 * Load live prices and sparklines for all cards on the page
 * Called after cards are rendered
 */
export async function loadLivePrices() {
  const livePriceRows = document.querySelectorAll('.live-price-row');
  
  if (livePriceRows.length === 0) {
    console.log('No cards with live price support on this tab');
    return;
  }

  console.log(`Loading live prices for ${livePriceRows.length} cards...`);

  for (const row of livePriceRows) {
    const ticker = row.dataset.ticker;
    const entryPrice = parseFloat(row.dataset.entry);
    const direction = row.dataset.direction;
    const valueSpan = row.querySelector('.live-price-value');

    try {
      const priceData = await fetchLivePrice(ticker);
      
      if (!priceData) {
        valueSpan.innerHTML = '<span class="live-price-error">Unavailable</span>';
        continue;
      }

      const livePrice = priceData.price;
      const change24h = priceData.change24h;
      const source = priceData.source;

      // Calculate vs entry
      let vsEntry = 0;
      let vsEntryColor = 'var(--color-text-secondary)';
      if (entryPrice > 0) {
        vsEntry = ((livePrice - entryPrice) / entryPrice) * 100;
        
        if (direction === 'LONG') {
          vsEntryColor = vsEntry >= 0 ? 'var(--color-success)' : 'var(--color-danger)';
        } else {
          vsEntryColor = vsEntry <= 0 ? 'var(--color-success)' : 'var(--color-danger)';
        }
      }

      // Build HTML based on data source
      let priceHtml = `
        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.25rem;">
          <span style="font-weight: 600;">$${formatNumber(livePrice, 2)}</span>
      `;

      // Show 24h change for crypto (has change24h)
      if (change24h !== undefined) {
        const change24hIcon = change24h >= 0 ? '▲' : '▼';
        const change24hColor = change24h >= 0 ? 'var(--color-success)' : 'var(--color-danger)';
        priceHtml += `
          <span style="font-size: 0.75rem; color: ${change24hColor};">
            ${change24hIcon} ${Math.abs(change24h).toFixed(2)}% (24h)
          </span>
        `;
      }

      // Show vs entry for all
      if (entryPrice > 0) {
        priceHtml += `
          <span style="font-size: 0.75rem; color: ${vsEntryColor};">
            ${vsEntry >= 0 ? '+' : ''}${vsEntry.toFixed(2)}% vs entry
          </span>
        `;
      }

      priceHtml += `</div>`;
      valueSpan.innerHTML = priceHtml;
    } catch (error) {
      console.error(`Failed to load price for ${ticker}:`, error);
      valueSpan.innerHTML = '<span class="live-price-error">Error</span>';
    }
  }
}

/**
 * Load sparklines for all FX/metals cards
 * Called after cards are rendered
 */
export async function loadSparklines() {
  const sparklineContainers = document.querySelectorAll('.sparkline-container');
  
  if (sparklineContainers.length === 0) {
    console.log('No sparkline containers on this tab');
    return;
  }

  console.log(`Loading sparklines for ${sparklineContainers.length} FX/metals cards...`);

  for (const container of sparklineContainers) {
    const symbol = container.dataset.symbol;
    const placeholder = container.querySelector('.sparkline-placeholder');
    
    if (placeholder) {
      await renderSparkline(symbol, placeholder);
    }
  }
}
