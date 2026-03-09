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
    <div className="min-h-screen flex flex-col bg-navy-950">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-navy-900/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <svg
            className="w-6 h-6 text-ocean-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M3 17h1l2-3h12l2 3h1" />
            <path d="M5 17l-2 4h18l-2-4" />
            <path d="M7 14V8l3-3h4l3 3v6" />
            <circle cx="12" cy="10" r="1" />
          </svg>
          <h1 className="text-lg font-bold tracking-tight text-white">
            Place Your Fleet
          </h1>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-4xl mx-auto w-full">
        {/* Status message */}
        <div className="mb-6 rounded-lg border border-ocean-400/30 bg-ocean-500/10 px-4 py-3 w-full max-w-md text-center">
          <p className="text-sm font-medium text-slate-200">{message}</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Board */}
          <div className="animate-fade-in">
            <div className="relative bg-navy-900 rounded-lg p-3 border border-white/5 shadow-xl">
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
                  {row.map((cell, colIdx) => {
                    const isShip = cell.state === 'ship';
                    const isPrev = isPreviewCell(rowIdx, colIdx);
                    const inBounds = rowIdx < BOARD_SIZE && colIdx < BOARD_SIZE;

                    let cellClass =
                      'w-full aspect-square rounded-sm transition-all duration-150 relative border border-white/5 flex items-center justify-center';

                    if (isShip) {
                      cellClass += ' bg-navy-500 border-ocean-400/30';
                    } else if (isPrev && inBounds) {
                      cellClass += isPreviewValid
                        ? ' bg-ocean-500/30 border-ocean-400/40'
                        : ' bg-red-500/20 border-red-400/30';
                    } else {
                      cellClass += ' bg-navy-800 hover:bg-navy-600 cursor-pointer';
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
                          <div className="w-2/3 h-2/3 rounded-sm bg-ocean-400/40" />
                        )}
                        {isPrev && !isShip && inBounds && (
                          <div className={`w-2/3 h-2/3 rounded-sm ${isPreviewValid ? 'bg-ocean-400/30' : 'bg-red-400/20'}`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Controls sidebar */}
          <div className="flex flex-col gap-4 min-w-[220px]">
            {/* Current ship info */}
            {currentShip && (
              <div className="bg-navy-900/50 rounded-lg border border-white/5 p-4">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
                  Placing Ship
                </h3>
                <div className="text-lg font-semibold text-ocean-300 mb-1">
                  {currentShip.label}
                </div>
                <div className="text-xs text-slate-400 mb-4">
                  {currentShip.size} cells &middot; {orientation}
                </div>

                {/* Ship preview */}
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: currentShip.size }, (_, i) => (
                    <div
                      key={i}
                      className="w-6 h-4 rounded-[2px] bg-ocean-400/40 border border-ocean-400/30"
                    />
                  ))}
                </div>

                <button
                  onClick={onToggleOrientation}
                  className="w-full px-3 py-2 text-xs font-medium rounded-md border border-ocean-400/30 bg-ocean-500/10 text-ocean-300 hover:bg-ocean-500/20 transition-all duration-200 cursor-pointer"
                >
                  Rotate (currently {orientation})
                </button>
              </div>
            )}

            {/* Ship list */}
            <div className="bg-navy-900/50 rounded-lg border border-white/5 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
                Fleet
              </h3>
              <div className="space-y-2">
                {SHIP_DEFINITIONS.map((def, i) => {
                  const placed = i < currentShipIndex;
                  const active = i === currentShipIndex;
                  return (
                    <div
                      key={def.type}
                      className={`flex items-center justify-between py-1.5 px-2 rounded transition-all duration-200 ${
                        placed
                          ? 'bg-ocean-500/10 border border-ocean-400/20'
                          : active
                            ? 'bg-navy-700/50 border border-ocean-400/30'
                            : 'bg-navy-800/30 border border-white/5 opacity-50'
                      }`}
                    >
                      <span className={`text-xs font-medium ${placed ? 'text-ocean-300' : active ? 'text-white' : 'text-slate-500'}`}>
                        {placed ? '\u2713 ' : ''}{def.label}
                      </span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: def.size }, (_, j) => (
                          <div
                            key={j}
                            className={`w-3 h-2 rounded-[1px] ${
                              placed
                                ? 'bg-ocean-400/40 border border-ocean-400/30'
                                : 'bg-navy-700/50 border border-white/10'
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
                className="w-full px-4 py-3 text-sm font-semibold rounded-lg bg-ocean-500 text-white hover:bg-ocean-400 transition-all duration-200 cursor-pointer shadow-lg shadow-ocean-500/20 hover:shadow-ocean-400/30 animate-fade-in"
              >
                Start Battle
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
