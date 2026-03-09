#!/usr/bin/env node
/**
 * Performance Analysis Script (Phase 6)
 * 
 * Analyzes trading performance from journal and previous outcomes:
 * - Strategy hit rates (predictions vs actuals)
 * - Confidence calibration (were "high" confidence calls accurate?)
 * - Market regime correlation
 * - Win rate and P&L trends
 * 
 * Usage:
 *   node tools/performance-analysis.js <archive-week-path> [output-path]
 * 
 * Example:
 *   node tools/performance-analysis.js archive/2026/week-10 archive/2026/week-10/performance-analysis.md
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
 * Analyze previous outcomes for a watchlist
 */
function analyzeOutcomes(watchlist) {
  if (!watchlist || !watchlist.previous_week_outcomes) {
    return null;
  }
  
  const outcomes = watchlist.previous_week_outcomes;
  
  if (outcomes.length === 0) {
    return null;
  }
  
  let hits = 0;
  let misses = 0;
  let total = outcomes.length;
  
  outcomes.forEach(outcome => {
    const hitTarget = outcome.hit_target;
    const accuracy = (outcome.accuracy || '').toLowerCase();
    
    if (hitTarget === true || accuracy.includes('hit') || accuracy.includes('success')) {
      hits++;
    } else if (hitTarget === false || accuracy.includes('miss') || accuracy.includes('failed')) {
      misses++;
    }
  });
  
  const hitRate = total > 0 ? (hits / total * 100).toFixed(1) : 'N/A';
  
  return {
    total,
    hits,
    misses,
    hitRate,
    outcomes
  };
}

/**
 * Analyze confidence calibration
 */
function analyzeConfidenceCalibration(watchlist) {
  if (!watchlist || !watchlist.previous_week_outcomes) {
    return null;
  }
  
  const outcomes = watchlist.previous_week_outcomes;
  
  const byConfidence = {
    high: { total: 0, hits: 0 },
    medium: { total: 0, hits: 0 },
    low: { total: 0, hits: 0 }
  };
  
  outcomes.forEach(outcome => {
    const confidence = (outcome.confidence || outcome.conviction || '').toLowerCase();
    const hitTarget = outcome.hit_target;
    const accuracy = (outcome.accuracy || '').toLowerCase();
    
    const isHit = hitTarget === true || accuracy.includes('hit') || accuracy.includes('success');
    
    if (confidence.includes('high')) {
      byConfidence.high.total++;
      if (isHit) byConfidence.high.hits++;
    } else if (confidence.includes('medium') || confidence.includes('moderate')) {
      byConfidence.medium.total++;
      if (isHit) byConfidence.medium.hits++;
    } else if (confidence.includes('low')) {
      byConfidence.low.total++;
      if (isHit) byConfidence.low.hits++;
    }
  });
  
  return byConfidence;
}

/**
 * Generate performance report for a single strategy
 */
function generateStrategyPerformance(strategyFile, archivePath) {
  const watchlist = loadJSON(path.join(archivePath, 'watchlists', strategyFile));
  
  if (!watchlist) {
    return `### ${strategyFile}\n\n⚠️ Data unavailable.\n\n`;
  }
  
  const strategyCode = watchlist.strategy || strategyFile.replace('.json', '');
  const strategyName = STRATEGY_NAMES[strategyCode] || strategyCode;
  
  let md = `### ${strategyName}\n\n`;
  
  const outcomeAnalysis = analyzeOutcomes(watchlist);
  
  if (!outcomeAnalysis) {
    md += `*No previous week outcomes to analyze.*\n\n`;
    return md;
  }
  
  md += `**Total Predictions:** ${outcomeAnalysis.total}  \n`;
  md += `**Hits:** ${outcomeAnalysis.hits}  \n`;
  md += `**Misses:** ${outcomeAnalysis.misses}  \n`;
  md += `**Hit Rate:** ${outcomeAnalysis.hitRate}%\n\n`;
  
  // Confidence calibration
  const calibration = analyzeConfidenceCalibration(watchlist);
  
  if (calibration) {
    md += `**Confidence Calibration:**\n\n`;
    
    ['high', 'medium', 'low'].forEach(level => {
      const data = calibration[level];
      if (data.total > 0) {
        const rate = (data.hits / data.total * 100).toFixed(1);
        md += `- **${level.charAt(0).toUpperCase() + level.slice(1)}:** ${data.hits}/${data.total} (${rate}%)\n`;
      }
    });
    
    md += '\n';
  }
  
  // Individual outcomes
  md += `**Detailed Outcomes:**\n\n`;
  
  outcomeAnalysis.outcomes.forEach(outcome => {
    const ticker = outcome.ticker || 'N/A';
    const predicted = outcome.predicted_direction || outcome.predicted || 'N/A';
    const actual = outcome.actual_outcome || outcome.actual || 'N/A';
    const accuracy = outcome.accuracy || 'N/A';
    const icon = (outcome.hit_target === true || accuracy.toLowerCase().includes('hit')) ? '✅' : '❌';
    
    md += `${icon} **${ticker}** - Predicted: ${predicted}, Actual: ${actual} (${accuracy})\n`;
  });
  
  md += '\n';
  
  return md;
}

