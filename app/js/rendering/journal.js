/**
 * Trade journal rendering
 */

import { formatNumber } from '../config.js';

/**
 * Render trade journal with sub-tabs for Positions and Transactions
 * @param {Object} journal - Journal data with transactions and positions
 */
export function renderTradeJournal(journal) {
  const container = document.getElementById('journal');
  const { transactions, positions } = journal;

  if (transactions && positions) {
    renderJournalWithSubTabs(container, transactions, positions);
  } else {
    container.innerHTML = '<div class="error-message">No journal data available</div>';
  }
}

/**
 * Render journal with sub-tabs
 * @param {HTMLElement} container - Container element
 * @param {Object} transactionsData - Transactions data
 * @param {Object} positionsData - Positions data
 */
function renderJournalWithSubTabs(container, transactionsData, positionsData) {
  const positions = positionsData.positions || [];
  const transactions = transactionsData.transactions || [];
  const positionsSummary = positionsData.summary || {};
  const transactionsSummary = transactionsData.summary || {};

  // Main header
  let html = '<div class="watchlist-header"><h2>📓 Trade Journal</h2></div>';

  // Summary section (always visible)
  html += renderJournalSummary(positionsSummary, transactionsSummary);

  // Sub-tabs
  html += `
    <div class="journal-sub-tabs">
      <button class="journal-sub-tab active" data-sub-tab="positions">
        💼 Open Positions (${positions.length})
      </button>
      <button class="journal-sub-tab" data-sub-tab="transactions">
        📜 Recent Transactions (${Math.min(transactions.length, 20)})
      </button>
    </div>
  `;

  // Positions content
  html += '<div class="journal-sub-content" id="journal-positions-content">';
  if (positions.length > 0) {
    html += '<div class="cards-grid">';
    positions.forEach(pos => {
      html += renderPositionCard(pos);
    });
    html += '</div>';
  } else {
    html += '<div class="empty-state">📊 No open positions</div>';
  }
  html += '</div>';

  // Transactions content (hidden by default)
  html += '<div class="journal-sub-content hidden" id="journal-transactions-content">';
  if (transactions.length > 0) {
    html += '<div class="cards-grid">';
    const recentTransactions = transactions.slice().reverse().slice(0, 20);
    recentTransactions.forEach(txn => {
      html += renderTransactionCard(txn);
    });
    html += '</div>';
  } else {
    html += '<div class="empty-state">📜 No transactions recorded</div>';
  }
  html += '</div>';

  container.innerHTML = html;

  // Add sub-tab switching event listeners
  initSubTabSwitching();
  
  // Add card toggle event listeners
  initCardToggle();
}

/**
 * Initialize sub-tab switching
 */
function initSubTabSwitching() {
  const subTabs = document.querySelectorAll('.journal-sub-tab');
  
  subTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const targetTab = this.dataset.subTab;
      
      // Update active tab
      subTabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      
      // Show/hide content
      const positionsContent = document.getElementById('journal-positions-content');
      const transactionsContent = document.getElementById('journal-transactions-content');
      
      if (targetTab === 'positions') {
        positionsContent.classList.remove('hidden');
        transactionsContent.classList.add('hidden');
      } else if (targetTab === 'transactions') {
        positionsContent.classList.add('hidden');
        transactionsContent.classList.remove('hidden');
      }
    });
  });
}

/**
 * Initialize card expand/collapse toggle
 */
function initCardToggle() {
  const cards = document.querySelectorAll('.journal-card');
  
  cards.forEach(card => {
    const header = card.querySelector('.journal-card-header');
    
    if (header) {
      header.addEventListener('click', function(e) {
        // Don't toggle if clicking on a link or button inside header
        if (e.target.closest('a, button')) return;
        
        card.classList.toggle('expanded');
      });
    }
  });
}

/**
 * Render individual position card (collapsible)
 * @param {Object} pos - Position object
 * @returns {string} HTML
 */
