/**
 * Trade journal rendering
 */

import { formatNumber } from '../config.js';

/**
 * Render trade journal (new format only - no legacy)
 * @param {Object} journal - Journal data with transactions and positions
 */
export function renderTradeJournal(journal) {
  const container = document.getElementById('journal');
  const { transactions, positions } = journal;

  if (transactions && positions) {
    renderNewJournalFormat(container, transactions, positions);
  } else {
    container.innerHTML = '<div class="error-message">No journal data available</div>';
  }
}

/**
 * Render journal in new two-file format
 * @param {HTMLElement} container - Container element
 * @param {Object} transactionsData - Transactions data
 * @param {Object} positionsData - Positions data
 */
function renderNewJournalFormat(container, transactionsData, positionsData) {
  const positions = positionsData.positions || [];
  const transactions = transactionsData.transactions || [];
  const positionsSummary = positionsData.summary || {};
  const transactionsSummary = transactionsData.summary || {};

  let html = '<div class="watchlist-header"><h2>📓 Trade Journal</h2></div>';

  // Render open positions
  if (positions.length > 0) {
    html += '<div class="journal-section"><h3>💼 Open Positions</h3>';
    positions.forEach(pos => {
      html += renderPositionCard(pos);
    });
    html += '</div>';
  }

  // Render recent transactions
  if (transactions.length > 0) {
    html += '<div class="journal-section"><h3>📜 Recent Transactions</h3><div class="transaction-list">';
    const recentTransactions = transactions.slice().reverse().slice(0, 20);
    recentTransactions.forEach(txn => {
      html += renderTransactionItem(txn);
    });
    html += '</div></div>';
  }

  // Render summary
  html += renderJournalSummary(positionsSummary, transactionsSummary);

  container.innerHTML = html;
}

/**
 * Render individual position card
 * @param {Object} pos - Position object
 * @returns {string} HTML
 */
function renderPositionCard(pos) {
  const pnlClass = (pos.unrealised_pnl || 0) >= 0 ? 'profit' : 'loss';
  const pnlColor = (pos.unrealised_pnl || 0) >= 0 ? 'var(--color-success)' : 'var(--color-danger)';
  const sideColor = pos.side === 'LONG' ? 'var(--color-success)' : 'var(--color-danger)';
  
  return `
    <div class="position-card ${pnlClass}">
      <div class="position-header">
        <div>
          <div class="position-title">${pos.instrument || pos.ticker || 'N/A'}</div>
          <div style="font-size: 0.875rem; color: var(--color-text-muted); margin-top: 0.25rem;">
            ${pos.short_description || ''}
          </div>
        </div>
        <div class="position-badge confidence-badge" style="background: ${pnlClass === 'profit' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}; color: ${pnlColor};">
          ${pnlClass === 'profit' ? '📈 PROFIT' : '📉 LOSS'}
        </div>
      </div>

      <div class="position-metrics">
        <div class="position-metric">
          <div class="position-metric-label">Side</div>
          <div class="position-metric-value" style="color: ${sideColor};">${pos.side || 'N/A'}</div>
        </div>
        <div class="position-metric">
          <div class="position-metric-label">Units</div>
          <div class="position-metric-value">${pos.units || 'N/A'}</div>
        </div>
        <div class="position-metric">
          <div class="position-metric-label">Entry Price</div>
          <div class="position-metric-value">$${formatNumber(pos.entry_price || 0, 2)}</div>
        </div>
        <div class="position-metric">
          <div class="position-metric-label">Current Price</div>
          <div class="position-metric-value">$${formatNumber(pos.current_price || 0, 2)}</div>
        </div>
        <div class="position-metric">
          <div class="position-metric-label">Unrealised P&L</div>
          <div class="position-metric-value" style="color: ${pnlColor}; font-size: 1.125rem;">
            $${formatNumber(pos.unrealised_pnl || 0, 2)}
          </div>
        </div>
        <div class="position-metric">
          <div class="position-metric-label">Exposure</div>
          <div class="position-metric-value">$${formatNumber(pos.exposure || 0, 2)}</div>
        </div>
        <div class="position-metric">
          <div class="position-metric-label">Margin</div>
          <div class="position-metric-value">$${formatNumber(pos.margin || 0, 2)}</div>
        </div>
        <div class="position-metric">
          <div class="position-metric-label">Leverage</div>
          <div class="position-metric-value">${pos.leverage || 'N/A'}</div>
        </div>
        <div class="position-metric">
          <div class="position-metric-label">Take Profit</div>
          <div class="position-metric-value" style="color: var(--color-success);">
            $${pos.exit_strategy && pos.exit_strategy.take_profit ? formatNumber(pos.exit_strategy.take_profit, 2) : 'N/A'}
          </div>
        </div>
        <div class="position-metric">
          <div class="position-metric-label">Stop Loss</div>
          <div class="position-metric-value" style="color: var(--color-danger);">
            $${pos.exit_strategy && pos.exit_strategy.stop_loss ? formatNumber(pos.exit_strategy.stop_loss, 2) : 'N/A'}
          </div>
        </div>
        <div class="position-metric">
          <div class="position-metric-label">Holding Days</div>
          <div class="position-metric-value">${pos.holding_days || 'N/A'}</div>
        </div>
        <div class="position-metric">
          <div class="position-metric-label">Strategy</div>
          <div class="position-metric-value">${pos.strategy || 'N/A'}</div>
        </div>
      </div>

      ${pos.notes ? `
      <div class="commentary-box">
        <h4>📝 Notes</h4>
        <p>${pos.notes}</p>
      </div>
      ` : ''}

      ${pos.recommendations ? `
      <div class="commentary-box">
        <h4>💡 Recommendations</h4>
        <p>${pos.recommendations}</p>
      </div>
      ` : ''}
    </div>
  `;
}

