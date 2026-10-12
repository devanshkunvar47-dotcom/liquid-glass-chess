import { GlassCard } from '../components/GlassCard';
import type { GameRecord } from '../types';

export function History({ history }: { history: GameRecord[] }) {
  return (
    <div className="safe-top space-y-4 pt-4">
      <h1 className="text-lg font-bold text-1">Game History</h1>

      {history.length === 0 ? (
        <GlassCard className="py-10 text-center">
          <p className="text-sm text-2">No games recorded yet.</p>
          <p className="mt-1 text-xs text-3">Finished games are saved on this device.</p>
        </GlassCard>
      ) : (
        <GlassCard padded={false} className="divide-y divide-white/5">
          {history.map((g) => (
            <div key={g.id} className="flex items-center justify-between p-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-1">vs {g.opponent}</p>
                <p className="text-[11px] text-3">
                  {new Date(g.date).toLocaleString()} · {g.moves} moves · {g.mode}
                </p>
              </div>
              <span
                className={[
                  'pill shrink-0 px-2.5 py-1 text-xs font-semibold',
                  g.result === 'win' ? 'text-emerald-300' : g.result === 'loss' ? 'text-red-300' : 'text-amber-200',
                ].join(' ')}
              >
                {g.result === 'win' ? 'Win' : g.result === 'loss' ? 'Loss' : 'Draw'}
              </span>
            </div>
          ))}
        </GlassCard>
      )}
    </div>
  );
}
