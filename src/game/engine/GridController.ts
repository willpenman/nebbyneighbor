import { GridState, GridPosition, positionToKey, createGridState, getMostRecentNeighbor } from '../types/grid.js';
import { GridRenderer } from '../ui/GridRenderer.js';
import { StatusBar } from '../ui/StatusBar.js';
import { Modal } from '../ui/Modal.js';
import { PuzzleConfig, PuzzleState } from '../types/puzzle.js';
import { LineDetector, InspectionData, ForbiddenSquareInfo } from './LineDetector.js';

export class GridController {
  private gridState: GridState;
  private renderer: GridRenderer;
  private statusBar: StatusBar;
  private modal: Modal;
  private canvas: HTMLCanvasElement;
  private puzzleState: PuzzleState | null = null;
  private lineDetector: LineDetector;
  private onNextLevel?: () => void;
  private getCurrentLevelIndex?: () => number;
  private hasNextLevel?: () => boolean;
  
  constructor(canvas: HTMLCanvasElement, size: number = 4, callbacks?: { onNextLevel?: () => void, getCurrentLevelIndex?: () => number, hasNextLevel?: () => boolean }) {
    this.gridState = createGridState(size);
    this.canvas = canvas;
    this.renderer = new GridRenderer(canvas, this.gridState);
    this.statusBar = new StatusBar();
    
    // Store navigation callbacks
    this.onNextLevel = callbacks?.onNextLevel;
    this.getCurrentLevelIndex = callbacks?.getCurrentLevelIndex;
    this.hasNextLevel = callbacks?.hasNextLevel;
    
    // Set up callback to sync status bar width with grid width
    this.renderer.setGridWidthCallback((width: number) => {
      this.statusBar.setWidth(width);
    });
    this.modal = new Modal();
    this.lineDetector = new LineDetector(size);
    
    this.setupEventListeners();
    
    // Defer initial setup to ensure DOM layout is stable
    requestAnimationFrame(() => {
      this.renderer.calculateDimensions();
      this.render();
    });
  }
  
  private setupEventListeners() {
    this.canvas.addEventListener('click', (e) => {
      this.handleCellClick(e.clientX, e.clientY);
    });
    
    // Listen for clicks anywhere on the document to exit inspect mode
    document.addEventListener('click', (e) => {
      // Only clear inspect mode if click is outside the canvas
      if (!this.canvas.contains(e.target as Node)) {
        this.clearInspectMode();
      }
    });
    
    window.addEventListener('resize', () => {
      this.renderer.resize();
    });
  }
  
  private handleCellClick(clientX: number, clientY: number) {
    const position = this.renderer.screenToGridPosition(clientX, clientY);
    
    // Handle clicks outside the grid (exit inspection mode)
    if (!position) {
      this.clearInspectMode();
      return;
    }
    
    const key = positionToKey(position);
    const isPrePlaced = this.gridState.prePlacedNeighbors.has(key);
    const hasNeighbor = this.gridState.neighbors.has(key);
    const isForbidden = this.gridState.forbiddenSquares.has(key);
    const isCurrentlyInspecting = this.gridState.inspectionMode && 
      positionToKey(this.gridState.inspectionMode.position) === key;
    
    // Check if this is the most recently placed neighbor
    const mostRecentNeighbor = getMostRecentNeighbor(this.gridState);
    const isMostRecent = mostRecentNeighbor && 
      position.row === mostRecentNeighbor.row && 
      position.col === mostRecentNeighbor.col;
    
    // Handle overconstrained state - show modal for non-removable clicks
    if (this.gridState.constraintWarning && !hasNeighbor) {
      this.showOverconstrainedModal();
      return;
    }
    
    if (isPrePlaced) {
      if (isCurrentlyInspecting) {
        // Second click on inspected pre-placed neighbor turns off inspect mode
        this.clearInspectMode();
      } else {
        // First click on pre-placed neighbor enters inspection mode (but can't remove)
        this.enterNeighborInspectMode(position);
      }
    } else if (hasNeighbor) {
      const isOverconstrainedModal = this.modal.isShowing() && 
        this.modal.getConfig()?.title === 'Uh-oh';
      
      if (isMostRecent && (!this.modal.isShowing() || isOverconstrainedModal)) {
        // First click on most recent neighbor removes it directly (allow removal during overconstrained modal)
        this.removeNeighbor(position);
      } else if (isCurrentlyInspecting && (!this.modal.isShowing() || isOverconstrainedModal)) {
        // Second click on inspected neighbor removes it (allow removal during overconstrained modal)
        this.removeNeighbor(position);
      } else if (isCurrentlyInspecting && this.modal.isShowing()) {
        // When non-overconstrained modal is showing, allow clearing inspection mode but not removal
        this.clearInspectMode();
      } else {
        // First click on neighbor enters inspection mode (always allowed)
        this.enterNeighborInspectMode(position);
      }
    } else if (isForbidden) {
      if (isCurrentlyInspecting) {
        // Second click on inspected forbidden square turns off inspect mode
        this.clearInspectMode();
      } else {
        // First click on forbidden square shows why it's forbidden
        this.enterForbiddenSquareInspectMode(position);
      }
    } else {
      // Click on empty square places neighbor and enters inspection mode
      this.placeNeighbor(position);
    }
  }
  
