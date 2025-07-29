# Nebby Neighbor - Phase 1 Development Todos

## High Priority (Core Gameplay)

- [ ] **Set up Vite + TypeScript project with basic HTML page**
  - Initialize project structure
  - Configure TypeScript and Vite
  - Create basic HTML layout

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