import { GridState, GridPosition } from '../types/grid.js';
import { GridTheme, themes } from './GridThemes.js';

export class GridRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gridState: GridState;
  private cellSize: number = 0;
  private gridOffset: { x: number; y: number } = { x: 0, y: 0 };
  private theme: GridTheme = themes.minimal;
  
  constructor(canvas: HTMLCanvasElement, gridState: GridState, themeName: string = 'minimal') {
    this.canvas = canvas;
    this.gridState = gridState;
    this.theme = themes[themeName] || themes.minimal;
    
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
    const minDimension = Math.min(rect.width, rect.height);
    const padding = 40;
    const availableSpace = minDimension - (padding * 2);
    
    this.cellSize = availableSpace / this.gridState.size;
    
    this.gridOffset.x = (rect.width - (this.cellSize * this.gridState.size)) / 2;
    this.gridOffset.y = (rect.height - (this.cellSize * this.gridState.size)) / 2;
  }
  
  render() {
    this.clear();
    this.drawBackground();
    this.drawGrid();
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
  
  setTheme(themeName: string) {
    this.theme = themes[themeName] || themes.minimal;
    this.render();
  }
}