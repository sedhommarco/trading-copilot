/**
 * Trade card rendering utilities
 */

import { formatNumber } from '../config.js';
import { fetchLivePrice, isCryptoTicker, isFxMetalSymbol, isEquityTicker } from '../api.js';
import { renderSparkline } from './sparkline.js';

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

export function getConfidenceForSorting(trade) {
  if (typeof trade.confidence === 'number') return trade.confidence;
  const conviction = (trade.conviction || trade.confidence_label || trade.confidence_string || '').toLowerCase();
  if (conviction.includes('high')) return 80;
  if (conviction.includes('moderate') || conviction.includes('medium')) return 60;
  if (conviction.includes('low')) return 40;
  return 0;
}

export function getConfidenceDisplay(trade) {
  if (typeof trade.confidence === 'number') return String(trade.confidence);
  if (trade.confidence_label) return trade.confidence_label;
  if (trade.confidence_string) return trade.confidence_string;
  if (trade.conviction) return trade.conviction;
  return 'N/A';
}

export function getConfidenceBadgeClass(trade) {
  const v = getConfidenceForSorting(trade);
  if (v >= 75) return 'confidence-high';
  if (v >= 50) return 'confidence-medium';
  return 'confidence-low';
}

export function calculateTradeAge(trade, watchlistData = {}) {
  let referenceDate = null;
  if (trade.recommended_date) referenceDate = new Date(trade.recommended_date);
  else if (trade.created_date) referenceDate = new Date(trade.created_date);
  else if (watchlistData.last_updated) referenceDate = new Date(watchlistData.last_updated);

  if (!referenceDate || isNaN(referenceDate.getTime())) {
    return { daysOld: null, isStale: false, staleBadge: '' };
  }

  const daysOld = Math.floor((Date.now() - referenceDate) / (1000 * 60 * 60 * 24));
  const expectedHoldingDays = trade.expected_holding_days || 7;
  const isStale = daysOld > expectedHoldingDays;
  const staleBadge = isStale
    ? `<span class="stale-badge">⏰ ${daysOld}d old (expected ${expectedHoldingDays}d)</span>`
    : '';
  return { daysOld, isStale, staleBadge };
}

function supportsLivePrice(ticker) {
  return isCryptoTicker(ticker) || isFxMetalSymbol(ticker) || isEquityTicker(ticker);
}

