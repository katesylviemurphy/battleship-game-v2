// ── Core Types ──────────────────────────────────────────────────────────────

export const BOARD_SIZE = 10;

export type Coordinate = {
  row: number;
  col: number;
};

export type Orientation = 'horizontal' | 'vertical';

export type CellState = 'empty' | 'ship' | 'hit' | 'miss' | 'sunk';

export type ShipType = 'carrier' | 'battleship' | 'cruiser' | 'submarine' | 'destroyer';

export type Ship = {
  type: ShipType;
  size: number;
  positions: Coordinate[];
  hits: Set<string>; // "row,col" strings for quick lookup
  isSunk: boolean;
};

export type Cell = {
  state: CellState;
  shipType?: ShipType;
  isLastMove?: boolean;
};

export type Board = Cell[][];

export type Difficulty = 'easy' | 'medium' | 'hard';

export type GamePhase = 'landing' | 'placing' | 'playing' | 'gameOver';

export type GameResult = 'win' | 'loss' | null;

export type GameState = {
  playerBoard: Board;
  enemyBoard: Board;
  playerShips: Ship[];
  enemyShips: Ship[];
  phase: GamePhase;
  result: GameResult;
  isPlayerTurn: boolean;
  difficulty: Difficulty;
  moveCount: number;
  lastPlayerMove: Coordinate | null;
  lastEnemyMove: Coordinate | null;
  message: string;
  // Ship placement state
  currentShipIndex: number;
  placementOrientation: Orientation;
};

// Ship definitions with sizes (standard Battleship rules)
export const SHIP_DEFINITIONS: { type: ShipType; size: number; label: string }[] = [
  { type: 'carrier', size: 5, label: 'Carrier' },
  { type: 'battleship', size: 4, label: 'Battleship' },
  { type: 'cruiser', size: 3, label: 'Cruiser' },
  { type: 'submarine', size: 3, label: 'Submarine' },
  { type: 'destroyer', size: 2, label: 'Destroyer' },
];

export const COLUMN_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
export const ROW_LABELS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

// Helper to convert coordinate to string key
export function coordToKey(coord: Coordinate): string {
  return `${coord.row},${coord.col}`;
}

export function keyToCoord(key: string): Coordinate {
  const [row, col] = key.split(',').map(Number);
  return { row, col };
}
