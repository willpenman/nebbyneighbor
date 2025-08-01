import { GridState, GridPosition, positionToKey, createGridState } from '../types/grid.js';
import { GridRenderer } from '../ui/GridRenderer.js';
import { StatusBar } from '../ui/StatusBar.js';
import { PuzzleConfig, PuzzleState } from '../types/puzzle.js';
import { LineDetector, InspectionData, ForbiddenSquareInfo } from './LineDetector.js';

export class GridController {
  private gridState: GridState;
  private renderer: GridRenderer;
  private statusBar: StatusBar;
  private canvas: HTMLCanvasElement;
  private puzzleState: PuzzleState | null = null;
  private lineDetector: LineDetector;
  
  constructor(canvas: HTMLCanvasElement, size: number = 4) {
    this.gridState = createGridState(size);
    this.canvas = canvas;
    this.renderer = new GridRenderer(canvas, this.gridState);
    this.statusBar = new StatusBar();
    this.lineDetector = new LineDetector(size);
    
    this.setupEventListeners();
    this.render();
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
    
    if (isPrePlaced) {
      if (isCurrentlyInspecting) {
        // Second click on inspected pre-placed neighbor turns off inspect mode
        this.clearInspectMode();
      } else {
        // First click on pre-placed neighbor enters inspection mode (but can't remove)
        this.enterNeighborInspectMode(position);
      }
    } else if (hasNeighbor) {
      if (isCurrentlyInspecting) {
        // Second click on inspected neighbor removes it
        this.removeNeighbor(position);
      } else {
        // First click on neighbor enters inspection mode
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
    const key = positionToKey(position);
    this.gridState.neighbors.add(key);
    this.updateForbiddenSquares();
    this.updateStatusBar();
    
    // Automatically enter inspection mode for newly placed neighbor
    this.enterNeighborInspectMode(position);
  }
  
  private removeNeighbor(position: GridPosition) {
    const key = positionToKey(position);
    this.gridState.neighbors.delete(key);
    this.updateForbiddenSquares();
    this.updateStatusBar();
    this.clearInspectMode();
    this.render();
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
      forbiddenSquares: new Set(this.gridState.forbiddenSquares)
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
    // Don't clear pre-placed neighbors
    this.updateForbiddenSquares();
    this.clearInspectMode();
  }
  
  loadPuzzle(puzzleConfig: PuzzleConfig) {
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
}