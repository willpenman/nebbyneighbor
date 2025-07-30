export interface GridTheme {
  name: string;
  gridLineColor: string;
  gridLineWidth: number;
  neighborColor: string;
  neighborRadius: number;
  backgroundColor?: string;
  neighborStyle: 'circle' | 'rounded-square';
}

export const themes: Record<string, GridTheme> = {
  minimal: {
    name: 'Clean Minimal',
    gridLineColor: '#e0e0e0',
    gridLineWidth: 1,
    neighborColor: '#3498db',
    neighborRadius: 0.25,
    neighborStyle: 'circle'
  },
  
  bold: {
    name: 'Bold Geometric', 
    gridLineColor: '#34495e',
    gridLineWidth: 2,
    neighborColor: '#e74c3c',
    neighborRadius: 0.35,
    neighborStyle: 'rounded-square'
  },
  
  organic: {
    name: 'Soft Organic',
    gridLineColor: '#d4b59a',
    gridLineWidth: 1.5,
    neighborColor: '#27ae60',
    neighborRadius: 0.3,
    backgroundColor: '#fefefe',
    neighborStyle: 'circle'
  }
};