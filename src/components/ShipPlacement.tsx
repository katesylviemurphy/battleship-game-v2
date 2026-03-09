import { useState, useCallback } from 'react';
import type { Board as BoardType, Coordinate, Orientation } from '../types/game';
import { BOARD_SIZE, COLUMN_LABELS, ROW_LABELS, SHIP_DEFINITIONS } from '../types/game';
import { getPlacementPreview } from '../logic/board';

type ShipPlacementProps = {
  board: BoardType;
  currentShipIndex: number;
  orientation: Orientation;
  onPlaceShip: (coord: Coordinate) => void;
  onToggleOrientation: () => void;
  onStartGame: () => void;
  message: string;
};

export function ShipPlacement({
  board,
  currentShipIndex,
  orientation,
  onPlaceShip,
  onToggleOrientation,
  onStartGame,
  message,
}: ShipPlacementProps) {
  const [hoverCoord, setHoverCoord] = useState<Coordinate | null>(null);
  const allPlaced = currentShipIndex >= SHIP_DEFINITIONS.length;
  const currentShip = allPlaced ? null : SHIP_DEFINITIONS[currentShipIndex];

  const previewData = useCallback(() => {
    if (!hoverCoord || !currentShip) return null;
    return getPlacementPreview(
      board,
      hoverCoord.row,
      hoverCoord.col,
      currentShip.size,
      orientation
    );
  }, [hoverCoord, currentShip, board, orientation]);

  const preview = previewData();

  const isPreviewCell = (row: number, col: number): boolean => {
    if (!preview) return false;
    return preview.positions.some(p => p.row === row && p.col === col);
  };

  const isPreviewValid = preview?.isValid ?? false;

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900" />
      <div className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(56, 189, 248, 0.8) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56, 189, 248, 0.8) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[100px]" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-cyan-500/20 bg-slate-950/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-cyan-400/50 flex items-center justify-center bg-cyan-500/10">
            <svg
              className="w-5 h-5 text-cyan-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 17h1l2-3h12l2 3h1" strokeLinecap="round" />
              <path d="M5 17l-2 4h18l-2-4" strokeLinecap="round" />
              <path d="M7 14V8l3-3h4l3 3v6" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            DEPLOY FLEET
          </h1>
        </div>
        <div className="text-xs font-mono text-cyan-400/70 uppercase tracking-wider">
          Phase 1: Positioning
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-5xl mx-auto w-full">
        {/* Status message */}
        <div className="mb-10 rounded-2xl border-2 border-cyan-500/30 bg-cyan-950/30 px-8 py-5 w-full max-w-lg text-center backdrop-blur-sm shadow-[0_0_40px_rgba(6,182,212,0.15)]">
          <p className="text-base font-medium text-cyan-100">{message}</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 items-start">
          {/* Board */}
          <div className="animate-fade-in">
            <div className="relative rounded-2xl p-5 bg-slate-900/80 border-2 border-cyan-500/20 shadow-[0_0_80px_rgba(6,182,212,0.15)]">
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
                  {row.map((cell, colIdx) => {
                    const isShip = cell.state === 'ship';
                    const isPrev = isPreviewCell(rowIdx, colIdx);
                    const inBounds = rowIdx < BOARD_SIZE && colIdx < BOARD_SIZE;

                    let cellClass =
                      'w-full aspect-square rounded-md transition-all duration-150 relative flex items-center justify-center';

                    if (isShip) {
                      cellClass += ' bg-gradient-to-br from-cyan-500 to-cyan-600 border-2 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)]';
                    } else if (isPrev && inBounds) {
                      cellClass += isPreviewValid
                        ? ' bg-cyan-500/40 border-2 border-cyan-400/60'
                        : ' bg-red-500/30 border-2 border-red-400/50';
                    } else {
                      cellClass += ' bg-slate-800/80 border border-slate-700/50 hover:bg-slate-700 hover:border-cyan-500/50 cursor-pointer';
                    }

                    return (
                      <button
                        key={`${rowIdx}-${colIdx}`}
                        className={cellClass}
                        onClick={() => !allPlaced && onPlaceShip({ row: rowIdx, col: colIdx })}
                        onMouseEnter={() => setHoverCoord({ row: rowIdx, col: colIdx })}
                        onMouseLeave={() => setHoverCoord(null)}
                        disabled={allPlaced}
                      >
                        {isShip && (
                          <div className="w-2 h-2 rounded-full bg-white/80" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Controls sidebar */}
          <div className="flex flex-col gap-5 min-w-[280px]">
            {/* Current ship info */}
            {currentShip && (
              <div className="rounded-2xl p-6 bg-slate-900/80 border-2 border-cyan-500/20">
                <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-4">
                  Now Placing
                </h3>
                <div className="text-2xl font-black text-white mb-2">
                  {currentShip.label}
                </div>
                <div className="text-sm text-slate-400 mb-6 flex items-center gap-3">
                  <span className="bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full font-medium">{currentShip.size} cells</span>
                  <span className="bg-slate-700/50 text-slate-300 px-3 py-1 rounded-full font-medium">{orientation}</span>
                </div>

                {/* Ship preview */}
                <div className="flex gap-1.5 mb-6">
                  {Array.from({ length: currentShip.size }, (_, i) => (
                    <div
                      key={i}
                      className="w-8 h-6 rounded-md bg-gradient-to-br from-cyan-400 to-cyan-600 border border-cyan-300/50 shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                    />
                  ))}
                </div>

                <button
                  onClick={onToggleOrientation}
                  className="w-full px-4 py-3 text-sm font-bold rounded-xl bg-slate-800 border-2 border-cyan-500/30 text-cyan-300 hover:bg-slate-700 hover:border-cyan-400 cursor-pointer flex items-center justify-center gap-2 transition-all duration-200"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Rotate Ship
                </button>
                <p className="text-xs text-slate-500 text-center mt-3">Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-cyan-400">R</kbd> to rotate</p>
              </div>
            )}

            {/* Ship list */}
            <div className="rounded-2xl p-6 bg-slate-900/80 border-2 border-cyan-500/20">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-400">
                  Your Fleet
                </h3>
                <span className="text-sm font-mono font-bold text-white bg-cyan-500/20 px-3 py-1 rounded-full">
                  {currentShipIndex}/{SHIP_DEFINITIONS.length}
                </span>
              </div>
              <div className="space-y-3">
                {SHIP_DEFINITIONS.map((def, i) => {
                  const placed = i < currentShipIndex;
                  const active = i === currentShipIndex;
                  return (
                    <div
                      key={def.type}
                      className={`flex items-center justify-between py-3 px-4 rounded-xl transition-all duration-300 ${
                        placed
                          ? 'bg-emerald-950/50 border-2 border-emerald-500/40'
                          : active
                            ? 'bg-cyan-950/50 border-2 border-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                            : 'bg-slate-800/30 border border-slate-700/30 opacity-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {placed && <span className="text-emerald-400 text-lg">✓</span>}
                        <span className={`text-sm font-bold ${placed ? 'text-emerald-300' : active ? 'text-white' : 'text-slate-500'}`}>
                          {def.label}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {Array.from({ length: def.size }, (_, j) => (
                          <div
                            key={j}
                            className={`w-4 h-2.5 rounded transition-all duration-300 ${
                              placed
                                ? 'bg-emerald-400'
                                : active
                                  ? 'bg-cyan-400'
                                  : 'bg-slate-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Start button */}
            {allPlaced && (
              <button
                onClick={onStartGame}
                className="w-full px-6 py-5 text-lg font-black rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white cursor-pointer animate-fade-in flex items-center justify-center gap-3 hover:from-emerald-400 hover:to-cyan-400 transition-all duration-300 shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:shadow-[0_0_60px_rgba(16,185,129,0.6)] hover:scale-105"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                START BATTLE
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
