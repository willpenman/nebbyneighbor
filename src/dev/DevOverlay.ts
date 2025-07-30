// Development overlay system for issue-specific testing
// Dynamically loads issue configurations and injects dev UI

export interface DevConfig {
  title: string;
  description: string;
  themeVariants?: Record<string, any>;
  defaultTheme?: string;
  testPuzzle?: any;
  devFeatures?: {
    themeSelector?: boolean;
    gridSizeSelector?: boolean;
    debugInfo?: boolean;
    resetButton?: boolean;
  };
}

export class DevOverlay {
  private issueNumber: string;
  private config: DevConfig | null = null;
  private devContainer: HTMLElement | null = null;

  constructor(issueNumber: string) {
    this.issueNumber = issueNumber;
  }

  async initialize(): Promise<DevConfig | null> {
    try {
      // Dynamically import the issue config
      const configModule = await import(`../../docs/development/issue-${this.issueNumber}/config.js`);
      this.config = configModule.issueConfig;
      
      if (this.config) {
        this.injectDevUI();
        this.setupEventListeners();
      }
      
      return this.config;
    } catch (error) {
      console.warn(`No dev config found for issue ${this.issueNumber}:`, error);
      return null;
    }
  }

  private injectDevUI(): void {
    if (!this.config) return;

    // Create dev container
    this.devContainer = document.createElement('div');
    this.devContainer.id = 'dev-overlay';
    this.devContainer.innerHTML = `
      <div class="dev-header">
        <h2>${this.config.title}</h2>
        <p>${this.config.description}</p>
        <div class="dev-badge">Development Mode: Issue #${this.issueNumber}</div>
      </div>
      <div class="dev-controls">
        ${this.renderControls()}
      </div>
    `;

    // Add styles
    this.injectStyles();

    // Insert before game container
    const gameContainer = document.getElementById('game-container');
    if (gameContainer && gameContainer.parentNode) {
      gameContainer.parentNode.insertBefore(this.devContainer, gameContainer);
    }
  }

  private renderControls(): string {
    if (!this.config?.devFeatures) return '';

    let controls = '';

    if (this.config.devFeatures.themeSelector && this.config.themeVariants) {
      controls += `
        <div class="dev-control-group">
          <label for="theme-select">Constraint Visualization Style:</label>
          <select id="theme-select">
            ${Object.entries(this.config.themeVariants).map(([key, variant]) => 
              `<option value="${key}" ${key === this.config?.defaultTheme ? 'selected' : ''}>
                ${variant.name}
              </option>`
            ).join('')}
          </select>
          <small id="theme-description">${this.getThemeDescription(this.config.defaultTheme || '')}</small>
        </div>
      `;
    }

    if (this.config.devFeatures.resetButton) {
      controls += `
        <div class="dev-control-group">
          <button id="reset-puzzle">Reset Puzzle</button>
        </div>
      `;
    }

    if (this.config.devFeatures.debugInfo) {
      controls += `
        <div class="dev-control-group">
          <div id="debug-info">
            <strong>Debug Info:</strong>
            <div id="debug-details">Grid ready for testing</div>
          </div>
        </div>
      `;
    }

    return controls;
  }

  private getThemeDescription(themeKey: string): string {
    const theme = this.config?.themeVariants?.[themeKey];
    return theme?.description || '';
  }

  private setupEventListeners(): void {
    if (!this.devContainer) return;

    // Theme selector
    const themeSelect = this.devContainer.querySelector('#theme-select') as HTMLSelectElement;
    if (themeSelect) {
      themeSelect.addEventListener('change', (e) => {
        const newTheme = (e.target as HTMLSelectElement).value;
        const description = this.getThemeDescription(newTheme);
        const descElement = this.devContainer?.querySelector('#theme-description');
        if (descElement) {
          descElement.textContent = description;
        }
        
        // Dispatch custom event for main app to listen to
        window.dispatchEvent(new CustomEvent('dev-theme-change', { 
          detail: { 
            themeKey: newTheme, 
            themeConfig: this.config?.themeVariants?.[newTheme] 
          } 
        }));
      });
    }

    // Reset button
    const resetButton = this.devContainer.querySelector('#reset-puzzle') as HTMLButtonElement;
    if (resetButton) {
      resetButton.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('dev-reset-puzzle'));
      });
    }
  }

  private injectStyles(): void {
    const styleId = 'dev-overlay-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      #dev-overlay {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px;
        margin-bottom: 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }
      
      .dev-header h2 {
        margin: 0 0 8px 0;
        font-size: 1.4rem;
      }
      
      .dev-header p {
        margin: 0 0 12px 0;
        opacity: 0.9;
      }
      
      .dev-badge {
        display: inline-block;
        background: rgba(255,255,255,0.2);
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 500;
      }
      
      .dev-controls {
        margin-top: 20px;
        display: flex;
        gap: 20px;
        flex-wrap: wrap;
        align-items: flex-start;
      }
      
      .dev-control-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      
      .dev-control-group label {
        font-weight: 500;
        font-size: 0.9rem;
      }
      
      .dev-control-group select,
      .dev-control-group button {
        padding: 8px 12px;
        border: none;
        border-radius: 4px;
        background: white;
        color: #333;
        font-size: 0.9rem;
      }
      
      .dev-control-group button {
        background: #ff6b6b;
        color: white;
        cursor: pointer;
        transition: background 0.2s;
      }
      
      .dev-control-group button:hover {
        background: #ee5a5a;
      }
      
      .dev-control-group small {
        opacity: 0.8;
        font-size: 0.8rem;
        font-style: italic;
      }
      
      #debug-info {
        background: rgba(255,255,255,0.1);
        padding: 10px;
        border-radius: 4px;
        font-size: 0.8rem;
      }
      
      #debug-details {
        margin-top: 6px;
        font-family: monospace;
      }
    `;
    
    document.head.appendChild(style);
  }

  updateDebugInfo(info: string): void {
    const debugDetails = this.devContainer?.querySelector('#debug-details');
    if (debugDetails) {
      debugDetails.textContent = info;
    }
  }
}