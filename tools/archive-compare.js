#!/usr/bin/env node
/**
 * Archive Comparison Script (Phase 5)
 * 
 * Compares two weekly archives and generates a diff report:
 * - Strategy-by-strategy opportunity changes
 * - Symbol carry-over tracking
 * - Market regime changes
 * - Capital allocation shifts
 * 
 * Usage:
 *   node tools/archive-compare.js <week1-path> <week2-path> [output-path]
 * 
 * Example:
 *   node tools/archive-compare.js archive/2026/week-09 archive/2026/week-10 archive/2026/week-10/changes-from-previous-week.md
 */

const fs = require('fs');
const path = require('path');

const STRATEGY_NAMES = {
  pre_earnings_momentum: 'Pre-Earnings Momentum',
  post_crash_rebound: 'Post-Crash Rebound',
  pair_trades: 'Pair Trading',
  macro_events: 'Macro Event Plays',
  volatility_plays: 'Volatility Plays',
  crypto_opportunities: 'Crypto Opportunities'
};

const WATCHLIST_FILES = [
  'pre-earnings.json',
  'post-crash.json',
  'volatility.json',
  'crypto.json',
  'pair-trades.json',
  'macro-events.json'
];

/**
 * Load JSON file safely
 */
function loadJSON(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error(`Failed to load ${filePath}:`, err.message);
    return null;
  }
}

/**
 * Extract symbols from watchlist
 */
function extractSymbols(watchlist) {
  if (!watchlist) return [];
  
  const opportunities = watchlist.opportunities || watchlist.events || watchlist.candidates || [];
  
  return opportunities.map(opp => {
    // Extract ticker/symbol
    const ticker = opp.ticker || opp.symbol || opp.instrument || opp.long_ticker || 'N/A';
    
    return {
      ticker,
      confidence: opp.confidence || opp.conviction || 'N/A',
      direction: opp.direction || opp.side || 'N/A'
    };
  });
}

/**
 * Compare two watchlists
 */
function compareWatchlists(prevSymbols, currSymbols) {
  const prevTickers = new Set(prevSymbols.map(s => s.ticker));
  const currTickers = new Set(currSymbols.map(s => s.ticker));
  
  const carryOver = currSymbols.filter(s => prevTickers.has(s.ticker));
  const removed = prevSymbols.filter(s => !currTickers.has(s.ticker));
  const added = currSymbols.filter(s => !prevTickers.has(s.ticker));
  
  return { carryOver, removed, added };
}

/**
 * Generate markdown diff for a single strategy
 */
function generateStrategyDiff(strategyFile, prevPath, currPath) {
  const prevWatchlist = loadJSON(path.join(prevPath, 'watchlists', strategyFile));
  const currWatchlist = loadJSON(path.join(currPath, 'watchlists', strategyFile));
  
  if (!prevWatchlist || !currWatchlist) {
    return `### ${strategyFile}\n\n⚠️ Data unavailable for comparison.\n`;
  }
  
  const prevSymbols = extractSymbols(prevWatchlist);
  const currSymbols = extractSymbols(currWatchlist);
  
  const { carryOver, removed, added } = compareWatchlists(prevSymbols, currSymbols);
  
  const strategyCode = currWatchlist.strategy || strategyFile.replace('.json', '');
  const strategyName = STRATEGY_NAMES[strategyCode] || strategyCode;
  
  let md = `### ${strategyName}\n\n`;
  md += `**Previous Week:** ${prevSymbols.length} opportunities  \n`;
  md += `**This Week:** ${currSymbols.length} opportunities  \n`;
  md += `**Change:** ${currSymbols.length - prevSymbols.length >= 0 ? '+' : ''}${currSymbols.length - prevSymbols.length}\n\n`;
  
  if (carryOver.length > 0) {
    md += `**Carry-Over (${carryOver.length}):**  \n`;
    carryOver.forEach(s => {
      md += `- ${s.ticker} (${s.direction}, conf: ${s.confidence})\n`;
    });
    md += '\n';
  }
  
  if (added.length > 0) {
    md += `**Newly Added (${added.length}):**  \n`;
    added.forEach(s => {
      md += `- ${s.ticker} (${s.direction}, conf: ${s.confidence})\n`;
    });
    md += '\n';
  }
  
  if (removed.length > 0) {
    md += `**Removed (${removed.length}):**  \n`;
    removed.forEach(s => {
      md += `- ${s.ticker} (${s.direction}, conf: ${s.confidence})\n`;
    });
    md += '\n';
  }
  
  if (carryOver.length === 0 && added.length === 0 && removed.length === 0) {
    md += '*No changes.*\n\n';
  }
  
  return md;
}

/**
 * Compare market regime
 */
