import type { Difficulty } from '../types/game';

type LandingPageProps = {
  onSelectDifficulty: (difficulty: Difficulty) => void;
};

const difficulties: { value: Difficulty; label: string; description: string; icon: string }[] = [
  { value: 'easy', label: 'Easy', description: 'Random fire — the enemy shoots blindly', icon: '🎯' },
  { value: 'medium', label: 'Medium', description: 'Hunt & target — the enemy tracks your ships', icon: '🔍' },
  { value: 'hard', label: 'Hard', description: 'Probability map — the enemy calculates optimal strikes', icon: '🧠' },
];

export function LandingPage({ onSelectDifficulty }: LandingPageProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-navy-950 relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(41, 128, 185, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(41, 128, 185, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Radial glow behind title */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-ocean-400/5 blur-3xl" />

      <div className="relative z-10 flex flex-col items-center px-6 animate-fade-in">
        {/* Ship icon */}
        <svg
          className="w-16 h-16 text-ocean-400 mb-6 drop-shadow-[0_0_20px_rgba(41,128,185,0.3)]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
        >
          <path d="M3 17h1l2-3h12l2 3h1" />
          <path d="M5 17l-2 4h18l-2-4" />
          <path d="M7 14V8l3-3h4l3 3v6" />
          <circle cx="12" cy="10" r="1" />
        </svg>

        {/* Title */}
        <h1 className="text-6xl sm:text-7xl font-bold tracking-tight text-white mb-2">
          Battleship
        </h1>
        <div className="flex items-center gap-3 mb-12">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-ocean-400/50" />
          <span className="text-xs font-mono uppercase tracking-[0.3em] text-ocean-400/70">
            Command Center
          </span>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-ocean-400/50" />
        </div>

        {/* Subtitle */}
        <p className="text-slate-400 text-sm mb-10 text-center max-w-md">
          Choose your challenge level and prepare for battle.
          <br />
          <span className="text-slate-500">You will place your fleet on the next screen.</span>
        </p>

        {/* Difficulty Cards */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
          {difficulties.map((d, i) => (
            <button
              key={d.value}
              onClick={() => onSelectDifficulty(d.value)}
              className="group flex-1 flex flex-col items-center gap-3 px-5 py-6 rounded-xl border border-white/5 bg-navy-900/60 backdrop-blur-sm hover:bg-navy-800/80 hover:border-ocean-400/30 transition-all duration-300 cursor-pointer hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(41,128,185,0.1)]"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <span className="text-2xl mb-1">{d.icon}</span>
              <span className="text-lg font-semibold text-white group-hover:text-ocean-300 transition-colors">
                {d.label}
              </span>
              <span className="text-xs text-slate-500 text-center leading-relaxed group-hover:text-slate-400 transition-colors">
                {d.description}
              </span>
            </button>
          ))}
        </div>

        {/* Footer hint */}
        <p className="mt-16 text-[10px] font-mono uppercase tracking-widest text-slate-600">
          Built with React + TypeScript + Tailwind
        </p>
      </div>
    </div>
  );
}
