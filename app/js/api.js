/**
 * API and data fetching utilities
 */

import { CONFIG } from './config.js';

/**
 * Get data URL for GitHub raw content or local fallback
 * @param {string} path - Relative path from data/ folder
 * @returns {string} Full URL
 */
export function getDataUrl(path) {
  if (window.location.protocol === 'file:') {
    return `data/${path}`;
  }
  return `https://raw.githubusercontent.com/${CONFIG.githubUser}/${CONFIG.repo}/${CONFIG.branch}/data/${path}`;
}

/**
 * Fetch and parse JSON from URL with error handling
 * @param {string} url - URL to fetch
 * @returns {Promise<Object|null>} Parsed JSON or null on error
 */
export async function fetchJSON(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error);
    return null;
  }
}
