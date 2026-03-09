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
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900" />
      
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(56, 189, 248, 0.8) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56, 189, 248, 0.8) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Large animated glow orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-full bg-cyan-500/20 blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-blue-600/15 blur-[100px]" />
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] rounded-full bg-teal-500/10 blur-[100px]" />

      <div className="relative z-10 flex flex-col items-center px-6 animate-fade-in">
        {/* Animated radar/sonar icon */}
        <div className="relative mb-10">
          <div className="absolute inset-0 w-28 h-28 bg-cyan-400/30 rounded-full blur-2xl animate-pulse" />
          <div className="relative w-28 h-28 rounded-full border-2 border-cyan-400/50 flex items-center justify-center">
            <div className="absolute inset-2 rounded-full border border-cyan-400/30" />
            <div className="absolute inset-4 rounded-full border border-cyan-400/20" />
            <svg
              className="relative w-12 h-12 text-cyan-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M3 17h1l2-3h12l2 3h1" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5 17l-2 4h18l-2-4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7 14V8l3-3h4l3 3v6" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="10" r="1.5" fill="currentColor" />
            </svg>
          </div>
        </div>

        {/* Large glowing title */}
        <h1 className="text-7xl sm:text-9xl font-black tracking-tighter mb-4 text-white drop-shadow-[0_0_50px_rgba(56,189,248,0.5)]">
          BATTLESHIP
        </h1>
        <div className="flex items-center gap-4 mb-16">
          <div className="h-0.5 w-20 bg-gradient-to-r from-transparent to-cyan-400" />
          <span className="text-sm font-mono uppercase tracking-[0.3em] text-cyan-400 font-semibold">
            Naval Command
          </span>
          <div className="h-0.5 w-20 bg-gradient-to-l from-transparent to-cyan-400" />
        </div>

        {/* Subtitle */}
        <p className="text-slate-300 text-lg mb-14 text-center max-w-lg leading-relaxed">
          Select your difficulty and prepare for naval warfare.
        </p>

        {/* Difficulty Cards - More dramatic styling */}
        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-3xl">
          {difficulties.map((d) => (
            <button
              key={d.value}
              onClick={() => onSelectDifficulty(d.value)}
              className={`group flex-1 flex flex-col items-center gap-5 px-8 py-10 rounded-3xl border-2 transition-all duration-300 cursor-pointer hover:scale-105 ${
                d.value === 'easy' 
                  ? 'bg-emerald-950/50 border-emerald-500/30 hover:border-emerald-400 hover:bg-emerald-900/50 hover:shadow-[0_0_60px_rgba(16,185,129,0.3)]'
                  : d.value === 'medium'
                    ? 'bg-amber-950/50 border-amber-500/30 hover:border-amber-400 hover:bg-amber-900/50 hover:shadow-[0_0_60px_rgba(245,158,11,0.3)]'
                    : 'bg-red-950/50 border-red-500/30 hover:border-red-400 hover:bg-red-900/50 hover:shadow-[0_0_60px_rgba(239,68,68,0.3)]'
              }`}
            >
              <span className="text-5xl">{d.icon}</span>
              <span className={`text-2xl font-bold ${
                d.value === 'easy' ? 'text-emerald-400' : d.value === 'medium' ? 'text-amber-400' : 'text-red-400'
              }`}>
                {d.label}
              </span>
              <span className="text-sm text-slate-400 text-center leading-relaxed">
                {d.description}
              </span>
            </button>
          ))}
        </div>

        {/* Footer */}
        <p className="mt-24 text-xs font-mono uppercase tracking-widest text-slate-600">
          React + TypeScript + Tailwind
        </p>
      </div>
    </div>
  );
}
