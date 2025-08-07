import { GridPosition } from '../types/grid.js';
import { SymmetryClass } from '../types/puzzle.js';

// Compressed puzzle data - each line represents one puzzle
// Format: {puzzleNumber}{symmetryClass}{column1Data};{column2Data};...
const COMPRESSED_PUZZLES = [
  '1*;',
  '2x;;2',
  '3-;1;1;',
  '4x2;;01;',
  '5:01;;;',
  '6*;03;;2',
  '7.0;;;0;',
  '8/0;;;3;',
  '9/0;0;;;4',
  '10.01;;;;3',
  '11.1;;3;;3',
  '12x0;;;;;5',
  '13.;4;;;45;',
  '14.0;;;1;3;',
  '15.0;;1;2;;',
  '16.;;24;;;',
  '17o;;;5;03;',
  '18o;5;;;2;',
  '19x;;;3;5;4',
  '20o;;;;03;3',
  '21:;24;;0;;',
  '22:;;2;5;0;',
  '23.03;;;;;6;',
  '24:0;;6;;;;6',
  '25.;2;;;3;6;',
  '26.0;;;;;4;5',
  '27.0;;;1;;1;',
  '28/0;;2;;;;',
  '29:2;;1;;;2;',
  '30:;2;2;;4;;',
  '31.4;;4;;;2;',
  '32:;;;;36;5;5',
  '33:;;;;0;5;5',
  '34.1;;6;;5;;',
  '35:;;01;0;;;5',
  '36:4;5;;;;1;5',
  '37:1;;;5;;6;',
  '38.1;1;;4;;;',
  '39:;;;5;;4;5',
  '40:;;2;;;2;',
  '41.1;;;14;;;',
  '42.12;;6;;;;',
  '43.;;4;1;3;;',
  '44.;15;36;;;;',
  '45/0;;;;;2;0;',
  '46.0;;;1;;6;;',
  '47.0;;1;;;;2;1',
  '48.0;;;;35;;;',
  '49.0;;;;6;;;6',
  '50.0;6;6;;;;;2',
  '51.;6;5;;;;5;',
  '52.;;35;5;;;;',
  '53.0;;;4;;;;6',
  '54.;2;;;5;;;0',
  '55.;3;;;;1;;1',
  '56:0;3;3;;;6;;',
  '57.;;1;;;4;;0',
  '58.0;;1;;;;;14',
  '59/0;;;4;3;;;',
  '60.0;7;;;;;2;',
  '61.0;;1;;;;0;',
  '62/;;2;7;4;;;3',
  '63/5;;;3;;03;;',
  '64.1;;;4;;;;5',
  '65.1;;6;;2;6;;',
  '66.;0;6;;;0;;',
  '67.1;2;;;3;;;',
  '68.1;;1;;5;;;',
  '69.;6;7;;;;27;',
  '70:14;;1;;;;;6',
  '71.1;;;03;;;;',
  '72.4;;37;;;;;',
  '73.1;;;;5;;;2',
  '74.1;0;;;;;5;',
  '75.;;4;;;;;45',
  '76/1;05;;;;1;;',
  '77.;6;;;4;;2;',
  '78.1;16;;;;;;5',
  '79.1;14;;7;;;;',
  '80.1;;;;1;;;4',
  '81:;2;;;2;;5;6',
  '82.1;2;;;;;1;',
  '83.1;;6;;;1;;2',
  '84.1;;;;2;;1;2',
  '85.1;;3;;2;1;;',
  '86:1;6;;;;;1;6',
  '87.1;;1;;;5;;2',
  '88.;4;13;;;;;6',
  '89.1;;;1;2;;;2',
  '90-;;24;;;4;;',
  '91.1;;1;;;7;4;',
  '92:;;;;;3;;56',
  '93.;;;;3;4;;',
  '94.12;;;;;;;3',
  '95.;;;3;;4;;6',
  '96:;1;;;;3;6;',
  '97:2;1;;;5;6;;5',
  '98o;23;;;;1;;3',
  '99o;;17;;17;;;5',
  '100o;;1;1;;;;5'
];

