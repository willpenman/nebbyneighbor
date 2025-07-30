# Development Tools

## Issue-Specific Development Shortcuts

Quick access to issue-specific development modes:

- **[index-2.html](./index-2.html)** → Issue #2: Display clickable 4×4 grid with soft organic theme
- **[index-4.html](./index-4.html)** → Issue #4: Load one solvable 4×4 puzzle with some pre-placed neighbors  
- **[index-5.html](./index-5.html)** → Issue #5: Add support for larger grid sizes (n=10) with mobile accessibility
- **[index-6.html](./index-6.html)** → Issue #6: Detect and highlight when 3 neighbors form a line

**Access URLs:**
- `http://localhost:3000/src/dev/index-2.html`
- `http://localhost:3000/src/dev/index-4.html`
- `http://localhost:3000/src/dev/index-5.html`
- `http://localhost:3000/src/dev/index-6.html`

## Direct URL Access

You can also access development modes directly:
- `http://localhost:3000?issue=2`
- `http://localhost:3000?issue=4` 
- `http://localhost:3000?issue=5`
- `http://localhost:3000?issue=6`

## How It Works

Each shortcut redirects to the main app with an issue parameter, which:
1. Loads the issue-specific configuration from `docs/development/issue-N/config.js`
2. Injects a development overlay with theme selectors and controls
3. Preserves the main app functionality while adding issue-specific testing features

This system allows testing design variations without separate implementations.

## Development Architecture

- **`DevOverlay.ts`** - Core development overlay system
- **`index-*.html`** - Issue-specific shortcuts
- **`../../docs/development/issue-*/config.js`** - Issue configurations