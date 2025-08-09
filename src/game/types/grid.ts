export type GridPosition = {
  row: number;
  col: number;
};

export type DeadEndMarker = {
  position: GridPosition;
  dependencyChain: Set<string>; // Set of position keys - permutation invariant
};

export type GridState = {
  size: number;
  neighbors: Set<string>;
  prePlacedNeighbors: Set<string>;
  forbiddenSquares: Set<string>;
  forcedMoves: Set<string>;
  deadEnds: DeadEndMarker[]; // Currently active/visible dead end instances (computed)
  deadEndData: DeadEndMarker[]; // All historical dead end data (never deleted)
  moveHistory: GridPosition[];
  constraintWarning?: {
    overConstrainedRows: number[];
    overConstrainedColumns: number[];
  };
  inspectionMode?: {
    type: 'neighbor' | 'forbidden-square';
    position: GridPosition;
  };
  isComplete?: boolean;
};

export type GridCell = {
  position: GridPosition;
  hasNeighbor: boolean;
  isDisabled: boolean;
};

export function positionToKey(pos: GridPosition): string {
  return `${pos.row},${pos.col}`;
}

export function keyToPosition(key: string): GridPosition {
  const [row, col] = key.split(',').map(Number);
  return { row, col };
}

export function createGridState(size: number): GridState {
  return {
    size,
    neighbors: new Set(),
    prePlacedNeighbors: new Set(),
    forbiddenSquares: new Set(),
    forcedMoves: new Set(),
    deadEnds: [], // Computed dynamically
    deadEndData: [], // Permanent historical record
    moveHistory: [],
  };
}

export function getMostRecentNeighbor(gridState: GridState): GridPosition | null {
  if (gridState.moveHistory.length === 0) return null;
  return gridState.moveHistory[gridState.moveHistory.length - 1];
}