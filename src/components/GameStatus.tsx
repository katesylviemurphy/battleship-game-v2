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
      className={`relative overflow-hidden rounded-2xl border-2 px-6 py-5 transition-all duration-500 backdrop-blur-sm ${
        isGameOver
          ? isWin
            ? 'bg-emerald-950/50 border-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.3)]'
            : 'bg-red-950/50 border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.3)]'
          : isPlayerTurn
            ? 'bg-cyan-950/40 border-cyan-500/40 shadow-[0_0_40px_rgba(6,182,212,0.2)]'
            : 'bg-amber-950/40 border-amber-500/40 shadow-[0_0_40px_rgba(245,158,11,0.2)]'
      }`}
    >
      <div className="relative flex items-center justify-between mb-3">
        <div className="flex items-center gap-4">
          {!isGameOver && (
            <div className="relative">
              <div
                className={`w-4 h-4 rounded-full ${
                  isPlayerTurn
                    ? 'bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.8)]'
                    : 'bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.8)]'
                }`}
              />
              <div
                className={`absolute inset-0 w-4 h-4 rounded-full animate-ping ${
                  isPlayerTurn ? 'bg-cyan-400/50' : 'bg-amber-400/50'
                }`}
              />
            </div>
          )}
          {isGameOver && (
            <span className="text-3xl">{isWin ? '⚓' : '💀'}</span>
          )}
          <span className={`text-lg font-black uppercase tracking-wider ${
            isGameOver
              ? isWin ? 'text-emerald-300' : 'text-red-300'
              : isPlayerTurn ? 'text-cyan-300' : 'text-amber-300'
          }`}>
            {isGameOver
              ? isWin
                ? 'VICTORY'
                : 'DEFEATED'
              : isPlayerTurn
                ? 'YOUR TURN'
                : 'ENEMY TURN'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Turn</span>
          <span className="text-xl font-black font-mono text-white bg-slate-800/80 px-4 py-1 rounded-lg border border-slate-600/50">
            {moveCount}
          </span>
        </div>
      </div>

      <p
        className={`relative text-base font-medium leading-relaxed ${
          isGameOver
            ? isWin
              ? 'text-emerald-200'
              : 'text-red-200'
            : 'text-slate-200'
        }`}
      >
        {message}
      </p>
    </div>
  );
}