function compareMarketRegime(prevPath, currPath) {
  const prevRegime = loadJSON(path.join(prevPath, 'context/market-regime.json'));
  const currRegime = loadJSON(path.join(currPath, 'context/market-regime.json'));
  
  if (!prevRegime || !currRegime) {
    return '⚠️ Market regime data unavailable.\n';
  }
  
  let md = '';
  
  const prevState = prevRegime.current_regime || 'N/A';
  const currState = currRegime.current_regime || 'N/A';
  
  md += `**Previous Week:** ${prevState}  \n`;
  md += `**This Week:** ${currState}  \n`;
  
  if (prevState !== currState) {
    md += `**⚠️ Regime changed:** ${prevState} → ${currState}\n`;
  } else {
    md += '*No regime change.*\n';
  }
  
  return md;
}

/**
 * Compare journal summaries
 */
function compareJournal(prevPath, currPath) {
  const prevPositions = loadJSON(path.join(prevPath, 'journal/positions.json'));
  const currPositions = loadJSON(path.join(currPath, 'journal/positions.json'));
  const prevTransactions = loadJSON(path.join(prevPath, 'journal/transactions.json'));
  const currTransactions = loadJSON(path.join(currPath, 'journal/transactions.json'));
  
  let md = '';
  
  if (prevPositions && currPositions) {
    const prevCount = prevPositions.summary?.total_positions || 0;
    const currCount = currPositions.summary?.total_positions || 0;
    md += `**Open Positions:** ${prevCount} → ${currCount} (${currCount - prevCount >= 0 ? '+' : ''}${currCount - prevCount})\n`;
  }
  
  if (prevTransactions && currTransactions) {
    const prevCount = prevTransactions.summary?.total_transactions || 0;
    const currCount = currTransactions.summary?.total_transactions || 0;
    md += `**Total Transactions:** ${prevCount} → ${currCount} (+${currCount - prevCount} this week)\n`;
  }
  
  return md;
}

/**
 * Main comparison logic
 */
function generateComparison(prevPath, currPath) {
  const prevManifest = loadJSON(path.join(prevPath, 'manifest.json'));
  const currManifest = loadJSON(path.join(currPath, 'manifest.json'));
  
  if (!prevManifest || !currManifest) {
    throw new Error('Missing manifest.json in one or both archive directories');
  }
  
  const prevWeek = path.basename(prevPath);
  const currWeek = path.basename(currPath);
  
  let md = `# Week-over-Week Changes: ${prevWeek} → ${currWeek}\n\n`;
  md += `**Generated:** ${new Date().toISOString()}\n\n`;
  md += `---\n\n`;
  
  // Market regime comparison
  md += `## Market Regime\n\n`;
  md += compareMarketRegime(prevPath, currPath);
  md += `\n---\n\n`;
  
  // Trading activity comparison
  md += `## Trading Activity\n\n`;
  md += compareJournal(prevPath, currPath);
  md += `\n---\n\n`;
  
  // Strategy-by-strategy comparison
  md += `## Strategy Opportunities\n\n`;
  
  WATCHLIST_FILES.forEach(file => {
    md += generateStrategyDiff(file, prevPath, currPath);
    md += `---\n\n`;
  });
  
  // Summary stats
  const prevTotal = prevManifest.summary?.total_opportunities || 0;
  const currTotal = currManifest.summary?.total_opportunities || 0;
  
  md += `## Summary\n\n`;
  md += `**Total Opportunities:**  \n`;
  md += `Previous Week: ${prevTotal}  \n`;
  md += `This Week: ${currTotal}  \n`;
  md += `Change: ${currTotal - prevTotal >= 0 ? '+' : ''}${currTotal - prevTotal}\n\n`;
  
  md += `---\n\n`;
  md += `*Generated by archive-compare.js*\n`;
  
  return md;
}

/**
 * CLI entry point
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: node tools/archive-compare.js <prev-week-path> <curr-week-path> [output-path]');
    console.error('Example: node tools/archive-compare.js archive/2026/week-09 archive/2026/week-10');
    process.exit(1);
  }
  
  const prevPath = args[0];
  const currPath = args[1];
  const outputPath = args[2] || path.join(currPath, 'changes-from-previous-week.md');
  
  if (!fs.existsSync(prevPath)) {
    console.error(`Previous week path not found: ${prevPath}`);
    process.exit(1);
  }
  
  if (!fs.existsSync(currPath)) {
    console.error(`Current week path not found: ${currPath}`);
    process.exit(1);
  }
  
  console.log(`Comparing ${prevPath} vs ${currPath}...`);
  
  try {
    const report = generateComparison(prevPath, currPath);
    fs.writeFileSync(outputPath, report, 'utf8');
    console.log(`✅ Report saved to: ${outputPath}`);
  } catch (err) {
    console.error(`❌ Failed to generate comparison:`, err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { generateComparison, compareWatchlists, extractSymbols };
