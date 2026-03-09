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
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-1">
          <div className={`w-3 h-3 rounded-full ${isPlayerBoard ? 'bg-emerald-400' : 'bg-red-400'} shadow-[0_0_12px_currentColor]`} />
          <h2 className="text-base font-black uppercase tracking-widest text-white">
            {title}
          </h2>
        </div>
        {subtitle && (
          <p className="text-sm text-slate-400 ml-6">{subtitle}</p>
        )}
      </div>

      <div className="relative rounded-2xl p-5 bg-slate-900/80 border-2 border-cyan-500/20 shadow-[0_0_60px_rgba(6,182,212,0.1)]">
        {/* Radial glow background */}
        <div className="absolute inset-0 rounded-2xl opacity-30"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(6,182,212,0.1) 0%, transparent 70%)'
          }}
        />

        {/* Column labels */}
        <div className="relative grid grid-cols-[2rem_repeat(10,1fr)] gap-1 mb-1">
          <div />
          {COLUMN_LABELS.map(label => (
            <div key={label} className="text-center py-1 text-xs font-mono font-bold text-cyan-400">
              {label}
            </div>
          ))}
        </div>

        {/* Grid rows */}
        {board.map((row, rowIdx) => (
          <div
            key={rowIdx}
            className="relative grid grid-cols-[2rem_repeat(10,1fr)] gap-1 mb-1"
          >
            <div className="flex items-center justify-center text-xs font-mono font-bold text-cyan-400">
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
