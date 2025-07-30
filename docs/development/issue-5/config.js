// Issue #5: Add support for larger grid sizes (n=10) with mobile accessibility
// Configuration for development testing

export const issueConfig = {
  title: "Issue #5: Add support for larger grid sizes (n=10) with mobile accessibility",
  description: "Test different grid sizes and mobile responsiveness",
  
  // Grid size variants for this issue
  themeVariants: {
    '4x4': {
      name: '4×4 Grid',
      description: 'Small grid, no scrolling needed',
      gridSize: 4
    },
    '6x6': {
      name: '6×6 Grid', 
      description: 'Medium grid, borderline for mobile',
      gridSize: 6
    },
    '8x8': {
      name: '8×8 Grid',
      description: 'Large grid, may need scrolling on mobile',
      gridSize: 8
    },
    '10x10': {
      name: '10×10 Grid',
      description: 'Very large grid, definitely needs scrolling',
      gridSize: 10
    }
  },
  
  // Default selection
  defaultTheme: '8x8',
  
  // Test configuration - dynamically updated based on grid size
  testPuzzle: {
    id: '8x8-size-test',
    size: 8,
    prePlacedNeighbors: [
      { row: 1, col: 2 },
      { row: 4, col: 6 }
    ],
    metadata: {
      symmetryClass: 'iden'
    }
  },
  
  // Development features to enable
  devFeatures: {
    themeSelector: true, // Actually grid size selector in this case
    gridSizeSelector: true,
    debugInfo: true,
    resetButton: true
  }
};