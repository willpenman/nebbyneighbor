import { PuzzleConfig } from '../types/puzzle.js';

export type CounterStyle = 'number-only' | 'with-label' | 'with-icon';
export type LevelStyle = 'id-only' | 'friendly' | 'compact';

export type StatusBarConfig = {
  counterStyle: CounterStyle;
  levelStyle: LevelStyle;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
};

export class StatusBar {
  private counterElement: HTMLElement;
  private levelElement: HTMLElement;
  private statusBarElement: HTMLElement;
  private config: StatusBarConfig;
  private currentPuzzle: PuzzleConfig | null = null;
  
  constructor() {
    this.counterElement = document.getElementById('counter-display')!;
    this.levelElement = document.getElementById('level-display')!;
    this.statusBarElement = document.getElementById('status-bar')!;
    
    // Default configuration (matches friendly-labels theme)
    this.config = {
      counterStyle: 'with-label',
      levelStyle: 'friendly'
    };
    
    if (!this.counterElement || !this.levelElement || !this.statusBarElement) {
      console.error('StatusBar: Required DOM elements not found');
    }
  }
  
  updateCounter(remainingCount: number, _totalNeeded: number) {
    if (!this.counterElement) return;
    
    let displayText = '';
    
    switch (this.config.counterStyle) {
      case 'number-only':
        displayText = remainingCount.toString();
        break;
      case 'with-label':
        const noun = remainingCount === 1 ? 'neighbor' : 'neighbors';
        displayText = `${remainingCount} ${noun} left`;
        break;
      case 'with-icon':
        displayText = `👥 ${remainingCount}`;
        break;
      default:
        // Fallback to with-label
        const defaultNoun = remainingCount === 1 ? 'neighbor' : 'neighbors';
        displayText = `${remainingCount} ${defaultNoun} left`;
        break;
    }
    
    this.counterElement.textContent = displayText;
  }
  
  updateLevel(puzzle: PuzzleConfig) {
    if (!this.levelElement) return;
    
    this.currentPuzzle = puzzle;
    let displayText = '';
    
    switch (this.config.levelStyle) {
      case 'id-only':
        // Generate display ID from semantic information
        displayText = `${puzzle.size}x${puzzle.size}-${(puzzle.metadata?.index || 1).toString().padStart(3, '0')}`;
        break;
      case 'friendly':
        const levelNumber = puzzle.metadata?.index || 1;
        displayText = `Level ${levelNumber}`;
        break;
      case 'compact':
        const compactNumber = puzzle.metadata?.index || 1;
        displayText = `#${compactNumber}`;
        break;
    }
    
    this.levelElement.textContent = displayText;
  }
  
  
  updateStyle(config: Partial<StatusBarConfig>) {
    this.config = { ...this.config, ...config };
    
    // Apply visual styling
    if (config.backgroundColor) {
      this.statusBarElement.style.backgroundColor = config.backgroundColor;
    }
    if (config.borderColor) {
      this.statusBarElement.style.borderColor = config.borderColor;
    }
    if (config.textColor) {
      this.statusBarElement.style.color = config.textColor;
      // Update child elements too
      [this.counterElement, this.levelElement].forEach(el => {
        if (el) el.style.color = config.textColor!;
      });
    }
    
    // Re-render current content with new style
    if (this.currentPuzzle) {
      this.updateLevel(this.currentPuzzle);
    }
  }
  
  calculateRemainingNeighbors(puzzle: PuzzleConfig, playerPlacedCount: number): number {
    const totalNeeded = puzzle.size * 2; // 2n neighbors total
    const prePlacedCount = puzzle.prePlacedNeighbors.length;
    return totalNeeded - prePlacedCount - playerPlacedCount;
  }
  
  hide() {
    this.statusBarElement.style.display = 'none';
  }
  
  show() {
    this.statusBarElement.style.display = 'flex';
  }
}