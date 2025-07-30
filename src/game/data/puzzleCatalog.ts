import { PuzzleConfig } from '../types/puzzle.js';

export const PUZZLE_CATALOG: PuzzleConfig[] = [
  {
    id: "4x4-001",
    size: 4,
    prePlacedNeighbors: [
      { row: 0, col: 0 },
      { row: 0, col: 1 }
    ],
    metadata: {
      symmetryClass: 'iden'
    }
  },
  {
    id: "4x4-002", 
    size: 4,
    prePlacedNeighbors: [
      { row: 3, col: 1 },
      { row: 3, col: 3 },
      { row: 1, col: 3 }
    ],
    metadata: {
      symmetryClass: 'iden'
    }
  },
  {
    id: "4x4-003",
    size: 4,
    prePlacedNeighbors: [
      { row: 0, col: 2 },
      { row: 2, col: 0 },
      { row: 2, col: 3 }
    ],
    metadata: {
      symmetryClass: 'iden'
    }
  },
  {
    id: "4x4-004",
    size: 4,
    prePlacedNeighbors: [
      { row: 1, col: 2 },
      { row: 2, col: 2 }
    ],
    metadata: {
      symmetryClass: 'iden'
    }
  }
];

export function getPuzzleById(id: string): PuzzleConfig | null {
  return PUZZLE_CATALOG.find(puzzle => puzzle.id === id) || null;
}

export function getDefaultPuzzle(): PuzzleConfig {
  return PUZZLE_CATALOG[0];
}