import { GridState, GridPosition } from '../types/grid.js';
import { GridTheme, gridTheme } from './GridThemes.js';

export class GridRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gridState: GridState;
  private cellSize: number = 0;
  private gridOffset: { x: number; y: number } = { x: 0, y: 0 };
  private theme: GridTheme = gridTheme;
  private static readonly MIN_CELL_SIZE = 55; // 44x44px touch targets (22px radius ÷ 0.4)
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
    // Use reasonable padding - small on mobile, larger on desktop
    const padding = rect.width < 500 ? 10 : 40;
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
      this.gridOffset.x = Math.max(20, (rect.width - totalGridWidth) / 2);
      this.gridOffset.y = 20; // Always position at top for scrollable grids
    } else {
      // For non-scrollable grids, center normally
      this.gridOffset.x = (rect.width - totalGridWidth) / 2;
      this.gridOffset.y = (rect.height - totalGridHeight) / 2;
    }
  }
  
  render() {
    this.clear();
    this.drawBackground();
    this.drawGrid();
    this.drawForbiddenSquares();
    this.drawNeighbors();
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
    
    for (let i = 0; i <= this.gridState.size; i++) {
      const pos = i * this.cellSize;
      
      this.ctx.beginPath();
      this.ctx.moveTo(this.gridOffset.x + pos, this.gridOffset.y);
      this.ctx.lineTo(this.gridOffset.x + pos, this.gridOffset.y + gridSize);
      this.ctx.stroke();
      
      this.ctx.beginPath();
      this.ctx.moveTo(this.gridOffset.x, this.gridOffset.y + pos);
      this.ctx.lineTo(this.gridOffset.x + gridSize, this.gridOffset.y + pos);
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
      const x = this.gridOffset.x + (col * this.cellSize);
      const y = this.gridOffset.y + (row * this.cellSize);

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
      const centerX = this.gridOffset.x + (col * this.cellSize) + (this.cellSize / 2);
      const centerY = this.gridOffset.y + (row * this.cellSize) + (this.cellSize / 2);
      const radius = Math.min(this.cellSize * this.theme.neighborRadius, 25);
      
      this.drawNeighborShape(centerX, centerY, radius, this.theme.neighborStyle, false);
    }
    
    // Draw pre-placed neighbors with distinct styling
    for (const neighborKey of this.gridState.prePlacedNeighbors) {
      const [row, col] = neighborKey.split(',').map(Number);
      const centerX = this.gridOffset.x + (col * this.cellSize) + (this.cellSize / 2);
      const centerY = this.gridOffset.y + (row * this.cellSize) + (this.cellSize / 2);
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
  
  screenToGridPosition(clientX: number, clientY: number): GridPosition | null {
    const rect = this.canvas.getBoundingClientRect();
    const x = clientX - rect.left - this.gridOffset.x;
    const y = clientY - rect.top - this.gridOffset.y;
    
    if (x < 0 || y < 0) return null;
    
    const col = Math.floor(x / this.cellSize);
    const row = Math.floor(y / this.cellSize);
    
    if (col >= this.gridState.size || row >= this.gridState.size) return null;
    
    return { row, col };
  }
  
  resize() {
    this.setupCanvas();
    this.calculateDimensions();
    this.render();
  }
  
  updateGridState(newState: GridState) {
    this.gridState = newState;
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
}