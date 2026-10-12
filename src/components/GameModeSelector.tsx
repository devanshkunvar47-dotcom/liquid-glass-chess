import type { Color, Difficulty } from '../types';
import { DIFFICULTY_LABELS } from '../lib/ai';

const LEVELS: Difficulty[] = ['beginner', 'easy', 'medium', 'hard', 'expert'];

export function GameModeSelector({
  difficulty,
  onDifficulty,
  playerColor,
  onPlayerColor,
  onStart,
}: {
  difficulty: Difficulty;
  onDifficulty: (d: Difficulty) => void;
  playerColor: Color;
  onPlayerColor: (c: Color) => void;
  onStart: () => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-3">Difficulty</p>
        <div className="flex flex-wrap gap-2">
          {LEVELS.map((d) => (
            <button
              key={d}
              onClick={() => onDifficulty(d)}
              className={[
                'pill px-3.5 py-2 text-sm font-medium transition-all',
                difficulty === d
                  ? 'bg-gradient-to-br from-accent-blue/50 to-accent-violet/40 text-1 shadow-glow'
                  : 'text-2',
              ].join(' ')}
            >
              {DIFFICULTY_LABELS[d]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-3">Play as</p>
        <div className="flex gap-2">
          {(['w', 'b'] as Color[]).map((c) => (
            <button
              key={c}
              onClick={() => onPlayerColor(c)}
              className={[
                'pill flex-1 py-2.5 text-sm font-medium transition-all',
                playerColor === c
                  ? 'bg-gradient-to-br from-accent-blue/50 to-accent-violet/40 text-1 shadow-glow'
                  : 'text-2',
              ].join(' ')}
            >
              {c === 'w' ? 'White' : 'Black'}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onStart}
        className="w-full rounded-2xl bg-gradient-to-br from-accent-blue to-accent-violet py-3.5 text-sm font-semibold text-white shadow-glow"
      >
        Start Game
      </button>
    </div>
  );
}
