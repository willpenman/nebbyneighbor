# Nebby Neighbor - Phase 1 Development Todos

## Issue Format

**Short summary** - 1-2 sentence, imperative form

**Guiding priorities** - required project context; short explanation about what aspects have already been in play and will likely guide subsequent choices

**Acceptance criteria** - bullet-point set of todos. Highlight items as "interactive-pre" (architectural) or "interactive-post" (design choices). For design elements, we will likely want to make multiple versions; for infrastructural aspects, will want to check in so Will can carefully plan the big picture

**Test steps** - comprehensive list (usually one per acceptance criterion), note that you will use the Playwright mcp for visual aspects such as clicking and image/pdf generation. Use lookahead to incorporate elements from future issues when they provide clear efficiency gains.

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

**Short summary** - Render interactive 4×4 grid with touch-friendly placement areas for neighbor placement.

**Guiding priorities** - Mobile-first design with large tap targets (per PRD), clean visual design with minimal clutter (per PRD), tic-tac-toe style grid where neighbors are placed in cell centers rather than mathematical intersection points. Grid must support dynamic constraint visualization from future PRs.

**Acceptance criteria**
- Render 4×4 grid with clearly defined cells for neighbor placement (like tic-tac-toe)
- **Interactive-pre**: Choose coordinate system representation (0-indexed vs 1-indexed, origin placement)
- **Interactive-pre**: Determine grid rendering approach (SVG, Canvas, or CSS Grid)
- Make cell centers touch-friendly with adequate tap target sizes for mobile
- **Interactive-post**: Choose visual styling for grid lines (color, thickness, style)
- **Interactive-post**: Design cell appearance and neighbor placement areas
- Ensure grid scales appropriately across different screen sizes
- Grid should visually integrate with header content from previous PR

**Test steps**
- Verify 4×4 grid renders correctly with 16 placeable cells
- Test cell centers are clickable/tappable on mobile devices  
- Confirm grid displays properly across different viewport sizes
- Validate grid visual integration with existing header content
- Test grid renders consistently across different browsers
- Verify cells have adequate spacing for touch interaction
- Confirm grid coordinate system works as expected for future neighbor placement

- [ ] **Click grid intersections to place/remove neighbor circles**

**Short summary** - Implement click/tap interaction system for placing and removing neighbors on grid cells with visual feedback.

**Guiding priorities** - Touch-friendly interactions (per PRD), toggle placement system, visual feedback for neighbor placement/removal. Neighbor icon design should be centrally configurable as it may evolve (per PRD notes about potential blob-like shapes). Consider that diagnostic mode will add a third state for inspecting neighbor dependencies.

**Acceptance criteria**
- **Interactive-pre**: Define internal grid state representation for tracking neighbor positions (will need to support conversion from compressed representation in final phase)
- **Interactive-pre**: Choose coordinate system consistency with grid rendering from previous PR
- **Interactive-post**: Design neighbor visual representation (currently small circles, may evolve per PRD)
- Handle click/tap events on grid cells for neighbor placement
- Implement toggle behavior: click empty cell to place neighbor, click occupied cell to remove neighbor
- Provide immediate visual feedback when neighbors are placed or removed
- Ensure neighbor placement is centrally configurable for future design evolution
- **Interactive-post**: Choose visual styling for placed neighbors (size, color, animation)
- Account for future third state: inspection mode for showing neighbor dependencies (implementation can be deferred)

**Test steps**
- Verify clicking empty cell places a neighbor at correct coordinates
- Test clicking occupied cell removes the neighbor
- Confirm touch interactions work properly on mobile devices
- Validate visual feedback appears immediately upon placement/removal
- Test neighbor placement persists correctly in internal state
- Verify coordinate system matches grid rendering from previous PR
- Confirm neighbor visual styling is centrally configurable
- Test rapid clicking doesn't cause state inconsistencies

- [ ] **Load one solvable 4×4 puzzle with some pre-placed neighbors**

**Short summary** - Implement puzzle loading system with pre-placed neighbors that uniquely determine a valid solution.

**Guiding priorities** - Minimal disambiguating sets approach (per PRD), visual distinction between pre-placed and player-placed neighbors, puzzle data format must support future conversion from compressed representation. Focus on one working 4×4 puzzle initially.