  private placeNeighbor(position: GridPosition) {
    // Check if there's already a constraint warning - prevent new placements
    if (this.gridState.constraintWarning) {
      // Show the modal again to remind player they need to resolve constraints first
      this.render(); // This will trigger the modal to show again
      return;
    }
    
    const key = positionToKey(position);
    this.gridState.neighbors.add(key);
    this.gridState.moveHistory.push(position);
    this.updateForbiddenSquares();
    this.updateStatusBar();
    
    // Check for win condition
    this.checkWinCondition();
    
    // Automatically enter inspection mode for newly placed neighbor (unless game is complete)
    if (!this.gridState.isComplete) {
      this.enterNeighborInspectMode(position);
    }
  }
  
  private removeNeighbor(position: GridPosition) {
    const key = positionToKey(position);
    this.gridState.neighbors.delete(key);
    
    // Remove this position from move history
    this.gridState.moveHistory = this.gridState.moveHistory.filter(
      move => !(move.row === position.row && move.col === position.col)
    );
    
    this.updateForbiddenSquares();
    this.updateStatusBar();
    
    // Check for win condition (in case it was previously complete)
    this.checkWinCondition();
    
    this.clearInspectMode();
    
    // Hide overconstrained modal if it was showing (since removing a neighbor might resolve constraints)
    if (this.modal.isShowing()) {
      this.modal.hide();
    }
    
    this.render();
    
  }
  
  private showOverconstrainedModal() {
    if (!this.gridState.constraintWarning) return;
    
    const { overConstrainedRows, overConstrainedColumns } = this.gridState.constraintWarning;
    const message = this.generateOverconstrainedMessage(overConstrainedRows, overConstrainedColumns);
    
    this.modal.show({
      title: 'Uh-oh',
      message,
      onDismiss: () => this.modal.hide(),
      maxWidth: this.renderer.getGridWidth()
    });
  }
  
  private generateOverconstrainedMessage(overConstrainedRows: number[], overConstrainedColumns: number[]): string {
    // Find the first overconstrained row or column (visually most prominent)
    let primaryConstraint = '';
    let hasMultiple = false;
    let verb = '';
    
    if (overConstrainedRows.length > 0) {
      const rowNum = overConstrainedRows[0] + 1; // Convert to 1-indexed
      primaryConstraint = `Row ${rowNum}`;
      hasMultiple = overConstrainedRows.length > 1 || overConstrainedColumns.length > 0;
    } else if (overConstrainedColumns.length > 0) {
      const colNum = overConstrainedColumns[0] + 1; // Convert to 1-indexed  
      primaryConstraint = `Column ${colNum}`;
      hasMultiple = overConstrainedColumns.length > 1;
    }
    
    if (hasMultiple) {
      verb = "don't";
      primaryConstraint = `**${primaryConstraint} (and others)**`;
    } else {
      verb = "doesn't";
      primaryConstraint = `**${primaryConstraint}**`;
    }
    
    return `${primaryConstraint} ${verb} have enough squares available to place 2 neighbors. To make progress, remove a neighbor and backtrack.`;
  }

