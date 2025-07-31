import { GridState, GridPosition } from '../types/grid.js';
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
  private lineStyles = {
    solidLineColor: '#8B7355',    // Soft organic default
    dashedLineColor: '#A67C5A',   // Companion shade
    lineWidth: 2,
    dashPattern: [6, 4],
    opacity: 0.9
  };
  private static readonly MIN_CELL_SIZE = 44; // WCAG 2.1 AA minimum 44×44px touch targets
  private isScrollable: boolean = false;
  
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
    this.calculateDimensions();
    this.setupPanningEvents();
  }
  
  private setupCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    
    this.ctx.scale(dpr, dpr);
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
  }
  
  private calculateDimensions() {
    const rect = this.canvas.getBoundingClientRect();
    // Use reasonable padding - minimal on mobile, larger on desktop
    const padding = rect.width < 500 ? 2 : 40;
    const availableWidth = rect.width - (padding * 2);
    const availableHeight = rect.height - (padding * 2);
    // Use minimum dimension to ensure grid fits completely in viewport
    const availableSpace = Math.min(availableWidth, availableHeight);
    
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
    const totalGridHeight = this.cellSize * this.gridState.size;
    
    if (this.isScrollable) {
      // For scrollable grids, position at top with minimal padding, center horizontally
      this.gridOffset.x = Math.max(2, (rect.width - totalGridWidth) / 2);
      this.gridOffset.y = 20; // Always position at top for scrollable grids
    } else {
      // For non-scrollable grids, center normally
      this.gridOffset.x = (rect.width - totalGridWidth) / 2;
      this.gridOffset.y = (rect.height - totalGridHeight) / 2;
    }
    
    // Set appropriate cursor
    this.canvas.style.cursor = this.isScrollable ? 'grab' : 'pointer';
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
    this.drawNeighbors();
    this.drawConstraintLines();
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
        case 'subtle-overlay':
          this.drawSubtleOverlay(x, y, color);
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

  private drawSubtleOverlay(x: number, y: number, color: string) {
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
  
  private drawNeighbors() {
    // Draw player-placed neighbors
    this.ctx.fillStyle = this.theme.neighborColor;
    
    for (const neighborKey of this.gridState.neighbors) {
      const [row, col] = neighborKey.split(',').map(Number);
      const centerX = this.gridOffset.x + this.panOffset.x + (col * this.cellSize) + (this.cellSize / 2);
      const centerY = this.gridOffset.y + this.panOffset.y + (row * this.cellSize) + (this.cellSize / 2);
      const radius = Math.min(this.cellSize * this.theme.neighborRadius, 25);
      
      this.drawNeighborShape(centerX, centerY, radius, this.theme.neighborStyle, false);
    }
    
    // Draw pre-placed neighbors with distinct styling
    for (const neighborKey of this.gridState.prePlacedNeighbors) {
      const [row, col] = neighborKey.split(',').map(Number);
      const centerX = this.gridOffset.x + this.panOffset.x + (col * this.cellSize) + (this.cellSize / 2);
      const centerY = this.gridOffset.y + this.panOffset.y + (row * this.cellSize) + (this.cellSize / 2);
      const radius = Math.min(this.cellSize * this.theme.neighborRadius, 25);
      
      this.drawNeighborShape(centerX, centerY, radius, this.theme.neighborStyle, true);
    }
  }
  
  private drawNeighborShape(centerX: number, centerY: number, radius: number, shape: 'circle' | 'rounded-square', isPrePlaced: boolean) {
    const color = isPrePlaced ? this.theme.prePlacedNeighborColor : this.theme.neighborColor;
    const styleType = isPrePlaced ? this.theme.prePlacedNeighborStyle : 'solid';
    
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
    this.gridState = newState;
    this.render();
  }
  
  updateInspectionData(data: InspectionData | ForbiddenSquareInfo | null) {
    this.inspectionData = data;
    this.render();
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
        'solid': 'subtle-overlay',
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
}