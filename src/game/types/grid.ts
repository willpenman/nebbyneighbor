export type GridPosition = {
  row: number;
  col: number;
};

export type SkullMarker = {
  position: GridPosition;
  dependencyChain: GridPosition[]; // Snapshot of moveHistory when skull was created
};

export type GridState = {
  size: number;
  neighbors: Set<string>;
  prePlacedNeighbors: Set<string>;
  forbiddenSquares: Set<string>;
  forcedMoves: Set<string>;
  skulls: Set<string>; // Keys of currently active/visible skulls (computed)
  skullData: SkullMarker[]; // All historical skull data (never deleted)
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
    skulls: new Set(), // Computed dynamically
    skullData: [], // Permanent historical record
    moveHistory: [],
  };
}

export function getMostRecentNeighbor(gridState: GridState): GridPosition | null {
  if (gridState.moveHistory.length === 0) return null;
  return gridState.moveHistory[gridState.moveHistory.length - 1];
}