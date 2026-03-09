import type { GamePhase, GameResult } from '../types/game';

type GameStatusProps = {
  message: string;
  phase: GamePhase;
  result: GameResult;
  isPlayerTurn: boolean;
  moveCount: number;
};

export function GameStatus({ message, phase, result, isPlayerTurn, moveCount }: GameStatusProps) {
  const isGameOver = phase === 'gameOver';
  const isWin = result === 'win';

  return (
    <div
      className={`rounded-lg border px-4 py-3 transition-all duration-500 ${
        isGameOver
          ? isWin
            ? 'bg-emerald-900/20 border-emerald-500/30'
            : 'bg-red-900/20 border-red-500/30'
          : isPlayerTurn
            ? 'bg-ocean-500/10 border-ocean-400/30'
            : 'bg-amber-900/10 border-amber-500/20'
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          {!isGameOver && (
            <div
              className={`w-2 h-2 rounded-full ${
                isPlayerTurn
                  ? 'bg-sonar-400 shadow-[0_0_6px_rgba(0,212,170,0.5)]'
                  : 'bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.5)]'
              }`}
            />
          )}
          {isGameOver && (
            <span className="text-lg">{isWin ? '⚓' : '💀'}</span>
          )}
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            {isGameOver
              ? isWin
                ? 'Mission Complete'
                : 'Mission Failed'
              : isPlayerTurn
                ? 'Your Turn'
                : 'Enemy Turn'}
          </span>
        </div>
        <span className="text-xs text-slate-500 font-mono">
          Turn {moveCount}
        </span>
      </div>

      <p
        className={`text-sm font-medium ${
          isGameOver
            ? isWin
              ? 'text-emerald-300'
              : 'text-red-300'
            : 'text-slate-200'
        }`}
      >
        {message}
      </p>
    </div>
  );
}
