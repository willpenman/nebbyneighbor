// Issue #7: Diagnostic Inspection Mode Configuration

const CONFIG = {
  testPuzzle: {
    id: '8x8-inspection-test',
    size: 8,
    prePlacedNeighbors: [
      { row: 7, col: 1 },   // Bottom left area
      { row: 3, col: 4 },   // Center
      { row: 4, col: 3 }    // Near center, creates constraints
    ],
    metadata: {
      symmetryClass: 'iden',
      description: 'Test puzzle for inspection mode with clear constraint relationships'
    }
  },

  // Line styling options for testing different visual treatments
  lineStyles: {
    // Design Option 1: Technical Precision
    option1: {
      solidLineColor: '#9D8B6F',    // Darker warm brown from theme palette
      dashedLineColor: '#B5A186',   // Lighter companion shade
      lineWidth: 3,                 // Thicker for technical clarity
      dashPattern: [4, 2],          // Tight, blueprint-like precision
      opacity: 1.0,                 // Full opacity for clarity
      description: 'Technical precision with earthy tones - thick lines, tight dashes for analytical players'
    },

    // Design Option 2: Gentle Learning
    option2: {
      solidLineColor: '#A67C5A',    // Soft warm tone from theme
      dashedLineColor: '#C4B798',   // Very gentle, muted extension
      lineWidth: 1.5,               // Thinner, less overwhelming
      dashPattern: [8, 6],          // Longer, softer dashes
      opacity: 0.75,                // Subtle transparency for gentleness
      description: 'Gentle learning mode - thin, soft lines with transparency for beginners'
    },

    // Design Option 3: Soft Organic (matches theme perfectly)
    option3: {
      solidLineColor: '#8B7355',    // Primary neighbor color
      dashedLineColor: '#A67C5A',   // Secondary neighbor shade
      lineWidth: 2,                 // Medium weight
      dashPattern: [6, 4],          // Natural, organic rhythm
      opacity: 0.9,                 // Slight softness
      description: 'Soft organic harmony - matches design theme with natural proportions'
    }
  },

  // Test scenarios for validation
  testScenarios: [
    {
      name: 'neighbor-inspection',
      description: 'Click on any neighbor to see its constraint relationships',
      expectedBehavior: 'Solid lines to other neighbors, dashed lines to forbidden squares'
    },
    {
      name: 'forbidden-square-inspection', 
      description: 'Click on grayed-out squares to see why they are forbidden',
      expectedBehavior: 'Lines showing which neighbor pairs make this square forbidden'
    },
    {
      name: 'automatic-inspection',
      description: 'Place a new neighbor to see automatic inspection mode',
      expectedBehavior: 'Immediate display of constraint lines for newly placed neighbor'
    },
    {
      name: 'exit-inspection',
      description: 'Click outside grid or on empty square to exit inspection',
      expectedBehavior: 'All constraint lines disappear, return to normal view'
    }
  ]
};

// Export for DevOverlay system
export const issueConfig = {
  title: 'Issue #7: Diagnostic Inspection Mode',
  description: 'Interactive line visualization showing constraint relationships when placing neighbors or clicking forbidden squares',
  testPuzzle: CONFIG.testPuzzle,
  themeVariants: {
    option1: {
      name: 'Technical Precision',
      description: 'Thick lines with tight dashes for analytical clarity',
      forbiddenSquareStyle: CONFIG.lineStyles.option1
    },
    option2: {
      name: 'Gentle Learning',
      description: 'Thin, soft lines with transparency for beginners',
      forbiddenSquareStyle: CONFIG.lineStyles.option2
    },
    option3: {
      name: 'Soft Organic',
      description: 'Natural harmony matching the game\'s aesthetic',
      forbiddenSquareStyle: CONFIG.lineStyles.option3
    }
  },
  defaultTheme: 'option3',
  devFeatures: {
    themeSelector: true,
    resetButton: true,
    debugInfo: true
  }
};

// Also export for window access if needed
if (typeof window !== 'undefined') {
  window.ISSUE_7_CONFIG = CONFIG;
}