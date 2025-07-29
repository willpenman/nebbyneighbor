# Nebby Neighbor - Phase 1 Development Todos

## PR Format

**Short summary** - 1-2 sentence, imperative form

**Guiding priorities** - required project context; short explanation about what aspects have already been in play and will likely guide subsequent choices

**Acceptance criteria** - bullet-point set of todos. Highlight items as "interactive-pre" (architectural) or "interactive-post" (design choices). For design elements, we will likely want to make multiple versions; for infrastructural aspects, will want to check in so Will can carefully plan the big picture

**Test steps** - comprehensive list (usually one per acceptance criterion), note that you will use the Playwright mcp for visual aspects such as clicking and image/pdf generation. Use lookahead to incorporate elements from future PRs when they provide clear efficiency gains.

## High Priority (Core Gameplay)

- [ ] **Set up Vite + TypeScript project with basic HTML page**

**Short summary** - Initialize Vite + TypeScript development environment with basic HTML foundation for mobile-first puzzle game.

**Guiding priorities** - Mobile-first design (per PRD), TypeScript for maintainability (per PRD), Vite for fast iteration (per PRD), client-side architecture with no server dependency (per PRD). Project should support touch-friendly interactions and responsive design from the start.

**Acceptance criteria**
- Initialize npm project with appropriate package.json metadata
- Install and configure Vite with TypeScript support
- Set up TypeScript configuration with strict settings appropriate for game development
- Create basic HTML page with mobile-responsive viewport and game-appropriate meta tags
- **Interactive-pre**: Choose initial CSS architecture (vanilla CSS, CSS modules, or styling library)
- **Interactive-pre**: Determine project directory structure (src/, public/, etc.)
- Create minimal TypeScript entry point that successfully builds and runs
- Configure development server to run locally
- Include project header ("Nebby Neighbor"), subtitle ("In Pittsburgh, 'nebby' means 'nosy'"), and main instruction ("Place all neighbors so that no one is hidden from someone's view") in initial HTML (per PRD page design)

**Test steps**
- Verify npm project initializes with correct metadata
- Confirm Vite development server starts without errors
- Validate TypeScript compilation works with example code
- Test HTML page loads correctly in browser with proper mobile viewport
- Verify build process produces deployable dist/ output
- Confirm development server supports hot reload for TypeScript changes
- Test page displays correctly on mobile viewport sizes
- Confirm project header, subtitle, and main instruction display correctly

- [ ] **Display clickable n×n grid on screen (start with n=4)**
  - Render 4×4 grid with intersection points
  - Make grid responsive and touch-friendly
  - Add visual styling for grid lines

- [ ] **Click grid intersections to place/remove neighbor circles**
  - Define internal representation of grid (coordinates, state tracking)
  - Define placed-neighbor icon (centrally configurable, may evolve)
  - Handle click/tap events on intersections
  - Toggle neighbor placement (add/remove)
  - Visual feedback for neighbor placement

- [ ] **Load one solvable 4×4 puzzle with some pre-placed neighbors**
  - Define puzzle data structure format
  - Create at least one valid 4×4 puzzle configuration
  - Load initial puzzle state with pre-placed neighbors
  - Define visual distinction for pre-placed vs player-placed neighbors

- [ ] **Detect and highlight when 3 neighbors form a line**
  - Implement line detection algorithm (all slopes, not just cardinal)
  - Choose visual treatment for highlighting violating lines
  - Real-time constraint checking architecture

- [ ] **Gray out squares that would violate three-in-line rule**
  - Define disabled square visual treatment
  - Calculate forbidden positions dynamically
  - Update visual constraints as neighbors are placed/removed
  - Prevent placement on grayed squares

- [ ] **Detect and celebrate when exactly 2n neighbors placed without violations**
  - Win condition detection (8 neighbors for 4×4)
  - Design victory animation/message treatment
  - Solution validation

## Medium Priority (Game Features)

- [ ] **Display remaining neighbors counter (goal: 2n neighbors)**
  - Design counter UI layout and styling
  - Show current neighbor count
  - Show target count (2n)
  - Visual progress indicator

- [ ] **Add working undo/redo buttons for neighbor placement**
  - Track placement history
  - Implement undo functionality
  - Implement redo functionality

## Low Priority (Navigation)

- [ ] **Add 'Next Level' button that loads a different 4×4 puzzle**
  - Multiple 4×4 puzzle definitions
  - Level transition functionality
  - Basic level progression