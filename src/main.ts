import { GridController } from './game/engine/GridController.js';
import { DevOverlay } from './dev/DevOverlay.js';

console.log('Nebby Neighbor game initializing...');

// Check for dev mode via URL parameter
const urlParams = new URLSearchParams(window.location.search);
const issueNumber = urlParams.get('issue');

async function initializeGame() {
  const gameContainer = document.getElementById('game-container');
  
  if (!gameContainer) {
    console.error('Game container not found');
    return;
  }

  let devConfig = null;
  let devOverlay: DevOverlay | null = null;

  // Initialize dev mode if issue parameter present
  if (issueNumber) {
    console.log(`Initializing dev mode for issue ${issueNumber}`);
    devOverlay = new DevOverlay(issueNumber);
    devConfig = await devOverlay.initialize();
  }

  const canvas = document.createElement('canvas');
  canvas.id = 'game-canvas';
  canvas.setAttribute('role', 'application');
  canvas.setAttribute('aria-label', '8x8 grid puzzle - click cells to place neighbors');
  
  gameContainer.innerHTML = '';
  gameContainer.appendChild(canvas);
  
  try {
    // Use dev config puzzle if available, otherwise default
    const puzzle = devConfig?.testPuzzle || {
      id: '8x8-test',
      size: 8,
      prePlacedNeighbors: [
        { row: 7, col: 1 },
        { row: 3, col: 4 },
        { row: 4, col: 3 }
      ],
      metadata: {
        symmetryClass: 'iden' as const
      }
    };

    const controller = new GridController(canvas, puzzle.size);
    controller.loadPuzzle(puzzle);
    
    // Set up dev mode event listeners
    if (devOverlay && devConfig) {
      setupDevModeListeners(controller, devOverlay, devConfig);
    }
    
    console.log('Grid controller initialized with puzzle:', puzzle.id);
    if (devOverlay) {
      devOverlay.updateDebugInfo(`Grid: ${puzzle.size}×${puzzle.size}, Pre-placed: ${puzzle.prePlacedNeighbors.length}`);
    }
    
  } catch (error) {
    console.error('Failed to initialize grid controller:', error);
    gameContainer.innerHTML = `
      <div style="text-align: center; color: #e74c3c;">
        <p>Failed to initialize game</p>
        <p style="font-size: 0.9rem; margin-top: 1rem;">
          ${error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    `;
  }
}

function setupDevModeListeners(controller: GridController, devOverlay: DevOverlay, devConfig: any) {
  // Theme change listener
  window.addEventListener('dev-theme-change', (event: any) => {
    const { themeKey, themeConfig } = event.detail;
    console.log('Dev theme change:', themeKey, themeConfig);
    
    const renderer = controller.getRenderer();
    if (!renderer) return;
    
    // Handle different types of theme overrides
    if (themeConfig?.override) {
      const override = themeConfig.override;
      
      // Issue 2: Basic color overrides
      if (override.backgroundColor || override.gridLineColor || override.neighborColor) {
        renderer.updateThemeColors({
          backgroundColor: override.backgroundColor,
          gridLineColor: override.gridLineColor,
          neighborColor: override.neighborColor
        });
      }
      
      // Issue 4: Pre-placed neighbor styling
      if (override.prePlacedNeighborStyle) {
        renderer.updatePrePlacedStyle(override.prePlacedNeighborStyle);
      }
    }
    
    // Issue 5: Grid size changes
    if (themeConfig?.gridSize) {
      const newPuzzle = {
        ...devConfig.testPuzzle,
        size: themeConfig.gridSize,
        id: `${themeConfig.gridSize}x${themeConfig.gridSize}-size-test`
      };
      controller.loadPuzzle(newPuzzle);
      devOverlay.updateDebugInfo(`Grid: ${themeConfig.gridSize}×${themeConfig.gridSize}, Pre-placed: ${newPuzzle.prePlacedNeighbors?.length || 0}`);
      return; // Exit early since we're reloading the puzzle
    }
    
    // Issue 6-7: Forbidden square style and constraint lines
    if (themeConfig?.forbiddenSquareStyle) {
      renderer.updateForbiddenSquareStyle(themeConfig.forbiddenSquareStyle);
      
      // Update constraint line styles if they exist
      const lineStyles = {
        solidLineColor: themeConfig.forbiddenSquareStyle.solidLineColor || '#8B7355',
        dashedLineColor: themeConfig.forbiddenSquareStyle.dashedLineColor || '#A67C5A',
        lineWidth: themeConfig.forbiddenSquareStyle.lineWidth || 2,
        dashPattern: themeConfig.forbiddenSquareStyle.dashPattern || [6, 4],
        opacity: themeConfig.forbiddenSquareStyle.opacity || 0.9
      };
      renderer.updateLineStyles(lineStyles);
    }
    
    devOverlay.updateDebugInfo(`Theme: ${themeKey} applied`);
  });

  // Reset puzzle listener
  window.addEventListener('dev-reset-puzzle', () => {
    controller.loadPuzzle(devConfig.testPuzzle);
    devOverlay.updateDebugInfo('Puzzle reset to initial state');
  });
}

// Initialize the game
initializeGame();