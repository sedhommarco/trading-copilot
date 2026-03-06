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
  const statusText = isFresh ? 'Data is fresh' : `Data is ${dataAge} days old (stale)`;

  statusBar.innerHTML = `
    <div class="status-item">
      <span class="status-indicator ${statusClass}"></span>
      <span>${statusText}</span>
    </div>
    <div class="status-item">
      <span>Last update: ${lastUpdate}</span>
    </div>
    ${autoRefreshTimer ? '<div class="status-item"><span>Auto-refresh: ON</span></div>' : ''}
  `;
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
    document.getElementById('statusBar').innerHTML = '<div class="loading">Loading data</div>';

    // Load all data
    const result = await loadAllData();

    // Render all components
    renderTabs();
    renderMarketRegime();
    renderTradeJournal(currentData.journal);
    renderAllWatchlists();
    updateStatusBar(result.manifest);

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
