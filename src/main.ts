// Main entry point for Nebby Neighbor game
console.log('Nebby Neighbor game initializing...');

// Simple initialization to verify TypeScript compilation
const gameContainer = document.getElementById('game-container');

if (gameContainer) {
  gameContainer.innerHTML = `
    <div style="text-align: center; color: #7f8c8d;">
      <p>Game setup complete! ✓</p>
      <p style="font-size: 0.9rem; margin-top: 1rem;">
        TypeScript + Vite development environment is ready.
      </p>
      <p style="font-size: 0.8rem; margin-top: 0.5rem; color: #95a5a6;">
        Hot reload test
      </p>
    </div>
  `;
  console.log('Game container found and initialized');
} else {
  console.error('Game container not found');
}