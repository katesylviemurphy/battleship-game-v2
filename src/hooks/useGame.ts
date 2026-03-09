import { useCallback, useReducer } from 'react';
import type { GameState, Coordinate, Difficulty, Orientation } from '../types/game';
import { SHIP_DEFINITIONS } from '../types/game';
import {
  createEmptyBoard,
  placeAllShips,
  placeShip,
  processAttack,
  allShipsSunk,
  isAlreadyAttacked,
} from '../logic/board';
import { getAITarget, updateMediumAI, resetAIState } from '../logic/ai';

// ── Actions ─────────────────────────────────────────────────────────────────

type GameAction =
  | { type: 'SELECT_DIFFICULTY'; difficulty: Difficulty }
  | { type: 'PLACE_SHIP'; target: Coordinate }
  | { type: 'TOGGLE_ORIENTATION' }
  | { type: 'START_GAME' }
  | { type: 'PLAYER_ATTACK'; target: Coordinate }
  | { type: 'AI_ATTACK' }
  | { type: 'RESTART' }
  | { type: 'GO_TO_LANDING' };

// ── Initial State ───────────────────────────────────────────────────────────

function createLandingState(): GameState {
  return {
    playerBoard: createEmptyBoard(),
    enemyBoard: createEmptyBoard(),
    playerShips: [],
    enemyShips: [],
    phase: 'landing',
    result: null,
    isPlayerTurn: true,
    difficulty: 'medium',
    moveCount: 0,
    lastPlayerMove: null,
    lastEnemyMove: null,
    message: '',
    currentShipIndex: 0,
    placementOrientation: 'horizontal',
  };
}

function createPlacingState(difficulty: Difficulty): GameState {
  return {
    playerBoard: createEmptyBoard(),
    enemyBoard: createEmptyBoard(),
    playerShips: [],
    enemyShips: [],
    phase: 'placing',
    result: null,
    isPlayerTurn: true,
    difficulty,
    moveCount: 0,
    lastPlayerMove: null,
    lastEnemyMove: null,
    message: `Place your ${SHIP_DEFINITIONS[0].label} (${SHIP_DEFINITIONS[0].size} cells)`,
    currentShipIndex: 0,
    placementOrientation: 'horizontal',
  };
}

// ── Reducer ─────────────────────────────────────────────────────────────────

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SELECT_DIFFICULTY': {
      return createPlacingState(action.difficulty);
    }

    case 'TOGGLE_ORIENTATION': {
      if (state.phase !== 'placing') return state;
      if (state.currentShipIndex >= SHIP_DEFINITIONS.length) return state;
      const newOrientation: Orientation =
        state.placementOrientation === 'horizontal' ? 'vertical' : 'horizontal';
      return {
        ...state,
        placementOrientation: newOrientation,
        message: `Place your ${SHIP_DEFINITIONS[state.currentShipIndex].label} (${SHIP_DEFINITIONS[state.currentShipIndex].size} cells) — ${newOrientation}`,
      };
    }

    case 'PLACE_SHIP': {
      if (state.phase !== 'placing') return state;
      if (state.currentShipIndex >= SHIP_DEFINITIONS.length) return state;

      const def = SHIP_DEFINITIONS[state.currentShipIndex];
      const { target } = action;

      const newBoard = state.playerBoard.map(row => row.map(cell => ({ ...cell })));
      const ship = placeShip(
        newBoard,
        def.type,
        def.size,
        target.row,
        target.col,
        state.placementOrientation
      );

      if (!ship) {
        return {
          ...state,
          message: `Invalid placement! Try a different position for ${def.label}`,
        };
      }

      const newShips = [...state.playerShips, ship];
      const nextIndex = state.currentShipIndex + 1;
      const allPlaced = nextIndex >= SHIP_DEFINITIONS.length;

      return {
        ...state,
        playerBoard: newBoard,
        playerShips: newShips,
        currentShipIndex: nextIndex,
        message: allPlaced
          ? 'All ships placed! Click "Start Battle" to begin.'
          : `Place your ${SHIP_DEFINITIONS[nextIndex].label} (${SHIP_DEFINITIONS[nextIndex].size} cells) — ${state.placementOrientation}`,
      };
    }

    case 'START_GAME': {
      if (state.currentShipIndex < SHIP_DEFINITIONS.length) return state;

      const enemyBoard = createEmptyBoard();
      const enemyShips = placeAllShips(enemyBoard);
      resetAIState();

      return {
        ...state,
        enemyBoard,
        enemyShips,
        phase: 'playing',
        message: 'Your turn — select a target on the enemy grid',
      };
    }

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

    case 'RESTART': {
      resetAIState();
      return createPlacingState(state.difficulty);
    }

    case 'GO_TO_LANDING': {
      resetAIState();
      return createLandingState();
    }

    default:
      return state;
  }
}

// ── Hook ────────────────────────────────────────────────────────────────────

export function useGame() {
  const [state, dispatch] = useReducer(gameReducer, undefined, createLandingState);

  const selectDifficulty = useCallback((difficulty: Difficulty) => {
    dispatch({ type: 'SELECT_DIFFICULTY', difficulty });
  }, []);

  const placePlayerShip = useCallback((target: Coordinate) => {
    dispatch({ type: 'PLACE_SHIP', target });
  }, []);

  const toggleOrientation = useCallback(() => {
    dispatch({ type: 'TOGGLE_ORIENTATION' });
  }, []);

  const startGame = useCallback(() => {
    dispatch({ type: 'START_GAME' });
  }, []);

  const playerAttack = useCallback((target: Coordinate) => {
    dispatch({ type: 'PLAYER_ATTACK', target });
  }, []);

  const aiAttack = useCallback(() => {
    dispatch({ type: 'AI_ATTACK' });
  }, []);

  const restart = useCallback(() => {
    dispatch({ type: 'RESTART' });
  }, []);

  const goToLanding = useCallback(() => {
    dispatch({ type: 'GO_TO_LANDING' });
  }, []);

  return {
    state,
    selectDifficulty,
    placePlayerShip,
    toggleOrientation,
    startGame,
    playerAttack,
    aiAttack,
    restart,
    goToLanding,
  };
}
