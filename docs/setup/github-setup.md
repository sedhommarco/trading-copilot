# GitHub Integration Setup

This guide explains how to configure GitHub integration for both Perplexity Spaces.

---

## Prerequisites

- GitHub account with access to `sedhommarco/trading-copilot` repository
- Personal Access Token (PAT) with appropriate permissions
- Perplexity Pro subscription (for MCP integration)

---

## Generate GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Set token name: `Perplexity Trading Copilot MCP`
4. Set expiration: 90 days (recommended) or custom
5. Select scopes:
   - `repo` (full control of private repositories)
   - This includes: `repo:status`, `repo_deployment`, `public_repo`, `repo:invite`, `security_events`
6. Generate token and **copy it immediately** (you won't see it again)
7. Store token securely (password manager recommended)

---

## Configure MCP in Trading Copilot Space (Execution)

### Settings

1. Open **Trading Copilot** space in Perplexity
2. Go to Space Settings → MCP Configuration
3. Add GitHub MCP server:
   - **Server type:** GitHub
   - **Repository:** `sedhommarco/trading-copilot`
   - **Default branch:** `main`
   - **Personal Access Token:** [paste your PAT]

### Permission Boundaries

**Allowed operations:**
- `get_file_contents` (read any file)
- `create_or_update_file` for:
  - `data/watchlists/*.json`
  - `data/context/market-regime.json`
  - `data/journal/*.json`
  - `data/meta/manifest.json`
- Direct commits to `main` (data updates only)

**Restricted operations:**
- Cannot modify `app/`, `docs/`, or root files
- Cannot create branches or PRs
- Cannot delete files

### Verification

Test with:
```
Read the current manifest file and show me the last update timestamp.
```

Expected: Space reads `data/meta/manifest.json` and displays `last_global_update`.

---

## Configure MCP in Trading Copilot Development Space

### Settings

1. Open **Trading Copilot Development** space in Perplexity
2. Go to Space Settings → MCP Configuration
3. Add GitHub MCP server:
   - **Server type:** GitHub
   - **Repository:** `sedhommarco/trading-copilot`
   - **Default branch:** `main`
   - **Personal Access Token:** [same PAT or separate one]

### Permission Boundaries

**Allowed operations:**
- All read operations (`get_file_contents`, `list_commits`, `list_branches`, etc.)
- All write operations:
  - `create_or_update_file`
  - `push_files` (multi-file commits)
  - `delete_file`
- Branch management:
  - `create_branch`
  - `list_branches`
- Pull requests:
  - `create_pull_request`
  - `update_pull_request`
  - `list_pull_requests`

**No restrictions** — this space has full repository access for development work.

### Branching Pattern

All code/doc changes must use feature branches:
- Pattern: `dev/yyyymmdd-hhmm-short-slug`
- Example: `dev/20260306-1120-bootstrap-migration`
- Always branch from `main`
- Open PR when work is complete (no approval workflow required)

### Verification

Test with:
```
Create a test branch called dev/test-branch and read the README file.
```

Expected: Space creates branch and displays README content.

---

## Repository Structure

```
trading-copilot/
├── README.md                      # Project overview and quick start
├── app/
│   ├── index.html                 # Single-page application
│   └── favicon.ico                # App icon
├── data/
│   ├── watchlists/                # Strategy-specific opportunity lists
│   │   ├── pre-earnings.json
│   │   ├── post-crash.json
│   │   ├── volatility.json
│   │   ├── crypto.json
│   │   ├── pair-trades.json
│   │   └── macro-events.json
│   ├── context/
│   │   └── market-regime.json     # Current market state and sentiment
│   ├── journal/
│   │   ├── transactions.json      # Trade execution log
│   │   └── positions.json         # Open positions snapshot
│   └── meta/
│       └── manifest.json          # Data freshness and UI config
├── docs/
│   ├── INSTRUCTIONS.md            # Meta-file (points to entrypoints)
│   ├── INSTRUCTIONS.TRADING.md    # Trading Copilot space instructions
│   ├── INSTRUCTIONS.DEV.md        # Trading Copilot Development instructions
│   ├── setup/
│   │   ├── spaces-setup.md
│   │   ├── github-setup.md
│   │   └── capital-and-user-profile.md
│   ├── strategies/                # Per-strategy documentation
│   │   ├── pre-earnings-momentum.md
│   │   ├── post-crash-rebound.md
│   │   ├── volatility-plays.md
│   │   ├── crypto-opportunities.md
│   │   ├── pair-trades.md
│   │   ├── macro-events.md
│   │   ├── revolut-tools-intraday-swing.md
│   │   └── cycles-sessions-events.md
│   └── journal/
│       ├── schema-transactions.md
│       └── schema-positions.md
└── archive/
    ├── index.json                 # Archive catalog
    └── 2026/
        └── week-XX/               # Weekly snapshots
            ├── manifest.json
            ├── watchlists/
            ├── context/
            └── journal/
```

---

## Hosting and Access

### GitHub Pages (Recommended)

The SPA is automatically deployed via GitHub Pages:

- **URL:** `https://sedhommarco.github.io/trading-copilot/`
- **Source:** `main` branch, `/app` directory
- **Updates:** Automatic on push to `main`
- **Configuration:** Repository Settings → Pages → Source: `main` branch → `/app` folder

### Local Development

For local testing:

```bash
# Clone repository
git clone https://github.com/sedhommarco/trading-copilot.git
cd trading-copilot

# Serve SPA locally (requires Python 3)
cd app
python -m http.server 8000

# Open in browser
# http://localhost:8000
```

Local app will fetch data from GitHub via raw URLs (requires internet connection).

---

## Security Best Practices

### Token Management

1. **Never commit tokens** to the repository
2. **Rotate tokens** every 90 days
3. **Use separate tokens** for each space if possible
4. **Revoke immediately** if compromised
5. **Store in password manager** (1Password, Bitwarden, etc.)

### Repository Access

1. **Keep repository private** (recommended for trading strategies)
2. **Review commit history** weekly for unexpected changes
3. **Monitor GitHub notifications** for suspicious activity
4. **Enable two-factor authentication** on GitHub account

### Data Safety

1. **Never commit sensitive data:**
   - Account credentials
   - API keys
   - Personal financial details beyond general capital amounts
2. **Use placeholder data** in examples and documentation
3. **Review PRs carefully** before merging to `main`

---

## Future Enhancements (Planned)

### JSON Validation Workflow

**Status:** Documented but not yet implemented

**Plan:** Add `.github/workflows/validate-json.yml` to:
- Validate all JSON files in `data/` on push
- Check schema compliance for watchlists and journal
- Run on PRs before merge
- Block merge if validation fails

**Implementation:** Tracked in `docs/INSTRUCTIONS.DEV.md` backlog

### Automated Archival

**Status:** Manual protocol documented

**Plan:** Add GitHub Action to:
- Trigger on schedule (Sunday 20:00 CET)
- Copy `data/` to `archive/<year>/week-XX/`
- Update `archive/index.json`
- Commit archive snapshot

**Implementation:** Future iteration after archive structure stabilizes

---

## Troubleshooting

### "Authentication failed" error

**Cause:** PAT expired, invalid, or missing permissions

**Fix:**
1. Generate new PAT with `repo` scope
2. Update MCP configuration in space
3. Test with simple read operation

### "Branch creation failed" error

**Cause:** Branch already exists or PAT lacks write permission

**Fix:**
1. Check existing branches: `git branch -a`
2. Delete stale branch if safe: `git branch -D <branch-name>`
3. Verify PAT has `repo` scope (not just `public_repo`)

### "File update failed" error

**Cause:** File SHA mismatch or concurrent modification

**Fix:**
1. Reload file content to get latest SHA
2. Ensure no other process is modifying the file
3. For Development space, use feature branches instead of direct `main` commits

### SPA not loading data

**Cause:** GitHub Pages not configured or data files missing

**Fix:**
1. Verify GitHub Pages is enabled (Settings → Pages)
2. Check source is set to `main` branch, `/app` folder
3. Confirm data files exist in `data/` on `main` branch
4. Check browser console for fetch errors

---

## Support

For issues with:
- **GitHub MCP integration:** Check Perplexity MCP documentation
- **Repository structure:** See `docs/INSTRUCTIONS.DEV.md`
- **Trading logic:** See `docs/INSTRUCTIONS.TRADING.md`
- **Strategy details:** See `docs/strategies/*.md`
