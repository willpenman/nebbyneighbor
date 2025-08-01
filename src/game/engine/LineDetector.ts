import { GridPosition, positionToKey } from '../types/grid.js';

export type LineRepresentation = {
  rise: number;
  run: number;
  // y-intercept represented as: yIntWhole + yIntNum/yIntDenom
  yIntWhole: number;
  yIntNum: number;
  yIntDenom: number;
};

export type LineViolation = {
  line: LineRepresentation;
  neighbors: GridPosition[];
};

export type ConstraintRelationship = {
  neighborPair: [GridPosition, GridPosition];
  line: LineRepresentation;
  forbiddenSquares: GridPosition[];
};

export type InspectionData = {
  inspectedNeighbor: GridPosition;
  constraintRelationships: ConstraintRelationship[];
};

export type ForbiddenSquareInfo = {
  position: GridPosition;
  causedBy: ConstraintRelationship[];
};

export type RowColumnConstraint = {
  type: 'row' | 'column';
  index: number;
  placedCount: number;
  availableCount: number;
  isOverConstrained: boolean;
};

export type ConstraintAnalysis = {
  overConstrainedRows: number[];
  overConstrainedColumns: number[];
  allConstraints: RowColumnConstraint[];
  hasUnsolvableState: boolean;
};

export class LineDetector {
  constructor(private gridSize: number) {}
  
  /**
   * Calculate which empty squares would create three-in-line violations if occupied
   * Returns set of position keys that should be grayed out
   */
  calculateForbiddenSquares(neighbors: Set<string>): Set<string> {
    if (neighbors.size < 2) return new Set();
    
    const neighborPositions = Array.from(neighbors).map(key => {
      const [row, col] = key.split(',').map(Number);
      return { row, col };
    });
    
    const forbiddenSquares = new Set<string>();
    
    // For every pair of existing neighbors, find all grid positions that would 
    // form a line with them (creating a three-in-line violation)
    for (let i = 0; i < neighborPositions.length; i++) {
      for (let j = i + 1; j < neighborPositions.length; j++) {
        const pos1 = neighborPositions[i];
        const pos2 = neighborPositions[j];
        
        const line = this.getLineFromTwoPoints(pos1, pos2);
        
        // Find all grid positions on this line that would create violations
        const forbiddenOnLine = this.findGridPositionsOnLine(line);
        
        for (const pos of forbiddenOnLine) {
          const key = positionToKey(pos);
          // Don't mark squares that already have neighbors
          if (!neighbors.has(key)) {
            forbiddenSquares.add(key);
          }
        }
      }
    }
    
    return forbiddenSquares;
  }
  
