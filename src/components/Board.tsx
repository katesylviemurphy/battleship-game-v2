import { memo } from 'react';
import type { Board as BoardType, Coordinate } from '../types/game';
import { COLUMN_LABELS, ROW_LABELS } from '../types/game';
import { Cell } from './Cell';

type BoardProps = {
  board: BoardType;
  isPlayerBoard: boolean;
  onCellClick?: (coord: Coordinate) => void;
  title: string;
  subtitle?: string;
  lastMove?: Coordinate | null;
};

export const Board = memo(function Board({
  board,
  isPlayerBoard,
  onCellClick,
  title,
  subtitle,
}: BoardProps) {
  return (
    <div className="animate-fade-in">
      <div className="mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        )}
      </div>

      <div className="relative bg-navy-900 rounded-lg p-3 border border-white/5 shadow-xl">
        {/* Scanline overlay */}
        <div className="absolute inset-0 scanline-overlay rounded-lg" />

        {/* Column labels */}
        <div className="grid grid-cols-[1.5rem_repeat(10,1fr)] gap-0.5 mb-0.5">
          <div />
          {COLUMN_LABELS.map(label => (
            <div key={label} className="grid-label text-center py-0.5">
              {label}
            </div>
          ))}
        </div>

        {/* Grid rows */}
        {board.map((row, rowIdx) => (
          <div
            key={rowIdx}
            className="grid grid-cols-[1.5rem_repeat(10,1fr)] gap-0.5 mb-0.5"
          >
            <div className="grid-label flex items-center justify-center">
              {ROW_LABELS[rowIdx]}
            </div>
            {row.map((cell, colIdx) => (
              <Cell
                key={`${rowIdx}-${colIdx}`}
                state={cell.state}
                isLastMove={cell.isLastMove}
                isPlayerBoard={isPlayerBoard}
                onCellClick={!isPlayerBoard ? onCellClick : undefined}
                row={rowIdx}
                col={colIdx}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
});
