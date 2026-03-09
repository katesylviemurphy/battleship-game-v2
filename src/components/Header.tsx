type HeaderProps = {
  onRestart: () => void;
  gamePhase: string;
};

export function Header({ onRestart, gamePhase }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-navy-900/50 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
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
            Battleship
          </h1>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 bg-navy-800 px-2 py-0.5 rounded">
          Command Center
        </span>
      </div>

      <button
        onClick={onRestart}
        className="px-3 py-1.5 text-xs font-medium rounded-md border border-white/10 text-slate-300 hover:bg-navy-700 hover:border-white/20 transition-all duration-200"
      >
        {gamePhase === 'gameOver' ? 'New Game' : 'Restart'}
      </button>
    </header>
  );
}
