import { GridPosition } from './grid.js';

export type SymmetryClass = 'iden' | 'dia1' | 'ort1' | 'rot2' | 'dia2' | 'rot4' | 'ort2' | 'full' | 'near';

export type PuzzleConfig = {
  id: string;
  puzzleNumber: number;
  size: number;
  symmetryClass: SymmetryClass;
  prePlacedNeighbors: GridPosition[];
};

export type PuzzleState = {
  config: PuzzleConfig;
  playerPlacedNeighbors: Set<string>;
  isComplete: boolean;
};