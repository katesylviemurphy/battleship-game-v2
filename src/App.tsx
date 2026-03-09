import { useCallback, useEffect, useRef } from 'react';
import { useGame } from './hooks/useGame';
import { LandingPage } from './components/LandingPage';
import { ShipPlacement } from './components/ShipPlacement';
import { Header } from './components/Header';
import { Board } from './components/Board';
import { GameStatus } from './components/GameStatus';
import { ShipTracker } from './components/ShipTracker';
import type { Coordinate } from './types/game';

const AI_DELAY_MS = 600;

export default function App() {
  const {
    state,
    selectDifficulty,
    placePlayerShip,
    toggleOrientation,
    startGame,
    playerAttack,
    aiAttack,
    restart,
    goToLanding,
  } = useGame();

  const aiTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Trigger AI attack after player's turn
  useEffect(() => {
    if (!state.isPlayerTurn && state.phase === 'playing') {
      aiTimeoutRef.current = setTimeout(() => {
        aiAttack();
      }, AI_DELAY_MS);
    }
    return () => {
      if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    };
  }, [state.isPlayerTurn, state.phase, aiAttack]);

  // Handle keyboard shortcut for rotation during placement
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (state.phase === 'placing' && (e.key === 'r' || e.key === 'R')) {
        toggleOrientation();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.phase, toggleOrientation]);

  // Stable callback — guards are in the reducer so this reference never changes.
  // Declared before early returns so hooks are called unconditionally.
  const handleEnemyCellClick = useCallback(
    (coord: Coordinate) => playerAttack(coord),
    [playerAttack]
  );

  // Landing page
  if (state.phase === 'landing') {
    return <LandingPage onSelectDifficulty={selectDifficulty} />;
  }

  // Ship placement phase
  if (state.phase === 'placing') {
    return (
      <ShipPlacement
        board={state.playerBoard}
        currentShipIndex={state.currentShipIndex}
        orientation={state.placementOrientation}
        onPlaceShip={placePlayerShip}
        onToggleOrientation={toggleOrientation}
        onStartGame={startGame}
        message={state.message}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-navy-950">
      <Header onRestart={restart} onBackToMenu={goToLanding} gamePhase={state.phase} />

      <main className="flex-1 px-4 py-6 max-w-7xl mx-auto w-full">
        {/* Game Status Bar */}
        <div className="mb-6">
          <GameStatus
            message={state.message}
            phase={state.phase}
            result={state.result}
            isPlayerTurn={state.isPlayerTurn}
            moveCount={state.moveCount}
          />
        </div>

        {/* Main Layout: Boards + Sidebar */}
        <div className="flex flex-col xl:flex-row gap-6">
          {/* Boards Section */}
          <div className="flex-1 flex flex-col lg:flex-row gap-6 justify-center">
            {/* Player Board */}
            <div className="flex-1 max-w-md">
              <Board
                board={state.playerBoard}
                isPlayerBoard={true}
                title="Your Fleet"
                subtitle="Defend your ships"
                lastMove={state.lastEnemyMove}
              />
            </div>

            {/* Enemy Board */}
            <div className="flex-1 max-w-md">
              <Board
                board={state.enemyBoard}
                isPlayerBoard={false}
                onCellClick={handleEnemyCellClick}
                title="Enemy Waters"
                subtitle="Click to fire"
                lastMove={state.lastPlayerMove}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="xl:w-64 flex flex-col gap-4">
            {/* Difficulty display */}
            <div className="bg-navy-900/50 rounded-lg border border-white/5 p-3">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
                Difficulty
              </h3>
              <p className="text-sm font-medium text-ocean-300 capitalize">
                {state.difficulty}
              </p>
            </div>

            {/* Enemy Fleet Status */}
            <div className="bg-navy-900/50 rounded-lg border border-white/5 p-3">
              <ShipTracker
                ships={state.enemyShips}
                title="Enemy Fleet"
              />
            </div>

            {/* Player Fleet Status */}
            <div className="bg-navy-900/50 rounded-lg border border-white/5 p-3">
              <ShipTracker
                ships={state.playerShips}
                title="Your Fleet"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-3 border-t border-white/5 text-center">
        <p className="text-[10px] text-slate-600 font-mono">
          BATTLESHIP COMMAND CENTER v1.0 — Built with React + TypeScript + Tailwind
        </p>
      </footer>
    </div>
  );
}
