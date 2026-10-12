import { Trophy, Info } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { winRate, type Profile } from '../lib/storage';

export function Leaderboard({ profile }: { profile: Profile }) {
  const rows = [
    { name: profile.name, rating: profile.rating, games: profile.games, win: winRate(profile), you: true },
  ];

  return (
    <div className="safe-top space-y-4 pt-4">
      <h1 className="text-lg font-bold text-1">Leaderboard</h1>

      <GlassCard padded={false} className="divide-y divide-white/5">
        <div className="flex items-center gap-3 p-4">
          <span className="w-6 text-center text-sm font-bold text-amber-300">1</span>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-blue to-accent-violet text-sm font-bold text-white">
            {profile.name.slice(0, 1).toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-1">{profile.name} <span className="text-[10px] text-3">(you)</span></p>
            <p className="text-[11px] text-3">{rows[0].games} games · {rows[0].win}% win rate</p>
          </div>
          <span className="pill px-2.5 py-1 text-xs font-semibold text-2">{profile.rating}</span>
        </div>
      </GlassCard>

      <GlassCard className="flex items-start gap-3">
        <Info size={16} className="mt-0.5 shrink-0 text-accent-cyan" />
        <p className="text-[12px] leading-relaxed text-2">
          This is a local leaderboard built from your own saved games. A global ranking requires an
          account and a backend — it is shown here as local-only rather than populated with invented
          players.
        </p>
      </GlassCard>

      <div className="flex items-center justify-center gap-2 pt-2 text-3">
        <Trophy size={15} />
        <span className="text-xs">Play more games to climb your local board.</span>
      </div>
    </div>
  );
}
