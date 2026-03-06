# Perplexity Spaces Setup Guide

This guide explains how to configure the two Perplexity Spaces for the Trading Copilot system.

---

## Overview

The Trading Copilot system uses **two distinct Perplexity Spaces**:

1. **Trading Copilot** (execution space)
   - Purpose: Live trading analysis, forecasts, watchlist generation, and trading consultancy
   - Instruction file: `docs/INSTRUCTIONS.TRADING.md`
   - Updates: Weekly refresh Sunday 19:00 CET

2. **Trading Copilot Development** (development space)
   - Purpose: Product ownership, architecture, refactoring, strategy design, and documentation
   - Instruction file: `docs/INSTRUCTIONS.DEV.md`
   - Updates: Weekly review Sunday 19:00 CET

---

## Space 1: Trading Copilot (Execution)

### Basic Configuration

**Name:** `Trading Copilot`

**Description:**
```
AI-powered trading analysis and forecasting system. Generates weekly watchlists across multiple strategies, tracks positions, and provides trading consultancy based on market regime and technical analysis.
```

**System Prompt File:** `docs/INSTRUCTIONS.TRADING.md`

### Key Responsibilities

- Generate and update weekly watchlists for all active strategies
- Analyze market regime and adjust strategy recommendations
- Provide trade entry/exit guidance and risk analysis
- Update trading journal with notes and recommendations
- Respond to ad-hoc trading questions and analysis requests

### MCP Configuration

**Required GitHub MCP permissions:**
- Read: All repository files
- Write: `data/watchlists/*.json`, `data/context/market-regime.json`, `data/journal/*.json`, `data/meta/manifest.json`
- Branch: Direct commits to `main` for data updates (not code)

**Repository:** `sedhommarco/trading-copilot`
**Default branch:** `main`

### Weekly Command

Run every **Sunday at 19:00 CET**:

```
Trading Copilot — Weekly Refresh [START_DATE to END_DATE]

Generate updated watchlists for all strategies, refresh market regime analysis, and update manifest timestamp.
```

### Ad-hoc Usage

- "Analyze [TICKER] for [STRATEGY]"
- "Update journal with today's trades"
- "What's the market regime saying about volatility plays?"
- "Review my open XAU position"

---

## Space 2: Trading Copilot Development

### Basic Configuration

**Name:** `Trading Copilot Development`

**Description:**
```
Product ownership and development space for Trading Copilot. Handles architecture, refactoring, strategy design, documentation, schema evolution, and repository maintenance.
```

**System Prompt File:** `docs/INSTRUCTIONS.DEV.md`

### Key Responsibilities

- Refactor and evolve repository structure
- Design and document trading strategies
- Maintain JSON schemas and data formats
- Improve SPA UI/UX
- Manage archive system and historical analysis
- Create development branches and PRs
- Update documentation

### MCP Configuration

**Required GitHub MCP permissions:**
- Read: All repository files
- Write: All files (code, docs, data, app)
- Branch: Create feature branches, open PRs
- Commits: Multi-file commits via `push_files`

**Repository:** `sedhommarco/trading-copilot`
**Default branch:** `main`
**Branching pattern:** `dev/yyyymmdd-hhmm-short-slug`

### Weekly Command

Run every **Sunday at 19:00 CET** (after Trading Copilot refresh):

```
Trading Copilot Development — Weekly Review [START_DATE to END_DATE]

Review repository state, compare archive snapshots, propose enhancements, create archive snapshot, and execute approved refactors.
```

### Ad-hoc Usage

- "Add new strategy: [STRATEGY_NAME]"
- "Refactor journal schema to support [FEATURE]"
- "Improve SPA sorting by [CRITERIA]"
- "Document [COMPONENT] in detail"
- "Create archive snapshot for week [N]"

---

## GitHub Integration

### Repository Access

Both spaces need GitHub MCP configured with:
- Personal access token (PAT) with `repo` scope
- Repository: `sedhommarco/trading-copilot`
- Default branch: `main`

See `docs/setup/github-setup.md` for detailed GitHub integration steps.

### Permission Boundaries

**Trading Copilot (execution):**
- Can update data files directly on `main`
- Cannot modify code or documentation
- Cannot create branches or PRs

**Trading Copilot Development:**
- Creates feature branches for all changes
- Opens PRs for review (no approval required)
- Can modify any file in the repository

---

## Weekly Schedule

**Every Sunday at 19:00 CET:**

1. **Trading Copilot** runs weekly refresh (15-30 min)
   - Updates all watchlists
   - Refreshes market regime
   - Updates manifest timestamp
   - Commits directly to `main`

2. **Trading Copilot Development** runs weekly review (30-60 min)
   - Reads updated data from step 1
   - Creates weekly archive snapshot
   - Reviews repository health
   - Proposes and executes enhancements
   - Creates feature branches and PRs

---

## User Profile Integration

Both spaces should reference `docs/setup/capital-and-user-profile.md` for:
- Trading capital and constraints
- Risk tolerance and position sizing
- Geographic location and trading hours
- Preferred platforms (Revolut, Revolut X)
- Instrument availability and limitations

---

## Migration Notes

If you're switching from the old single-instruction setup:

1. Update **Trading Copilot** space system prompt to use `docs/INSTRUCTIONS.TRADING.md`
2. Update **Trading Copilot Development** space system prompt to use `docs/INSTRUCTIONS.DEV.md`
3. Verify MCP permissions match the boundaries described above
4. Test both spaces with a simple query before Sunday refresh
5. Old `docs/INSTRUCTIONS.md` now serves as a meta-file pointing to the two entrypoints

---

## Troubleshooting

**Trading Copilot can't update watchlists:**
- Check GitHub MCP has write permission to `data/` directory
- Verify PAT hasn't expired
- Confirm space is pointing to correct instruction file

**Trading Copilot Development can't create branches:**
- Check GitHub MCP has full repository write access
- Verify branching pattern in `INSTRUCTIONS.DEV.md` matches space behavior
- Confirm PAT has `repo` scope (not just `public_repo`)

**Both spaces give inconsistent responses:**
- Ensure each space is using its correct instruction file
- Verify `docs/INSTRUCTIONS.TRADING.md` and `docs/INSTRUCTIONS.DEV.md` are up to date
- Check that data files follow documented schemas
