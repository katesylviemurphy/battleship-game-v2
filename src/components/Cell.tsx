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
    'w-full aspect-square rounded-sm transition-all duration-200 relative border border-white/5 flex items-center justify-center';

  // Enemy board cells that haven't been revealed
  if (!isPlayerBoard && state === 'empty') {
    return `${base} bg-navy-800 hover:bg-navy-600 cursor-pointer hover:border-ocean-400/40`;
  }

  // Player board - show ships
  if (isPlayerBoard && state === 'ship') {
    return `${base} bg-navy-500 border-ocean-400/30`;
  }

  // Empty water
  if (state === 'empty') {
    return `${base} bg-navy-800`;
  }

  const lastMoveClass = isLastMove ? 'animate-last-move' : '';

  switch (state) {
    case 'hit':
      return `${base} bg-hit-500/80 border-hit-400/40 ${lastMoveClass} ${isLastMove ? 'animate-hit-pulse' : ''}`;
    case 'miss':
      return `${base} bg-navy-700 border-miss-400/20 ${lastMoveClass}`;
    case 'sunk':
      return `${base} bg-sunk-500/70 border-red-400/50 ${isLastMove ? 'animate-sink-ship' : ''}`;
    default:
      return `${base} bg-navy-800`;
  }
}

function CellContent({ state, isPlayerBoard }: { state: CellState; isPlayerBoard: boolean }) {
  if (isPlayerBoard && state === 'ship') {
    return <div className="w-2/3 h-2/3 rounded-sm bg-ocean-400/40" />;
  }

  if (state === 'hit') {
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="w-3 h-3 rounded-full bg-hit-400 shadow-[0_0_8px_rgba(231,76,60,0.6)]" />
        <div className="absolute w-5 h-0.5 bg-hit-400/60 rotate-45" />
        <div className="absolute w-5 h-0.5 bg-hit-400/60 -rotate-45" />
      </div>
    );
  }

  if (state === 'miss') {
    return (
      <div className="w-1.5 h-1.5 rounded-full bg-miss-400/50" />
    );
  }

  if (state === 'sunk') {
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(192,57,43,0.8)]" />
        <div className="absolute w-5 h-0.5 bg-red-400/80 rotate-45" />
        <div className="absolute w-5 h-0.5 bg-red-400/80 -rotate-45" />
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