**Acceptance criteria**
- **Interactive-pre**: Define puzzle data structure format (coordinates, pre-placed positions, metadata)
- Create at least one valid 4×4 puzzle configuration with minimal pre-placed neighbors
- Load initial puzzle state with pre-placed neighbors in correct positions
- **Interactive-post**: Choose visual distinction for pre-placed vs player-placed neighbors (e.g., different colors, styling)
- Ensure puzzle data format is compatible with internal grid state from previous PR
- Verify pre-placed neighbors create unique solution path when completed
- **Interactive-pre**: Choose approach for storing puzzle configurations (hardcoded, JSON, etc.)

**Test steps**
- Verify puzzle loads with correct pre-placed neighbor positions
- Confirm pre-placed neighbors are visually distinct from player-placed neighbors
- Test that pre-placed neighbors cannot be removed by player interaction
- Validate puzzle configuration represents a solvable state
- Confirm puzzle data integrates correctly with internal grid state
- Test that completing the puzzle from pre-placed state yields exactly 2n neighbors
- Verify puzzle data structure supports future batch loading from conversion tool

- [ ] **Add support for larger grid sizes (n=10) for comprehensive line testing**

**Short summary** - Extend grid system to support n=10 grids for testing complex slope detection and future scalability.

**Guiding priorities** - Mathematical accuracy requires testing arbitrary slopes like 2:1, 3:2 ratios which need larger grids. Mobile-first design must accommodate larger grids through scrolling or scaling (per PRD). Architecture should support eventual progression to much larger grids (n≥53).

**Acceptance criteria**
- Extend grid rendering system to support configurable grid sizes (n=4 through n=10)
- **Interactive-pre**: Choose approach for displaying larger grids on mobile (scrolling, scaling, zoom)
- Update coordinate system and internal state to handle larger grids
- Ensure touch targets remain adequate for mobile interaction at all grid sizes
- **Interactive-post**: Choose visual approach for grid size transitions or selection
- Maintain performance with larger grids and more potential neighbor placements
- Grid sizing should integrate with existing header and UI elements

**Test steps**
- Verify n=10 grid renders correctly with 100 placeable cells
- Test mobile interaction remains usable on 10x10 grid
- Confirm coordinate system accuracy across different grid sizes
- Validate performance remains smooth with larger grids
- Test grid size changes don't break existing functionality
- Verify touch targets remain adequately sized for mobile devices
- Confirm larger grids display properly across different screen sizes

- [ ] **Detect and highlight when 3 neighbors form a line**

**Short summary** - Implement real-time line detection algorithm for three-in-line violations with visual highlighting.

**Guiding priorities** - Mathematical accuracy (all slopes, not just cardinal directions per PRD), real-time constraint checking for immediate feedback, visual treatment must be clear but not overwhelming. This enables the constraint visualization system from subsequent PRs.

**Acceptance criteria**
- Implement line detection algorithm that handles all slopes and orientations (not just horizontal, vertical, diagonal)
- **Interactive-pre**: Choose algorithm approach (brute force vs optimized geometric calculations)
- Detect three-in-line violations in real-time as neighbors are placed
- **Interactive-post**: Choose visual treatment for highlighting violating lines (color, animation, line overlay)
- **Interactive-post**: Design visual feedback intensity (subtle vs prominent highlighting)
- Ensure line detection integrates with existing neighbor placement system
- Support detection across both pre-placed and player-placed neighbors
- Build architecture that supports future constraint visualization (graying out forbidden squares)

**Test steps**
- Verify detection works for horizontal, vertical, and diagonal lines
- Test detection for lines at arbitrary slopes (e.g., 2:1, 3:2 ratios) using n=10 grid
- Confirm real-time detection triggers immediately upon third neighbor placement
- Test visual highlighting appears correctly for all detected lines
- Verify detection works with mixed pre-placed and player-placed neighbors
- Test multiple simultaneous line violations are handled correctly
- Confirm line detection performance remains smooth during gameplay
- Validate detection accuracy with edge cases (corners, boundaries)

- [ ] **Gray out squares that would violate three-in-line rule**

**Short summary** - Implement dynamic constraint visualization system that grays out forbidden squares in real-time.

**Guiding priorities** - Real-time constraint visualization reduces player frustration and builds geometric intuition (per PRD). Visual system must be clear but not overwhelming, updating dynamically as neighbors are placed/removed. This is the core constraint visualization feature.

