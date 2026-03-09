type HeaderProps = {
  onRestart: () => void;
  onBackToMenu: () => void;
  gamePhase: string;
};

export function Header({ onRestart, onBackToMenu, gamePhase }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-8 py-5 border-b border-cyan-500/20 bg-slate-950/50 backdrop-blur-md">
      <div className="flex items-center gap-5">
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
            BATTLESHIP
          </h1>
        </div>
        <div className="hidden sm:flex items-center">
          <div className="h-6 w-px bg-cyan-500/30 mr-4" />
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400/80 font-semibold">
            Phase 2: Combat
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onBackToMenu}
          className="px-5 py-2.5 text-sm font-bold rounded-xl bg-slate-800 border-2 border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500 hover:text-white transition-all duration-200 cursor-pointer"
        >
          Menu
        </button>
        <button
          onClick={onRestart}
          className="px-5 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 text-white cursor-pointer hover:from-cyan-500 hover:to-cyan-400 transition-all duration-200 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]"
        >
          {gamePhase === 'gameOver' ? 'New Game' : 'Restart'}
        </button>
      </div>
    </header>
  );
}
