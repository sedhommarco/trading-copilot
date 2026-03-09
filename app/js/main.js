/**
 * Main application bootstrap
 */

import { CONFIG } from './config.js';
import { loadAllData, currentData, setAutoRefreshTimer, autoRefreshTimer } from './state.js';
import { renderTabs } from './rendering/tabs.js';
import { renderMarketRegime } from './rendering/marketRegime.js';
import { renderTradeJournal } from './rendering/journal.js';
import { renderAllWatchlists } from './rendering/watchlists.js';

let isRefreshing = false;
let lastRefreshTime = null;
let timerInterval = null;

/**
 * Update "Last refreshed" live counter
 */
function updateRefreshCounter() {
  if (!lastRefreshTime) return;

  const counterElement = document.getElementById('refreshCounter');
  if (!counterElement) return;

  const now = Date.now();
  const secondsAgo = Math.floor((now - lastRefreshTime) / 1000);

  let text;
  if (secondsAgo < 60) {
    text = `${secondsAgo}s ago`;
  } else if (secondsAgo < 3600) {
    const minutes = Math.floor(secondsAgo / 60);
    text = `${minutes}m ago`;
  } else {
    const hours = Math.floor(secondsAgo / 3600);
    text = `${hours}h ago`;
  }

  counterElement.textContent = text;
}

/**
 * Update status bar with data freshness
 * @param {Object} manifest - Manifest data
 */
function updateStatusBar(manifest) {
  const statusBar = document.getElementById('statusBar');
  if (!manifest) {
    statusBar.innerHTML = '<div class="status-item"><span class="status-indicator status-error"></span><span>Error loading data</span></div>';
    return;
  }

  const lastUpdate = manifest.last_global_update || 'Unknown';
  const dataAge = manifest.data_age_days || 0;
  const staleThreshold = manifest.stale_threshold_days || 10;

  const isFresh = dataAge <= staleThreshold;
  const statusClass = isFresh ? 'status-fresh' : 'status-stale';
  
  let statusText;
  if (dataAge === 0) {
    statusText = 'Data is current (today)';
  } else if (dataAge === 1) {
    statusText = 'Data is 1 day old';
  } else if (isFresh) {
    statusText = `Data is ${dataAge} days old (within ${staleThreshold}d window)`;
  } else {
    statusText = `⚠️ Data is ${dataAge} days old (overdue by ${dataAge - staleThreshold}d)`;
  }

  const refreshCounterHtml = lastRefreshTime 
    ? `<div class="status-item"><span>🔄 Last refreshed: <span id="refreshCounter"></span></span></div>`
    : '';

  statusBar.innerHTML = `
    <div class="status-item">
      <span class="status-indicator ${statusClass}"></span>
      <span>${statusText}</span>
    </div>
    <div class="status-item">
      <span>Last update: ${lastUpdate}</span>
    </div>
    <div class="status-item" style="color: var(--color-text-muted); font-size: 0.8125rem;">
      <span>📅 Next expected: Sunday 20:00 CET</span>
    </div>
    ${refreshCounterHtml}
    ${autoRefreshTimer ? '<div class="status-item"><span>🔄 Auto-refresh: ON</span></div>' : ''}
  `;

  if (lastRefreshTime) {
    updateRefreshCounter();
  }
}

/**
 * Refresh all data and re-render
 */
async function refreshData() {
  if (isRefreshing) return;

  const refreshBtn = document.getElementById('refreshBtn');
  const originalText = refreshBtn.textContent;
  
  isRefreshing = true;
  refreshBtn.disabled = true;
  refreshBtn.textContent = '⏳ Refreshing...';

  try {
    const result = await loadAllData();
    
    // Re-render everything
    renderTabs();
    renderMarketRegime();
    renderTradeJournal(currentData.journal);
    renderAllWatchlists();
    
    // Update last refresh time
    lastRefreshTime = Date.now();
    updateStatusBar(result.manifest);

    console.log('Data refreshed successfully');
  } catch (error) {
    console.error('Failed to refresh data:', error);
    updateStatusBar(null);
  } finally {
    isRefreshing = false;
    refreshBtn.disabled = false;
    refreshBtn.textContent = originalText;
  }
}

/**
 * Toggle auto-refresh functionality
 * @param {boolean} enabled - Enable or disable auto-refresh
 */
function toggleAutoRefresh(enabled) {
  if (enabled) {
    const timerId = setInterval(() => {
      console.log('Auto-refreshing data...');
      refreshData();
    }, CONFIG.autoRefreshInterval);
    setAutoRefreshTimer(timerId);
    console.log(`Auto-refresh enabled (${CONFIG.autoRefreshInterval / 1000}s interval)`);
  } else {
    if (autoRefreshTimer) {
      clearInterval(autoRefreshTimer);
      setAutoRefreshTimer(null);
      console.log('Auto-refresh disabled');
    }
  }
  updateStatusBar(currentData.manifest);
}

/**
 * Initialize the application
 */
async function init() {
  try {
    // Show loading state
    document.getElementById('statusBar').innerHTML = '<div class="loading">Loading data...</div>';

    // Load all data
    const result = await loadAllData();

    // Set initial refresh time
    lastRefreshTime = Date.now();

    // Render all components
    renderTabs();
    renderMarketRegime();
    renderTradeJournal(currentData.journal);
    renderAllWatchlists();
    updateStatusBar(result.manifest);

    // Start live refresh counter (updates every second)
    timerInterval = setInterval(updateRefreshCounter, 1000);

    // Attach event listeners
    document.getElementById('refreshBtn').addEventListener('click', refreshData);
    document.getElementById('autoRefreshToggle').addEventListener('change', (e) => {
      toggleAutoRefresh(e.target.checked);
    });

    console.log('Application initialized successfully');
  } catch (error) {
    console.error('Failed to initialize application:', error);
    document.getElementById('statusBar').innerHTML = '<div class="error-message">Failed to load data. Please refresh the page.</div>';
  }
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