**Acceptance criteria**
- Calculate forbidden positions dynamically based on current neighbor placements
- **Interactive-post**: Define visual treatment for disabled squares (graying, opacity, color change)
- Update constraint visualization in real-time as neighbors are placed or removed
- Prevent neighbor placement on grayed-out squares while allowing tap for inspection mode
- **Interactive-pre**: Choose calculation approach (per-placement analysis vs comprehensive grid analysis)
- Ensure constraint visualization works with both pre-placed and player-placed neighbors
- Visual constraints should integrate with existing grid and neighbor styling
- Support constraint visualization across different grid sizes (n=4 to n=10)
- Prepare architecture for future diagnostic mode (tap grayed square to show conflicting neighbors)

**Test steps**
- Verify squares gray out correctly when placement would create three-in-line
- Test constraint visualization updates immediately when neighbors are placed/removed
- Confirm grayed squares prevent neighbor placement but still respond to tap events
- Validate constraint calculation accuracy for all line orientations and slopes
- Test performance remains smooth with real-time constraint updates
- Verify constraint visualization works correctly across different grid sizes
- Test constraint updates work with mixed pre-placed and player-placed neighbors
- Confirm visual treatment is clear and intuitive for players

## Medium Priority (Game Features)

- [ ] **Display remaining neighbors counter and level identifier**

**Short summary** - Implement neighbor counter showing remaining placements needed and level identification display.

**Guiding priorities** - Game Status Bar placement (per PRD), counter shows remaining neighbors (counts down to 0), level identifier provides puzzle tracking. Visual design should integrate with existing header elements.

**Acceptance criteria**
- Display remaining neighbor count (starts at 2n, counts down to 0)
- **Interactive-post**: Design counter visual layout and styling within Game Status Bar
- Update counter immediately when neighbors are placed or removed  
- Show level identifier/number for current puzzle (right-aligned per PRD)
- **Interactive-post**: Choose level identifier format (number, description, unique ID)
- Counter should work across different grid sizes (4×4 starts at 8, 10×10 starts at 20)
- **Interactive-pre**: Choose data structure for level identification and metadata
- Integrate styling with existing header content (title, subtitle, instruction)

**Test steps**
- Verify counter starts at correct value (2n) for each grid size
- Test counter decrements when neighbors are placed, increments when removed
- Confirm counter reaches 0 when exactly 2n neighbors are placed
- Validate level identifier displays correctly and updates with level changes
- Test counter and identifier display integrate well with existing header
- Verify elements remain visible and readable across different screen sizes
- Confirm counter accuracy with mixed pre-placed and player-placed neighbors
- Test right-alignment of level identifier works properly

- [ ] **Detect and celebrate when exactly 2n neighbors placed without violations**

**Short summary** - Implement win condition detection and victory celebration for completed puzzles.

**Guiding priorities** - Clear victory experience with seamless continuation to next level (per PRD). Win detection must be mathematically accurate (exactly 2n neighbors with no three-in-line violations). Victory treatment should feel rewarding without being overwhelming. Integrates with neighbor counter reaching 0.

**Acceptance criteria**
- Detect win condition when exactly 2n neighbors are placed (8 for 4×4, 20 for 10×10)
- Validate that no three-in-line violations exist at completion
- **Interactive-post**: Design victory animation/message treatment (celebration, feedback)
- **Interactive-post**: Choose victory display duration and dismissal method
- Ensure win detection works across different grid sizes
- **Interactive-pre**: Choose approach for transitioning to next level or level selection
- Win detection should integrate with existing constraint checking system
- Support win detection with mixed pre-placed and player-placed neighbors
- Coordinate with neighbor counter reaching 0 from previous PR

**Test steps**
- Verify win detection triggers when exactly 2n neighbors are placed without violations
- Test that win condition does not trigger with fewer than 2n neighbors
- Confirm win detection properly validates absence of three-in-line violations
- Test victory animation/message displays correctly and is dismissible
- Validate win detection works correctly across different grid sizes (4×4, 10×10)
- Test win detection with various combinations of pre-placed and player-placed neighbors
- Confirm victory experience provides clear path to continue gameplay
- Verify win detection performance doesn't impact gameplay smoothness
- Test coordination with neighbor counter showing 0 remaining

- [ ] **Add working undo/redo buttons for neighbor placement**

