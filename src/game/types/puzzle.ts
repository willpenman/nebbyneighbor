import { GridPosition } from './grid.js';

export type SymmetryClass = 'iden' | 'dia1' | 'ort1' | 'rot2' | 'dia2' | 'rot4' | 'ort2' | 'full' | 'near';

export type PuzzleConfig = {
  id: string;
  size: number;
  prePlacedNeighbors: GridPosition[];
  metadata: {
    symmetryClass: SymmetryClass;
    difficulty?: number;
  };
};

export type PuzzleState = {
  config: PuzzleConfig;
  playerPlacedNeighbors: Set<string>;
  isComplete: boolean;
};