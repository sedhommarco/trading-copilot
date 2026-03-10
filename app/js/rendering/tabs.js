/**
 * Tab management and rendering
 */

import { uiConfig } from '../state.js';

const TAB_LABELS = {
  'pre-earnings': 'Pre-Earnings',
  'post-crash': 'Post-Crash',
  'volatility': 'Volatility',
  'crypto': 'Crypto',
  'pair-trades': 'Pair Trades',
  'macro-events': 'Macro Events'
};

export function renderTabs() {
  const tabsContainer = document.getElementById('tabsContainer');

  tabsContainer.innerHTML = uiConfig.tab_order
    .map((tabId, index) => {
      const label = TAB_LABELS[tabId] || tabId;
      const activeClass = index === 0 ? 'active' : '';
      return `<div class="tab ${activeClass}" data-tab="${tabId}">${label}</div>`;
    })
    .join('');

  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', (e) => switchTab(e.currentTarget.dataset.tab, e.currentTarget));
  });

  const firstTab = uiConfig.tab_order[0];
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
  const firstContent = document.getElementById(firstTab);
  if (firstContent) firstContent.classList.add('active');
}

export function switchTab(tabName, tabElement) {
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  tabElement.classList.add('active');
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
  document.getElementById(tabName)?.classList.add('active');
}
