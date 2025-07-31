# Nebby Neighbor - Product Requirements Document

## Goals

### Mathematical Foundation: The No-Three-in-Line Problem

The "no-three-in-line" problem is a classic question in discrete geometry first posed by Henry Dudeney in 1900. It asks: What is the maximum number of points that can be placed on an n×n grid such that no three points are collinear (lie on the same straight line)?

**Key Mathematical Properties:**
- For any n×n grid, the theoretical maximum is 2n points (proven by pigeonhole principle)
- All solutions are known for n≤18
- Solutions with exactly 2n points have been found for n=2 through n=46, and for n=48, 50, 52
- For grids larger than n=18, only some symmetric solutions are known
- For larger values of n (especially n=53 and beyond), no solutions are known to exist
- The problem considers lines of all slopes and orientations, not just horizontal, vertical, and diagonal
- Constructive methods exist for certain cases (e.g., Erdős's quadratic construction for prime n)

### Game Transformation: From Mathematics to Interactive Puzzle

**Semantic Reframing:**
The abstract mathematical concept transforms into an intuitive neighborhood scenario:
- Each grid intersection becomes a potential **house location**
- Each point placement represents a **neighbor** living at that location  
- The "no three in line" constraint becomes: **"No neighbor should be hidden from another neighbor's view"**

This semantic transformation makes the mathematical constraint immediately understandable: if three neighbors were placed in a straight line, the middle neighbor would block the view between the outer two.

**Puzzle Game Mechanics:**
- **Objective:** Place exactly 2n neighbors on an n×n grid so none are hidden from each other's view
- **Starting Conditions:** 
  - For well-studied grids (n≤52): Begin with 2-5 pre-placed neighbors that uniquely determine the solution
  - For unsolved grids (n≥53): Begin with empty grid, allowing players to explore unknown mathematical territory
- **Progressive Difficulty:** Players advance through increasing grid sizes, from simple 2×2 up to mathematically unsolved cases
- **Educational Value:** Players develop intuition for geometric relationships and combinatorial constraints

**Unique Value Proposition:**
"Nebby Neighbor" bridges recreational mathematics and interactive entertainment, allowing players to engage with unsolved mathematical problems while enjoying an accessible puzzle experience. Players working on large grids may potentially discover new mathematical solutions.

### Visual Constraint System

**Real-Time Constraint Visualization:**
To reduce player frustration and build geometric intuition, the game provides immediate visual feedback about placement constraints:
- **Grayed-out squares:** When neighbors are placed, all squares that would create a three-in-line violation become visually disabled (grayed out)
- **Dynamic updates:** As players place or remove neighbors, the constraint visualization updates in real-time
- **Educational benefit:** Players develop understanding of how each placement affects future options

This visual system transforms the abstract mathematical constraint into immediate, intuitive feedback, helping players understand the geometric relationships at play.

### Copycat Mechanics: Symmetry-Based Assistance

**Mathematical Foundation - Flammenkamp's Symmetry Classifications:**
Based on Achim Flammenkamp's 1998 research, solutions can be categorized into eight symmetry classes:

- **`iden`** - No symmetry (identity only)
- **`dia1`** - Diagonal reflection symmetry (one long-diagonal)  
- **`ort1`** - Orthogonal reflection symmetry (one mid-perpendicular)
- **`rot2`** - Half rotational symmetry (180°)
- **`dia2`** - Diagonal reflection symmetry (both long-diagonals)
- **`rot4`** - Quarter rotational symmetry (90°)
- **`ort2`** - Orthogonal reflection symmetry (both mid-perpendiculars)
- **`full`** - Full symmetry (all transformations)
- **`near`** - Near-quarter rotational symmetry (for odd n, quarter-rotational except on long-diagonals)

**Copycat Implementation:**
Players can unlock "copycat" modes that leverage these symmetries:
- **Reduced complexity:** Only a portion of the grid becomes placeable (e.g., left half for `ort1`)
- **Visual overlay:** Non-placeable areas receive a subtle grayish overlay
- **Automatic mirroring:** Placements in the active area automatically generate symmetric placements
- **Progressive unlocks:** Copycats unlock as players demonstrate mastery of basic gameplay

This system both reduces cognitive load for players and educates them about the deep mathematical structure underlying the problem.

### Interactive Diagnostic Mode

**Understanding Constraints Through Exploration:**
When players interact with non-placeable squares, the game enters diagnostic mode to explain the underlying constraints:

**For Grayed-Out Squares:**
- **Trigger:** Click/tap on any disabled (grayed) square
- **Visual explanation:** Board highlights the reason for the constraint
- **Possible implementation:** Red circles or highlighting around the conflicting neighbor pairs whose sight-lines would be blocked

**For Occupied Squares:**
- **First tap:** Display all squares that this neighbor's placement has made unavailable
- **Possible implementation:** Subtle animation or visual enhancement (e.g., "popping out") of affected gray squares
- **Second tap:** Remove the neighbor from the board

*Note: Visual design details (colors, animations, highlighting methods) remain flexible for UI/UX optimization during development.*

### Undo/Redo System

**Tree Navigation Support:**
- **Rewind functionality:** Players can step backward through their placement history
- **Redo capability:** Forward navigation through previously explored paths
- **Tree exploration:** Enables players to explore different solution branches without penalty

### Level Selection and Progression System

**Massive Scale Management:**
The game accommodates an extraordinary number of unique levels:
- **Small grids (n≤18):** 37,582 total unique solutions
- **Larger grids (n>18):** Additional 27,554+ symmetric solutions
- **Efficient storage:** Solutions stored in compressed format
- **On-demand loading:** Levels loaded as needed rather than all at once

**Level Organization:**
- **Grid size selector:** Players choose their preferred n×n grid size
- **Progress tracking:** Visual indication of completed vs. available levels per grid size
- **Difficulty scaling:** Clear progression from solved mathematical cases to unexplored territory
- **Accessibility:** No artificial barriers - players can attempt any unlocked level

### Copycat Progression and Symmetry Tracking

**Gradual Feature Unlocking:**
- **Earned complexity reduction:** Copycat modes unlock as players demonstrate mastery
- **Symmetry class awareness:** Completion tracking subdivided by Flammenkamp classifications

**Example: n=6 Grid Breakdown:**
- **Total levels:** 11 unique solutions
- **`iden` (no symmetry):** 4 levels
- **`rot2` (half rotation):** 2 levels  
- **`dia2` (both diagonals):** 2 levels
- **`rot4` (quarter rotation):** 3 levels

### Success Flow and Level Completion

**Victory Experience:**
- **Success display:** Clear indication of level completion
- **Seamless continuation:** Easy transition to next level or level selection
- **No artificial barriers:** Once symmetry classes are unlocked, players have full access to appropriate levels
- **Achievement recognition:** Progress tracking encourages continued engagement

**Flexible Progression:**
Players can freely navigate between completed levels, attempt new challenges, or explore different symmetry classes based on their interests and skill development.

## Page Design and Layout

### Main Game Interface

**Header Section:**
- **Title:** "Nebby Neighbor"
- **Subtitle:** "(In Pittsburgh, 'nebby' means 'nosy')"
- **Main Instructions:** "Place all neighbors so that no one is hidden from someone's view"

**Game Status Bar:**
- **Neighbors Counter:** Icon showing remaining neighbors to be placed
- **Puzzle Identifier:** Unique number/identifier for current puzzle (right-aligned)
- **Copycat Indicator:** Visual indicator when symmetry mode is active

**Gameboard Area:**
- **Minimal Visual Clutter:** Clean, focused design prioritizing gameplay
- **Neighbor Representation:** Currently small circles, *area for exploration* - may evolve to blob-like shapes or other visual treatments
- **Grid Design:** Clear intersection points with intuitive interaction zones

**Control Section:**
- **Rewind Button:** Step backward through placement history
- **Redo Button:** Step forward through explored paths  
- **Back to Levels:** Return to level selection interface

### Level Selection Interface

**Current Design Status:**
- **Placeholder Concept:** Scrollable list format
- **Visual Design:** *TODO - requires detailed UI exploration*
- **Functionality:** Must accommodate 65k+ total levels with efficient navigation

*Note: Level picker interface design is identified as a key area requiring focused design exploration and user testing.*

## Technical Architecture

### Platform and Technology Stack

**Core Technologies:**
- **TypeScript:** Primary development language for type safety and maintainability
- **Vite:** Build tool and development server for fast iteration
- **Native Web App:** Mobile-first progressive web application
- **Client-Side Architecture:** Entire application runs in the browser (no server dependency)

### Mobile-First Design Considerations

**Responsive Interface:**
- **Large Tap Targets:** Touch-friendly interaction zones for grid placement
- **Scrollable Gameboard:** Implementation may require viewport scrolling for larger grids
- **Touch Optimization:** Gesture-based interactions for placement, removal, and navigation

### Development and Deployment

**Local Development:**
- **Project Location:** `/Users/will/Documents/Projects/nebbyneighbor`
- **Git Integration:** Connected to personal GitHub account via `gh` CLI
- **Build Process:** Vite handles bundling and optimization

**Deployment Strategy:**
- **Target:** Integration with personal website
- **Distribution:** Build output (`dist/`) requires configuration for website deployment
- **Post-Receive Hooks:** *TODO - requires planning for automated deployment pipeline*

### Solution Data Processing

**Computational Strategy:**
Since players are relatively slow compared to computational requirements, we optimize for code clarity over micro-optimizations.

**Solution Management:**
- **Source Data:** Extremely compressed representation of known solutions
- **Preprocessing:** One-time conversion function transforms compressed data into "minimal disambiguating sets"
- **Symmetry Handling:** Preprocessing accounts for various symmetry classes to generate appropriate starter configurations
- **Security Through Obscurity:** Full solutions hidden from client to preserve puzzle integrity

**Runtime Validation:**
- **Dynamic Calculation:** Client validates moves through computation rather than solution lookup
- **Constraint Checking:** Real-time three-in-line detection for immediate feedback
- **Solution Detection:** Client recognizes completion state without knowing target configuration

**Development Phases:**
1. **Phase 1:** Basic gameplay with grids having known complete solution sets (n≤18)
2. **Phase 2:** Add copycat mechanics (symmetry-based assistance) for all n (starting around n=5)
3. **Phase 3:** Support for unsolved mathematical cases (n≥53) and larger symmetric solutions

## Design (Ongoing)

### Choices So Far

**Issue #2 - Visual Theme Selection:** Adopted "Soft Organic" theme with warm earth tones (#faf7f2 background, #d4c4a8 grid lines, #8B7355 neighbors) over minimal and bold contrast alternatives for approachable, non-intimidating aesthetic.

**Issue #4 - Pre-placed Neighbor Styling:** Selected "filled-outline" style for pre-placed neighbors, using semi-transparent fill with darker outline to clearly distinguish them from player-placed neighbors while maintaining visual cohesion.

**Issue #6 - Constraint Visualization:** Chose "Grid Fade (Organic)" approach for forbidden squares, using faded background with dashed inner grid pattern at 50% opacity to provide clear constraint feedback without overwhelming the interface.

**Issue #7 - Diagnostic Inspection Mode:** Selected "Soft Organic" line visualization approach with natural earth tones (#8B7355 solid, #A67C5A dashed), 2px line weight, [6,4] dash pattern, and 90% opacity. This provides immediate educational feedback on constraint relationships while maintaining perfect harmony with the game's warm, approachable aesthetic. The system features automatic inspection on neighbor placement, manual inspection via clicking existing neighbors, forbidden square analysis, and click-elsewhere exit behavior.

### Design Testing

**Compatibility Requirements - Critical Dependencies:**
The issue-specific development system requires preserving URL parameter detection, dev overlay initialization patterns, and custom event contracts (`dev-theme-change`, `dev-reset-puzzle`) in main.ts. GridController and GridRenderer APIs (`getRenderer()`, `loadPuzzle()`, `updateForbiddenSquareStyle()`) must remain public for dev mode functionality.

**System Extensibility:**
The current dev system supports static styling, real-time theme switching, puzzle configuration, and debug information. It's easily extensible for animations & interactions (click animations, transitions), behavioral changes (auto-solve hints, undo limits), and UI layout experiments (control positioning, grid layouts). Main constraint is canvas-based rendering compatibility and event-driven architecture.

**Development Workflow:**
Each issue preserves design choices as testable configurations in `docs/development/issue-N/config.js` rather than separate implementations. The branching tree approach allows walking back through design decisions while maintaining a single evolving production codebase. Access via `http://localhost:3000/src/dev/index-N.html` or `http://localhost:3000?issue=N`.