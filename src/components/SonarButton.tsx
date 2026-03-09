type SonarButtonProps = {
  scansRemaining: number;
  isSonarMode: boolean;
  onToggle: () => void;
  disabled: boolean;
};

export function SonarButton({ scansRemaining, isSonarMode, onToggle, disabled }: SonarButtonProps) {
  const canUse = scansRemaining > 0 && !disabled;

  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
        Sonar Scan
      </h3>
      <button
        onClick={onToggle}
        disabled={!canUse}
        className={`w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 border ${
          isSonarMode
            ? 'bg-sonar-500/25 border-sonar-400/50 text-sonar-400 animate-glow-pulse'
            : canUse
              ? 'bg-navy-800/50 border-sonar-400/20 text-sonar-400 hover:bg-sonar-500/15 hover:border-sonar-400/40'
              : 'bg-navy-800/30 border-white/5 text-slate-500 cursor-not-allowed'
        }`}
      >
        <div className="flex items-center justify-center gap-2">
          <svg
            className={`w-4 h-4 ${isSonarMode ? 'animate-pulse' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M6.7 6.7a8 8 0 0 0 0 10.6" />
            <path d="M17.3 6.7a8 8 0 0 1 0 10.6" />
            <path d="M3.3 3.3a14 14 0 0 0 0 17.4" />
            <path d="M20.7 3.3a14 14 0 0 1 0 17.4" />
          </svg>
          <span>{isSonarMode ? 'Select target area...' : 'Activate Sonar'}</span>
        </div>
        <div className="mt-1 text-[10px] opacity-60">
          {scansRemaining} scan{scansRemaining !== 1 ? 's' : ''} remaining — reveals 3x3 area
        </div>
      </button>
    </div>
  );
}
