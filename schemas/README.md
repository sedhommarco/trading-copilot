# JSON Schemas

This directory contains JSON Schema definitions for validating Trading Copilot data files.

## Purpose

- **Catch errors early**: Validate JSON structure before data is used by the SPA
- **Document structure**: Schemas serve as machine-readable documentation
- **Non-blocking**: Validation warnings are informational only - PRs are never blocked

## Available Schemas

### `watchlist.schema.json`

Validates all strategy watchlist files:
- `data/watchlists/pre-earnings.json`
- `data/watchlists/post-crash.json`
- `data/watchlists/volatility.json`
- `data/watchlists/crypto.json`
- `data/watchlists/pair-trades.json`
- `data/watchlists/macro-events.json`

**Key validations:**
- Required fields: `strategy`, `week_start`, `week_end`, `opportunities`
- Strategy enum values
- Date formats
- Opportunity/event/candidate structures

### `transactions.schema.json`

Validates transaction log:
- `data/journal/transactions.json`

**Key validations:**
- Required summary fields
- Transaction structure
- Date-time formats
- Side enum (buy/sell)

### `positions.schema.json`

Validates open positions:
- `data/journal/positions.json`

**Key validations:**
- Required summary fields
- Position structure
- Numeric fields (P&L, margin, exposure)
- Exit strategy structure

### `manifest.schema.json`

Validates metadata manifest:
- `data/meta/manifest.json`

**Key validations:**
- UI configuration structure
- File tracking array
- Date formats
- Tab order arrays

## GitHub Actions Workflow

The `.github/workflows/validate-json.yml` workflow:

- **Triggers on:**
  - Pull requests touching `data/**/*.json`
  - Manual dispatch

- **Validation behavior:**
  - Uses AJV (Another JSON Validator) CLI
  - Runs validation for all data files
  - Prints warnings for schema violations
  - **Always exits with success** (non-blocking)

- **Output:**
  - GitHub PR check shows green ✅ even if validation fails
  - Warnings appear in workflow logs
  - Annotations on specific files with issues

## Local Validation

### Install AJV

```bash
npm install -g ajv-cli ajv-formats
```

### Validate Files

```bash
# Validate manifest
ajv validate -s schemas/manifest.schema.json -d data/meta/manifest.json

# Validate a watchlist
ajv validate -s schemas/watchlist.schema.json -d data/watchlists/crypto.json

# Validate transactions
ajv validate -s schemas/transactions.schema.json -d data/journal/transactions.json

# Validate positions
ajv validate -s schemas/positions.schema.json -d data/journal/positions.json
```

### Validate All

```bash
# Bash script to validate all files
for file in data/watchlists/*.json; do
  ajv validate -s schemas/watchlist.schema.json -d "$file"
done

ajv validate -s schemas/manifest.schema.json -d data/meta/manifest.json
ajv validate -s schemas/transactions.schema.json -d data/journal/transactions.json
ajv validate -s schemas/positions.schema.json -d data/journal/positions.json
```

## Schema Maintenance

### Updating Schemas

When adding new fields to JSON files:

1. Update the corresponding schema in `schemas/`
2. Test locally with `ajv validate`
3. Commit schema changes with data changes in same PR
4. GitHub Actions will validate on next PR

### Adding New Schemas

For new JSON file types:

1. Create `schemas/<name>.schema.json`
2. Follow JSON Schema Draft 07 format
3. Add validation step to `.github/workflows/validate-json.yml`
4. Document in this README

## Philosophy: Warnings-Only

**Why non-blocking validation?**

- **Flexibility**: Allows rapid iteration during development
- **No CI bottleneck**: Doesn't block manual trading updates
- **Informational**: Provides feedback without enforcing strictness
- **Gradual improvement**: Warnings surface issues over time

**When to fix warnings:**

- Before major releases
- During weekly dev reviews
- When adding new features that rely on specific fields
- When refactoring JSON structure

**When warnings are OK:**

- Quick manual updates to journal
- Testing new fields before schema update
- Experimental data structures

## Related Documentation

- JSON structure: `docs/journal/schema-*.md`
- Strategy expectations: `docs/strategies/*.md`
- Development workflow: `docs/INSTRUCTIONS.DEV.md`
