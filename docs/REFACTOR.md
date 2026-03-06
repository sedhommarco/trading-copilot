# Static App Refactor Documentation

## Overview

This refactor transforms the Trading Copilot SPA from a single monolithic `index.html` file into a clean, modular static web application with proper separation of concerns.

## New File Structure

```text
app/
  index.html                  # Clean HTML entry point (CSS + JS external)
  favicon.ico                 # App icon
  css/
    style.css                 # All application styles
  js/
    config.js                 # Configuration and constants
    api.js                    # Data fetching utilities
    state.js                  # Application state management
    main.js                   # Bootstrap and event wiring
    rendering/
      tabs.js                 # Tab management
      marketRegime.js         # Market regime section
      journal.js              # Trade journal rendering
      watchlists.js           # Watchlist tabs rendering
      cards.js                # Trade card components
```

## Module Responsibilities

### `config.js`
- Global configuration (GitHub user, repo, branch)
- Utility functions (formatNumber)
- Constants

### `api.js`
- `getDataUrl()` - Build data URLs for GitHub or local
- `fetchJSON()` - Fetch and parse JSON with error handling

### `state.js`
- `currentData` - Global application data store
- `uiConfig` - UI configuration from manifest
- `loadAllData()` - Load all data from GitHub/local
- `autoRefreshTimer` - Auto-refresh state

### `main.js`
- Application bootstrap
- Event listener wiring
- Auto-refresh logic
- Status bar updates
- `refreshData()` function

### `rendering/tabs.js`
- `renderTabs()` - Build tab navigation from manifest
- `switchTab()` - Handle tab switching

### `rendering/marketRegime.js`
- `renderMarketRegime()` - Display market regime section
- `toggleMarketRegime()` - Expand/collapse details

### `rendering/journal.js`
- `renderTradeJournal()` - Main journal render function
- `renderNewJournalFormat()` - New format (transactions + positions)
- Individual rendering functions for positions, transactions, summary

**Note:** Legacy journal support has been **completely removed** as requested.

### `rendering/watchlists.js`
- `renderWatchlist()` - Render a single watchlist tab
- `renderAllWatchlists()` - Render all watchlist tabs
- `renderPreviousOutcomes()` - Display previous week outcomes

### `rendering/cards.js`
- `normalizeTradeData()` - Normalize trade data from various formats
- `getConfidenceForSorting()` - Extract numeric confidence for sorting
- `getConfidenceDisplay()` - Get display text for confidence
- `getConfidenceBadgeClass()` - Get CSS class for confidence badge
- `renderTradeCard()` - Standard trade opportunity card
- `renderPairTradeCard()` - Pair trade card
- `renderMacroEventCard()` - Macro event card
- `toggleCardExpansion()` - Expand/collapse card details
- `attachCardEventListeners()` - Attach event listeners after rendering

## Key Improvements

### 1. **Separation of Concerns**
- HTML structure separated from CSS styling and JS logic
- Each module has a single, clear responsibility
- Easy to locate and modify specific functionality

### 2. **Better Maintainability**
- No more 1000+ line HTML file
- Changes to styling don't require touching JS or HTML
- Changes to rendering logic are isolated to specific modules

### 3. **Improved Auto-Refresh UX**
- Manual refresh button stays enabled even with auto-refresh on
- Shows `⏳ Refreshing...` state during refresh
- Status bar displays auto-refresh status

### 4. **Event Handling Fixes**
- `switchTab()` no longer relies on global `event` variable
- Proper event listener attachment via `addEventListener`
- No more inline `onclick` handlers

### 5. **Legacy Cleanup**
- **Removed:** `trade-history.json` loading
- **Removed:** `renderLegacyJournal()` function
- **Removed:** All legacy journal fallback logic
- Dashboard now only supports the new `transactions.json` + `positions.json` format

## Migration from Old Structure

### What Changed?

| Old | New |
|-----|-----|
| Inline `<style>` block | `<link rel="stylesheet" href="./css/style.css">` |
| Inline `<script>` block | `<script type="module" src="./js/main.js"></script>` |
| All code in one file | Modular structure across multiple files |
| Legacy journal support | Removed completely |
| `onclick="switchTab('...')"` | Event listeners in `main.js` |
| Global `event` usage | Explicit event parameter passing |

### What Stayed the Same?

- **Visual design:** Identical look and feel
- **Functionality:** All features work exactly as before (except legacy journal removed)
- **Data format:** Still loads from `data/` folder via GitHub raw URLs
- **Manifest-driven UI:** Tab order and favorites still controlled by manifest
- **Watchlist sorting:** Still sorts by confidence (high → low)

## Development Workflow

### Local Development

1. Serve the `app/` folder with any static HTTP server:
   ```bash
   # Python
   cd app && python3 -m http.server 8000
   
   # Node.js
   npx serve app
   ```

2. Open `http://localhost:8000` in your browser

3. Browser DevTools will now show clear stack traces pointing to specific modules

### GitHub Pages Deployment

- No changes needed
- GitHub Pages serves all files in `app/` as static assets
- ES6 modules work natively in modern browsers

## Browser Compatibility

- **ES6 Modules:** Requires modern browser (Chrome 61+, Firefox 60+, Safari 11+, Edge 16+)
- **ES6 Features:** Arrow functions, const/let, template literals, async/await
- **No Build Step:** Browsers execute modules directly (no bundler needed)

## Future Enhancements

This modular structure sets the foundation for:

- **Phase 2:** JSON validation workflow, improved auto-refresh UX
- **Phase 3:** Archive comparison script
- **Phase 4:** Confidence decay and stale opportunity detection
- **Phase 5:** Live price data integration
- **Phase 6:** Quick-add form for journal entries

## Testing Checklist

Before merging, verify:

- [ ] All tabs render correctly
- [ ] Market regime section expands/collapses
- [ ] Trade cards expand on click
- [ ] Confidence-based sorting works
- [ ] Auto-refresh toggles correctly
- [ ] Manual refresh works even with auto-refresh on
- [ ] Status bar updates correctly
- [ ] Tab switching works smoothly
- [ ] Previous week outcomes display
- [ ] Journal displays positions and transactions
- [ ] No legacy journal fallback (should show error if only legacy exists)
- [ ] Browser console shows no errors
- [ ] GitHub Pages deployment works

## Rollback Plan

If issues arise:

1. The original monolithic `index.html` exists in `main` branch commit `c881135bea02cc2b81658032bf7b6aecd2d74f9b`
2. Can be restored by reverting this branch or cherry-picking old commit
3. All data files remain unchanged, so no data migration needed

## Questions?

Refer to:
- `docs/INSTRUCTIONS.DEV.md` for overall development guidelines
- Individual module files for inline documentation
- Commit history for detailed change rationale