function renderPositionCard(pos) {
  const pnl = pos.unrealised_pnl || 0;
  const pnlClass = pnl >= 0 ? 'profit' : 'loss';
  const pnlColor = pnl >= 0 ? 'var(--color-success)' : 'var(--color-danger)';
  const sideColor = (pos.side || '').toUpperCase() === 'BUY' ? 'var(--color-success)' : 'var(--color-danger)';
  const pnlPercentage = pos.entry_price && pos.entry_price > 0 ? ((pnl / (pos.entry_price * (pos.units || 1))) * 100) : 0;
  
  return `
    <div class="journal-card trade-card ${pnlClass}">
      <div class="journal-card-header">
        <div>
          <div class="card-title">${pos.instrument || pos.ticker || 'N/A'}</div>
          <div class="card-ticker">${pos.short_description || ''}</div>
          <div class="card-subtitle">
            ${pos.side || 'N/A'} • ${pos.units || 'N/A'} units • Entry: $${formatNumber(pos.entry_price || 0, 2)}
          </div>
        </div>
        <div class="position-pnl-badge" style="background: ${pnlClass === 'profit' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}; color: ${pnlColor};">
          <div style="font-size: 1.125rem; font-weight: 700;">
            ${pnl >= 0 ? '+' : ''}$${formatNumber(pnl, 2)}
          </div>
          <div style="font-size: 0.75rem; opacity: 0.8;">
            ${pnlPercentage >= 0 ? '+' : ''}${pnlPercentage.toFixed(2)}%
          </div>
        </div>
      </div>

      <div class="journal-card-details">
        <div class="card-metrics">
          <div class="metric">
            <div class="metric-label">Current Price</div>
            <div class="metric-value">$${formatNumber(pos.current_price || 0, 2)}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Exposure</div>
            <div class="metric-value">$${formatNumber(pos.exposure || 0, 2)}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Margin</div>
            <div class="metric-value">$${formatNumber(pos.margin || 0, 2)}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Leverage</div>
            <div class="metric-value">${pos.leverage || 'N/A'}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Take Profit</div>
            <div class="metric-value" style="color: var(--color-success);">
              $${pos.exit_strategy && pos.exit_strategy.take_profit ? formatNumber(pos.exit_strategy.take_profit, 2) : 'N/A'}
            </div>
          </div>
          <div class="metric">
            <div class="metric-label">Stop Loss</div>
            <div class="metric-value" style="color: var(--color-danger);">
              $${pos.exit_strategy && pos.exit_strategy.stop_loss ? formatNumber(pos.exit_strategy.stop_loss, 2) : 'N/A'}
            </div>
          </div>
          <div class="metric">
            <div class="metric-label">Holding Days</div>
            <div class="metric-value">${pos.holding_days || 'N/A'}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Strategy</div>
            <div class="metric-value">${pos.strategy || 'N/A'}</div>
          </div>
        </div>

        ${pos.notes || pos.recommendations ? `
        <div class="card-details-always-visible" style="margin-top: 1rem;">
          ${pos.notes ? `
          <div class="detail-section">
            <h4>📝 Notes</h4>
            <p>${pos.notes}</p>
          </div>
          ` : ''}

          ${pos.recommendations ? `
          <div class="detail-section">
            <h4>💡 Recommendations</h4>
            <p>${pos.recommendations}</p>
          </div>
          ` : ''}
        </div>
        ` : ''}
      </div>
    </div>
  `;
}

/**
 * Render transaction card (collapsible)
 * @param {Object} txn - Transaction object
 * @returns {string} HTML
 */
