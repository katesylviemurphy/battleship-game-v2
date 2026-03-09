import type { Ship } from '../types/game';
import { SHIP_DEFINITIONS } from '../types/game';

type ShipTrackerProps = {
  ships: Ship[];
  title: string;
};

function ShipIcon({ size, isSunk }: { size: number; isSunk: boolean }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: size }, (_, i) => (
        <div
          key={i}
          className={`w-4 h-3 rounded transition-all duration-500 ${
            isSunk
              ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
              : 'bg-cyan-400'
          }`}
        />
      ))}
    </div>
  );
}

export function ShipTracker({ ships, title }: ShipTrackerProps) {
  const sunkCount = ships.filter(s => s.isSunk).length;
  const allSunk = sunkCount === SHIP_DEFINITIONS.length;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-400">
          {title}
        </h3>
        <div className={`text-sm font-mono font-bold px-3 py-1 rounded-full ${
          allSunk 
            ? 'bg-red-500/30 text-red-400 border border-red-500/50' 
            : 'bg-cyan-500/20 text-white border border-cyan-500/30'
        }`}>
          {sunkCount}/{SHIP_DEFINITIONS.length}
        </div>
      </div>
      <div className="space-y-2">
        {SHIP_DEFINITIONS.map(def => {
          const ship = ships.find(s => s.type === def.type);
          const isSunk = ship?.isSunk ?? false;

          return (
            <div
              key={def.type}
              className={`flex items-center justify-between py-2.5 px-3 rounded-xl transition-all duration-300 ${
                isSunk 
                  ? 'bg-red-950/50 border-2 border-red-500/40' 
                  : 'bg-slate-800/50 border border-slate-700/50'
              }`}
            >
              <div className="flex items-center gap-2">
                {isSunk && (
                  <span className="text-red-400 text-sm font-bold">✕</span>
                )}
                <span
                  className={`text-sm font-bold transition-all duration-300 ${
                    isSunk ? 'text-red-400 line-through' : 'text-white'
                  }`}
                >
                  {def.label}
                </span>
              </div>
              <ShipIcon size={def.size} isSunk={isSunk} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
