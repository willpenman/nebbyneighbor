import { PuzzleConfig } from '../types/puzzle.js';

export const PUZZLE_CATALOG: PuzzleConfig[] = [
  // 4x4 puzzle - easiest (user specified)
  {
    id: "4x4-002", 
    size: 4,
    prePlacedNeighbors: [
      { row: 1, col: 3 },
      { row: 3, col: 1 },
      { row: 3, col: 3 }
    ],
    metadata: {
      symmetryClass: 'iden',
      index: 1
    }
  },
  
  // 5x5 puzzle - medium (user specified)
  {
    id: "5x5-001",
    size: 5,
    prePlacedNeighbors: [
      { row: 1, col: 4 },
      { row: 2, col: 4 }
    ],
    metadata: {
      symmetryClass: 'iden',
      index: 2
    }
  },
  
  // 8x8 puzzle - hardest (current default)
  {
    id: "8x8-001",
    size: 8,
    prePlacedNeighbors: [
      { row: 7, col: 1 },
      { row: 3, col: 4 },
      { row: 4, col: 3 }
    ],
    metadata: {
      symmetryClass: 'iden',
      index: 10
    }
  }
];

export function getPuzzleById(id: string): PuzzleConfig | null {
  return PUZZLE_CATALOG.find(puzzle => puzzle.id === id) || null;
}

export function getDefaultPuzzle(): PuzzleConfig {
  return PUZZLE_CATALOG[0];
}

export function getPuzzleByIndex(index: number): PuzzleConfig | null {
  return PUZZLE_CATALOG[index] || null;
}

export function getPuzzleCount(): number {
  return PUZZLE_CATALOG.length;
}

export function getPuzzleIndex(puzzleId: string): number {
  return PUZZLE_CATALOG.findIndex(puzzle => puzzle.id === puzzleId);
}