export const issueConfig = {
  title: 'Early Warning System for Unsolvable States',
  description: 'Row/column constraint analysis with visual warning designs',
  
  themeVariants: {
    'gameplay-stopping': {
      name: 'Gameplay-Stopping Alert',
      description: 'Modal overlay with explanation and undo suggestion - blocks all interaction until resolved',
      override: {
        warningStyle: 'modal',
        showOverlay: true,
        blockInteraction: true,
        showUndoSuggestion: true,
        modalBackgroundColor: 'rgba(139, 115, 85, 0.9)', // Semi-transparent organic brown for modal overlay only
        textColor: '#faf7f2',
        borderColor: '#8B7355',
        messageText: 'Puzzle cannot be completed! Some rows or columns cannot fit 2 neighbors.',
        undoText: 'Try undoing your last move'
      }
    },
    
    'warning-indicator': {
      name: 'Warning Indicator with Explanation',
      description: 'Non-blocking ⚠️ indicator outside grid with hover/click details',
      override: {
        warningStyle: 'indicator',
        showOverlay: false,
        blockInteraction: false,
        indicatorPosition: 'top-right',
        iconColor: '#D2691E', // Warm orange warning
        tooltipBackgroundColor: '#faf7f2',
        textColor: '#5d4e37',
        borderColor: '#d4c4a8',
        messageText: 'Warning: This puzzle state cannot be completed',
        detailsText: 'Some rows or columns cannot fit the required 2 neighbors'
      }
    },
    
    'subtle-row-column': {
      name: 'Subtle Row/Column Headers',
      description: 'Visual treatment of affected row/column headers with problem indication',
      override: {
        warningStyle: 'headers',
        showOverlay: false,
        blockInteraction: false,
        highlightRows: true,
        highlightColumns: true,
        headerWarningColor: '#CD853F', // Sandy brown for subtle emphasis
        headerBackgroundColor: 'rgba(205, 133, 63, 0.2)',
        pulseAnimation: true,
        showRowColumnNumbers: true
      }
    }
  },
  
  defaultTheme: 'warning-indicator',
  
  // Test puzzle designed to easily trigger over-constrained states
  testPuzzle: {
    id: 'constraint-test-6x6',
    size: 6,
    prePlacedNeighbors: [
      { row: 0, col: 0 }, // Forces constraint on row 0 and column 0
      { row: 0, col: 5 }, // Second neighbor in row 0 - now row 0 is at max
      { row: 5, col: 0 }, // Second neighbor in column 0 - now column 0 is at max
    ],
    metadata: {
      index: 'Constraint Test',
      title: 'Row/Column Warning Test',
      description: 'Designed to easily trigger over-constrained warnings'
    }
  },
  
  devFeatures: {
    themeSelector: true,
    debugInfo: true,
    resetButton: true,
    showConstraintInfo: true,
    showRowColumnAnalysis: true,
    logConstraintChanges: true,
    allowWarningToggle: true
  }
};