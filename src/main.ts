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
    
    // Apply theme to renderer
    const renderer = controller.getRenderer();
    if (renderer && themeConfig?.forbiddenSquareStyle) {
      // Update renderer with new forbidden square style
      renderer.updateForbiddenSquareStyle(themeConfig.forbiddenSquareStyle);
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