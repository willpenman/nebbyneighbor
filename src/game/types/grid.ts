export type GridPosition = {
  row: number;
  col: number;
};

export type GridState = {
  size: number;
  neighbors: Set<string>;
  prePlacedNeighbors: Set<string>;
  forbiddenSquares: Set<string>;
  constraintWarning?: {
    overConstrainedRows: number[];
    overConstrainedColumns: number[];
  };
  inspectionMode?: {
    type: 'neighbor' | 'forbidden-square';
    position: GridPosition;
  };
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
  };
}