  private checkWinCondition() {
    if (!this.puzzleState) return;
    
    // Calculate total neighbors placed (pre-placed + player-placed)
    const totalNeighbors = this.gridState.prePlacedNeighbors.size + this.gridState.neighbors.size;
    const requiredNeighbors = this.gridState.size * 2; // 2n for n×n grid
    
    // Check if we have exactly the right number of neighbors
    if (totalNeighbors === requiredNeighbors) {
      // Verify no three-in-line violations exist
      const allNeighbors = new Set([
        ...this.gridState.neighbors,
        ...this.gridState.prePlacedNeighbors
      ]);
      
      // Check for violations: are any forbidden squares also neighbor squares?
      const forbiddenSquares = this.lineDetector.calculateForbiddenSquares(allNeighbors);
      const hasViolations = Array.from(allNeighbors).some(neighbor => forbiddenSquares.has(neighbor));
      
      if (!hasViolations) {
        this.gridState.isComplete = true;
        this.clearInspectMode(); // Clear inspection mode when winning
        this.saveCompletionState();
        this.showSuccessModal();
        this.render();
      }
    } else {
      // Not complete if we don't have the right number
      this.gridState.isComplete = false;
    }
  }

  private showSuccessModal() {
    if (!this.puzzleState) return;
    
    const totalNeighbors = this.gridState.size * 2;
    const currentLevel = this.getCurrentLevelIndex ? this.getCurrentLevelIndex() + 1 : 1;
    const hasNext = this.hasNextLevel ? this.hasNextLevel() : false;
    
    this.modal.show({
      title: `Level ${currentLevel} - Success!`,
      message: `You placed all ${totalNeighbors}/${totalNeighbors} neighbors. Everyone can see everyone else. Click a neighbor to see their view.`,
      primaryButton: hasNext ? {
        text: 'Next level',
        style: 'primary',
        onClick: () => {
          this.modal.hide();
          if (this.onNextLevel) {
            this.onNextLevel();
          }
        }
      } : {
        text: 'Play this level again',
        style: 'primary',
        onClick: () => {
          this.modal.hide();
          this.clearGrid();
          this.render();
        }
      },
      secondaryButton: hasNext ? {
        text: 'Play this level again',
        style: 'secondary',
        onClick: () => {
          this.modal.hide();
          this.clearGrid();
          this.render();
        }
      } : undefined,
      allowInspectMode: true,
      preventNeighborRemoval: true,
      maxWidth: this.renderer.getGridWidth()
    });
  }

  private enterNeighborInspectMode(position: GridPosition) {
    this.gridState.inspectionMode = {
      type: 'neighbor',
      position
    };
    this.render();
  }
  
  private enterForbiddenSquareInspectMode(position: GridPosition) {
    this.gridState.inspectionMode = {
      type: 'forbidden-square',
      position
    };
    this.render();
  }
  
  private clearInspectMode() {
    this.gridState.inspectionMode = undefined;
    this.render();
  }

  private updateForbiddenSquares() {
    // Combine pre-placed and player-placed neighbors for constraint calculation
    const allNeighbors = new Set([
      ...this.gridState.neighbors,
      ...this.gridState.prePlacedNeighbors
    ]);
    
    this.gridState.forbiddenSquares = this.lineDetector.calculateForbiddenSquares(allNeighbors);
    
    // Calculate forced moves
    const forcedMoves = this.lineDetector.detectForcedMoves(allNeighbors, this.gridState.forbiddenSquares);
    this.gridState.forcedMoves = new Set(forcedMoves.map(positionToKey));
    
    // Analyze row/column constraints for unsolvable states
    const constraintAnalysis = this.lineDetector.analyzeRowColumnConstraints(
      allNeighbors,
      this.gridState.forbiddenSquares
    );
    
    // Update constraint warning state
    if (constraintAnalysis.hasUnsolvableState) {
      this.gridState.constraintWarning = {
        overConstrainedRows: constraintAnalysis.overConstrainedRows,
        overConstrainedColumns: constraintAnalysis.overConstrainedColumns
      };
    } else {
      this.gridState.constraintWarning = undefined;
    }
  }
  
  private updateStatusBar() {
    if (!this.puzzleState) return;
    
    const playerPlacedCount = this.gridState.neighbors.size;
    const remainingNeighbors = this.statusBar.calculateRemainingNeighbors(
      this.puzzleState.config,
      playerPlacedCount
    );
    
    this.statusBar.updateCounter(remainingNeighbors, this.puzzleState.config.size * 2);
  }
  
  private render() {
    this.renderer.updateGridState(this.gridState);
    this.renderer.updateInspectionData(this.getInspectionData());
  }
  