// Symmetry class mapping from symbols to descriptive names
const SYMMETRY_CLASS_MAP: { [key: string]: SymmetryClass } = {
  '.': 'iden',    // asymmetric solutions [none]
  '/': 'dia1',    // solutions with exact one diagonal reflection symmetry
  '-': 'ort1',    // solutions with exact one orthogonal reflection symmetry
  ':': 'rot2',    // solutions with only half rotation symmetry
  'x': 'dia2',    // solutions with both diagonal reflection symmetries
  'c': 'near',    // solutions with quarter rotation symmetry except long diagonals
  'o': 'rot4',    // solutions with quarter rotation symmetry
  '+': 'ort2',    // solutions with both orthogonal reflection symmetries
  '*': 'full'     // solutions with all 8 symmetries of the grid
};

// Parse a compressed puzzle string into component data
function parseCompressedPuzzle(compressed: string): {
  id: string;
  puzzleNumber: number;
  size: number;
  symmetryClass: SymmetryClass;
  prePlacedNeighbors: GridPosition[];
} {
  // Find the symmetry class character
  const symmetryChars = './-:xco+*';
  let symmetryIndex = -1;
  let symmetryChar = '';
  
  for (let i = 0; i < compressed.length; i++) {
    if (symmetryChars.includes(compressed[i])) {
      symmetryIndex = i;
      symmetryChar = compressed[i];
      break;
    }
  }
  
  if (symmetryIndex === -1) {
    throw new Error(`Invalid compressed puzzle format: ${compressed}`);
  }
  
  // Extract puzzle number and column data
  const puzzleNumber = parseInt(compressed.substring(0, symmetryIndex));
  const columnData = compressed.substring(symmetryIndex + 1);
  const columns = columnData.split(';');
  
  // Size is number of columns (including empty ones represented by semicolons)
  const size = columns.length;
  
  // Parse pre-placed neighbors
  const prePlacedNeighbors: GridPosition[] = [];
  
  for (let col = 0; col < columns.length; col++) {
    const columnStr = columns[col];
    for (let charIndex = 0; charIndex < columnStr.length; charIndex++) {
      const char = columnStr[charIndex];
      let row: number;
      
      // Convert character to row number (0-9, then A=10, B=11, etc.)
      if (char >= '0' && char <= '9') {
        row = parseInt(char);
      } else if (char >= 'A' && char <= 'Z') {
        row = char.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
      } else {
        throw new Error(`Invalid character in compressed puzzle: ${char}`);
      }
      
      prePlacedNeighbors.push({ row, col });
    }
  }
  
  return {
    id: `puzzle-${puzzleNumber.toString().padStart(3, '0')}`,
    puzzleNumber,
    size,
    symmetryClass: SYMMETRY_CLASS_MAP[symmetryChar],
    prePlacedNeighbors
  };
}

export function getPuzzleById(id: string) {
  const index = COMPRESSED_PUZZLES.findIndex((compressed) => {
    const parsed = parseCompressedPuzzle(compressed);
    return parsed.id === id;
  });
  
  if (index === -1) return null;
  return parseCompressedPuzzle(COMPRESSED_PUZZLES[index]);
}

export function getDefaultPuzzle() {
  return parseCompressedPuzzle(COMPRESSED_PUZZLES[0]);
}

export function getPuzzleByIndex(index: number) {
  if (index < 0 || index >= COMPRESSED_PUZZLES.length) return null;
  return parseCompressedPuzzle(COMPRESSED_PUZZLES[index]);
}

export function getPuzzleCount(): number {
  return COMPRESSED_PUZZLES.length;
}

export function getPuzzleIndex(puzzleId: string): number {
  return COMPRESSED_PUZZLES.findIndex((compressed) => {
    const parsed = parseCompressedPuzzle(compressed);
    return parsed.id === puzzleId;
  });
}