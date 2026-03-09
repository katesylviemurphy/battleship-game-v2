import { useCallback, useReducer } from 'react';
import type { GameState, Coordinate, Difficulty, SonarResult } from '../types/game';
import { TOTAL_SONAR_SCANS, SHIP_DEFINITIONS } from '../types/game';
import {
  createEmptyBoard,
  placeAllShips,
  processAttack,
  allShipsSunk,
  isAlreadyAttacked,
  getSonarArea,
  performSonarScan,
} from '../logic/board';
import { getAITarget, updateMediumAI, resetAIState } from '../logic/ai';

// ── Actions ─────────────────────────────────────────────────────────────────

type GameAction =
  | { type: 'PLAYER_ATTACK'; target: Coordinate }
  | { type: 'AI_ATTACK' }
  | { type: 'SET_DIFFICULTY'; difficulty: Difficulty }
  | { type: 'TOGGLE_SONAR_MODE' }
  | { type: 'SONAR_SCAN'; target: Coordinate }
  | { type: 'RESTART' };

// ── Initial State ───────────────────────────────────────────────────────────

function createInitialState(difficulty: Difficulty): GameState {
  const playerBoard = createEmptyBoard();
  const enemyBoard = createEmptyBoard();
  const playerShips = placeAllShips(playerBoard);
  const enemyShips = placeAllShips(enemyBoard);

  return {
    playerBoard,
    enemyBoard,
    playerShips,
    enemyShips,
    phase: 'playing',
    result: null,
    isPlayerTurn: true,
    difficulty,
    sonarScansRemaining: TOTAL_SONAR_SCANS,
    sonarResults: [],
    isSonarMode: false,
    moveCount: 0,
    lastPlayerMove: null,
    lastEnemyMove: null,
    message: 'Your turn — select a target on the enemy grid',
  };
}

// ── Reducer ─────────────────────────────────────────────────────────────────

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'PLAYER_ATTACK': {
      if (!state.isPlayerTurn || state.phase !== 'playing') return state;
      const { target } = action;
      if (isAlreadyAttacked(state.enemyBoard, target)) return state;

      const { board, ships, isHit, sunkShip } = processAttack(
        state.enemyBoard, state.enemyShips, target
      );

      const gameOver = allShipsSunk(ships);
      let message = isHit ? 'Direct hit!' : 'Miss...';
      if (sunkShip) {
        const def = SHIP_DEFINITIONS.find(d => d.type === sunkShip.type);
        message = `You sunk their ${def?.label ?? sunkShip.type}!`;
      }
      if (gameOver) message = 'Victory! All enemy ships destroyed!';

      return {
        ...state,
        enemyBoard: board,
        enemyShips: ships,
        isPlayerTurn: false,
        phase: gameOver ? 'gameOver' : 'playing',
        result: gameOver ? 'win' : null,
        moveCount: state.moveCount + 1,
        lastPlayerMove: target,
        isSonarMode: false,
        message,
      };
    }

    case 'AI_ATTACK': {
      if (state.isPlayerTurn || state.phase !== 'playing') return state;

      const target = getAITarget(state.difficulty, state.playerBoard, state.playerShips);
      const { board, ships, isHit, sunkShip } = processAttack(
        state.playerBoard, state.playerShips, target
      );

      if (state.difficulty === 'medium') {
        updateMediumAI(target, isHit, board);
      }

      const gameOver = allShipsSunk(ships);
      let message = isHit ? 'Enemy hit your ship!' : 'Enemy missed!';
      if (sunkShip) {
        const def = SHIP_DEFINITIONS.find(d => d.type === sunkShip.type);
        message = `Enemy sunk your ${def?.label ?? sunkShip.type}!`;
      }
      if (gameOver) message = 'Defeat. All your ships have been destroyed.';

      return {
        ...state,
        playerBoard: board,
        playerShips: ships,
        isPlayerTurn: gameOver ? false : true,
        phase: gameOver ? 'gameOver' : 'playing',
        result: gameOver ? 'loss' : null,
        lastEnemyMove: target,
        message: gameOver ? message : `${message} Your turn.`,
      };
    }

    case 'SET_DIFFICULTY': {
      resetAIState();
      return createInitialState(action.difficulty);
    }

    case 'TOGGLE_SONAR_MODE': {
      if (state.phase !== 'playing' || !state.isPlayerTurn) return state;
      if (state.sonarScansRemaining <= 0) return state;
      return { ...state, isSonarMode: !state.isSonarMode };
    }

    case 'SONAR_SCAN': {
      if (!state.isSonarMode || state.sonarScansRemaining <= 0) return state;
      if (state.phase !== 'playing' || !state.isPlayerTurn) return state;

      const { target } = action;
      const hasShip = performSonarScan(state.enemyBoard, target);
      const cells = getSonarArea(target);

      const sonarResult: SonarResult = {
        center: target,
        hasShip,
        cells,
        timestamp: Date.now(),
      };

      const newBoard = state.enemyBoard.map(row => row.map(cell => ({ ...cell })));
      for (const cell of cells) {
        if (newBoard[cell.row][cell.col].state === 'empty') {
          newBoard[cell.row][cell.col] = {
            ...newBoard[cell.row][cell.col],
            isSonarRevealed: true,
          };
        }
      }

      return {
        ...state,
        enemyBoard: newBoard,
        sonarScansRemaining: state.sonarScansRemaining - 1,
        sonarResults: [...state.sonarResults, sonarResult],
        isSonarMode: false,
        message: hasShip
          ? 'Sonar contact! Ship detected in scan area.'
          : 'Sonar clear — no ships detected.',
      };
    }

    case 'RESTART': {
      resetAIState();
      return createInitialState(state.difficulty);
    }

    default:
      return state;
  }
}

// ── Hook ────────────────────────────────────────────────────────────────────

export function useGame(initialDifficulty: Difficulty = 'medium') {
  const [state, dispatch] = useReducer(gameReducer, initialDifficulty, createInitialState);

  const playerAttack = useCallback((target: Coordinate) => {
    dispatch({ type: 'PLAYER_ATTACK', target });
  }, []);

  const aiAttack = useCallback(() => {
    dispatch({ type: 'AI_ATTACK' });
  }, []);

  const setDifficulty = useCallback((difficulty: Difficulty) => {
    dispatch({ type: 'SET_DIFFICULTY', difficulty });
  }, []);

  const toggleSonarMode = useCallback(() => {
    dispatch({ type: 'TOGGLE_SONAR_MODE' });
  }, []);

  const sonarScan = useCallback((target: Coordinate) => {
    dispatch({ type: 'SONAR_SCAN', target });
  }, []);

  const restart = useCallback(() => {
    dispatch({ type: 'RESTART' });
  }, []);

  return { state, playerAttack, aiAttack, setDifficulty, toggleSonarMode, sonarScan, restart };
}
