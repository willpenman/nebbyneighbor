import { 
  PlayerProgress, 
  serializeGameState, 
  deserializeGameState,
  PuzzleStats 
} from '../types/persistence.js';
import { GridPosition, DeadEndMarker } from '../types/grid.js';

/**
 * Manages player progress persistence using localStorage
 * Handles saving/loading game state, win records, and statistics
 */
export class PersistenceManager {
  private static readonly STORAGE_KEY = 'nebby-neighbor-progress';
  private static readonly CURRENT_VERSION = '1.0.0';
  
  private progress: PlayerProgress | null = null;

  constructor() {
    this.loadProgress();
  }

  /**
   * Initialize or load player progress from localStorage
   */
  private loadProgress(): void {
    try {
      const stored = localStorage.getItem(PersistenceManager.STORAGE_KEY);
      if (!stored) {
        this.progress = this.createEmptyProgress();
        this.saveProgress();
        return;
      }

      const parsed = JSON.parse(stored) as PlayerProgress;
      
      // Validate data structure and handle version migrations if needed
      if (this.validateProgress(parsed)) {
        this.progress = parsed;
      } else {
        console.warn('Invalid progress data found, creating fresh progress');
        this.progress = this.createEmptyProgress();
        this.saveProgress();
      }
    } catch (error) {
      console.error('Failed to load progress from localStorage:', error);
      this.progress = this.createEmptyProgress();
      this.saveProgress();
    }
  }

  /**
   * Create empty progress structure for new players
   */
  private createEmptyProgress(): PlayerProgress {
    const now = Date.now();
    return {
      version: PersistenceManager.CURRENT_VERSION,
      levels: {},
      metadata: {
        totalPuzzlesSolved: 0,
        createdTimestamp: now,
        lastModified: now
      }
    };
  }

  /**
   * Validate progress data structure
   */
  private validateProgress(progress: any): progress is PlayerProgress {
    return (
      progress &&
      typeof progress === 'object' &&
      typeof progress.version === 'string' &&
      typeof progress.levels === 'object' &&
      typeof progress.metadata === 'object' &&
      typeof progress.metadata.totalPuzzlesSolved === 'number'
    );
  }

  /**
   * Save current progress to localStorage
   */
  private saveProgress(): void {
    if (!this.progress) return;

    try {
      this.progress.metadata.lastModified = Date.now();
      localStorage.setItem(PersistenceManager.STORAGE_KEY, JSON.stringify(this.progress));
    } catch (error) {
      console.error('Failed to save progress to localStorage:', error);
      // Could implement fallback strategies here (e.g., compression, cleanup of old data)
    }
  }

  /**
   * Save current game state for a puzzle
   * Call this whenever the player makes a significant move
   */
  public saveGameState(
    puzzleId: string,
    puzzleNumber: number,
    size: number,
    neighbors: Set<string>,
    deadEndData: DeadEndMarker[],
    moveHistory: GridPosition[]
  ): void {
    if (!this.progress) return;

    const gameState = serializeGameState(size, neighbors, deadEndData, moveHistory);
    
    // Initialize level record if it doesn't exist
    if (!this.progress.levels[puzzleId]) {
      this.progress.levels[puzzleId] = {
        puzzleId,
        puzzleNumber,
        winStatus: { hasWon: false },
        stats: {},
        lastModified: Date.now()
      };
    }

    // Update game state
    this.progress.levels[puzzleId].gameState = gameState;
    this.progress.levels[puzzleId].lastModified = Date.now();
    this.progress.metadata.lastPlayedPuzzleId = puzzleId;

    this.saveProgress();
  }

  /**
   * Load saved game state for a puzzle
   */
  public loadGameState(puzzleId: string): {
    size: number;
    neighbors: Set<string>;
    deadEndData: DeadEndMarker[];
    moveHistory: GridPosition[];
  } | null {
    if (!this.progress?.levels[puzzleId]?.gameState) return null;

    try {
      return deserializeGameState(this.progress.levels[puzzleId].gameState!);
    } catch (error) {
      console.error(`Failed to deserialize game state for puzzle ${puzzleId}:`, error);
      return null;
    }
  }

