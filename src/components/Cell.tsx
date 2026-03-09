import { memo, useCallback } from 'react';
import type { CellState, Coordinate } from '../types/game';

type CellProps = {
  state: CellState;
  isLastMove?: boolean;
  isPlayerBoard: boolean;
  onCellClick?: (coord: Coordinate) => void;
  row: number;
  col: number;
};

function getCellClasses(
  state: CellState,
  isPlayerBoard: boolean,
  isLastMove?: boolean,
): string {
  const base =
    'w-full aspect-square rounded-md transition-all duration-200 relative flex items-center justify-center';

  // Enemy board cells that haven't been revealed
  if (!isPlayerBoard && state === 'empty') {
    return `${base} bg-slate-800/80 border border-slate-700/50 hover:bg-slate-700 hover:border-cyan-500/50 cursor-pointer hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]`;
  }

  // Player board - show ships
  if (isPlayerBoard && state === 'ship') {
    return `${base} bg-gradient-to-br from-cyan-500 to-cyan-600 border-2 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)]`;
  }

  // Empty water
  if (state === 'empty') {
    return `${base} bg-slate-800/60 border border-slate-700/30`;
  }

  const lastMoveClass = isLastMove ? 'animate-last-move' : '';

  switch (state) {
    case 'hit':
      return `${base} bg-gradient-to-br from-red-500 to-red-600 border-2 border-red-400 shadow-[0_0_25px_rgba(239,68,68,0.6)] ${lastMoveClass} ${isLastMove ? 'animate-hit-pulse' : ''}`;
    case 'miss':
      return `${base} bg-slate-700/80 border-2 border-slate-500/50 ${lastMoveClass}`;
    case 'sunk':
      return `${base} bg-gradient-to-br from-red-700 to-red-800 border-2 border-red-500 shadow-[0_0_30px_rgba(185,28,28,0.7)] ${isLastMove ? 'animate-sink-ship' : ''}`;
    default:
      return `${base} bg-slate-800/60 border border-slate-700/30`;
  }
}

function CellContent({ state, isPlayerBoard }: { state: CellState; isPlayerBoard: boolean }) {
  if (isPlayerBoard && state === 'ship') {
    return (
      <div className="w-2 h-2 rounded-full bg-white/80" />
    );
  }

  if (state === 'hit') {
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="w-3 h-3 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
        <div className="absolute w-full h-0.5 bg-white/60 rotate-45" />
        <div className="absolute w-full h-0.5 bg-white/60 -rotate-45" />
      </div>
    );
  }

  if (state === 'miss') {
    return (
      <div className="w-2.5 h-2.5 rounded-full bg-slate-400/60 shadow-[0_0_8px_rgba(148,163,184,0.4)]" />
    );
  }

  if (state === 'sunk') {
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)]" />
        <div className="absolute w-full h-0.5 bg-white/80 rotate-45" />
        <div className="absolute w-full h-0.5 bg-white/80 -rotate-45" />
      </div>
    );
  }

  return null;
}

export const Cell = memo(function Cell({
  state,
  isLastMove,
  isPlayerBoard,
  onCellClick,
  row,
  col,
}: CellProps) {
  // Stable handler — onCellClick, row, and col are all stable across renders
  const handleClick = useCallback(() => {
    onCellClick?.({ row, col });
  }, [onCellClick, row, col]);

  const classes = getCellClasses(state, isPlayerBoard, isLastMove);

  return (
    <button
      className={classes}
      onClick={onCellClick ? handleClick : undefined}
      disabled={isPlayerBoard || state === 'hit' || state === 'miss' || state === 'sunk'}
      aria-label={`Cell ${state}`}
    >
      <CellContent state={state} isPlayerBoard={isPlayerBoard} />
    </button>
  );
});