/**
 * Analyze journal P&L
 */
function analyzeJournal(archivePath) {
  const positions = loadJSON(path.join(archivePath, 'journal/positions.json'));
  const transactions = loadJSON(path.join(archivePath, 'journal/transactions.json'));
  
  let md = '';
  
  if (positions && positions.summary) {
    const summary = positions.summary;
    md += `**Open Positions:** ${summary.total_positions || 0}  \n`;
    md += `**Total Unrealized P&L:** ${summary.total_unrealised_pnl !== undefined ? (summary.total_unrealised_pnl >= 0 ? '+' : '') + summary.total_unrealised_pnl.toFixed(2) : 'N/A'}  \n`;
    md += `**Total Exposure:** ${summary.total_exposure !== undefined ? summary.total_exposure.toFixed(2) : 'N/A'}  \n`;
    md += `**Total Margin Used:** ${summary.total_margin_used !== undefined ? summary.total_margin_used.toFixed(2) : 'N/A'}  \n\n`;
  }
  
  if (transactions && transactions.summary) {
    const summary = transactions.summary;
    md += `**Total Transactions:** ${summary.total_transactions || 0}  \n`;
    md += `**Total Realized P&L:** ${summary.total_realised_pnl !== undefined ? (summary.total_realised_pnl >= 0 ? '+' : '') + summary.total_realised_pnl.toFixed(2) : 'N/A'}  \n\n`;
  }
  
  return md;
}

/**
 * Main performance analysis logic
 */
function generatePerformanceReport(archivePath) {
  const manifest = loadJSON(path.join(archivePath, 'manifest.json'));
  const marketRegime = loadJSON(path.join(archivePath, 'context/market-regime.json'));
  
  if (!manifest) {
    throw new Error(`Missing manifest.json in ${archivePath}`);
  }
  
  const weekName = path.basename(archivePath);
  const weekStart = manifest.week_start || 'N/A';
  const weekEnd = manifest.week_end || 'N/A';
  
  let md = `# Performance Analysis: ${weekName}\n\n`;
  md += `**Week:** ${weekStart} to ${weekEnd}  \n`;
  md += `**Generated:** ${new Date().toISOString()}\n\n`;
  md += `---\n\n`;
  
  // Market regime context
  if (marketRegime) {
    md += `## Market Context\n\n`;
    md += `**Regime:** ${marketRegime.current_regime || 'N/A'}  \n`;
    md += `**VIX:** ${marketRegime.vix || 'N/A'}  \n`;
    md += `**Sentiment:** ${marketRegime.sentiment || 'N/A'}\n\n`;
    md += `---\n\n`;
  }
  
  // Journal P&L summary
  md += `## Trading Performance\n\n`;
  md += analyzeJournal(archivePath);
  md += `---\n\n`;
  
  // Strategy-by-strategy performance
  md += `## Strategy Performance\n\n`;
  
  WATCHLIST_FILES.forEach(file => {
    md += generateStrategyPerformance(file, archivePath);
    md += `---\n\n`;
  });
  
  // Overall insights
  md += `## Key Insights\n\n`;
  md += `*Add your weekly observations and lessons learned here.*\n\n`;
  md += `**Questions to consider:**\n`;
  md += `- Which strategies performed best this week?\n`;
  md += `- Were high-confidence predictions more accurate than low-confidence ones?\n`;
  md += `- Did the market regime align with strategy performance?\n`;
  md += `- What patterns or blind spots emerged?\n`;
  md += `- What adjustments should be made for next week?\n\n`;
  
  md += `---\n\n`;
  md += `*Generated by performance-analysis.js*\n`;
  
  return md;
}

/**
 * CLI entry point
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.error('Usage: node tools/performance-analysis.js <archive-week-path> [output-path]');
    console.error('Example: node tools/performance-analysis.js archive/2026/week-10');
    process.exit(1);
  }
  
  const archivePath = args[0];
  const outputPath = args[1] || path.join(archivePath, 'performance-analysis.md');
  
  if (!fs.existsSync(archivePath)) {
    console.error(`Archive path not found: ${archivePath}`);
    process.exit(1);
  }
  
  console.log(`Analyzing performance for ${archivePath}...`);
  
  try {
    const report = generatePerformanceReport(archivePath);
    fs.writeFileSync(outputPath, report, 'utf8');
    console.log(`✅ Report saved to: ${outputPath}`);
  } catch (err) {
    console.error(`❌ Failed to generate performance analysis:`, err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { generatePerformanceReport, analyzeOutcomes, analyzeConfidenceCalibration };
