import { GridPosition, DeadEndMarker } from './grid.js';

/**
 * Serializable version of DeadEndMarker for localStorage storage
 * Converts Set<string> to string[] for JSON serialization
 */
export type SerializableDeadEndMarker = {
  position: GridPosition;
  dependencyChain: string[]; // Serialized from Set<string>
};

/**
 * Game state that can be persisted and restored
 * Contains only the essential data needed to reconstruct a game session
 */
export type PersistableGameState = {
  size: number;
  neighbors: string[]; // Serialized from Set<string> - player-placed neighbor position keys
  deadEndData: SerializableDeadEndMarker[]; // All historical dead-end discoveries
  moveHistory: GridPosition[]; // Sequence of player moves for undo functionality
};

/**
 * Win record for a completed puzzle
 */
export type WinStatus = {
  hasWon: boolean;
  winningSolution?: GridPosition[]; // The complete set of neighbor positions that solved the puzzle
  completionTimestamp?: number; // When the puzzle was first completed
};

/**
 * Performance statistics for a puzzle (not yet implemented in game logic)
 */
export type PuzzleStats = {
  numDeadEnds?: number; // Total dead-ends encountered during best attempt
  bestNumPlacements?: number; // Minimum moves needed to solve (if won)
  totalAttempts?: number; // Number of times "Play Again" was used
};

/**
 * Complete persistence data for a single puzzle level
 */
export type LevelPersistence = {
  puzzleId: string; // e.g., "puzzle-001"
  puzzleNumber: number; // e.g., 1
  
  // Completion tracking - permanent achievement record
  winStatus: WinStatus;
  
  // Active game state - empty if level completed but not currently in progress
  // This allows players to "Play Again" on solved puzzles while preserving win record
  gameState?: PersistableGameState;
  
  // Performance metrics - for future features
  stats: PuzzleStats;
  
  // Metadata
  lastModified: number; // Timestamp of last save
};

/**
 * Complete player progress data stored in localStorage
 */
export type PlayerProgress = {
  version: string; // Data format version for migration compatibility
  levels: { [puzzleId: string]: LevelPersistence };
  metadata: {
    totalPuzzlesSolved: number;
    lastPlayedPuzzleId?: string;
    createdTimestamp: number;
    lastModified: number;
  };
};

/**
 * Convert GridState data to persistable format
 * Handles serialization of Sets and other non-JSON-serializable data
 */
export function serializeGameState(
  size: number,
  neighbors: Set<string>,
  deadEndData: DeadEndMarker[],
  moveHistory: GridPosition[]
): PersistableGameState {
  return {
    size,
    neighbors: Array.from(neighbors),
    deadEndData: deadEndData.map(marker => ({
      position: marker.position,
      dependencyChain: Array.from(marker.dependencyChain)
    })),
    moveHistory: [...moveHistory] // Create defensive copy
  };
}

/**
 * Convert persistable data back to GridState-compatible format
 * Handles deserialization of Sets and validation
 */
export function deserializeGameState(persistedState: PersistableGameState): {
  size: number;
  neighbors: Set<string>;
  deadEndData: DeadEndMarker[];
  moveHistory: GridPosition[];
} {
  return {
    size: persistedState.size,
    neighbors: new Set(persistedState.neighbors),
    deadEndData: persistedState.deadEndData.map(marker => ({
      position: marker.position,
      dependencyChain: new Set(marker.dependencyChain)
    })),
    moveHistory: [...persistedState.moveHistory] // Create defensive copy
  };
}