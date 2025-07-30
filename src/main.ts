import { GridController } from './game/engine/GridController.js';

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
    new GridController(canvas, 4, 'organic');
    console.log('Grid controller initialized successfully');
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