import { GridState, GridPosition, positionToKey, createGridState } from '../types/grid.js';
import { GridRenderer } from '../ui/GridRenderer.js';
import { PuzzleConfig, PuzzleState } from '../types/puzzle.js';
import { LineDetector } from './LineDetector.js';

export class GridController {
  private gridState: GridState;
  private renderer: GridRenderer;
  private canvas: HTMLCanvasElement;
  private inspectingPosition: GridPosition | null = null;
  private puzzleState: PuzzleState | null = null;
  private lineDetector: LineDetector;
  
  constructor(canvas: HTMLCanvasElement, size: number = 4) {
    this.gridState = createGridState(size);
    this.canvas = canvas;
    this.renderer = new GridRenderer(canvas, this.gridState);
    this.lineDetector = new LineDetector(size);
    
    this.setupEventListeners();
    this.render();
  }
  
  private setupEventListeners() {
    this.canvas.addEventListener('click', (e) => {
      this.handleCellClick(e.clientX, e.clientY);
    });
    
    window.addEventListener('resize', () => {
      this.renderer.resize();
    });
  }
  
  private handleCellClick(clientX: number, clientY: number) {
    const position = this.renderer.screenToGridPosition(clientX, clientY);
    if (!position) return;
    
    const key = positionToKey(position);
    const isPrePlaced = this.gridState.prePlacedNeighbors.has(key);
    
    // Don't allow interaction with pre-placed neighbors
    if (isPrePlaced) return;
    
    const hasNeighbor = this.gridState.neighbors.has(key);
    const isInspecting = this.inspectingPosition && 
      positionToKey(this.inspectingPosition) === key;
    
    if (hasNeighbor) {
      if (isInspecting) {
        this.removeNeighbor(position);
      } else {
        this.enterInspectMode(position);
      }
    } else {
      this.placeNeighbor(position);
    }
  }
  
  private placeNeighbor(position: GridPosition) {
    const key = positionToKey(position);
    this.gridState.neighbors.add(key);
    this.updateForbiddenSquares();
    this.clearInspectMode();
    this.render();
  }
  
  private removeNeighbor(position: GridPosition) {
    const key = positionToKey(position);
    this.gridState.neighbors.delete(key);
    this.updateForbiddenSquares();
    this.clearInspectMode();
    this.render();
  }
  
  private enterInspectMode(position: GridPosition) {
    this.inspectingPosition = position;
    this.render();
  }
  
  private clearInspectMode() {
    this.inspectingPosition = null;
  }

  private updateForbiddenSquares() {
    // Combine pre-placed and player-placed neighbors for constraint calculation
    const allNeighbors = new Set([
      ...this.gridState.neighbors,
      ...this.gridState.prePlacedNeighbors
    ]);
    
    this.gridState.forbiddenSquares = this.lineDetector.calculateForbiddenSquares(allNeighbors);
  }
  
  private render() {
    this.renderer.updateGridState(this.gridState);
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
    this.render();
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
    
    this.updateForbiddenSquares();
    this.clearInspectMode();
    this.render();
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
}