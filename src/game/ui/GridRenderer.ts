import { GridState, GridPosition, getMostRecentNeighbor, positionToKey } from '../types/grid.js';
import { GridTheme, gridTheme } from './GridThemes.js';
import { InspectionData, ForbiddenSquareInfo, ConstraintRelationship } from '../engine/LineDetector.js';

export class GridRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gridState: GridState;
  private cellSize: number = 0;
  private gridOffset: { x: number; y: number } = { x: 0, y: 0 };
  private panOffset: { x: number; y: number } = { x: 0, y: 0 };
  private theme: GridTheme = gridTheme;
  private inspectionData: InspectionData | ForbiddenSquareInfo | null = null;
  private isPanning: boolean = false;
  private lastPanPoint: { x: number; y: number } | null = null;
  private panStartPoint: { x: number; y: number } | null = null;
  private panDistance: number = 0;
  private static readonly PAN_THRESHOLD = 10; // pixels
  private gridWidth: number = 0;
  private onGridWidthChange?: (width: number) => void;
  private lineStyles = {
    solidLineColor: '#8B7355',    // Soft organic default
    dashedLineColor: '#A67C5A',   // Companion shade
    lineWidth: 2,
    dashPattern: [6, 4],
    opacity: 0.9
  };
  private static readonly MIN_CELL_SIZE = 44; // WCAG 2.1 AA minimum 44×44px touch targets
  private isScrollable: boolean = false;
  private warningStyle: string = 'headers'; // Default warning style
  private recentNeighborHighlight: {
    type: string;
    backgroundColor?: string;
    backgroundOpacity?: number;
    borderColor?: string | null;
    borderWidth?: number;
    borderOpacity?: number;
    glowColor?: string;
    glowRadius?: number;
    glowOpacity?: number;
    innerGlowColor?: string;
    innerGlowRadius?: number;
  } = {
    type: 'square',
    backgroundColor: '#A8D4A8',
    backgroundOpacity: 0.7,
    borderColor: null,
    borderWidth: 0,
    borderOpacity: 0
  };
  
  constructor(canvas: HTMLCanvasElement, gridState: GridState) {
    this.canvas = canvas;
    this.gridState = gridState;
    this.theme = gridTheme;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2D context from canvas');
    }
    this.ctx = ctx;
    
    this.setupCanvas();
    this.setupPanningEvents();
    // Don't call calculateDimensions here - let GridController call it when ready
  }
  
  private setupCanvas() {
    const dpr = window.devicePixelRatio || 1;
    
    // Force layout recalculation
    this.canvas.offsetWidth;
    
    const rect = this.canvas.getBoundingClientRect();
    
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    
    this.ctx.scale(dpr, dpr);
    // Don't set explicit pixel dimensions - let CSS handle responsive sizing
  }
  
  calculateDimensions() {
    // Recalculate canvas dimensions first
    this.setupCanvas();
    
    const rect = this.canvas.getBoundingClientRect();
    
    // Guard against invalid dimensions during DOM layout
    if (rect.width <= 0 || rect.height <= 0) {
      console.log('Canvas dimensions not ready, deferring calculation');
      requestAnimationFrame(() => {
        this.calculateDimensions();
      });
      return;
    }
    
    // Use reasonable padding - minimal on mobile, larger on desktop
    // No top padding since status bar is now directly adjacent
    const sidePadding = rect.width < 500 ? 2 : 40;
    const topPadding = 0; // Status bar touches grid directly
    const bottomPadding = rect.width < 500 ? 2 : 40;
    
    const availableWidth = rect.width - (sidePadding * 2);
    const availableHeight = rect.height - topPadding - bottomPadding;
    // Use minimum dimension to ensure grid fits completely in viewport
    const availableSpace = Math.min(availableWidth, availableHeight);
    
    // Guard against negative available space
    if (availableSpace <= 0) {
      console.log('No available space for grid, deferring calculation');
      requestAnimationFrame(() => {
        this.calculateDimensions();
      });
      return;
    }
    
    // Calculate ideal cell size
    const idealCellSize = availableSpace / this.gridState.size;
    
    console.log(`Canvas: ${rect.width}×${rect.height}, Available: ${availableSpace}px, Ideal cell: ${idealCellSize}px`);
    
    // For small grids, use the full available space to maximize cell size
    if (this.gridState.size <= 4) {
      this.cellSize = idealCellSize; // Use maximum possible size that fits
      this.isScrollable = false;
      console.log(`Grid ${this.gridState.size}×${this.gridState.size} fits normally: cellSize=${this.cellSize}px`);
    } else if (idealCellSize < GridRenderer.MIN_CELL_SIZE) {
      // Only use scrolling for larger grids that actually need it
      this.cellSize = GridRenderer.MIN_CELL_SIZE;
      this.isScrollable = true;
      console.log(`Grid ${this.gridState.size}×${this.gridState.size} requires scrolling: cellSize=${this.cellSize}px`);
    } else {
      this.cellSize = idealCellSize;
      this.isScrollable = false;
      console.log(`Grid ${this.gridState.size}×${this.gridState.size} fits normally: cellSize=${this.cellSize}px`);
    }
    
    // Center the grid, but ensure it fits within viewport for scrollable grids
    const totalGridWidth = this.cellSize * this.gridState.size;
    
    if (this.isScrollable) {
      // For scrollable grids, position at top with minimal padding, center horizontally
      this.gridOffset.x = Math.max(2, (rect.width - totalGridWidth) / 2);
      this.gridOffset.y = 20; // Always position at top for scrollable grids
    } else {
      // For non-scrollable grids, center horizontally but position at top since status bar is adjacent
      this.gridOffset.x = (rect.width - totalGridWidth) / 2;
      this.gridOffset.y = topPadding; // Position at top to touch status bar
    }
    
    // Set appropriate cursor
    this.canvas.style.cursor = this.isScrollable ? 'grab' : 'pointer';
    
    // Store grid width for external access (actual grid size, not canvas width)
    this.gridWidth = this.cellSize * this.gridState.size;
    
    // Notify callback if grid width changed
    if (this.onGridWidthChange) {
      this.onGridWidthChange(this.gridWidth);
    }
    
    // Trigger a render now that dimensions are properly calculated
    this.render();
  }
  
  private setupPanningEvents() {
    // Mouse events for desktop
    this.canvas.addEventListener('mousedown', this.handlePanStart.bind(this));
    this.canvas.addEventListener('mousemove', this.handlePanMove.bind(this));
    this.canvas.addEventListener('mouseup', this.handlePanEnd.bind(this));
    this.canvas.addEventListener('mouseleave', this.handlePanEnd.bind(this));
    
    // Touch events for mobile
    this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
    this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
    this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
  }
  
  private handlePanStart(event: MouseEvent) {
    if (!this.isScrollable) return;
    
    this.panStartPoint = { x: event.clientX, y: event.clientY };
    this.lastPanPoint = { x: event.clientX, y: event.clientY };
    this.panDistance = 0;
    this.isPanning = false; // Don't set to true until we exceed threshold
  }
  
  private handlePanMove(event: MouseEvent) {
    if (!this.isScrollable || !this.lastPanPoint || !this.panStartPoint) return;
    
    // Calculate total distance from start
    const totalDeltaX = event.clientX - this.panStartPoint.x;
    const totalDeltaY = event.clientY - this.panStartPoint.y;
    this.panDistance = Math.sqrt(totalDeltaX * totalDeltaX + totalDeltaY * totalDeltaY);
    
    // Only start panning if we exceed threshold
    if (this.panDistance > GridRenderer.PAN_THRESHOLD && !this.isPanning) {
      this.isPanning = true;
      this.canvas.style.cursor = 'grabbing';
    }
    
    if (this.isPanning) {
      const deltaX = event.clientX - this.lastPanPoint.x;
      const deltaY = event.clientY - this.lastPanPoint.y;
      
      this.updatePanOffset(deltaX, deltaY);
    }
    
    this.lastPanPoint = { x: event.clientX, y: event.clientY };
  }
  
  private handlePanEnd() {
    if (!this.isScrollable) return;
    
    const wasPanning = this.isPanning;
    this.isPanning = false;
    this.lastPanPoint = null;
    this.panStartPoint = null;
    this.panDistance = 0;
    this.canvas.style.cursor = this.isScrollable ? 'grab' : 'pointer';
    
    // Return whether this was a pan gesture (for click prevention)
    return wasPanning;
  }
  
  private handleTouchStart(event: TouchEvent) {
    if (!this.isScrollable) return;
    
    const touch = event.touches[0];
    this.panStartPoint = { x: touch.clientX, y: touch.clientY };
    this.lastPanPoint = { x: touch.clientX, y: touch.clientY };
    this.panDistance = 0;
    this.isPanning = false; // Don't set to true until we exceed threshold
  }
  
  private handleTouchMove(event: TouchEvent) {
    if (!this.isScrollable || !this.lastPanPoint || !this.panStartPoint) return;
    
    const touch = event.touches[0];
    
    // Calculate total distance from start
    const totalDeltaX = touch.clientX - this.panStartPoint.x;
    const totalDeltaY = touch.clientY - this.panStartPoint.y;
    this.panDistance = Math.sqrt(totalDeltaX * totalDeltaX + totalDeltaY * totalDeltaY);
    
    // Only start panning if we exceed threshold
    if (this.panDistance > GridRenderer.PAN_THRESHOLD && !this.isPanning) {
      this.isPanning = true;
      event.preventDefault(); // Only prevent default when actually panning
    }
    
    if (this.isPanning) {
      event.preventDefault();
      const deltaX = touch.clientX - this.lastPanPoint.x;
      const deltaY = touch.clientY - this.lastPanPoint.y;
      
      this.updatePanOffset(deltaX, deltaY);
    }
    
    this.lastPanPoint = { x: touch.clientX, y: touch.clientY };
  }
  
  private handleTouchEnd(event: TouchEvent) {
    if (!this.isScrollable) return;
    
    const wasPanning = this.isPanning;
    
    // Only prevent default if we were actually panning
    if (wasPanning) {
      event.preventDefault();
    }
    
    this.isPanning = false;
    this.lastPanPoint = null;
    this.panStartPoint = null;
    this.panDistance = 0;
    
    // Return whether this was a pan gesture (for click prevention)
    return wasPanning;
  }
  
  private updatePanOffset(deltaX: number, deltaY: number) {
    const rect = this.canvas.getBoundingClientRect();
    const totalGridWidth = this.cellSize * this.gridState.size;
    const totalGridHeight = this.cellSize * this.gridState.size;
    
    // Calculate bounds for panning - ensure full cells are visible with some padding
    const padding = 10;
    const maxPanX = Math.max(0, totalGridWidth - rect.width + padding * 2);
    const maxPanY = Math.max(0, totalGridHeight - rect.height + padding * 2);
    
    // Update pan offset with bounds checking
    this.panOffset.x = Math.max(-maxPanX, Math.min(0, this.panOffset.x + deltaX));
    this.panOffset.y = Math.max(-maxPanY, Math.min(0, this.panOffset.y + deltaY));
    
    this.render();
  }
  
  render() {
    this.clear();
    this.drawBackground();
    this.drawGrid();
    this.drawForbiddenSquares();
    this.drawForcedMoves();
    this.drawNeighbors();
    this.drawConstraintLines();
    this.drawConstraintWarnings();
  }
  
  private clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
  
  private drawBackground() {
    if (this.theme.backgroundColor) {
      this.ctx.fillStyle = this.theme.backgroundColor;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
  
  private drawGrid() {
    this.ctx.strokeStyle = this.theme.gridLineColor;
    this.ctx.lineWidth = this.theme.gridLineWidth;
    
    const gridSize = this.cellSize * this.gridState.size;
    const offsetX = this.gridOffset.x + this.panOffset.x;
    const offsetY = this.gridOffset.y + this.panOffset.y;
    
    for (let i = 0; i <= this.gridState.size; i++) {
      const pos = i * this.cellSize;
      
      this.ctx.beginPath();
      this.ctx.moveTo(offsetX + pos, offsetY);
      this.ctx.lineTo(offsetX + pos, offsetY + gridSize);
      this.ctx.stroke();
      
      this.ctx.beginPath();
      this.ctx.moveTo(offsetX, offsetY + pos);
      this.ctx.lineTo(offsetX + gridSize, offsetY + pos);
      this.ctx.stroke();
    }
  }

  private drawForbiddenSquares() {
    if (!this.gridState.forbiddenSquares || this.gridState.forbiddenSquares.size === 0) {
      return;
    }

    const style = this.theme.forbiddenSquareStyle;
    const color = this.theme.forbiddenSquareColor;
    const opacity = this.theme.forbiddenSquareOpacity;

    for (const squareKey of this.gridState.forbiddenSquares) {
      const [row, col] = squareKey.split(',').map(Number);
      const x = this.gridOffset.x + this.panOffset.x + (col * this.cellSize);
      const y = this.gridOffset.y + this.panOffset.y + (row * this.cellSize);

      this.ctx.save();
      this.ctx.globalAlpha = opacity;

      switch (style) {
        case 'forbidden-overlay':
          this.drawForbiddenOverlay(x, y, color);
          break;
        case 'grid-fade':
          this.drawGridFade(x, y, color);
          break;
        case 'cross-hatch':
          this.drawCrossHatch(x, y, color);
          break;
      }

      this.ctx.restore();
    }
  }

  private drawForbiddenOverlay(x: number, y: number, color: string) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
  }

  private drawGridFade(x: number, y: number, color: string) {
    // Draw faded square background
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2);
    
    // Draw faded grid lines within the square
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([2, 2]);
    
    // Draw inner grid pattern
    this.ctx.beginPath();
    this.ctx.moveTo(x + this.cellSize / 2, y);
    this.ctx.lineTo(x + this.cellSize / 2, y + this.cellSize);
    this.ctx.moveTo(x, y + this.cellSize / 2);
    this.ctx.lineTo(x + this.cellSize, y + this.cellSize / 2);
    this.ctx.stroke();
    
    this.ctx.setLineDash([]);
  }

  private drawCrossHatch(x: number, y: number, color: string) {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 1.5;
    
    const spacing = this.cellSize / 6;
    
    this.ctx.beginPath();
    // Diagonal lines from top-left to bottom-right
    for (let i = 0; i < this.cellSize; i += spacing) {
      this.ctx.moveTo(x + i, y);
      this.ctx.lineTo(x + i + this.cellSize, y + this.cellSize);
    }
    // Diagonal lines from top-right to bottom-left  
    for (let i = 0; i < this.cellSize; i += spacing) {
      this.ctx.moveTo(x + this.cellSize - i, y);
      this.ctx.lineTo(x - i, y + this.cellSize);
    }
    this.ctx.stroke();
  }

  private drawForcedMoves() {
    if (!this.gridState.forcedMoves || this.gridState.forcedMoves.size === 0) {
      return;
    }
    
    // Skip forced move highlights for 4x4 and 5x5 grids (distracting for beginners)
    if (this.gridState.size <= 5) {
      return;
    }

    this.ctx.save();
    
    // Use same light green as recent neighbor highlight for forced moves
    const forcedMoveColor = '#A8D4A8'; // Same as recent neighbor highlight
    
    for (const forcedMoveKey of this.gridState.forcedMoves) {
      const [row, col] = forcedMoveKey.split(',').map(Number);
      const x = this.gridOffset.x + this.panOffset.x + (col * this.cellSize);
      const y = this.gridOffset.y + this.panOffset.y + (row * this.cellSize);
      
      // Draw background highlight (same style as recent neighbor but less opaque)
      this.ctx.fillStyle = forcedMoveColor;
      this.ctx.globalAlpha = 0.3;
      this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
    }
    
    this.ctx.restore();
  }
  
  private drawNeighbors() {
    const mostRecentNeighbor = getMostRecentNeighbor(this.gridState);
    const mostRecentKey = mostRecentNeighbor ? positionToKey(mostRecentNeighbor) : null;
    
    // Draw player-placed neighbors
    this.ctx.fillStyle = this.theme.neighborColor;
    
    for (const neighborKey of this.gridState.neighbors) {
      const [row, col] = neighborKey.split(',').map(Number);
      const centerX = this.gridOffset.x + this.panOffset.x + (col * this.cellSize) + (this.cellSize / 2);
      const centerY = this.gridOffset.y + this.panOffset.y + (row * this.cellSize) + (this.cellSize / 2);
      const radius = Math.min(this.cellSize * this.theme.neighborRadius, 25);
      
      const isHighlighted = neighborKey === mostRecentKey;
      this.drawNeighborShape(centerX, centerY, radius, this.theme.neighborStyle, false, isHighlighted);
    }
    
    // Draw pre-placed neighbors with distinct styling
    for (const neighborKey of this.gridState.prePlacedNeighbors) {
      const [row, col] = neighborKey.split(',').map(Number);
      const centerX = this.gridOffset.x + this.panOffset.x + (col * this.cellSize) + (this.cellSize / 2);
      const centerY = this.gridOffset.y + this.panOffset.y + (row * this.cellSize) + (this.cellSize / 2);
      const radius = Math.min(this.cellSize * this.theme.neighborRadius, 25);
      
      this.drawNeighborShape(centerX, centerY, radius, this.theme.neighborStyle, true, false);
    }
  }
  
  private drawNeighborShape(centerX: number, centerY: number, radius: number, shape: 'circle' | 'rounded-square', isPrePlaced: boolean, isHighlighted: boolean = false) {
    // Guard against negative or zero radius values
    if (radius <= 0) {
      console.warn('Invalid radius for neighbor shape:', radius);
      return;
    }
    
    const color = isPrePlaced ? this.theme.prePlacedNeighborColor : this.theme.neighborColor;
    const styleType = isPrePlaced ? this.theme.prePlacedNeighborStyle : 'solid';
    
    // Draw highlighting effect if this neighbor is highlighted
    if (isHighlighted && this.recentNeighborHighlight) {
      this.drawHighlightEffect(centerX, centerY, radius, shape);
    }
    
    if (shape === 'circle') {
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      
      if (styleType === 'solid') {
        this.ctx.fillStyle = color;
        this.ctx.fill();
      } else if (styleType === 'outline') {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
      } else if (styleType === 'filled-outline') {
        // Fill with lighter version of color
        this.ctx.fillStyle = color + '40'; // Add transparency
        this.ctx.fill();
        // Add darker outline
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
      }
    } else if (shape === 'rounded-square') {
      const size = radius * 1.4;
      const cornerRadius = size * 0.2;
      this.drawRoundedRect(centerX - size/2, centerY - size/2, size, size, cornerRadius);
      
      if (styleType === 'solid') {
        this.ctx.fillStyle = color;
        this.ctx.fill();
      } else if (styleType === 'outline') {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
      } else if (styleType === 'filled-outline') {
        // Fill with lighter version of color
        this.ctx.fillStyle = color + '40'; // Add transparency
        this.ctx.fill();
        // Add darker outline
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
      }
    }
  }
  
  private drawRoundedRect(x: number, y: number, width: number, height: number, radius: number) {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.arcTo(x + width, y, x + width, y + height, radius);
    this.ctx.arcTo(x + width, y + height, x, y + height, radius);
    this.ctx.arcTo(x, y + height, x, y, radius);
    this.ctx.arcTo(x, y, x + width, y, radius);
    this.ctx.closePath();
  }
  
  private drawConstraintLines() {
    if (!this.inspectionData) return;
    
    this.ctx.save();
    this.ctx.lineWidth = this.lineStyles.lineWidth;
    this.ctx.globalAlpha = this.lineStyles.opacity;
    
    if ('constraintRelationships' in this.inspectionData) {
      // Neighbor inspection mode
      for (const relationship of this.inspectionData.constraintRelationships) {
        this.drawConstraintRelationship(relationship, this.lineStyles.solidLineColor, this.lineStyles.dashedLineColor);
      }
    } else {
      // Forbidden square inspection mode
      for (const relationship of this.inspectionData.causedBy) {
        this.drawConstraintRelationship(relationship, this.lineStyles.solidLineColor, this.lineStyles.dashedLineColor);
      }
    }
    
    this.ctx.restore();
  }
  
  private drawConstraintRelationship(relationship: ConstraintRelationship, solidColor: string, dashedColor: string) {
    const [pos1, pos2] = relationship.neighborPair;
    
    // Calculate screen coordinates for neighbors
    const pos1Screen = this.gridPositionToScreen(pos1);
    const pos2Screen = this.gridPositionToScreen(pos2);
    
    // Draw solid line between the two neighbors
    this.ctx.strokeStyle = solidColor;
    this.ctx.setLineDash([]);
    this.ctx.beginPath();
    this.ctx.moveTo(pos1Screen.x, pos1Screen.y);
    this.ctx.lineTo(pos2Screen.x, pos2Screen.y);
    this.ctx.stroke();
    
    // Draw dashed lines to forbidden squares on the line
    this.ctx.strokeStyle = dashedColor;
    this.ctx.setLineDash(this.lineStyles.dashPattern);
    
    for (const forbiddenPos of relationship.forbiddenSquares) {
      const forbiddenScreen = this.gridPositionToScreen(forbiddenPos);
      
      // Find which neighbor is closer to draw from
      const dist1 = this.getDistance(pos1Screen, forbiddenScreen);
      const dist2 = this.getDistance(pos2Screen, forbiddenScreen);
      
      const startScreen = dist1 < dist2 ? pos1Screen : pos2Screen;
      
      this.ctx.beginPath();
      this.ctx.moveTo(startScreen.x, startScreen.y);
      this.ctx.lineTo(forbiddenScreen.x, forbiddenScreen.y);
      this.ctx.stroke();
    }
    
    // Reset line dash
    this.ctx.setLineDash([]);
  }
  
  private gridPositionToScreen(pos: GridPosition): { x: number; y: number } {
    return {
      x: this.gridOffset.x + this.panOffset.x + (pos.col * this.cellSize) + (this.cellSize / 2),
      y: this.gridOffset.y + this.panOffset.y + (pos.row * this.cellSize) + (this.cellSize / 2)
    };
  }
  
  private getDistance(pos1: { x: number; y: number }, pos2: { x: number; y: number }): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  screenToGridPosition(clientX: number, clientY: number): GridPosition | null {
    const rect = this.canvas.getBoundingClientRect();
    const x = clientX - rect.left - this.gridOffset.x - this.panOffset.x;
    const y = clientY - rect.top - this.gridOffset.y - this.panOffset.y;
    
    if (x < 0 || y < 0) return null;
    
    const col = Math.floor(x / this.cellSize);
    const row = Math.floor(y / this.cellSize);
    
    if (col >= this.gridState.size || row >= this.gridState.size) return null;
    
    return { row, col };
  }
  
  resize() {
    this.setupCanvas();
    this.calculateDimensions();
    this.panOffset = { x: 0, y: 0 }; // Reset pan when resizing
    this.render();
  }
  
  updateGridState(newState: GridState) {
    const oldSize = this.gridState.size;
    this.gridState = newState;
    
    // If grid size changed, recalculate dimensions
    if (oldSize !== newState.size) {
      console.log(`Grid size changed from ${oldSize}×${oldSize} to ${newState.size}×${newState.size}, recalculating dimensions`);
      this.calculateDimensions();
    }
    
    // Only render if dimensions have been calculated (cellSize > 0)
    if (this.cellSize > 0) {
      this.render();
    }
  }
  
  updateInspectionData(data: InspectionData | ForbiddenSquareInfo | null) {
    this.inspectionData = data;
    // Only render if dimensions have been calculated (cellSize > 0)
    if (this.cellSize > 0) {
      this.render();
    }
  }
  
  updateLineStyles(styles: {
    solidLineColor?: string;
    dashedLineColor?: string;
    lineWidth?: number;
    dashPattern?: number[];
    opacity?: number;
  }) {
    this.lineStyles = { ...this.lineStyles, ...styles };
    this.render();
  }
  
  setTheme() {
    // Theme is now fixed - this method kept for backwards compatibility
    this.theme = gridTheme;
    this.render();
  }
  
  getCellSize(): number {
    return this.cellSize;
  }
  
  getIsScrollable(): boolean {
    return this.isScrollable;
  }

  updateForbiddenSquareStyle(styleConfig: any) {
    // Update theme with new forbidden square styling
    if (styleConfig.fillColor) {
      this.theme = {
        ...this.theme,
        forbiddenSquareColor: styleConfig.fillColor,
        forbiddenSquareOpacity: styleConfig.opacity || this.theme.forbiddenSquareOpacity
      };
    }

    // Map pattern to our internal style names
    if (styleConfig.pattern) {
      const patternMap: Record<string, string> = {
        'solid': 'forbidden-overlay',
        'dashed-grid': 'grid-fade', 
        'diagonal-lines': 'cross-hatch'
      };
      const mappedStyle = patternMap[styleConfig.pattern] || styleConfig.pattern;
      this.theme = {
        ...this.theme,
        forbiddenSquareStyle: mappedStyle as any
      };
    }

    // Re-render with new style
    this.render();
  }

  updateWarningStyle(warningStyle: string) {
    this.warningStyle = warningStyle;
    this.render();
  }

  updateRecentNeighborHighlight(highlightStyle: typeof this.recentNeighborHighlight) {
    this.recentNeighborHighlight = highlightStyle;
    this.render();
  }

  private drawHighlightEffect(centerX: number, centerY: number, radius: number, shape: 'circle' | 'rounded-square') {
    if (!this.recentNeighborHighlight) return;

    this.ctx.save();

    if (this.recentNeighborHighlight.type === 'glow') {
      // Create glow effect
      this.ctx.shadowColor = this.recentNeighborHighlight.glowColor || '#8B7355';
      this.ctx.shadowBlur = this.recentNeighborHighlight.glowRadius || 8;
      this.ctx.globalAlpha = this.recentNeighborHighlight.glowOpacity || 0.6;

      // Draw outer glow
      this.ctx.beginPath();
      if (shape === 'circle') {
        this.ctx.arc(centerX, centerY, radius + 2, 0, Math.PI * 2);
      } else {
        const size = radius * 1.4 + 4;
        const cornerRadius = size * 0.2;
        this.drawRoundedRect(centerX - size/2, centerY - size/2, size, size, cornerRadius);
      }
      this.ctx.fillStyle = this.recentNeighborHighlight.glowColor || '#8B7355';
      this.ctx.fill();

      // Draw inner glow if specified
      if (this.recentNeighborHighlight.innerGlowColor) {
        this.ctx.shadowColor = this.recentNeighborHighlight.innerGlowColor;
        this.ctx.shadowBlur = this.recentNeighborHighlight.innerGlowRadius || 4;
        this.ctx.beginPath();
        if (shape === 'circle') {
          this.ctx.arc(centerX, centerY, radius + 1, 0, Math.PI * 2);
        } else {
          const size = radius * 1.4 + 2;
          const cornerRadius = size * 0.2;
          this.drawRoundedRect(centerX - size/2, centerY - size/2, size, size, cornerRadius);
        }
        this.ctx.fillStyle = this.recentNeighborHighlight.innerGlowColor;
        this.ctx.fill();
      }
    } else if (this.recentNeighborHighlight.type === 'border') {
      // Create border effect
      this.ctx.strokeStyle = this.recentNeighborHighlight.borderColor || '#A0522D';
      this.ctx.lineWidth = this.recentNeighborHighlight.borderWidth || 3;
      this.ctx.globalAlpha = this.recentNeighborHighlight.borderOpacity || 0.9;

      this.ctx.beginPath();
      if (shape === 'circle') {
        this.ctx.arc(centerX, centerY, radius + (this.recentNeighborHighlight.borderWidth || 3) / 2, 0, Math.PI * 2);
      } else {
        const size = radius * 1.4 + (this.recentNeighborHighlight.borderWidth || 3);
        const cornerRadius = size * 0.2;
        this.drawRoundedRect(centerX - size/2, centerY - size/2, size, size, cornerRadius);
      }
      this.ctx.stroke();
    } else if (this.recentNeighborHighlight.type === 'square') {
      // Highlight the entire grid square
      const halfCell = this.cellSize / 2;
      const squareX = centerX - halfCell;
      const squareY = centerY - halfCell;
      
      // Draw background highlight
      this.ctx.fillStyle = this.recentNeighborHighlight.backgroundColor || '#D4C4A8';
      this.ctx.globalAlpha = this.recentNeighborHighlight.backgroundOpacity || 0.4;
      this.ctx.fillRect(squareX, squareY, this.cellSize, this.cellSize);
      
      // Draw border highlight
      if (this.recentNeighborHighlight.borderColor && (this.recentNeighborHighlight.borderWidth || 0) > 0) {
        this.ctx.strokeStyle = this.recentNeighborHighlight.borderColor;
        this.ctx.lineWidth = this.recentNeighborHighlight.borderWidth || 2;
        this.ctx.globalAlpha = this.recentNeighborHighlight.borderOpacity || 0.6;
        this.ctx.strokeRect(squareX, squareY, this.cellSize, this.cellSize);
      }
    }

    this.ctx.restore();
  }

  clearConstraintWarnings() {
    const existingWarning = document.getElementById('constraint-warning-indicator');
    if (existingWarning) {
      existingWarning.remove();
    }
  }

  updateThemeColors(colorConfig: {
    backgroundColor?: string;
    gridLineColor?: string;
    neighborColor?: string;
  }) {
    // Update theme with new colors
    this.theme = {
      ...this.theme,
      ...(colorConfig.backgroundColor && { backgroundColor: colorConfig.backgroundColor }),
      ...(colorConfig.gridLineColor && { gridLineColor: colorConfig.gridLineColor }),
      ...(colorConfig.neighborColor && { neighborColor: colorConfig.neighborColor })
    };

    // Re-render with new colors
    this.render();
  }

  updatePrePlacedStyle(style: 'solid' | 'outline' | 'filled-outline') {
    // Update theme with new pre-placed neighbor style
    this.theme = {
      ...this.theme,
      prePlacedNeighborStyle: style
    };

    // Re-render with new style
    this.render();
  }
  
  private drawConstraintWarnings() {
    const existingWarning = document.getElementById('constraint-warning-indicator');
    
    if (!this.gridState.constraintWarning) {
      // No constraints - remove any existing warnings
      if (existingWarning) {
        existingWarning.remove();
      }
      return;
    }
    
    const { overConstrainedRows, overConstrainedColumns } = this.gridState.constraintWarning;
    
    if (overConstrainedRows.length > 0 || overConstrainedColumns.length > 0) {
      // Only create warning if one doesn't already exist
      if (!existingWarning) {
        switch (this.warningStyle) {
          case 'modal':
            this.drawGameplayStoppingAlert(overConstrainedRows, overConstrainedColumns);
            break;
          case 'indicator':
            this.drawWarningIndicator(overConstrainedRows, overConstrainedColumns);
            break;
          case 'headers':
            this.drawOverconstrainedHighlights(overConstrainedRows, overConstrainedColumns);
            break;
          default:
            this.drawWarningIndicator(overConstrainedRows, overConstrainedColumns);
        }
      }
    } else {
      // Constraints resolved - remove warning
      if (existingWarning) {
        existingWarning.remove();
      }
    }
  }
  
  private drawGameplayStoppingAlert(overConstrainedRows: number[], overConstrainedColumns: number[]) {
    // Create modal overlay that blocks interaction
    const overlay = document.createElement('div');
    overlay.id = 'constraint-warning-indicator';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(139, 115, 85, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      font-family: system-ui, sans-serif;
    `;
    
    const modal = document.createElement('div');
    modal.style.cssText = `
      background: #faf7f2;
      color: #5d4e37;
      padding: 30px;
      border-radius: 12px;
      border: 3px solid #8B7355;
      text-align: center;
      max-width: 400px;
      margin: 20px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      position: relative;
    `;
    
    const problemRows = overConstrainedRows.length > 0 ? `row${overConstrainedRows.length > 1 ? 's' : ''} ${overConstrainedRows.map(r => r + 1).join(', ')}` : '';
    const problemCols = overConstrainedColumns.length > 0 ? `column${overConstrainedColumns.length > 1 ? 's' : ''} ${overConstrainedColumns.map(c => String.fromCharCode(65 + c)).join(', ')}` : '';
    const problemAreas = [problemRows, problemCols].filter(Boolean).join(' and ');
    
    modal.innerHTML = `
      <h3 style="margin: 0 0 15px 0; font-size: 1.3rem; color: #8B7355;">Puzzle Cannot Be Completed!</h3>
      <p style="margin: 0 0 15px 0; line-height: 1.4;">Some ${problemAreas} cannot fit the required 2 neighbors.</p>
      <p style="margin: 0 0 20px 0; font-style: italic; opacity: 0.8;">Try undoing your last move or reset the puzzle</p>
      <button id="dismiss-warning" style="
        background: #D2691E;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 6px;
        font-size: 1rem;
        cursor: pointer;
        font-weight: 500;
        transition: background 0.2s;
      " onmouseover="this.style.background='#B8601E'" onmouseout="this.style.background='#D2691E'">Continue Playing</button>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Add click handler to dismiss
    const dismissButton = modal.querySelector('#dismiss-warning') as HTMLButtonElement;
    if (dismissButton) {
      dismissButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        overlay.remove();
        // Don't call render() here - that would recreate the modal immediately
        // The modal will only reappear if user tries to place another neighbor
      });
    }
    
    // Allow clicking outside to dismiss
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
        // Don't call render() here - that would recreate the modal immediately
      }
    });
    
    // Add escape key handler
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && document.body.contains(overlay)) {
        overlay.remove();
        // Don't call render() here - that would recreate the modal immediately
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
  }
  
  private drawWarningIndicator(overConstrainedRows: number[], overConstrainedColumns: number[]) {
    // Non-blocking warning indicator - current implementation enhanced
    this.ctx.save();
    
    // Position relative to the grid like the row/column headers do
    const indicatorSize = 32;
    const offsetX = this.gridOffset.x + this.panOffset.x;
    const offsetY = this.gridOffset.y + this.panOffset.y;
    
    // Position indicator to the left of the grid with some padding
    // Ensure it's not positioned off-screen
    const x = Math.max(10, offsetX - indicatorSize - 10);
    const y = offsetY;
    
    // Draw warning triangle with organic theme colors
    this.ctx.fillStyle = '#D2691E';
    this.ctx.beginPath();
    this.ctx.moveTo(x + indicatorSize / 2, y);
    this.ctx.lineTo(x, y + indicatorSize);
    this.ctx.lineTo(x + indicatorSize, y + indicatorSize);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Add a subtle border for definition
    this.ctx.strokeStyle = '#8B7355';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    
    // Draw exclamation mark
    this.ctx.fillStyle = '#faf7f2';
    this.ctx.font = 'bold 18px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('!', x + indicatorSize / 2, y + indicatorSize * 0.7);
    
    this.ctx.restore();
    
    // Add hover tooltip functionality via DOM element
    // Use setTimeout to avoid triggering immediate re-render
    setTimeout(() => {
      const tooltip = document.createElement('div');
      tooltip.id = 'constraint-warning-indicator';
      tooltip.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        width: ${indicatorSize}px;
        height: ${indicatorSize}px;
        cursor: pointer;
        z-index: 100;
        pointer-events: none; /* Prevent any interaction events that might trigger re-renders */
      `;
      
      const problemRows = overConstrainedRows.length > 0 ? `row${overConstrainedRows.length > 1 ? 's' : ''} ${overConstrainedRows.join(', ')}` : '';
      const problemCols = overConstrainedColumns.length > 0 ? `column${overConstrainedColumns.length > 1 ? 's' : ''} ${overConstrainedColumns.join(', ')}` : '';
      const problemAreas = [problemRows, problemCols].filter(Boolean).join(' and ');
      
      tooltip.title = `Warning: This puzzle state cannot be completed. Some ${problemAreas} cannot fit the required 2 neighbors.`;
      
      const canvasRect = this.canvas.getBoundingClientRect();
      const tooltipLeft = canvasRect.left + x;
      const tooltipTop = canvasRect.top + y;
      tooltip.style.left = tooltipLeft + 'px';
      tooltip.style.top = tooltipTop + 'px';
      
      document.body.appendChild(tooltip);
    }, 0);
  }
  
  private drawOverconstrainedHighlights(overConstrainedRows: number[], overConstrainedColumns: number[]) {
    this.ctx.save();
    
    const offsetX = this.gridOffset.x + this.panOffset.x;
    const offsetY = this.gridOffset.y + this.panOffset.y;
    
    this.ctx.lineWidth = 3;
    
    // Track which edges have been reserved by previous constraints
    const reservedEdges = new Set<string>();
    
    // Helper function to create edge key
    const edgeKey = (x1: number, y1: number, x2: number, y2: number) => 
      `${x1},${y1}-${x2},${y2}`;
    
    // Helper function to draw line if not already reserved, and reserve it after drawing
    const drawLineIfAvailable = (x1: number, y1: number, x2: number, y2: number) => {
      const key = edgeKey(x1, y1, x2, y2);
      if (!reservedEdges.has(key)) {
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        reservedEdges.add(key); // Reserve this edge so subsequent constraints can't overwrite
      }
    };
    
    // Draw all constraints in alternating row/column order - first drawn becomes top layer
    const rowConstraints = overConstrainedRows.map(rowIndex => ({ type: 'row' as const, index: rowIndex }));
    const columnConstraints = overConstrainedColumns.map(colIndex => ({ type: 'column' as const, index: colIndex }));
    
    const allConstraints = [];
    const maxConstraints = Math.max(rowConstraints.length, columnConstraints.length);
    
    for (let i = 0; i < maxConstraints; i++) {
      if (i < rowConstraints.length) {
        allConstraints.push(rowConstraints[i]);
      }
      if (i < columnConstraints.length) {
        allConstraints.push(columnConstraints[i]);
      }
    }
    
    // Draw all constraints with layering and two-color system
    allConstraints.forEach((constraint, index) => {
      // First constraint gets full color, all others get light secondary color
      if (index === 0) {
        this.ctx.strokeStyle = '#CD853F'; // Original full-intensity color
      } else {
        this.ctx.strokeStyle = '#B8B8B8'; // Light gray secondary color (fully opaque)
      }
      
      this.ctx.beginPath();
      
      if (constraint.type === 'row') {
        const rowIndex = constraint.index;
        const y = offsetY + rowIndex * this.cellSize;
        
        // For row constraint: draw left/right edges for all cells, top/bottom edges for first/last cells
        for (let colIndex = 0; colIndex < this.gridState.size; colIndex++) {
          const x = offsetX + colIndex * this.cellSize;
          const isFirst = colIndex === 0;
          const isLast = colIndex === this.gridState.size - 1;
          
          // All cells get top and bottom edges
          drawLineIfAvailable(x, y, x + this.cellSize, y); // Top edge
          drawLineIfAvailable(x, y + this.cellSize, x + this.cellSize, y + this.cellSize); // Bottom edge
          
          // First cell gets left edge
          if (isFirst) {
            drawLineIfAvailable(x, y, x, y + this.cellSize); // Left edge
          }
          
          // Last cell gets right edge  
          if (isLast) {
            drawLineIfAvailable(x + this.cellSize, y, x + this.cellSize, y + this.cellSize); // Right edge
          }
        }
        
        // Mark ALL edges as reserved to prevent color overwriting
        // Top and bottom edges (full width)
        reservedEdges.add(edgeKey(offsetX, y, offsetX + this.gridState.size * this.cellSize, y));
        reservedEdges.add(edgeKey(offsetX, y + this.cellSize, offsetX + this.gridState.size * this.cellSize, y + this.cellSize));
        
        // All vertical edges (internal and external)
        for (let colIndex = 0; colIndex <= this.gridState.size; colIndex++) {
          const segmentX = offsetX + colIndex * this.cellSize;
          reservedEdges.add(edgeKey(segmentX, y, segmentX, y + this.cellSize));
        }
        
      } else { // column
        const colIndex = constraint.index;
        const x = offsetX + colIndex * this.cellSize;
        
        // For column constraint: draw top/bottom edges for all cells, left/right edges for first/last cells
        for (let rowIndex = 0; rowIndex < this.gridState.size; rowIndex++) {
          const y = offsetY + rowIndex * this.cellSize;
          const isFirst = rowIndex === 0;
          const isLast = rowIndex === this.gridState.size - 1;
          
          // All cells get left and right edges
          drawLineIfAvailable(x, y, x, y + this.cellSize); // Left edge
          drawLineIfAvailable(x + this.cellSize, y, x + this.cellSize, y + this.cellSize); // Right edge
          
          // First cell gets top edge
          if (isFirst) {
            drawLineIfAvailable(x, y, x + this.cellSize, y); // Top edge
          }
          
          // Last cell gets bottom edge
          if (isLast) {
            drawLineIfAvailable(x, y + this.cellSize, x + this.cellSize, y + this.cellSize); // Bottom edge
          }
        }
        
        // Mark ALL edges as reserved to prevent color overwriting
        // Left and right edges (full height)
        reservedEdges.add(edgeKey(x, offsetY, x, offsetY + this.gridState.size * this.cellSize));
        reservedEdges.add(edgeKey(x + this.cellSize, offsetY, x + this.cellSize, offsetY + this.gridState.size * this.cellSize));
        
        // All horizontal edges (internal and external)
        for (let rowIndex = 0; rowIndex <= this.gridState.size; rowIndex++) {
          const segmentY = offsetY + rowIndex * this.cellSize;
          reservedEdges.add(edgeKey(x, segmentY, x + this.cellSize, segmentY));
        }
      }
      
      this.ctx.stroke();
    });
    
    this.ctx.restore();
  }
  
  getGridWidth(): number {
    return this.gridWidth;
  }
  
  setGridWidthCallback(callback: (width: number) => void) {
    this.onGridWidthChange = callback;
  }
}