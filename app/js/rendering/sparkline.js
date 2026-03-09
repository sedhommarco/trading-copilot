/**
 * Sparkline chart rendering for price trends
 */

import { fetchFxMetalHistory } from '../api.js';

/**
 * Generate a simple sparkline SVG
 * @param {Array<number>} dataPoints - Array of price values
 * @param {number} width - SVG width
 * @param {number} height - SVG height
 * @param {string} color - Line color
 * @returns {string} SVG markup
 */
function generateSparklineSVG(dataPoints, width = 80, height = 30, color = '#3b82f6') {
  if (!dataPoints || dataPoints.length < 2) {
    return `<svg width="${width}" height="${height}" class="sparkline"></svg>`;
  }

  const min = Math.min(...dataPoints);
  const max = Math.max(...dataPoints);
  const range = max - min || 1;
  
  const points = dataPoints.map((value, index) => {
    const x = (index / (dataPoints.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(' ');

  return `
    <svg width="${width}" height="${height}" class="sparkline" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke="${color}"
        stroke-width="1.5"
        points="${points}"
      />
    </svg>
  `;
}

/**
 * Render sparkline for FX/metals instrument
 * @param {string} symbol - Trading symbol (e.g., "XAU/USD")
 * @param {HTMLElement} container - Container element
 */
export async function renderSparkline(symbol, container) {
  if (!symbol || !container) return;

  // Show loading state
  container.innerHTML = '<span class="sparkline-loading">Loading chart...</span>';

  try {
    const historical = await fetchFxMetalHistory(symbol);
    
    if (!historical || historical.length === 0) {
      container.innerHTML = '<span class="sparkline-error">No data</span>';
      return;
    }

    const prices = historical.map(d => d.price);
    const firstPrice = prices[0];
    const lastPrice = prices[prices.length - 1];
    const isPositive = lastPrice >= firstPrice;
    const color = isPositive ? '#10b981' : '#ef4444'; // green or red

    container.innerHTML = generateSparklineSVG(prices, 80, 30, color);
  } catch (error) {
    console.error(`Failed to render sparkline for ${symbol}:`, error);
    container.innerHTML = '<span class="sparkline-error">Error</span>';
  }
}
