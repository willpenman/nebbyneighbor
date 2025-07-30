// Issue #4: Load one solvable 4×4 puzzle with some pre-placed neighbors
// Configuration for development testing

export const issueConfig = {
  title: "Issue #4: Load one solvable 4×4 puzzle with some pre-placed neighbors",
  description: "Test pre-placed neighbor styling variations",
  
  // Pre-placed styling variants for this issue
  themeVariants: {
    'outline': {
      name: 'Outline Style',
      description: 'Pre-placed neighbors shown as outlines',
      override: {
        prePlacedNeighborStyle: 'outline'
      }
    },
    'filled-outline': {
      name: 'Filled Outline',
      description: 'Pre-placed neighbors with fill and outline',
      override: {
        prePlacedNeighborStyle: 'filled-outline'
      }
    },
    'solid': {
      name: 'Solid Color',
      description: 'Pre-placed neighbors as solid shapes',
      override: {
        prePlacedNeighborStyle: 'solid'
      }
    }
  },
  
  // Default theme selection
  defaultTheme: 'filled-outline',
  
  // Test configuration
  testPuzzle: {
    id: '4x4-puzzle-001',
    size: 4,
    prePlacedNeighbors: [
      { row: 0, col: 1 },
      { row: 2, col: 3 }
    ],
    metadata: {
      symmetryClass: 'iden'
    }
  },
  
  // Development features to enable
  devFeatures: {
    themeSelector: true,
    gridSizeSelector: false,
    debugInfo: true,
    resetButton: true
  }
};