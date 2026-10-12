import { motion } from 'framer-motion';
import {
  Crown,
  Play,
  Cpu,
  Users,
  Globe,
  Puzzle,
  LineChart,
  CalendarDays,
  ChevronRight,
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import type { GameRecord, Screen } from '../types';
import type { Profile } from '../lib/storage';
import { winRate } from '../lib/storage';

const grid = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export function Home({
  profile,
  history,
  onNavigate,
  onStart,
}: {
  profile: Profile;
  history: GameRecord[];
  onNavigate: (s: Screen) => void;
  onStart: (mode: 'computer' | 'local' | 'online') => void;
}) {
  const modes: { label: string; sub: string; Icon: typeof Cpu; onClick: () => void }[] = [
    { label: 'Play vs Computer', sub: 'Choose difficulty', Icon: Cpu, onClick: () => onStart('computer') },
    { label: 'Local Multiplayer', sub: '2 players, 1 device', Icon: Users, onClick: () => onStart('local') },
    { label: 'Online Multiplayer', sub: 'Play real players', Icon: Globe, onClick: () => onNavigate('online') },
    { label: 'Puzzles', sub: 'Improve your skills', Icon: Puzzle, onClick: () => onNavigate('puzzles') },
  ];

  return (
    <div className="safe-top space-y-5 pt-4">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-blue to-accent-violet shadow-glow">
          <Crown size={22} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold leading-tight grad-text">Liquid Glass Chess</h1>
          <p className="text-xs text-3">Think · Move · Win</p>
        </div>
      </motion.div>

      <GlassCard className="flex items-center gap-4">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-3xl text-xl font-bold text-white shadow-glass"
          style={{ background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)' }}
        >
          {profile.name.slice(0, 1).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-1">{profile.name}</span>
            <Crown size={14} className="text-amber-300" />
          </div>
          <p className="text-sm text-2">
            Rating <span className="font-semibold text-1">{profile.rating}</span>
          </p>
        </div>
        <div className="flex gap-3 text-center">
          <Stat label="Games" value={profile.games} />
          <Stat label="Win" value={`${winRate(profile)}%`} />
          <Stat label="Streak" value={profile.streak} />
        </div>
      </GlassCard>

      <button
        onClick={() => onStart('computer')}
        className="w-full rounded-[26px] bg-gradient-to-br from-accent-blue to-accent-violet p-5 text-left shadow-glow transition-transform active:scale-[0.99]"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
            <Play size={24} className="text-white" />
          </div>
          <div>
            <p className="text-lg font-bold text-white">Play Chess</p>
            <p className="text-sm text-white/80">Start a new game</p>
          </div>
        </div>
      </button>

      <motion.div variants={grid} initial="hidden" animate="show" className="grid grid-cols-2 gap-3">
        {modes.map(({ label, sub, Icon, onClick }) => (
          <motion.button key={label} variants={item} onClick={onClick} className="text-left">
            <GlassCard hover className="h-full">
              <Icon size={22} className="mb-2 text-accent-cyan" />
              <p className="text-sm font-semibold text-1">{label}</p>
              <p className="mt-0.5 text-[11px] text-3">{sub}</p>
            </GlassCard>
          </motion.button>
        ))}
      </motion.div>

      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => onNavigate('analysis')} className="text-left">
          <GlassCard hover>
            <LineChart size={20} className="mb-2 text-accent-violet" />
            <p className="text-sm font-semibold text-1">Game Analysis</p>
            <p className="mt-0.5 text-[11px] text-3">Review your games</p>
          </GlassCard>
        </button>
        <button onClick={() => onNavigate('puzzles')} className="text-left">
          <GlassCard hover>
            <CalendarDays size={20} className="mb-2 text-accent-blue" />
            <p className="text-sm font-semibold text-1">Daily Challenge</p>
            <p className="mt-0.5 text-[11px] text-3">New puzzle every day</p>
          </GlassCard>
        </button>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-3">Recent Games</h2>
          <button onClick={() => onNavigate('history')} className="flex items-center text-xs text-2">
            See all <ChevronRight size={14} />
          </button>
        </div>
        <GlassCard padded={false} className="divide-y divide-white/5">
          {history.length === 0 && <p className="p-4 text-sm text-3">No games yet — play your first!</p>}
          {history.slice(0, 3).map((g) => (
            <div key={g.id} className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium text-1">vs {g.opponent}</p>
                <p className="text-[11px] text-3">{g.moves} moves</p>
              </div>
              <span
                className={[
                  'pill px-2.5 py-1 text-xs font-semibold',
                  g.result === 'win' ? 'text-emerald-300' : g.result === 'loss' ? 'text-red-300' : 'text-amber-200',
                ].join(' ')}
              >
                {g.result === 'win' ? 'Win' : g.result === 'loss' ? 'Loss' : 'Draw'}
              </span>
            </div>
          ))}
        </GlassCard>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <p className="text-sm font-bold text-1">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-3">{label}</p>
    </div>
  );
}
