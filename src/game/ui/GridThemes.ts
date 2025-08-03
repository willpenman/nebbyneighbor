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
  forbiddenSquareStyle: 'forbidden-overlay' | 'grid-fade' | 'cross-hatch';
  forbiddenSquareColor: string;
  forbiddenSquareOpacity: number;
}

// Single evolving theme - started as "Soft Organic" in Issue #2,
// enhanced with pre-placed styling in Issue #4,
// and constraint visualization in Issue #6
export const gridTheme: GridTheme = {
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
};