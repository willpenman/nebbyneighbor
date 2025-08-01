// Issue #8: Display remaining neighbors counter and level identifier
export const issueConfig = {
  title: "Game Status Bar with Counter and Level ID",
  description: "Display remaining neighbor count and level identifier in game status bar",
  themeVariants: {
    'minimal-clean': {
      name: 'Minimal Clean',
      description: 'Clean minimal approach with simple numbers and subtle styling',
      statusBarStyle: {
        backgroundColor: '#ffffff',
        borderColor: '#e5e5e5',
        textColor: '#34495e',
        counterStyle: 'number-only', // "8"
        levelStyle: 'id-only', // "6x6-042"
        layout: 'split' // counter left, level right
      }
    },
    'friendly-labels': {
      name: 'Friendly Labels',
      description: 'User-friendly labels with descriptive text and warmer styling',
      statusBarStyle: {
        backgroundColor: '#faf7f2',
        borderColor: '#d4c4a8',
        textColor: '#5d4e37',
        counterStyle: 'with-label', // "8 neighbors left"
        levelStyle: 'friendly', // "Level 42"
        layout: 'split'
      }
    },
    'compact-icons': {
      name: 'Compact Icons',
      description: 'Space-efficient design with icons and condensed information',
      statusBarStyle: {
        backgroundColor: '#f8f9fa',
        borderColor: '#dee2e6',
        textColor: '#495057',
        counterStyle: 'with-icon', // "👥 8"
        levelStyle: 'compact', // "#42"
        layout: 'inline' // both items flowing together
      }
    }
  },
  defaultTheme: 'friendly-labels',
  testPuzzle: {
    id: '6x6-042',
    size: 6,
    prePlacedNeighbors: [
      { row: 1, col: 2 },
      { row: 3, col: 4 },
      { row: 4, col: 1 }
    ],
    metadata: {
      symmetryClass: 'rot2',
      difficulty: 3,
      index: 42
    }
  },
  devFeatures: {
    themeSelector: true,
    debugInfo: true,
    resetButton: true
  }
};