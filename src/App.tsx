import { useEffect, useRef } from 'react';
import { useGame } from './hooks/useGame';
import { Header } from './components/Header';
import { Board } from './components/Board';
import { GameStatus } from './components/GameStatus';
import { ShipTracker } from './components/ShipTracker';
import { DifficultySelector } from './components/DifficultySelector';
import { SonarButton } from './components/SonarButton';
import type { Coordinate } from './types/game';

const AI_DELAY_MS = 600;

export default function App() {
  const {
    state,
    playerAttack,
    aiAttack,
    setDifficulty,
    toggleSonarMode,
    sonarScan,
    restart,
  } = useGame('medium');

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

  function handleEnemyCellClick(coord: Coordinate) {
    if (state.phase !== 'playing' || !state.isPlayerTurn) return;

    if (state.isSonarMode) {
      sonarScan(coord);
    } else {
      playerAttack(coord);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-navy-950">
      <Header onRestart={restart} gamePhase={state.phase} />

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
                isSonarMode={state.isSonarMode}
                onCellClick={handleEnemyCellClick}
                title="Enemy Waters"
                subtitle={
                  state.isSonarMode
                    ? 'Click to scan 3x3 area'
                    : 'Click to fire'
                }
                lastMove={state.lastPlayerMove}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="xl:w-64 flex flex-col gap-4">
            {/* Difficulty Selector */}
            <div className="bg-navy-900/50 rounded-lg border border-white/5 p-3">
              <DifficultySelector
                difficulty={state.difficulty}
                onChange={setDifficulty}
                disabled={false}
              />
              <p className="text-[10px] text-slate-500 mt-2">
                Changing difficulty starts a new game
              </p>
            </div>

            {/* Sonar Scan */}
            <div className="bg-navy-900/50 rounded-lg border border-white/5 p-3">
              <SonarButton
                scansRemaining={state.sonarScansRemaining}
                isSonarMode={state.isSonarMode}
                onToggle={toggleSonarMode}
                disabled={
                  state.phase !== 'playing' || !state.isPlayerTurn
                }
              />
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

            {/* Sonar Log */}
            {state.sonarResults.length > 0 && (
              <div className="bg-navy-900/50 rounded-lg border border-white/5 p-3">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
                  Sonar Log
                </h3>
                <div className="space-y-1">
                  {state.sonarResults.map((result, i) => (
                    <div
                      key={i}
                      className={`text-xs px-2 py-1 rounded ${
                        result.hasShip
                          ? 'bg-sonar-500/10 text-sonar-400'
                          : 'bg-navy-800/50 text-slate-500'
                      }`}
                    >
                      Scan #{i + 1}: {result.hasShip ? 'Contact detected' : 'Area clear'}
                    </div>
                  ))}
                </div>
              </div>
            )}
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
