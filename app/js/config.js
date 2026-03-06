/**
 * Configuration and constants for Trading Copilot Dashboard
 */

export const CONFIG = {
  githubUser: 'sedhommarco',
  repo: 'trading-copilot',
  branch: 'main',
  autoRefreshInterval: 5 * 60 * 1000 // 5 minutes
};

/**
 * Format number with thousand separators and specified decimal places
 * @param {number} value - Number to format
 * @param {number} decimals - Number of decimal places (default 2)
 * @returns {string} Formatted number or 'N/A'
 */
export function formatNumber(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  return Number(value).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}
