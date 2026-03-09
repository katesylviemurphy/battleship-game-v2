import type { Difficulty } from '../types/game';

type DifficultySelectorProps = {
  difficulty: Difficulty;
  onChange: (difficulty: Difficulty) => void;
  disabled: boolean;
};

const difficulties: { value: Difficulty; label: string; description: string }[] = [
  { value: 'easy', label: 'Easy', description: 'Random fire' },
  { value: 'medium', label: 'Medium', description: 'Hunt & target' },
  { value: 'hard', label: 'Hard', description: 'Probability map' },
];

export function DifficultySelector({ difficulty, onChange, disabled }: DifficultySelectorProps) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
        AI Difficulty
      </h3>
      <div className="flex gap-1.5">
        {difficulties.map(d => (
          <button
            key={d.value}
            onClick={() => onChange(d.value)}
            disabled={disabled}
            className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200 border ${
              difficulty === d.value
                ? 'bg-ocean-500/30 border-ocean-400/40 text-ocean-300'
                : 'bg-navy-800/50 border-white/5 text-slate-400 hover:bg-navy-700/50 hover:text-slate-300'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            title={d.description}
          >
            <span className="block">{d.label}</span>
            <span className="block text-[10px] opacity-60 mt-0.5">{d.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