  /**
   * Find all grid positions that lie on the given line within grid bounds
   */
  private findGridPositionsOnLine(line: LineRepresentation): GridPosition[] {
    const positions: GridPosition[] = [];
    const { rise, run, yIntWhole } = line;
    
    // Handle vertical line case
    if (rise === 1 && run === 0) {
      const col = yIntWhole;
      if (col >= 0 && col < this.gridSize) {
        for (let row = 0; row < this.gridSize; row++) {
          positions.push({ row, col });
        }
      }
      return positions;
    }
    
    // Handle horizontal line case
    if (rise === 0 && run === 1) {
      const row = yIntWhole;
      if (row >= 0 && row < this.gridSize) {
        for (let col = 0; col < this.gridSize; col++) {
          positions.push({ row, col });
        }
      }
      return positions;
    }
    
    // General case: check all grid positions
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        if (this.isPointOnLine({ row, col }, line)) {
          positions.push({ row, col });
        }
      }
    }
    
    return positions;
  }
  
  /**
   * Get line representation from two points using rise/run approach
   * Handles vertical lines and uses GCD normalization
   */
  private getLineFromTwoPoints(pos1: GridPosition, pos2: GridPosition): LineRepresentation {
    const deltaX = pos2.col - pos1.col;
    const deltaY = pos2.row - pos1.row;
    
    // Handle vertical line case (deltaX = 0)
    if (deltaX === 0) {
      return {
        rise: 1, // Special marker for vertical lines
        run: 0,  // Special marker for vertical lines
        yIntWhole: pos1.col, // x-intercept for vertical lines
        yIntNum: 0,
        yIntDenom: 1
      };
    }
    
    // Handle horizontal line case (deltaY = 0)
    if (deltaY === 0) {
      return {
        rise: 0,
        run: 1,
        yIntWhole: pos1.row, // y-intercept for horizontal lines
        yIntNum: 0,
        yIntDenom: 1
      };
    }
    
    // Normalize using GCD to get reduced form
    const gcd = this.gcd(Math.abs(deltaY), Math.abs(deltaX));
    let rise = deltaY / gcd;
    let run = deltaX / gcd;
    
    // Ensure consistent direction (run > 0, or run = 0 and rise > 0)
    if (run < 0 || (run === 0 && rise < 0)) {
      rise = -rise;
      run = -run;
    }
    
    // Calculate y-intercept as rational number to avoid floating point
    // Line equation: y = (rise/run)x + b
    // Solving for b: b = y - (rise/run)x = (y*run - rise*x) / run
    const numerator = pos1.row * run - rise * pos1.col;
    const denominator = run;
    
    // Split into whole and fractional parts
    const yIntWhole = Math.floor(numerator / denominator);
    const yIntNum = ((numerator % denominator) + denominator) % denominator; // Ensure positive
    const yIntDenom = Math.abs(denominator);
    
    return {
      rise,
      run,
      yIntWhole,
      yIntNum,
      yIntDenom
    };
  }
  
  /**
   * Check if a point lies on the given line
   */
  private isPointOnLine(pos: GridPosition, line: LineRepresentation): boolean {
    const { rise, run, yIntWhole, yIntNum, yIntDenom } = line;
    
    // Handle vertical line case
    if (rise === 1 && run === 0) {
      return pos.col === yIntWhole;
    }
    
    // Handle horizontal line case
    if (rise === 0 && run === 1) {
      return pos.row === yIntWhole;
    }
    
    // General case: check if point satisfies line equation
    // Line equation: y*run = rise*x + yIntWhole*run + yIntNum*run/yIntDenom
    // Rearranged: y*run*yIntDenom = rise*x*yIntDenom + yIntWhole*run*yIntDenom + yIntNum*run
    const leftSide = pos.row * run * yIntDenom;
    const rightSide = rise * pos.col * yIntDenom + yIntWhole * run * yIntDenom + yIntNum * run;
    
    return leftSide === rightSide;
  }
  
  /**
   * Get inspection data for a specific neighbor showing all its constraint relationships
   */
  getInspectionData(inspectedNeighbor: GridPosition, allNeighbors: Set<string>): InspectionData {
    const inspectedKey = positionToKey(inspectedNeighbor);
    const neighborPositions = Array.from(allNeighbors).map(key => {
      const [row, col] = key.split(',').map(Number);
      return { row, col };
    });
    
    const constraintRelationships: ConstraintRelationship[] = [];
    
    // Find all neighbors that form constraint relationships with the inspected neighbor
    for (const otherNeighbor of neighborPositions) {
      const otherKey = positionToKey(otherNeighbor);
      if (otherKey === inspectedKey) continue;
      
      const line = this.getLineFromTwoPoints(inspectedNeighbor, otherNeighbor);
      const forbiddenSquares = this.findGridPositionsOnLine(line)
        .filter(pos => {
          const key = positionToKey(pos);
          return !allNeighbors.has(key); // Only include empty squares
        });
      
      // Include ALL neighbor relationships, even if they create no forbidden squares
      constraintRelationships.push({
        neighborPair: [inspectedNeighbor, otherNeighbor],
        line,
        forbiddenSquares
      });
    }
    
    return {
      inspectedNeighbor,
      constraintRelationships
    };
  }
  
  /**
   * Get information about why a forbidden square is forbidden
   */
  getForbiddenSquareInfo(forbiddenSquare: GridPosition, allNeighbors: Set<string>): ForbiddenSquareInfo {
    const neighborPositions = Array.from(allNeighbors).map(key => {
      const [row, col] = key.split(',').map(Number);
      return { row, col };
    });
    
    const causedBy: ConstraintRelationship[] = [];
    
    // Find all neighbor pairs whose line passes through this forbidden square
    for (let i = 0; i < neighborPositions.length; i++) {
      for (let j = i + 1; j < neighborPositions.length; j++) {
        const pos1 = neighborPositions[i];
        const pos2 = neighborPositions[j];
        const line = this.getLineFromTwoPoints(pos1, pos2);
        
        if (this.isPointOnLine(forbiddenSquare, line)) {
          const forbiddenSquares = this.findGridPositionsOnLine(line)
            .filter(pos => {
              const key = positionToKey(pos);
              return !allNeighbors.has(key);
            });
          
          causedBy.push({
            neighborPair: [pos1, pos2],
            line,
            forbiddenSquares
          });
        }
      }
    }
    
    return {
      position: forbiddenSquare,
      causedBy
    };
  }

  /**
   * Analyze row and column constraints to detect unsolvable states
   * Based on the 2n mathematical limit (max 2 neighbors per row/column)
   */
  analyzeRowColumnConstraints(allNeighbors: Set<string>, forbiddenSquares: Set<string>): ConstraintAnalysis {
    const neighborPositions = Array.from(allNeighbors).map(key => {
      const [row, col] = key.split(',').map(Number);
      return { row, col };
    });
    
    const overConstrainedRows: number[] = [];
    const overConstrainedColumns: number[] = [];
    const allConstraints: RowColumnConstraint[] = [];
    
    // Analyze each row
    for (let row = 0; row < this.gridSize; row++) {
      const placedCount = neighborPositions.filter(pos => pos.row === row).length;
      const availableCount = this.countAvailableSquaresInRow(row, allNeighbors, forbiddenSquares);
      const totalPossible = placedCount + availableCount;
      const isOverConstrained = totalPossible < 2;
      
      if (isOverConstrained) {
        overConstrainedRows.push(row);
      }
      
      allConstraints.push({
        type: 'row',
        index: row,
        placedCount,
        availableCount,
        isOverConstrained
      });
    }
    
    // Analyze each column
    for (let col = 0; col < this.gridSize; col++) {
      const placedCount = neighborPositions.filter(pos => pos.col === col).length;
      const availableCount = this.countAvailableSquaresInColumn(col, allNeighbors, forbiddenSquares);
      const totalPossible = placedCount + availableCount;
      const isOverConstrained = totalPossible < 2;
      
      if (isOverConstrained) {
        overConstrainedColumns.push(col);
      }
      
      allConstraints.push({
        type: 'column',
        index: col,
        placedCount,
        availableCount,
        isOverConstrained
      });
    }
    
    return {
      overConstrainedRows,
      overConstrainedColumns,
      allConstraints,
      hasUnsolvableState: overConstrainedRows.length > 0 || overConstrainedColumns.length > 0
    };
  }
  
  /**
   * Count available (non-forbidden, non-occupied) squares in a specific row
   */
  private countAvailableSquaresInRow(row: number, allNeighbors: Set<string>, forbiddenSquares: Set<string>): number {
    let count = 0;
    for (let col = 0; col < this.gridSize; col++) {
      const key = positionToKey({ row, col });
      if (!allNeighbors.has(key) && !forbiddenSquares.has(key)) {
        count++;
      }
    }
    return count;
  }
  
  /**
   * Count available (non-forbidden, non-occupied) squares in a specific column
   */
  private countAvailableSquaresInColumn(col: number, allNeighbors: Set<string>, forbiddenSquares: Set<string>): number {
    let count = 0;
    for (let row = 0; row < this.gridSize; row++) {
      const key = positionToKey({ row, col });
      if (!allNeighbors.has(key) && !forbiddenSquares.has(key)) {
        count++;
      }
    }
    return count;
  }

  /**
   * Get available squares in a specific row (extends countAvailableSquaresInRow to return positions)
   */
  private getAvailableSquaresInRow(row: number, allNeighbors: Set<string>, forbiddenSquares: Set<string>): GridPosition[] {
    const available: GridPosition[] = [];
    for (let col = 0; col < this.gridSize; col++) {
      const key = positionToKey({ row, col });
      if (!allNeighbors.has(key) && !forbiddenSquares.has(key)) {
        available.push({ row, col });
      }
    }
    return available;
  }

  /**
   * Get available squares in a specific column (extends countAvailableSquaresInColumn to return positions)
   */
  private getAvailableSquaresInColumn(col: number, allNeighbors: Set<string>, forbiddenSquares: Set<string>): GridPosition[] {
    const available: GridPosition[] = [];
    for (let row = 0; row < this.gridSize; row++) {
      const key = positionToKey({ row, col });
      if (!allNeighbors.has(key) && !forbiddenSquares.has(key)) {
        available.push({ row, col });
      }
    }
    return available;
  }

  /**
   * Detect forced moves: positions that must be filled to avoid unsolvable states
   * 
   * Forced moves occur when:
   * - A row/column has 1 placed neighbor and only 1 available square (must fill that square)
   * - A row/column has 0 placed neighbors and only 2 available squares (must fill both squares)
   */
  detectForcedMoves(allNeighbors: Set<string>, forbiddenSquares: Set<string>): GridPosition[] {
    const neighborPositions = Array.from(allNeighbors).map(key => {
      const [row, col] = key.split(',').map(Number);
      return { row, col };
    });

    const forcedMoves: GridPosition[] = [];
    const forcedMovesSet = new Set<string>();

    // Check each row for forced moves
    for (let row = 0; row < this.gridSize; row++) {
      const placedCount = neighborPositions.filter(pos => pos.row === row).length;
      const availableSquares = this.getAvailableSquaresInRow(row, allNeighbors, forbiddenSquares);
      const availableCount = availableSquares.length;

      // Case 1: 1 placed, 1 available -> must fill the available square
      if (placedCount === 1 && availableCount === 1) {
        const key = positionToKey(availableSquares[0]);
        if (!forcedMovesSet.has(key)) {
          forcedMoves.push(availableSquares[0]);
          forcedMovesSet.add(key);
        }
      }
      // Case 2: 0 placed, 2 available -> must fill both squares
      else if (placedCount === 0 && availableCount === 2) {
        for (const square of availableSquares) {
          const key = positionToKey(square);
          if (!forcedMovesSet.has(key)) {
            forcedMoves.push(square);
            forcedMovesSet.add(key);
          }
        }
      }
    }

    // Check each column for forced moves
    for (let col = 0; col < this.gridSize; col++) {
      const placedCount = neighborPositions.filter(pos => pos.col === col).length;
      const availableSquares = this.getAvailableSquaresInColumn(col, allNeighbors, forbiddenSquares);
      const availableCount = availableSquares.length;

      // Case 1: 1 placed, 1 available -> must fill the available square
      if (placedCount === 1 && availableCount === 1) {
        const key = positionToKey(availableSquares[0]);
        if (!forcedMovesSet.has(key)) {
          forcedMoves.push(availableSquares[0]);
          forcedMovesSet.add(key);
        }
      }
      // Case 2: 0 placed, 2 available -> must fill both squares
      else if (placedCount === 0 && availableCount === 2) {
        for (const square of availableSquares) {
          const key = positionToKey(square);
          if (!forcedMovesSet.has(key)) {
            forcedMoves.push(square);
            forcedMovesSet.add(key);
          }
        }
      }
    }

    return forcedMoves;
  }

  /**
   * Calculate Greatest Common Divisor
   */
  private gcd(a: number, b: number): number {
    while (b !== 0) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return a;
  }
}