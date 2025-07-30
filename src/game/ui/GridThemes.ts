export interface GridTheme {
  name: string;
  gridLineColor: string;
  gridLineWidth: number;
  neighborColor: string;
  neighborRadius: number;
  backgroundColor?: string;
  neighborStyle: 'circle' | 'rounded-square';
  prePlacedNeighborColor: string;
  prePlacedNeighborStyle: 'solid' | 'outline' | 'filled-outline';
  // Forbidden square styling
  forbiddenSquareStyle: 'subtle-overlay' | 'grid-fade' | 'cross-hatch';
  forbiddenSquareColor: string;
  forbiddenSquareOpacity: number;
}

export const themes: Record<string, GridTheme> = {
  minimal: {
    name: 'Clean Minimal',
    gridLineColor: '#e0e0e0',
    gridLineWidth: 1,
    neighborColor: '#3498db',
    neighborRadius: 0.25,
    neighborStyle: 'circle',
    prePlacedNeighborColor: '#2c3e50',
    prePlacedNeighborStyle: 'solid',
    forbiddenSquareStyle: 'subtle-overlay',
    forbiddenSquareColor: '#bdc3c7',
    forbiddenSquareOpacity: 0.4
  },
  
  bold: {
    name: 'Bold Geometric', 
    gridLineColor: '#34495e',
    gridLineWidth: 2,
    neighborColor: '#e74c3c',
    neighborRadius: 0.35,
    neighborStyle: 'rounded-square',
    prePlacedNeighborColor: '#8e44ad',
    prePlacedNeighborStyle: 'outline',
    forbiddenSquareStyle: 'cross-hatch',
    forbiddenSquareColor: '#95a5a6',
    forbiddenSquareOpacity: 0.6
  },
  
  organic: {
    name: 'Soft Organic',
    gridLineColor: '#d4b59a',
    gridLineWidth: 1.5,
    neighborColor: '#27ae60',
    neighborRadius: 0.3,
    backgroundColor: '#fefefe',
    neighborStyle: 'circle',
    prePlacedNeighborColor: '#8B4513',
    prePlacedNeighborStyle: 'filled-outline',
    forbiddenSquareStyle: 'grid-fade',
    forbiddenSquareColor: '#e8d5c3',
    forbiddenSquareOpacity: 0.5
  }
};