// Issue #6: Line Detection & Constraint Visualization
// Configuration for development testing

export const issueConfig = {
  title: "Issue #6: Line Detection & Constraint Visualization Test",
  description: "Test real-time constraint visualization with different visual treatments",
  
  // Theme variants for this issue
  themeVariants: {
    'subtle-overlay': {
      name: 'Subtle Overlay (Minimal)',
      description: 'Light gray semi-transparent overlay',
      forbiddenSquareStyle: {
        fillColor: '#666666',
        opacity: 0.4,
        pattern: 'solid'
      }
    },
    'grid-fade': {
      name: 'Grid Fade (Organic)', 
      description: 'Faded background with dashed inner grid',
      forbiddenSquareStyle: {
        fillColor: '#8B7355',
        opacity: 0.5,
        pattern: 'dashed-grid'
      }
    },
    'cross-hatch': {
      name: 'Cross Hatch (Bold)',
      description: 'Diagonal line pattern for high contrast',
      forbiddenSquareStyle: {
        fillColor: '#666666',
        opacity: 0.6,
        pattern: 'diagonal-lines'
      }
    }
  },
  
  // Default theme selection
  defaultTheme: 'grid-fade',
  
  // Test configuration
  testPuzzle: {
    id: '8x8-constraint-test',
    size: 8,
    prePlacedNeighbors: [
      { row: 7, col: 1 },
      { row: 3, col: 4 },
      { row: 4, col: 3 }
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