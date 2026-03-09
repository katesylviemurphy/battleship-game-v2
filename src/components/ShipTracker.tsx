import type { Ship } from '../types/game';
import { SHIP_DEFINITIONS } from '../types/game';

type ShipTrackerProps = {
  ships: Ship[];
  title: string;
};

function ShipIcon({ size, isSunk }: { size: number; isSunk: boolean }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: size }, (_, i) => (
        <div
          key={i}
          className={`w-4 h-2.5 rounded-[2px] transition-all duration-500 ${
            isSunk
              ? 'bg-sunk-500/60 border border-red-400/30'
              : 'bg-ocean-400/40 border border-ocean-400/30'
          }`}
        />
      ))}
    </div>
  );
}

export function ShipTracker({ ships, title }: ShipTrackerProps) {
  const sunkCount = ships.filter(s => s.isSunk).length;

  return (
    <div className="animate-fade-in">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
        {title}
      </h3>
      <div className="space-y-1.5">
        {SHIP_DEFINITIONS.map(def => {
          const ship = ships.find(s => s.type === def.type);
          const isSunk = ship?.isSunk ?? false;

          return (
            <div
              key={def.type}
              className={`flex items-center justify-between py-1 px-2 rounded transition-all duration-300 ${
                isSunk ? 'bg-red-900/20' : 'bg-navy-800/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-medium transition-all duration-300 ${
                    isSunk ? 'text-red-400 line-through' : 'text-slate-300'
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
      <div className="mt-2 text-xs text-slate-500">
        {sunkCount} / {SHIP_DEFINITIONS.length} sunk
      </div>
    </div>
  );
}
