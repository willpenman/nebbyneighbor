import { PuzzleConfig } from '../types/puzzle.js';

export const PUZZLE_CATALOG: PuzzleConfig[] = [
  // 4x4 puzzle - level 1 (index 0)
  {
    id: "puzzle-001", 
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
  
  // 4x4 puzzle - level 3 (index 2)
  {
    id: "puzzle-002", 
    size: 4,
    prePlacedNeighbors: [
      { row: 0, col: 2 },
      { row: 2, col: 0 },
      { row: 3, col: 2 }
    ],
    metadata: {
      symmetryClass: 'iden',
      index: 2
    }
  },
  
  // 4x4 puzzle - level 4 (index 3)
  {
    id: "puzzle-003", 
    size: 4,
    prePlacedNeighbors: [
      { row: 0, col: 0 },
      { row: 1, col: 0 }
    ],
    metadata: {
      symmetryClass: 'iden',
      index: 3
    }
  },
  
  // 4x4 puzzle - level 5 (index 4)
  {
    id: "puzzle-004", 
    size: 4,
    prePlacedNeighbors: [
      { row: 2, col: 1 },
      { row: 2, col: 2 }
    ],
    metadata: {
      symmetryClass: 'iden',
      index: 4
    }
  },
  
  // 5x5 puzzle - level 6 (index 5)
  {
    id: "puzzle-005",
    size: 5,
    prePlacedNeighbors: [
      { row: 0, col: 1 },
      { row: 0, col: 3 },
      { row: 1, col: 1 },
      { row: 3, col: 2 },
      { row: 4, col: 4 }
    ],
    metadata: {
      symmetryClass: 'iden',
      index: 5
    }
  },
  
  // 5x5 puzzle - level 7 (index 6)
  {
    id: "puzzle-006",
    size: 5,
    prePlacedNeighbors: [
      { row: 0, col: 1 },
      { row: 0, col: 2 },
      { row: 1, col: 0 },
      { row: 1, col: 2 }
    ],
    metadata: {
      symmetryClass: 'iden',
      index: 6
    }
  },
  
  // 5x5 puzzle - level 8 (index 7)
  {
    id: "puzzle-007",
    size: 5,
    prePlacedNeighbors: [
      { row: 2, col: 3 },
      { row: 4, col: 1 },
      { row: 4, col: 2 }
    ],
    metadata: {
      symmetryClass: 'iden',
      index: 7
    }
  },
  
  // 5x5 puzzle - level 9 (index 8)
  {
    id: "puzzle-008",
    size: 5,
    prePlacedNeighbors: [
      { row: 1, col: 4 },
      { row: 2, col: 4 }
    ],
    metadata: {
      symmetryClass: 'iden',
      index: 8
    }
  },
  
  // 8x8 puzzle - level 10 (index 9)
  {
    id: "puzzle-009",
    size: 8,
    prePlacedNeighbors: [
      { row: 7, col: 1 },
      { row: 3, col: 4 },
      { row: 4, col: 3 }
    ],
    metadata: {
      symmetryClass: 'iden',
      index: 9
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