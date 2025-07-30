import { GridController } from './game/engine/GridController.js';
import { getDefaultPuzzle } from './game/data/puzzleCatalog.js';

console.log('Nebby Neighbor game initializing...');

const gameContainer = document.getElementById('game-container');

if (gameContainer) {
  const canvas = document.createElement('canvas');
  canvas.id = 'game-canvas';
  canvas.setAttribute('role', 'application');
  canvas.setAttribute('aria-label', '4x4 grid puzzle - click cells to place neighbors');
  
  gameContainer.innerHTML = '';
  gameContainer.appendChild(canvas);
  
  try {
    // Grid system now supports n=4 through n=10 with automatic mobile scrolling
    const controller = new GridController(canvas, 4, 'organic');
    const defaultPuzzle = getDefaultPuzzle();
    controller.loadPuzzle(defaultPuzzle);
    console.log('Grid controller initialized with puzzle:', defaultPuzzle.id);
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
} else {
  console.error('Game container not found');
}