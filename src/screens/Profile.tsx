import { Trophy, Swords, ShieldCheck, ChevronRight, Crown } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import type { Profile as ProfileType } from '../lib/storage';
import { winRate } from '../lib/storage';
import type { GameRecord, Screen } from '../types';

export function Profile({
  profile,
  history,
  onNavigate,
}: {
  profile: ProfileType;
  history: GameRecord[];
  onNavigate: (s: Screen) => void;
}) {
  const xpToNext = 500 * profile.level;
  const pct = Math.min(100, Math.round((profile.xp / xpToNext) * 100));

  const achievements = [
    { icon: Trophy, label: 'Checkmate', count: profile.wins, tone: 'text-amber-300' },
    { icon: Swords, label: 'Games played', count: profile.games, tone: 'text-accent-cyan' },
    { icon: ShieldCheck, label: 'Best streak', count: profile.bestStreak, tone: 'text-emerald-300' },
  ];

  return (
    <div className="safe-top space-y-4 pt-4">
      <h1 className="text-lg font-bold text-1">Profile</h1>

      <GlassCard className="text-center">
        <div
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] text-3xl font-bold text-white shadow-glass"
          style={{ background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)' }}
        >
          {profile.name.slice(0, 1).toUpperCase()}
        </div>
        <div className="mt-3 flex items-center justify-center gap-1.5">
          <span className="text-lg font-bold text-1">{profile.name}</span>
          <Crown size={16} className="text-amber-300" />
        </div>
        <p className="text-xs text-3">Level {profile.level} · Rating {profile.rating}</p>

        <div className="mt-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent-blue to-accent-violet"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-1.5 text-[11px] text-3">
            {profile.xp} / {xpToNext} XP to next level
          </p>
        </div>
      </GlassCard>

      <div className="grid grid-cols-3 gap-3">
        <MiniStat label="Games" value={profile.games} />
        <MiniStat label="Win Rate" value={`${winRate(profile)}%`} />
        <MiniStat label="Streak" value={profile.streak} />
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-3">Achievements</p>
        <GlassCard padded={false} className="divide-y divide-white/5">
          {achievements.map(({ icon: Icon, label, count, tone }) => (
            <div key={label} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Icon size={18} className={tone} />
                <span className="text-sm text-1">{label}</span>
              </div>
              <span className="text-sm font-semibold text-2">{count}×</span>
            </div>
          ))}
        </GlassCard>
      </div>

      <GlassCard padded={false} className="divide-y divide-white/5">
        {[
          { label: 'Game History', to: 'history' as Screen },
          { label: 'Leaderboard', to: 'leaderboard' as Screen },
          { label: 'Settings', to: 'settings' as Screen },
        ].map((r) => (
          <button
            key={r.label}
            onClick={() => onNavigate(r.to)}
            className="flex w-full items-center justify-between p-4 text-left"
          >
            <span className="text-sm text-1">{r.label}</span>
            <ChevronRight size={16} className="text-3" />
          </button>
        ))}
      </GlassCard>

      <p className="text-center text-[11px] text-3">
        {history.length} games stored locally on this device.
      </p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number | string }) {
  return (
    <GlassCard className="py-3 text-center">
      <p className="text-lg font-bold text-1">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-3">{label}</p>
    </GlassCard>
  );
}