/**
 * Render transaction item
 * @param {Object} txn - Transaction object
 * @returns {string} HTML
 */
function renderTransactionItem(txn) {
  const sideClass = (txn.side || '').toUpperCase() === 'BUY' ? 'buy' : 'sell';
  const datetime = new Date(txn.datetime || '').toLocaleString();
  
  return `
    <div class="transaction-item ${sideClass}">
      <div class="transaction-header">
        <div class="transaction-desc">${txn.short_description || txn.instrument || 'Transaction'}</div>
        <div class="transaction-datetime">${datetime}</div>
      </div>
      
      <div class="transaction-details">
        <div><strong>Instrument:</strong> ${txn.instrument || 'N/A'}</div>
        <div><strong>Side:</strong> ${txn.side || 'N/A'}</div>
        <div><strong>Units:</strong> ${txn.units || 'N/A'}</div>
        <div><strong>Price:</strong> $${formatNumber(txn.price || 0, 2)}</div>
        <div><strong>Exposure:</strong> $${formatNumber(txn.exposure || 0, 2)}</div>
        <div><strong>Margin:</strong> $${formatNumber(txn.margin || 0, 2)}</div>
        <div><strong>Leverage:</strong> ${txn.leverage || 'N/A'}</div>
        <div><strong>Fees:</strong> $${formatNumber(txn.fees || 0, 2)}</div>
      </div>

      ${txn.notes ? `
      <div class="commentary-box" style="margin-top: 0.75rem;">
        <h4>📝 Notes</h4>
        <p>${txn.notes}</p>
      </div>
      ` : ''}

      ${txn.recommendations ? `
      <div class="commentary-box" style="margin-top: 0.75rem;">
        <h4>💡 Recommendations</h4>
        <p>${txn.recommendations}</p>
      </div>
      ` : ''}
    </div>
  `;
}

/**
 * Render journal summary section
 * @param {Object} positionsSummary - Positions summary data
 * @param {Object} transactionsSummary - Transactions summary data
 * @returns {string} HTML
 */
function renderJournalSummary(positionsSummary, transactionsSummary) {
  return `
    <div class="journal-section">
      <h3>📊 Summary</h3>
      <div class="position-metrics">
        <div class="position-metric">
          <div class="position-metric-label">Total Positions</div>
          <div class="position-metric-value">${positionsSummary.total_positions || 0}</div>
        </div>
        <div class="position-metric">
          <div class="position-metric-label">Long Positions</div>
          <div class="position-metric-value" style="color: var(--color-success);">${positionsSummary.long_positions || 0}</div>
        </div>
        <div class="position-metric">
          <div class="position-metric-label">Short Positions</div>
          <div class="position-metric-value" style="color: var(--color-danger);">${positionsSummary.short_positions || 0}</div>
        </div>
        <div class="position-metric">
          <div class="position-metric-label">Total Unrealised P&L</div>
          <div class="position-metric-value" style="color: ${(positionsSummary.total_unrealised_pnl || 0) >= 0 ? 'var(--color-success)' : 'var(--color-danger)'}; font-size: 1.25rem;">
            $${formatNumber(positionsSummary.total_unrealised_pnl || 0, 2)}
          </div>
        </div>
        <div class="position-metric">
          <div class="position-metric-label">Total Exposure</div>
          <div class="position-metric-value">$${formatNumber(positionsSummary.total_exposure || 0, 2)}</div>
        </div>
        <div class="position-metric">
          <div class="position-metric-label">Total Margin Used</div>
          <div class="position-metric-value">$${formatNumber(positionsSummary.total_margin_used || 0, 2)}</div>
        </div>
        <div class="position-metric">
          <div class="position-metric-label">Total Transactions</div>
          <div class="position-metric-value">${transactionsSummary.total_transactions || 0}</div>
        </div>
        <div class="position-metric">
          <div class="position-metric-label">Total Volume</div>
          <div class="position-metric-value">$${formatNumber(transactionsSummary.total_volume_usd || 0, 2)}</div>
        </div>
      </div>
    </div>
  `;
}
