import { GridController } from './game/engine/GridController.js';
import { DevOverlay } from './dev/DevOverlay.js';
import { getDefaultPuzzle, getPuzzleByIndex, getPuzzleCount } from './game/data/puzzleCatalog.js';
import { initFooter } from './footer.js';

console.log('Nebby Neighbor game initializing...');

// Level navigation state
let currentLevelIndex = 0;
let currentController: GridController | null = null;

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
  
  // Only clear canvas if it already exists, preserve status bar
  const existingCanvas = gameContainer.querySelector('#game-canvas');
  if (existingCanvas) {
    existingCanvas.remove();
  }
  gameContainer.appendChild(canvas);
  
  try {
    // Use dev config puzzle if available, otherwise use default from catalog (4x4)
    const puzzle = devConfig?.testPuzzle || getDefaultPuzzle();
    
    // Set dynamic accessibility label
    canvas.setAttribute('aria-label', `${puzzle.size}x${puzzle.size} grid puzzle - click cells to place neighbors`);

    const controller = new GridController(canvas, puzzle.size, {
      onNextLevel: goToNextLevel,
      onPreviousLevel: goToPreviousLevel,
      getCurrentLevelIndex: () => currentLevelIndex,
      getTotalLevels: () => getPuzzleCount(),
      hasNextLevel: () => currentLevelIndex < getPuzzleCount() - 1
    });
    controller.loadPuzzle(puzzle);
    currentController = controller;
    
    // Set up dev mode event listeners
    if (devOverlay && devConfig) {
      setupDevModeListeners(controller, devOverlay, devConfig);
    }
    
    console.log('Grid controller initialized with puzzle:', puzzle.id);
    if (devOverlay) {
      devOverlay.updateDebugInfo(`Grid: ${puzzle.size}×${puzzle.size}, Pre-placed: ${puzzle.prePlacedNeighbors.length}`);
    }
    
    // Add level controls to DOM if not in dev mode
    if (!devOverlay) {
      addLevelControlsToDom(controller);
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
      
      // Issue 13: Warning style for constraint violations
      if (override.warningStyle) {
        renderer.updateWarningStyle(override.warningStyle);
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
    
    // Issue 18: Most recent neighbor highlighting
    if (themeConfig?.highlightStyle) {
      renderer.updateRecentNeighborHighlight(themeConfig.highlightStyle);
    }
    
    // Issue 8: Status bar styling
    if (themeConfig?.statusBarStyle) {
      const statusBar = controller.getStatusBar();
      statusBar.updateStyle({
        counterStyle: themeConfig.statusBarStyle.counterStyle,
        levelStyle: themeConfig.statusBarStyle.levelStyle,
        backgroundColor: themeConfig.statusBarStyle.backgroundColor,
        borderColor: themeConfig.statusBarStyle.borderColor,
        textColor: themeConfig.statusBarStyle.textColor
      });
      
      // Trigger a status bar update to refresh with new styles
      const gridState = controller.getGridState();
      const playerPlacedCount = gridState.neighbors.size;
      const puzzleState = controller.getPuzzleState();
      if (puzzleState) {
        const remainingNeighbors = statusBar.calculateRemainingNeighbors(
          puzzleState.config,
          playerPlacedCount
        );
        statusBar.updateCounter(remainingNeighbors, puzzleState.config.size * 2);
      }
    }
    
    devOverlay.updateDebugInfo(`Theme: ${themeKey} applied`);
  });

  // Reset puzzle listener
  window.addEventListener('dev-reset-puzzle', () => {
    controller.loadPuzzle(devConfig.testPuzzle);
    devOverlay.updateDebugInfo('Puzzle reset to initial state');
  });
}

function addLevelControlsToDom(controller: GridController) {
  const gameContainer = document.getElementById('game-container');
  if (!gameContainer) return;
  
  // Remove existing navigation if it exists
  const existingNav = document.getElementById('level-navigation');
  if (existingNav) {
    existingNav.remove();
  }
  
  // Get level controls from controller and add to DOM
  const levelControls = controller.getLevelControls();
  const levelControlsElement = levelControls.getElement();
  
  // Append level controls inside the game container (after the canvas)
  gameContainer.appendChild(levelControlsElement);
  
  // Initial visibility update
  levelControls.updateVisibility();
}


function goToPreviousLevel() {
  if (currentLevelIndex > 0) {
    currentLevelIndex--;
    loadCurrentLevel();
  }
}

function goToNextLevel() {
  if (currentLevelIndex < getPuzzleCount() - 1) {
    currentLevelIndex++;
    loadCurrentLevel();
  }
}

function loadCurrentLevel() {
  const puzzle = getPuzzleByIndex(currentLevelIndex);
  if (!puzzle || !currentController) return;
  
  // Update canvas accessibility label
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  if (canvas) {
    canvas.setAttribute('aria-label', `${puzzle.size}x${puzzle.size} grid puzzle - click cells to place neighbors`);
  }
  
  // Load puzzle (this handles size changes automatically and updates level controls)
  currentController.loadPuzzle(puzzle);
  
  console.log(`Loaded level ${currentLevelIndex + 1}: ${puzzle.id}`);
}

// Initialize the game
initializeGame();

// Initialize footer functionality
initFooter();