function renderTransactionCard(txn) {
  const sideClass = (txn.side || '').toUpperCase() === 'BUY' ? 'buy' : 'sell';
  const sideColor = sideClass === 'buy' ? 'var(--color-success)' : 'var(--color-danger)';
  const datetime = new Date(txn.datetime || '').toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return `
    <div class="journal-card trade-card ${sideClass}">
      <div class="journal-card-header">
        <div>
          <div class="card-title">${txn.instrument || 'N/A'}</div>
          <div class="card-ticker" style="color: ${sideColor};">
            ${(txn.side || 'N/A').toUpperCase()} • ${txn.units || 'N/A'}
          </div>
          <div class="card-subtitle">${datetime}</div>
        </div>
        <div class="transaction-badge" style="background: ${sideClass === 'buy' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}; color: ${sideColor};">
          <div style="font-size: 0.875rem; font-weight: 600; text-transform: uppercase;">
            ${txn.side || 'N/A'}
          </div>
          <div style="font-size: 1rem; font-weight: 700; margin-top: 0.25rem;">
            $${formatNumber(txn.price || 0, 2)}
          </div>
        </div>
      </div>

      <div class="journal-card-details">
        <div class="card-metrics">
          <div class="metric">
            <div class="metric-label">Exposure</div>
            <div class="metric-value">$${formatNumber(txn.exposure || 0, 2)}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Margin</div>
            <div class="metric-value">$${formatNumber(txn.margin || 0, 2)}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Leverage</div>
            <div class="metric-value">${txn.leverage || 'N/A'}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Fees</div>
            <div class="metric-value">$${formatNumber(txn.fees || 0, 2)}</div>
          </div>
        </div>

        ${txn.notes || txn.recommendations ? `
        <div class="card-details-always-visible" style="margin-top: 1rem;">
          ${txn.notes ? `
          <div class="detail-section">
            <h4>📝 Notes</h4>
            <p>${txn.notes}</p>
          </div>
          ` : ''}

          ${txn.recommendations ? `
          <div class="detail-section">
            <h4>💡 Recommendations</h4>
            <p>${txn.recommendations}</p>
          </div>
          ` : ''}
        </div>
        ` : ''}
      </div>
    </div>
  `;
}

/**
 * Render journal summary section (always visible at top)
 * @param {Object} positionsSummary - Positions summary data
 * @param {Object} transactionsSummary - Transactions summary data
 * @returns {string} HTML
 */
function renderJournalSummary(positionsSummary, transactionsSummary) {
  const totalPnl = positionsSummary.total_unrealised_pnl || 0;
  const totalRealized = transactionsSummary.total_realised_pnl || 0;
  
  return `
    <div class="journal-summary">
      <div class="summary-grid">
        <div class="summary-card">
          <div class="summary-label">Open Positions</div>
          <div class="summary-value">${positionsSummary.total_positions || 0}</div>
          <div class="summary-breakdown">
            <span style="color: var(--color-success);">▲ ${positionsSummary.long_positions || 0} Long</span>
            <span style="color: var(--color-danger);">▼ ${positionsSummary.short_positions || 0} Short</span>
          </div>
        </div>
        
        <div class="summary-card">
          <div class="summary-label">Unrealized P&L</div>
          <div class="summary-value" style="color: ${totalPnl >= 0 ? 'var(--color-success)' : 'var(--color-danger)'}; font-size: 1.5rem;">
            ${totalPnl >= 0 ? '+' : ''}$${formatNumber(totalPnl, 2)}
          </div>
        </div>
        
        <div class="summary-card">
          <div class="summary-label">Total Exposure</div>
          <div class="summary-value">$${formatNumber(positionsSummary.total_exposure || 0, 2)}</div>
        </div>
        
        <div class="summary-card">
          <div class="summary-label">Margin Used</div>
          <div class="summary-value">$${formatNumber(positionsSummary.total_margin_used || 0, 2)}</div>
        </div>
        
        <div class="summary-card">
          <div class="summary-label">Total Transactions</div>
          <div class="summary-value">${transactionsSummary.total_transactions || 0}</div>
        </div>
        
        <div class="summary-card">
          <div class="summary-label">Realized P&L</div>
          <div class="summary-value" style="color: ${totalRealized >= 0 ? 'var(--color-success)' : 'var(--color-danger)'}">
            ${totalRealized >= 0 ? '+' : ''}$${formatNumber(totalRealized, 2)}
          </div>
        </div>
      </div>
    </div>
  `;
}
