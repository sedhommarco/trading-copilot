/**
 * Tab management and rendering
 */

import { uiConfig } from '../state.js';

const TAB_LABELS = {
  'journal': 'Trade Journal',
  'pre-earnings': 'Pre-Earnings',
  'post-crash': 'Post-Crash',
  'volatility': 'Volatility',
  'crypto': 'Crypto',
  'pair-trades': 'Pair Trades',
  'macro-events': 'Macro Events'
};

/**
 * Render tabs based on UI config
 */
export function renderTabs() {
  const tabsContainer = document.getElementById('tabsContainer');
  
  tabsContainer.innerHTML = uiConfig.tab_order
    .map((tabId, index) => {
      const label = TAB_LABELS[tabId] || tabId;
      const favoriteClass = uiConfig.favorite_tabs.includes(tabId) ? 'favorite' : '';
      const activeClass = index === 0 ? 'active' : '';
      return `<div class="tab ${activeClass} ${favoriteClass}" data-tab="${tabId}">${label}</div>`;
    })
    .join('');

  // Attach event listeners
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', (e) => switchTab(e.currentTarget.dataset.tab, e.currentTarget));
  });

  // Activate first tab content
  const firstTab = uiConfig.tab_order[0];
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  const firstContent = document.getElementById(firstTab);
  if (firstContent) {
    firstContent.classList.add('active');
  }
}

/**
 * Switch active tab
 * @param {string} tabName - Tab identifier
 * @param {HTMLElement} tabElement - Clicked tab element
 */
export function switchTab(tabName, tabElement) {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
  });
  tabElement.classList.add('active');

  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  document.getElementById(tabName)?.classList.add('active');
}
