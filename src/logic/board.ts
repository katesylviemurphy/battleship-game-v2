import type { Board, Cell, Coordinate, Orientation, Ship, ShipType } from '../types/game';
import { BOARD_SIZE, SHIP_DEFINITIONS, coordToKey } from '../types/game';

/** Create an empty 10x10 board */
export function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, (): Cell => ({ state: 'empty' }))
  );
}

/** Check if a ship placement is valid */
function isValidPlacement(
  board: Board,
  startRow: number,
  startCol: number,
  size: number,
  orientation: Orientation
): boolean {
  for (let i = 0; i < size; i++) {
    const row = orientation === 'vertical' ? startRow + i : startRow;
    const col = orientation === 'horizontal' ? startCol + i : startCol;
    if (row >= BOARD_SIZE || col >= BOARD_SIZE) return false;
    if (board[row][col].state === 'ship') return false;
  }
  return true;
}

/** Place a single ship on the board randomly */
function placeShipRandomly(board: Board, shipType: ShipType, size: number): Ship {
  let placed = false;
  let positions: Coordinate[] = [];

  while (!placed) {
    const orientation: Orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
    const maxRow = orientation === 'vertical' ? BOARD_SIZE - size : BOARD_SIZE - 1;
    const maxCol = orientation === 'horizontal' ? BOARD_SIZE - size : BOARD_SIZE - 1;
    const startRow = Math.floor(Math.random() * (maxRow + 1));
    const startCol = Math.floor(Math.random() * (maxCol + 1));

    if (isValidPlacement(board, startRow, startCol, size, orientation)) {
      positions = [];
      for (let i = 0; i < size; i++) {
        const row = orientation === 'vertical' ? startRow + i : startRow;
        const col = orientation === 'horizontal' ? startCol + i : startCol;
        positions.push({ row, col });
        board[row][col] = { state: 'ship', shipType };
      }
      placed = true;
    }
  }

  return { type: shipType, size, positions, hits: new Set<string>(), isSunk: false };
}

/** Place all ships randomly on a board */
export function placeAllShips(board: Board): Ship[] {
  const ships: Ship[] = [];
  for (const def of SHIP_DEFINITIONS) {
    ships.push(placeShipRandomly(board, def.type, def.size));
  }
  return ships;
}

/** Process an attack on a board */
export function processAttack(
  board: Board,
  ships: Ship[],
  target: Coordinate
): { board: Board; ships: Ship[]; isHit: boolean; sunkShip: Ship | null } {
  const newBoard = board.map(row => row.map(cell => ({ ...cell, isLastMove: false })));
  const newShips = ships.map(ship => ({ ...ship, hits: new Set(ship.hits) }));

  const cell = newBoard[target.row][target.col];
  let isHit = false;
  let sunkShip: Ship | null = null;

  if (cell.state === 'ship') {
    isHit = true;
    const key = coordToKey(target);
    const hitShip = newShips.find(s =>
      s.positions.some(p => p.row === target.row && p.col === target.col)
    );

    if (hitShip) {
      hitShip.hits.add(key);
      if (hitShip.hits.size === hitShip.size) {
        hitShip.isSunk = true;
        sunkShip = hitShip;
        for (const pos of hitShip.positions) {
          newBoard[pos.row][pos.col] = {
            state: 'sunk',
            shipType: hitShip.type,
            isLastMove: pos.row === target.row && pos.col === target.col,
          };
        }
      } else {
        newBoard[target.row][target.col] = {
          state: 'hit',
          shipType: cell.shipType,
          isLastMove: true,
        };
      }
    }
  } else {
    newBoard[target.row][target.col] = { state: 'miss', isLastMove: true };
  }

  return { board: newBoard, ships: newShips, isHit, sunkShip };
}

/** Check if all ships are sunk */
export function allShipsSunk(ships: Ship[]): boolean {
  return ships.every(ship => ship.isSunk);
}

/** Check if a cell has already been attacked */
export function isAlreadyAttacked(board: Board, coord: Coordinate): boolean {
  const state = board[coord.row][coord.col].state;
  return state === 'hit' || state === 'miss' || state === 'sunk';
}

/** Get all cells in a 3x3 area centered on a coordinate (clamped to board) */
export function getSonarArea(center: Coordinate): Coordinate[] {
  const cells: Coordinate[] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const row = center.row + dr;
      const col = center.col + dc;
      if (row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE) {
        cells.push({ row, col });
      }
    }
  }
  return cells;
}

/** Perform a sonar scan: returns true if any ship segment is in the 3x3 area */
export function performSonarScan(board: Board, center: Coordinate): boolean {
  const area = getSonarArea(center);
  return area.some(({ row, col }) => board[row][col].state === 'ship');
}
