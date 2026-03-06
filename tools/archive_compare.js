#!/usr/bin/env node
/**
 * Archive Comparison Tool
 * 
 * Compares current data/ files with the most recent archive to generate:
 * - Performance analysis (what changed per strategy)
 * - Weekly diff summary (new/removed/repeated opportunities)
 * 
 * Usage:
 *   node tools/archive_compare.js
 * 
 * Outputs:
 *   archive/<year>/week-XX/performance-analysis.md
 *   archive/<year>/week-XX/changes-from-previous-week.md
 */

const fs = require('fs');
const path = require('path');

// Paths
const DATA_DIR = path.join(__dirname, '..', 'data');
const ARCHIVE_DIR = path.join(__dirname, '..', 'archive');
const ARCHIVE_INDEX = path.join(ARCHIVE_DIR, 'index.json');

/**
 * Load JSON file with error handling
 */
function loadJSON(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.warn(`Failed to load ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Get the most recent archive path from index.json
 */
function getMostRecentArchive() {
  const index = loadJSON(ARCHIVE_INDEX);
  if (!index || !index.archives || index.archives.length === 0) {
    console.error('No archives found in index.json');
    return null;
  }
  
  // Sort by date descending
  const sorted = index.archives.sort((a, b) => {
    return new Date(b.week_start) - new Date(a.week_start);
  });
  
  return sorted[0];
}

/**
 * Extract tickers from opportunities/events/candidates
 */
function extractTickers(watchlist) {
  const tickers = new Set();
  
  if (watchlist.opportunities) {
    watchlist.opportunities.forEach(opp => {
      if (opp.ticker) tickers.add(opp.ticker);
    });
  }
  
  if (watchlist.events) {
    watchlist.events.forEach(evt => {
      if (evt.event_name) tickers.add(evt.event_name);
    });
  }
  
  if (watchlist.candidates) {
    watchlist.candidates.forEach(pair => {
      if (pair.long_ticker && pair.short_ticker) {
        tickers.add(`${pair.long_ticker}/${pair.short_ticker}`);
      }
    });
  }
  
  return Array.from(tickers);
}

/**
 * Compare two watchlists and generate diff
 */
function compareWatchlists(current, previous, strategyName) {
  const currentTickers = new Set(extractTickers(current));
  const previousTickers = new Set(extractTickers(previous));
  
  const newTickers = Array.from(currentTickers).filter(t => !previousTickers.has(t));
  const removedTickers = Array.from(previousTickers).filter(t => !currentTickers.has(t));
  const repeatedTickers = Array.from(currentTickers).filter(t => previousTickers.has(t));
  
  return {
    strategy: strategyName,
    currentCount: currentTickers.size,
    previousCount: previousTickers.size,
    new: newTickers,
    removed: removedTickers,
    repeated: repeatedTickers
  };
}

/**
 * Generate performance analysis markdown
 */
function generatePerformanceAnalysis(comparisons, archivePath) {
  let markdown = `# Performance Analysis\n\n`;
  markdown += `**Archive:** ${path.basename(path.dirname(archivePath))} / ${path.basename(archivePath)}\n`;
  markdown += `**Generated:** ${new Date().toISOString()}\n\n`;
  
  markdown += `## Strategy Breakdown\n\n`;
  
  comparisons.forEach(comp => {
    markdown += `### ${comp.strategy}\n\n`;
    markdown += `- **Current opportunities:** ${comp.currentCount}\n`;
    markdown += `- **Previous week:** ${comp.previousCount}\n`;
    markdown += `- **Change:** ${comp.currentCount - comp.previousCount >= 0 ? '+' : ''}${comp.currentCount - comp.previousCount}\n\n`;
    
    if (comp.new.length > 0) {
      markdown += `**New this week:**\n`;
      comp.new.forEach(ticker => markdown += `- ${ticker}\n`);
      markdown += `\n`;
    }
    
    if (comp.removed.length > 0) {
      markdown += `**Removed (closed/expired):**\n`;
      comp.removed.forEach(ticker => markdown += `- ${ticker}\n`);
      markdown += `\n`;
    }
    
    if (comp.repeated.length > 0) {
      markdown += `**Carry-over:**\n`;
      comp.repeated.forEach(ticker => markdown += `- ${ticker}\n`);
      markdown += `\n`;
    }
    
    markdown += `---\n\n`;
  });
  
  markdown += `## Notes\n\n`;
  markdown += `*Add your manual notes and observations here.*\n\n`;
  
  return markdown;
}

/**
 * Generate weekly diff summary
 */
function generateWeeklyDiff(comparisons) {
  let markdown = `# Changes From Previous Week\n\n`;
  markdown += `**Generated:** ${new Date().toISOString()}\n\n`;
  
  markdown += `## Summary\n\n`;
  
  const totalNew = comparisons.reduce((sum, c) => sum + c.new.length, 0);
  const totalRemoved = comparisons.reduce((sum, c) => sum + c.removed.length, 0);
  const totalRepeated = comparisons.reduce((sum, c) => sum + c.repeated.length, 0);
  
  markdown += `- **Total new opportunities:** ${totalNew}\n`;
  markdown += `- **Total removed:** ${totalRemoved}\n`;
  markdown += `- **Total carry-over:** ${totalRepeated}\n\n`;
  
  markdown += `## Strategy Changes\n\n`;
  
  comparisons.forEach(comp => {
    const delta = comp.currentCount - comp.previousCount;
    const arrow = delta > 0 ? '📈' : delta < 0 ? '📉' : '➡️';
    markdown += `- **${comp.strategy}:** ${arrow} ${comp.previousCount} → ${comp.currentCount} (${delta >= 0 ? '+' : ''}${delta})\n`;
  });
  
  markdown += `\n`;
  
  return markdown;
}

/**
 * Main function
 */
function main() {
  console.log('🔍 Archive Comparison Tool\n');
  
  // Get most recent archive
  const recentArchive = getMostRecentArchive();
  if (!recentArchive) {
    console.error('❌ No archive found to compare against.');
    process.exit(1);
  }
  
  console.log(`📂 Comparing against: ${recentArchive.path}`);
  
  const archiveDataPath = path.join(ARCHIVE_DIR, recentArchive.path, 'data');
  
  // Strategy files to compare
  const strategies = [
    { file: 'pre-earnings.json', name: 'Pre-Earnings Momentum' },
    { file: 'post-crash.json', name: 'Post-Crash Rebound' },
    { file: 'volatility.json', name: 'Volatility Plays' },
    { file: 'crypto.json', name: 'Crypto Opportunities' },
    { file: 'pair-trades.json', name: 'Pair Trades' },
    { file: 'macro-events.json', name: 'Macro Events' }
  ];
  
  const comparisons = [];
  
  strategies.forEach(strategy => {
    const currentPath = path.join(DATA_DIR, 'watchlists', strategy.file);
    const previousPath = path.join(archiveDataPath, 'watchlists', strategy.file);
    
    const current = loadJSON(currentPath);
    const previous = loadJSON(previousPath);
    
    if (current && previous) {
      const comparison = compareWatchlists(current, previous, strategy.name);
      comparisons.push(comparison);
      console.log(`✓ Compared ${strategy.name}`);
    } else {
      console.warn(`⚠️  Skipped ${strategy.name} (missing data)`);
    }
  });
  
  if (comparisons.length === 0) {
    console.error('❌ No comparisons could be made.');
    process.exit(1);
  }
  
  // Generate outputs
  const outputDir = path.join(ARCHIVE_DIR, recentArchive.path);
  
  const performanceAnalysis = generatePerformanceAnalysis(comparisons, recentArchive.path);
  const weeklyDiff = generateWeeklyDiff(comparisons);
  
  fs.writeFileSync(
    path.join(outputDir, 'performance-analysis.md'),
    performanceAnalysis,
    'utf-8'
  );
  console.log(`✓ Written: performance-analysis.md`);
  
  fs.writeFileSync(
    path.join(outputDir, 'changes-from-previous-week.md'),
    weeklyDiff,
    'utf-8'
  );
  console.log(`✓ Written: changes-from-previous-week.md`);
  
  console.log('\n✅ Archive comparison complete!');
}

if (require.main === module) {
  main();
}

module.exports = { compareWatchlists, extractTickers };