**Short summary** - Implement undo/redo system for neighbor placement with tree navigation support.

**Guiding priorities** - Tree navigation support for exploring different solution branches (per PRD), rewind and forward navigation through placement history. Control Section placement with Rewind and Redo buttons (per PRD).

**Acceptance criteria**
- Track complete placement history for undo/redo functionality
- **Interactive-pre**: Choose data structure for history tracking (stack, tree, or linear history)
- Implement undo functionality that removes most recent neighbor placement
- Implement redo functionality that restores previously undone placements
- **Interactive-post**: Design button placement and styling within Control Section (per PRD)
- Support tree exploration for different solution branches without penalty
- **Interactive-post**: Choose visual design for undo/redo buttons (icons, text, styling)
- History should integrate with constraint visualization and counter updates
- Undo/redo should work with both player-placed neighbors (pre-placed neighbors remain fixed)

**Test steps**
- Verify undo removes most recent neighbor placement and updates constraints
- Test redo restores previously undone neighbor placement
- Confirm undo/redo updates neighbor counter correctly
- Validate constraint visualization updates properly with undo/redo actions
- Test undo/redo buttons are accessible and well-positioned in Control Section
- Verify history tracking works correctly across different grid sizes
- Test undo/redo performance remains smooth during gameplay
- Confirm pre-placed neighbors are not affected by undo/redo operations

## Low Priority (Navigation)

- [ ] **Display level selection interface**

**Short summary** - Implement level selection system for choosing between available 4×4 puzzles.

**Guiding priorities** - Level Selection Interface design (per PRD), accommodate multiple levels efficiently, "Back to Levels" button integration from Control Section (per PRD). Foundation for future massive scale level management (65k+ levels).

**Acceptance criteria**
- Create level selection interface for choosing between available 4×4 puzzles
- **Interactive-pre**: Choose level selection layout approach (list, grid, scrollable interface)
- Display available puzzles with appropriate identifiers or previews
- **Interactive-post**: Design visual layout for level selection (placeholder concept per PRD)
- Implement navigation from game back to level selection ("Back to Levels" button)
- **Interactive-pre**: Choose data structure for managing multiple puzzle definitions
- Load selected puzzle and transition to game interface
- **Interactive-post**: Choose progress indication (completed vs available levels)
- Interface should be efficient and scalable for future expansion

**Test steps**
- Verify level selection interface displays available 4×4 puzzles
- Test puzzle selection loads correct puzzle and transitions to game
- Confirm "Back to Levels" button returns to selection interface correctly
- Validate level selection interface is usable across different screen sizes
- Test interface handles multiple puzzles efficiently
- Verify selected puzzle loads with correct pre-placed neighbors
- Confirm interface provides clear visual feedback for selection actions
- Test navigation between level selection and game interface works smoothly

- [ ] **Create one-time conversion tool from extremely compressed representation to puzzle data**

**Short summary** - Build preprocessing tool to convert 65k+ compressed mathematical solutions into minimal disambiguating puzzle configurations.

**Guiding priorities** - One-time conversion function approach (per PRD), transform compressed data into minimal disambiguating sets, handle Flammenkamp symmetry classifications, preserve solution integrity while hiding complete solutions from client. Foundation for massive level content.

**Acceptance criteria**
- Load extremely compressed solution data (65k+ solutions from mathematical research)
- **Interactive-pre**: Choose input format for compressed solution data (file format, data structure)
- Transform compressed data into minimal disambiguating sets for puzzle initialization
- Generate pre-placed neighbor configurations that uniquely determine solutions
- Handle all Flammenkamp symmetry classifications (iden, dia1, ort1, rot2, dia2, rot4, ort2, full, near)
- **Interactive-pre**: Choose output format compatible with internal grid state representation
- Preserve solution integrity while hiding complete solutions from client-side code
- **Interactive-pre**: Choose approach for batch processing and data validation
- Generate puzzle data compatible with level selection interface

**Test steps**
- Verify tool successfully loads compressed solution data
- Test conversion produces valid minimal disambiguating sets
- Confirm generated puzzles have unique solution paths when completed
- Validate all symmetry classifications are handled correctly
- Test output format integrates with existing puzzle loading system
- Verify solution integrity is preserved while complete solutions remain hidden
- Confirm batch processing handles large dataset (65k+ solutions) efficiently
- Test generated puzzle data works with level selection and game interfaces