  /**
   * Record a puzzle completion
   */
  public recordWin(
    puzzleId: string,
    puzzleNumber: number,
    winningSolution: GridPosition[]
  ): void {
    if (!this.progress) return;

    // Initialize level record if it doesn't exist
    if (!this.progress.levels[puzzleId]) {
      this.progress.levels[puzzleId] = {
        puzzleId,
        puzzleNumber,
        winStatus: { hasWon: false },
        stats: {},
        lastModified: Date.now()
      };
    }

    const levelData = this.progress.levels[puzzleId];
    const isFirstWin = !levelData.winStatus.hasWon;

    // Record the win
    levelData.winStatus = {
      hasWon: true,
      winningSolution: [...winningSolution], // Defensive copy
      completionTimestamp: levelData.winStatus.completionTimestamp || Date.now()
    };

    // Clear game state since puzzle is completed
    levelData.gameState = undefined;
    levelData.lastModified = Date.now();

    // Update global statistics
    if (isFirstWin) {
      this.progress.metadata.totalPuzzlesSolved += 1;
    }

    this.saveProgress();
  }

  /**
   * Clear game state when "Play Again" is pressed
   * Preserves win status but removes active game state
   */
  public clearGameState(puzzleId: string): void {
    if (!this.progress?.levels[puzzleId]) return;

    this.progress.levels[puzzleId].gameState = undefined;
    this.progress.levels[puzzleId].lastModified = Date.now();
    this.saveProgress();
  }

  /**
   * Check if a puzzle has been completed
   */
  public hasCompletedPuzzle(puzzleId: string): boolean {
    return this.progress?.levels[puzzleId]?.winStatus.hasWon || false;
  }

  /**
   * Get winning solution for a completed puzzle
   */
  public getWinningSolution(puzzleId: string): GridPosition[] | null {
    return this.progress?.levels[puzzleId]?.winStatus.winningSolution || null;
  }

  /**
   * Check if a puzzle has active game state
   */
  public hasActiveGameState(puzzleId: string): boolean {
    return !!(this.progress?.levels[puzzleId]?.gameState);
  }

  /**
   * Get player statistics
   */
  public getPlayerStats(): {
    totalSolved: number;
    totalAttempted: number;
    lastPlayedPuzzleId?: string;
  } {
    if (!this.progress) {
      return { totalSolved: 0, totalAttempted: 0 };
    }

    return {
      totalSolved: this.progress.metadata.totalPuzzlesSolved,
      totalAttempted: Object.keys(this.progress.levels).length,
      lastPlayedPuzzleId: this.progress.metadata.lastPlayedPuzzleId
    };
  }

  /**
   * Get the last played puzzle ID for resuming player's session
   */
  public getLastPlayedPuzzleId(): string | null {
    return this.progress?.metadata.lastPlayedPuzzleId || null;
  }

  /**
   * Update the current level (last played puzzle) without requiring game state
   * Call this when a player views a level, even if they don't make moves
   */
  public updateCurrentLevel(puzzleId: string, puzzleNumber: number): void {
    if (!this.progress) return;

    // Initialize level record if it doesn't exist (but don't add game state)
    if (!this.progress.levels[puzzleId]) {
      this.progress.levels[puzzleId] = {
        puzzleId,
        puzzleNumber,
        winStatus: { hasWon: false },
        stats: {},
        lastModified: Date.now()
      };
    }

    // Update the last played puzzle (current level)
    this.progress.metadata.lastPlayedPuzzleId = puzzleId;
    this.progress.levels[puzzleId].lastModified = Date.now();

    this.saveProgress();
  }

  /**
   * Update puzzle statistics (for future features)
   */
  public updateStats(puzzleId: string, stats: Partial<PuzzleStats>): void {
    if (!this.progress?.levels[puzzleId]) return;

    this.progress.levels[puzzleId].stats = {
      ...this.progress.levels[puzzleId].stats,
      ...stats
    };
    this.progress.levels[puzzleId].lastModified = Date.now();
    this.saveProgress();
  }

  /**
   * Get estimated storage usage (for debugging)
   */
  public getStorageInfo(): {
    usedBytes: number;
    totalLevels: number;
    levelsSolved: number;
    levelsInProgress: number;
  } {
    if (!this.progress) {
      return { usedBytes: 0, totalLevels: 0, levelsSolved: 0, levelsInProgress: 0 };
    }

    const serialized = JSON.stringify(this.progress);
    const levels = Object.values(this.progress.levels);

    return {
      usedBytes: new Blob([serialized]).size,
      totalLevels: levels.length,
      levelsSolved: levels.filter(level => level.winStatus.hasWon).length,
      levelsInProgress: levels.filter(level => level.gameState).length
    };
  }

  /**
   * Clear all progress (for testing or user reset)
   */
  public clearAllProgress(): void {
    this.progress = this.createEmptyProgress();
    this.saveProgress();
  }
}