  getGridState(): GridState {
    return { 
      ...this.gridState, 
      neighbors: new Set(this.gridState.neighbors),
      prePlacedNeighbors: new Set(this.gridState.prePlacedNeighbors),
      forbiddenSquares: new Set(this.gridState.forbiddenSquares),
      forcedMoves: new Set(this.gridState.forcedMoves),
      moveHistory: [...this.gridState.moveHistory]
    };
  }
  
  setGridState(newState: GridState) {
    this.gridState = newState;
    this.updateForbiddenSquares();
    this.clearInspectMode();
    this.render();
  }
  
  clearGrid() {
    this.gridState.neighbors.clear();
    this.gridState.moveHistory = [];
    // Don't clear pre-placed neighbors
    this.updateForbiddenSquares();
    this.clearInspectMode();
  }
  
  loadPuzzle(puzzleConfig: PuzzleConfig) {
    // Clear any existing modal when loading new puzzle
    this.modal.hide();
    
    // Create new grid state with puzzle data
    this.gridState = createGridState(puzzleConfig.size);
    this.lineDetector = new LineDetector(puzzleConfig.size);
    
    // Set pre-placed neighbors
    for (const position of puzzleConfig.prePlacedNeighbors) {
      const key = positionToKey(position);
      this.gridState.prePlacedNeighbors.add(key);
    }
    
    // Initialize puzzle state
    this.puzzleState = {
      config: puzzleConfig,
      playerPlacedNeighbors: new Set(),
      isComplete: false
    };
    
    // Update status bar with new puzzle
    this.statusBar.updateLevel(puzzleConfig);
    
    this.updateForbiddenSquares();
    this.updateStatusBar();
    
    // Check if this puzzle was completed in this session and restore state
    const completedPuzzles = this.getCompletedPuzzles();
    const savedState = completedPuzzles[puzzleConfig.id];
    if (savedState?.completed) {
      // Restore player's neighbor placements
      this.gridState.neighbors = new Set(savedState.playerNeighbors);
      this.updateForbiddenSquares();
      this.updateStatusBar();
      this.checkWinCondition(); // This will trigger the success modal if complete
    }
    
    this.clearInspectMode();
  }
  
  getInspectionData(): InspectionData | ForbiddenSquareInfo | null {
    if (!this.gridState.inspectionMode) return null;
    
    const allNeighbors = new Set([
      ...this.gridState.neighbors,
      ...this.gridState.prePlacedNeighbors
    ]);
    
    if (this.gridState.inspectionMode.type === 'neighbor') {
      return this.lineDetector.getInspectionData(
        this.gridState.inspectionMode.position,
        allNeighbors
      );
    } else {
      return this.lineDetector.getForbiddenSquareInfo(
        this.gridState.inspectionMode.position,
        allNeighbors
      );
    }
  }
  
  getPuzzleState(): PuzzleState | null {
    return this.puzzleState;
  }
  
  setTheme() {
    // Theme is now fixed - this method kept for backwards compatibility
    this.renderer.setTheme();
  }
  
  getRenderer(): GridRenderer {
    return this.renderer;
  }
  
  getStatusBar(): StatusBar {
    return this.statusBar;
  }
  
  getModal(): Modal {
    return this.modal;
  }
  
  private saveCompletionState() {
    if (!this.puzzleState) return;
    
    try {
      const completedPuzzles = this.getCompletedPuzzles();
      const saveData = {
        playerNeighbors: [...this.gridState.neighbors],
        completed: true
      };
      completedPuzzles[this.puzzleState.config.id] = saveData;
      sessionStorage.setItem('nebby-completed-puzzles', JSON.stringify(completedPuzzles));
    } catch (error) {
      // Silently fail if sessionStorage is not available
      console.warn('Could not save completion state:', error);
    }
  }
  
  private getCompletedPuzzles(): Record<string, any> {
    try {
      const stored = sessionStorage.getItem('nebby-completed-puzzles');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Handle old format (array) vs new format (object)
        if (Array.isArray(parsed)) {
          // Clear old format and start fresh
          sessionStorage.removeItem('nebby-completed-puzzles');
          return {};
        }
        return parsed;
      }
    } catch (error) {
      // Silently fail if sessionStorage is not available
      console.warn('Could not load completion state:', error);
    }
    return {};
  }
  
}