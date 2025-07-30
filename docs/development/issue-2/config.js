// Issue #2: Display clickable 4×4 grid with soft organic theme
// Configuration for development testing

export const issueConfig = {
  title: "Issue #2: Display clickable 4×4 grid with soft organic theme",
  description: "Test basic grid display with theme variations",
  
  // Theme variants for this issue
  themeVariants: {
    'minimal': {
      name: 'Minimal',
      description: 'Clean minimal design with basic colors',
      override: {
        backgroundColor: '#f8f9fa',
        gridLineColor: '#dee2e6',
        neighborColor: '#007bff'
      }
    },
    'organic': {
      name: 'Soft Organic',
      description: 'Warm earth tones with organic feel',
      override: {
        backgroundColor: '#faf7f2',
        gridLineColor: '#d4c4a8',
        neighborColor: '#8B7355'
      }
    },
    'bold': {
      name: 'Bold Contrast',
      description: 'High contrast for accessibility',
      override: {
        backgroundColor: '#ffffff',
        gridLineColor: '#333333',
        neighborColor: '#e74c3c'
      }
    }
  },
  
  // Default theme selection
  defaultTheme: 'organic',
  
  // Test configuration
  testPuzzle: {
    id: '4x4-basic-test',
    size: 4,
    prePlacedNeighbors: [],
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