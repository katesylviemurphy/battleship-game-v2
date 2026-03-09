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
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900" />
      <div className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(56, 189, 248, 0.8) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56, 189, 248, 0.8) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />
      <div className="absolute top-0 left-1/4 w-[800px] h-[600px] rounded-full bg-cyan-500/10 blur-[150px]" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[120px]" />

      <div className="relative z-10 flex flex-col min-h-screen">
      <Header onRestart={restart} onBackToMenu={goToLanding} gamePhase={state.phase} />

      <main className="flex-1 px-6 py-8 max-w-7xl mx-auto w-full">
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
          <div className="xl:w-80 flex flex-col gap-5">
            {/* Difficulty display */}
            <div className="rounded-2xl p-5 bg-slate-900/80 border-2 border-cyan-500/20">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-400">
                  Difficulty
                </h3>
                <div className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                  state.difficulty === 'easy' 
                    ? 'bg-emerald-500/30 text-emerald-400 border-2 border-emerald-500/50'
                    : state.difficulty === 'medium'
                      ? 'bg-amber-500/30 text-amber-400 border-2 border-amber-500/50'
                      : 'bg-red-500/30 text-red-400 border-2 border-red-500/50'
                } capitalize`}>
                  {state.difficulty}
                </div>
              </div>
            </div>

            {/* Enemy Fleet Status */}
            <div className="rounded-2xl p-5 bg-slate-900/80 border-2 border-cyan-500/20">
              <ShipTracker
                ships={state.enemyShips}
                title="Enemy Fleet"
              />
            </div>

            {/* Player Fleet Status */}
            <div className="rounded-2xl p-5 bg-slate-900/80 border-2 border-cyan-500/20">
              <ShipTracker
                ships={state.playerShips}
                title="Your Fleet"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-cyan-500/20 text-center bg-slate-950/50">
        <p className="text-xs text-slate-500 font-mono tracking-wider">
          BATTLESHIP COMMAND CENTER v1.0 — React + TypeScript + Tailwind
        </p>
      </footer>
      </div>
    </div>
  );
}
