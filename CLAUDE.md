# Claude Context - Nebby Neighbor

## I/O

This project uses `gh` CLI for GitHub operations and repository management.

We plan to use the Playwright MCP for web actions including visual testing, clicking interactions, and screenshot/PDF generation during development and testing phases.

**Playwright MCP Fix:** If you encounter "Browser is already in use" errors, use `npx -y @playwright/mcp@v0.0.31` to install the previous version which resolves the issue.

For mobile testing, use `npm run dev -- --host` to expose the development server to the local network. The server is configured with `allowedHosts: ['wills-macbook-pro-6.local']` for Will's phone access.

## Design Tests

The project uses a systematic issue-based design exploration system:

**Issue Configuration Structure:**
Each `docs/development/issue-N/config.js` exports an `issueConfig` object with:
- `title` - Issue description
- `description` - Brief explanation of what's being tested
- `themeVariants` - Object mapping variant keys to theme configurations
- `defaultTheme` - Initial variant selection
- `testPuzzle` - Puzzle configuration for testing
- `devFeatures` - Flags for dev overlay UI elements

**Theme Variants Structure:**
Each theme variant should have:
- `name` - Display name for dropdown (e.g., "Friendly Labels")
- `description` - Explanation of the design approach
- Theme-specific configuration object (varies by issue type):
  - `override` - For renderer-based themes (colors, styling)
  - `statusBarStyle` - For status bar themes (counterStyle, levelStyle, colors)
  - `forbiddenSquareStyle` - For constraint visualization themes
  - `gridSize` - For grid size variants

**Development Overlay Flow:**
1. URL parameter `?issue=N` triggers dev mode in `main.ts`
2. `DevOverlay` class dynamically imports the issue config
3. Dev UI is injected with theme selectors and controls
4. Theme changes dispatch `dev-theme-change` events
5. Main app listens for events and applies changes via renderer methods - as more issues are addressed, additional work may be required in the main app to configure new types of overrides

**Archive Structure:**
`docs/development/issue-N/` preserves design choices as:
- `config.js` - Testable theme variants
- Screenshots documenting the exploration process
- No redundant HTML files (configs are applied dynamically)

This approach maintains a single evolving production codebase while preserving the full design exploration history.

## For Will

**Development commands:**
- `npm run dev` - Start development server at http://localhost:3000
- `npm run dev -- --host` - Expose server for mobile testing at wills-macbook-pro-6.local:3000
- `npm run build` - Build for production (outputs to dist/)
- `npm run preview` - Preview production build locally

**Issue-specific testing:**
- `http://localhost:3000/index.html?issue=N` - Load specific issue configuration

**Git workflow:**
- To back up and try again: `git add .claude/ && git commit && git reset --hard HEAD && git clean -fdn` (then probably `git clean -fd` to actually do it)

## Beware

**Common Failure Points and Bug Patterns:**

**Re-rendering Issues:**
- Canvas rendering is event-driven, not continuous - DOM manipulations (tooltips, modals) can trigger unexpected resize events causing render cycles
- Modal dismissal handlers calling `render()` can recreate modals immediately if state persists
- Use `setTimeout()` to defer DOM manipulation until after render cycle completes
- Animation features require `requestAnimationFrame` loops vs. current event-driven approach

**Grid Size and Responsive Behavior:**
- Transition from wide to tall aspect ratios can break grid positioning calculations  
- `MIN_CELL_SIZE` (44px) threshold determines scrollable vs. fitted behavior
- Grid offset calculations assume static viewport - dynamic resizing needs recalculation
- Mobile panning gestures can interfere with cell click detection on smaller grids

**Dev Overlay System:**
- Theme selector dropdown only appears if `devFeatures.themeSelector: true` is set in config
- Inconsistent naming between config keys (e.g., `square-highlight`) and display names (`Square Highlight`)
- DevOverlay CSS can conflict with main app styles - use scoped selectors
- Config property names must match exactly between `config.js` and renderer update methods

**Cross-Project Concept Naming:**
- "Constraint Visualization Style" label used in dev overlay but refers to highlighting, forbidden squares, status bars, etc.
- Theme variant keys use kebab-case, display names use Title Case - maintain consistency
- Config object properties vary by issue type (`override`, `statusBarStyle`, `highlightStyle`) - document expected structure per issue type