function generateLivePriceRow(ticker, entryPrice, direction) {
  if (!supportsLivePrice(ticker)) return '';
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

function generateSparklinePlaceholder(ticker) {
  if (!isFxMetalSymbol(ticker)) return '';
  return `
    <div class="sparkline-container" data-symbol="${ticker}">
      <span class="info-label">7d Trend:</span>
      <span class="sparkline-placeholder"></span>
    </div>
  `;
}

export function renderTradeCard(trade, watchlistData = {}) {
  const ticker = trade.ticker || 'N/A';
  const company = trade.company_name || '';
  const confidenceDisplay = getConfidenceDisplay(trade);
  const confidenceClass = getConfidenceBadgeClass(trade);
  const direction = (trade.direction || 'LONG').toUpperCase();
  const { isStale, staleBadge } = calculateTradeAge(trade, watchlistData);

  let entry = trade.current_price || 0;
  if (trade.entry_zone) {
    const parts = String(trade.entry_zone).split('-');
    entry = parts.length === 2
      ? (parseFloat(parts[0]) + parseFloat(parts[1])) / 2
      : parseFloat(trade.entry_zone) || entry;
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
  const riskPct = trade.risk_pct ?? trade.risk_percent ?? null;
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
          ${staleBadge}
        </div>
        <div class="confidence-badge ${confidenceClass}">${confidenceDisplay.toUpperCase()}</div>
      </div>

      <div class="card-summary">
        <div class="info-row">
          <span class="info-label">Direction</span>
          <span class="info-value" style="color: ${direction === 'LONG' ? 'var(--color-success)' : 'var(--color-danger)'}">${direction}</span>
        </div>
        ${generateLivePriceRow(ticker, entry, direction)}
        ${earningsDate ? `
        <div class="info-row">
          <span class="info-label">Earnings</span>
          <span class="info-value">${earningsDate}</span>
        </div>` : ''}
        ${riskPct != null ? `
        <div class="info-row">
          <span class="info-label">Risk %</span>
          <span class="info-value">${(riskPct * 100).toFixed(1)}%</span>
        </div>` : ''}
      </div>

      <div class="card-metrics">
        <div class="metric"><div class="metric-label">Entry</div><div class="metric-value">$${entry > 0 ? formatNumber(entry, 2) : 'N/A'}</div></div>
        <div class="metric"><div class="metric-label">Target</div><div class="metric-value" style="color: var(--color-success)">$${target > 0 ? formatNumber(target, 2) : 'N/A'}</div></div>
        <div class="metric"><div class="metric-label">Stop Loss</div><div class="metric-value" style="color: var(--color-danger)">$${stopLoss > 0 ? formatNumber(stopLoss, 2) : 'N/A'}</div></div>
        <div class="metric"><div class="metric-label">Risk:Reward</div><div class="metric-value">${riskRewardRatio}</div></div>
        <div class="metric"><div class="metric-label">Timeframe</div><div class="metric-value">${timeframe}</div></div>
      </div>

      ${trade.rationale || trade.trade_setup || trade.entry_trigger || trade.crash_date ? `
      <div class="card-details-always-visible">
        ${trade.rationale ? `<div class="detail-section"><h4>Full Rationale</h4><p>${trade.rationale}</p></div>` : ''}
        ${trade.trade_setup ? `<div class="detail-section"><h4>Trade Setup</h4><p>${trade.trade_setup}</p></div>` : ''}
        ${trade.entry_trigger ? `<div class="detail-section"><h4>Entry Trigger</h4><p>${trade.entry_trigger}</p></div>` : ''}
        ${trade.crash_date ? `<div class="detail-section"><h4>Crash Details</h4><p>Date: ${trade.crash_date}<br>Drop: ${trade.drop_percent}%</p></div>` : ''}
      </div>` : ''}
    </div>
  `;
}

export function renderPairTradeCard(trade, watchlistData = {}) {
  const longTicker = trade.long_ticker || 'N/A';
  const shortTicker = trade.short_ticker || 'N/A';
  const longEntry = trade.long_entry || 0;
  const shortEntry = trade.short_entry || 0;
  const spreadTarget = trade.target_spread || 'N/A';
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
        <div class="info-row"><span class="info-label">Long</span><span class="info-value" style="color: var(--color-success)">${longTicker} @ $${longEntry > 0 ? formatNumber(longEntry, 2) : 'N/A'}</span></div>
        <div class="info-row"><span class="info-label">Short</span><span class="info-value" style="color: var(--color-danger)">${shortTicker} @ $${shortEntry > 0 ? formatNumber(shortEntry, 2) : 'N/A'}</span></div>
        <div class="info-row"><span class="info-label">Spread Target</span><span class="info-value">${spreadTarget}</span></div>
      </div>
      <div class="card-metrics">
        <div class="metric"><div class="metric-label">Timeframe</div><div class="metric-value">${timeframe}</div></div>
        <div class="metric"><div class="metric-label">Long Stop</div><div class="metric-value">$${trade.long_stop ? formatNumber(trade.long_stop, 2) : 'N/A'}</div></div>
        <div class="metric"><div class="metric-label">Short Stop</div><div class="metric-value">$${trade.short_stop ? formatNumber(trade.short_stop, 2) : 'N/A'}</div></div>
      </div>
      ${trade.rationale ? `<div class="card-details-always-visible"><div class="detail-section"><h4>Rationale</h4><p>${trade.rationale}</p></div></div>` : ''}
    </div>
  `;
}

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
    isPast = evtDate < new Date();
    if (isPast) {
      const daysAgo = Math.floor((Date.now() - evtDate) / (1000 * 60 * 60 * 24));
      pastBadge = `<span class="stale-badge">✓ Occurred ${daysAgo}d ago</span>`;
    }
  }

  return `
    <div class="trade-card ${isPast ? 'trade-card-stale' : ''}">
      <div class="card-header-static">
        <div>
          <div class="card-title">${eventName}</div>
          <div class="card-ticker">${eventDate} ${eventTime}</div>
          ${pastBadge}
        </div>
        <div class="confidence-badge ${confidenceClass}">${confidenceDisplay.toUpperCase()}</div>
      </div>
      <div class="card-summary">
        <div class="info-row"><span class="info-label">Impact</span><span class="info-value confidence-badge ${impactClass}">${impact.toUpperCase()}</span></div>
        <div class="info-row"><span class="info-label">Trade Setup</span><span class="info-value">${setup}</span></div>
        <div class="info-row"><span class="info-label">Action</span><span class="info-value">${action.replace(/_/g, ' ')}</span></div>
        <div class="info-row"><span class="info-label">Instruments</span><span class="info-value">${instruments.join(', ')}</span></div>
      </div>
      ${rationale ? `<div class="card-details-always-visible"><div class="detail-section"><h4>Event Analysis</h4><p>${rationale}</p></div></div>` : ''}
    </div>
  `;
}

