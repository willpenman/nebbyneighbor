export type LevelControlsConfig = {
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  buttonColor?: string;
  buttonHoverColor?: string;
};

export class LevelControls {
  private levelControlsElement!: HTMLElement;
  private previousButton!: HTMLButtonElement;
  private nextButton!: HTMLButtonElement;
  private config: LevelControlsConfig;
  private currentLevelIndex: number = 0;
  private totalLevels: number = 1;

  // Callbacks for navigation
  private onPreviousLevel?: () => void;
  private onNextLevel?: () => void;
  private getCurrentLevelIndex?: () => number;
  private getTotalLevels?: () => number;

  constructor(callbacks?: {
    onPreviousLevel?: () => void;
    onNextLevel?: () => void;
    getCurrentLevelIndex?: () => number;
    getTotalLevels?: () => number;
  }) {
    // Store callbacks
    this.onPreviousLevel = callbacks?.onPreviousLevel;
    this.onNextLevel = callbacks?.onNextLevel;
    this.getCurrentLevelIndex = callbacks?.getCurrentLevelIndex;
    this.getTotalLevels = callbacks?.getTotalLevels;

    // Default configuration (matches soft organic theme)
    this.config = {
      backgroundColor: '#faf7f2',
      borderColor: '#d4c4a8',
      textColor: '#5a4a37',
      buttonColor: '#8B7355',
      buttonHoverColor: '#6d5a43'
    };

    this.createLevelControlsElement();
    this.setupEventListeners();
  }

  private createLevelControlsElement() {
    // Create main container
    this.levelControlsElement = document.createElement('div');
    this.levelControlsElement.id = 'level-controls';
    this.levelControlsElement.className = 'level-controls';

    // Create previous button
    this.previousButton = document.createElement('button');
    this.previousButton.textContent = '← Previous';
    this.previousButton.className = 'level-button level-button-previous';

    // Create next button
    this.nextButton = document.createElement('button');
    this.nextButton.textContent = 'Next →';
    this.nextButton.className = 'level-button level-button-next';

    // Add buttons to container
    this.levelControlsElement.appendChild(this.previousButton);
    this.levelControlsElement.appendChild(this.nextButton);

    // Apply initial styling
    this.applyStyles();
  }

  private applyStyles() {
    // Container styles - thematic background with line visual, similar to status bar structure
    this.levelControlsElement.style.cssText = `
      display: block;
      position: relative;
      height: 60px;
      padding: 0.75rem 1rem;
      margin: 0 auto;
      background-color: ${this.config.backgroundColor || '#f5f2ed'};
      border: 1px solid ${this.config.borderColor || '#d4c4a8'};
      border-top: none;
      border-radius: 0 0 8px 8px;
      flex-shrink: 0;
      width: fit-content;
      min-width: 200px;
    `;

    // Previous button - positioned on left like counter-display
    this.previousButton.style.cssText = `
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      padding: 0.5rem 1rem;
      background: ${this.config.buttonColor || '#8B7355'};
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      font-family: inherit;
      transition: background-color 0.2s ease;
      line-height: 1.2;
    `;

    // Next button - positioned on right like level-display
    this.nextButton.style.cssText = `
      position: absolute;
      right: 1rem;
      top: 50%;
      transform: translateY(-50%);
      padding: 0.5rem 1rem;
      background: ${this.config.buttonColor || '#8B7355'};
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      font-family: inherit;
      transition: background-color 0.2s ease;
      line-height: 1.2;
    `;
  }

  private setupEventListeners() {
    // Previous button events
    this.previousButton.addEventListener('click', () => {
      if (this.onPreviousLevel) {
        this.onPreviousLevel();
      }
    });

    this.previousButton.addEventListener('mouseenter', () => {
      this.previousButton.style.backgroundColor = this.config.buttonHoverColor || '#6d5a43';
    });

    this.previousButton.addEventListener('mouseleave', () => {
      this.previousButton.style.backgroundColor = this.config.buttonColor || '#8B7355';
    });

    // Next button events
    this.nextButton.addEventListener('click', () => {
      if (this.onNextLevel) {
        this.onNextLevel();
      }
    });

    this.nextButton.addEventListener('mouseenter', () => {
      this.nextButton.style.backgroundColor = this.config.buttonHoverColor || '#6d5a43';
    });

    this.nextButton.addEventListener('mouseleave', () => {
      this.nextButton.style.backgroundColor = this.config.buttonColor || '#8B7355';
    });
  }

  updateVisibility() {
    // Update current state
    if (this.getCurrentLevelIndex) {
      this.currentLevelIndex = this.getCurrentLevelIndex();
    }
    if (this.getTotalLevels) {
      this.totalLevels = this.getTotalLevels();
    }

    // Hide previous button if on first level
    this.previousButton.style.visibility = this.currentLevelIndex === 0 ? 'hidden' : 'visible';

    // Hide next button if on last level
    this.nextButton.style.visibility = this.currentLevelIndex >= this.totalLevels - 1 ? 'hidden' : 'visible';
  }

  updateStyle(config: Partial<LevelControlsConfig>) {
    this.config = { ...this.config, ...config };
    this.applyStyles();
  }

  setWidth(gridWidthPx: number) {
    this.levelControlsElement.style.width = `${gridWidthPx}px`;
  }

  getElement(): HTMLElement {
    return this.levelControlsElement;
  }

  getHeight(): number {
    return 60; // Fixed height matching the CSS
  }

  hide() {
    this.levelControlsElement.style.display = 'none';
  }

  show() {
    this.levelControlsElement.style.display = 'flex';
  }
}