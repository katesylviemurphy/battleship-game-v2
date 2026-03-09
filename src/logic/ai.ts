import type { Board, Coordinate, Difficulty, Ship } from '../types/game';
import { BOARD_SIZE, coordToKey } from '../types/game';
import { isAlreadyAttacked } from './board';

// ── Easy AI: Pure random targeting ──────────────────────────────────────────

function getRandomTarget(board: Board): Coordinate {
  const available: Coordinate[] = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (!isAlreadyAttacked(board, { row, col })) {
        available.push({ row, col });
      }
    }
  }
  return available[Math.floor(Math.random() * available.length)];
}

// ── Medium AI: Random search + intelligent hunt mode ────────────────────────

type HuntState = {
  mode: 'search' | 'hunt';
  targets: Coordinate[];
};

let huntState: HuntState = { mode: 'search', targets: [] };

export function resetAIState(): void {
  huntState = { mode: 'search', targets: [] };
}

function getAdjacentCells(coord: Coordinate): Coordinate[] {
  const dirs = [
    { row: -1, col: 0 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
    { row: 0, col: 1 },
  ];
  return dirs
    .map(d => ({ row: coord.row + d.row, col: coord.col + d.col }))
    .filter(c => c.row >= 0 && c.row < BOARD_SIZE && c.col >= 0 && c.col < BOARD_SIZE);
}

function getMediumTarget(board: Board): Coordinate {
  huntState.targets = huntState.targets.filter(t => !isAlreadyAttacked(board, t));

  if (huntState.targets.length > 0) {
    huntState.mode = 'hunt';
    return huntState.targets.shift()!;
  }

  huntState.mode = 'search';
  return getRandomTarget(board);
}

/** Called after medium AI makes an attack to update hunt state */
export function updateMediumAI(
  target: Coordinate,
  wasHit: boolean,
  board: Board
): void {
  if (wasHit) {
    const neighbors = getAdjacentCells(target).filter(c => !isAlreadyAttacked(board, c));
    const existingKeys = new Set(huntState.targets.map(coordToKey));
    for (const n of neighbors) {
      if (!existingKeys.has(coordToKey(n))) {
        huntState.targets.push(n);
      }
    }
  }
}

// ── Hard AI: Probability-density targeting ──────────────────────────────────

function getHardTarget(board: Board, ships: Ship[]): Coordinate {
  const density: number[][] = Array.from({ length: BOARD_SIZE }, () =>
    Array(BOARD_SIZE).fill(0)
  );

  const remainingSizes = ships.filter(s => !s.isSunk).map(s => s.size);

  if (remainingSizes.length === 0) return getRandomTarget(board);

  for (const size of remainingSizes) {
    // Horizontal placements
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col <= BOARD_SIZE - size; col++) {
        let valid = true;
        let coversHit = false;
        for (let i = 0; i < size; i++) {
          const state = board[row][col + i].state;
          if (state === 'miss' || state === 'sunk') { valid = false; break; }
          if (state === 'hit') coversHit = true;
        }
        if (valid) {
          const weight = coversHit ? 20 : 1;
          for (let i = 0; i < size; i++) {
            if (!isAlreadyAttacked(board, { row, col: col + i })) {
              density[row][col + i] += weight;
            }
          }
        }
      }
    }
    // Vertical placements
    for (let row = 0; row <= BOARD_SIZE - size; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        let valid = true;
        let coversHit = false;
        for (let i = 0; i < size; i++) {
          const state = board[row + i][col].state;
          if (state === 'miss' || state === 'sunk') { valid = false; break; }
          if (state === 'hit') coversHit = true;
        }
        if (valid) {
          const weight = coversHit ? 20 : 1;
          for (let i = 0; i < size; i++) {
            if (!isAlreadyAttacked(board, { row: row + i, col })) {
              density[row + i][col] += weight;
            }
          }
        }
      }
    }
  }

  let maxDensity = 0;
  const candidates: Coordinate[] = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (isAlreadyAttacked(board, { row, col })) continue;
      if (density[row][col] > maxDensity) {
        maxDensity = density[row][col];
        candidates.length = 0;
        candidates.push({ row, col });
      } else if (density[row][col] === maxDensity) {
        candidates.push({ row, col });
      }
    }
  }

  if (candidates.length === 0) return getRandomTarget(board);
  return candidates[Math.floor(Math.random() * candidates.length)];
}

// ── Public API ──────────────────────────────────────────────────────────────

export function getAITarget(
  difficulty: Difficulty,
  board: Board,
  ships: Ship[]
): Coordinate {
  switch (difficulty) {
    case 'easy': return getRandomTarget(board);
    case 'medium': return getMediumTarget(board);
    case 'hard': return getHardTarget(board, ships);
  }
}
