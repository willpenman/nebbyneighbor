import { GridController } from './game/engine/GridController.js';

console.log('Nebby Neighbor game initializing...');

const gameContainer = document.getElementById('game-container');

if (gameContainer) {
  const canvas = document.createElement('canvas');
  canvas.id = 'game-canvas';
  canvas.setAttribute('role', 'application');
  canvas.setAttribute('aria-label', '8x8 grid puzzle - click cells to place neighbors');
  
  gameContainer.innerHTML = '';
  gameContainer.appendChild(canvas);
  
  try {
    // Default to 8x8 grid for better constraint visualization testing
    const controller = new GridController(canvas, 8);
    
    // Create test puzzle with the specified neighbors
    const testPuzzle = {
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
    
    controller.loadPuzzle(testPuzzle);
    console.log('Grid controller initialized with puzzle:', testPuzzle.id);
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