export async function loadLivePrices() {
  const rows = document.querySelectorAll('.live-price-row');
  if (!rows.length) return;

  for (const row of rows) {
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

      const { price: livePrice, change24h, changePct, change, source } = priceData;

      let vsEntry = 0;
      let vsEntryColor = 'var(--color-text-secondary)';
      if (entryPrice > 0) {
        vsEntry = ((livePrice - entryPrice) / entryPrice) * 100;
        vsEntryColor = direction === 'LONG'
          ? (vsEntry >= 0 ? 'var(--color-success)' : 'var(--color-danger)')
          : (vsEntry <= 0 ? 'var(--color-success)' : 'var(--color-danger)');
      }

      let priceHtml = `<div style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.25rem;">
        <span style="font-weight: 600;">$${formatNumber(livePrice, 2)}</span>`;

      // Crypto: show 24h % change
      if (change24h !== undefined && change24h !== null) {
        const icon = change24h >= 0 ? '▲' : '▼';
        const color = change24h >= 0 ? 'var(--color-success)' : 'var(--color-danger)';
        priceHtml += `<span style="font-size: 0.75rem; color: ${color};">${icon} ${Math.abs(change24h).toFixed(2)}% (24h)</span>`;
      }

      // Equity: show day change and %
      if (source === 'yahoo' && changePct !== null) {
        const icon = changePct >= 0 ? '▲' : '▼';
        const color = changePct >= 0 ? 'var(--color-success)' : 'var(--color-danger)';
        const changeAbs = change !== null ? ` (${change >= 0 ? '+' : ''}${formatNumber(change, 2)})` : '';
        priceHtml += `<span style="font-size: 0.75rem; color: ${color};">${icon} ${Math.abs(changePct).toFixed(2)}%${changeAbs} today</span>`;
      }

      // All: show vs entry
      if (entryPrice > 0) {
        priceHtml += `<span style="font-size: 0.75rem; color: ${vsEntryColor};">${vsEntry >= 0 ? '+' : ''}${vsEntry.toFixed(2)}% vs entry</span>`;
      }

      priceHtml += `</div>`;
      valueSpan.innerHTML = priceHtml;
    } catch (error) {
      console.error(`loadLivePrices failed for ${ticker}:`, error);
      valueSpan.innerHTML = '<span class="live-price-error">Error</span>';
    }
  }
}

export async function loadSparklines() {
  const containers = document.querySelectorAll('.sparkline-container');
  if (!containers.length) return;
  for (const container of containers) {
    const symbol = container.dataset.symbol;
    const placeholder = container.querySelector('.sparkline-placeholder');
    if (placeholder) await renderSparkline(symbol, placeholder);
  }
}
