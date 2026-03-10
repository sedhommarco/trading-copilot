/**
 * Main application bootstrap
 */

import { loadAllData } from './state.js';
import { renderTabs } from './rendering/tabs.js';
import { renderMarketRegime } from './rendering/marketRegime.js';
import { renderAllWatchlists } from './rendering/watchlists.js';

async function init() {
  try {
    await loadAllData();
    renderTabs();
    renderMarketRegime();
    renderAllWatchlists();
    console.log('Trading Copilot initialized');
  } catch (error) {
    console.error('Failed to initialize application:', error);
    const header = document.querySelector('header');
    if (header) {
      header.insertAdjacentHTML(
        'beforeend',
        '<div class="error-message">Failed to load data. Please refresh the page.</div>'
      );
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
