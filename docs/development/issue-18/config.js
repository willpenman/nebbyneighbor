export const issueConfig = {
  title: "Highlight most recently placed neighbor",
  description: "Visual highlighting for the most recent neighbor placement, similar to move highlighting in chess games",
  
  themeVariants: {
    'subtle-glow': {
      name: 'Subtle Glow',
      description: 'Soft outer glow effect that complements the organic aesthetic',
      highlightStyle: {
        type: 'glow',
        glowColor: '#8B7355',
        glowRadius: 8,
        glowOpacity: 0.6,
        innerGlowColor: '#D4C4A8',
        innerGlowRadius: 4
      }
    },
    
    'warm-border': {
      name: 'Warm Border',
      description: 'Thicker border with warm earth tone that stands out clearly',
      highlightStyle: {
        type: 'border',
        borderColor: '#A0522D', // Sienna - warmer than existing neighbor color
        borderWidth: 3,
        borderOpacity: 0.9
      }
    },
    
    'square-highlight': {
      name: 'Square Highlight',
      description: 'Highlights the entire grid square behind the most recent neighbor',
      highlightStyle: {
        type: 'square',
        backgroundColor: '#A8D4A8', // Success green - positive semantic meaning
        backgroundOpacity: 0.3, // More prominent
        borderColor: null, // No border
        borderWidth: 0,
        borderOpacity: 0
      }
    }
  },
  
  defaultTheme: 'subtle-glow',
  
  testPuzzle: {
    size: 4,
    prePlacedNeighbors: [
      { row: 0, col: 0 },
      { row: 3, col: 3 }
    ]
  },
  
  devFeatures: {
    themeSelector: true,
    resetButton: true,
    debugInfo: true
  }
};